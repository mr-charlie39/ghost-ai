import { NextResponse } from "next/server";
import { auth as triggerAuth } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity } from "@/lib/project-access";

interface DesignTokenRequest {
  runId: string;
}

function parseDesignTokenRequest(raw: unknown): DesignTokenRequest | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }

  const body = raw as Record<string, unknown>;
  const runId = typeof body.runId === "string" ? body.runId.trim() : "";

  if (!runId) {
    return null;
  }

  return { runId };
}

/**
 * POST /api/ai/design/token
 * Verifies TaskRun ownership and issues a run-scoped Trigger.dev public access token.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await getCurrentIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody: unknown = await req.json().catch(() => null);
    const payload = parseDesignTokenRequest(rawBody);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid request: runId is required" },
        { status: 400 }
      );
    }

    const taskRun = await prisma.taskRun.findUnique({
      where: { runId: payload.runId },
      select: {
        runId: true,
        userId: true,
      },
    });

    if (!taskRun) {
      return NextResponse.json(
        { error: "Task run not found" },
        { status: 404 }
      );
    }

    if (taskRun.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: you do not own this task run" },
        { status: 403 }
      );
    }

    const token = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [taskRun.runId],
        },
      },
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("POST /api/ai/design/token error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
