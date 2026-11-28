import { NextResponse } from "next/server";
import { auth as triggerAuth } from "@trigger.dev/sdk";
import { specTokenRequestSchema } from "@/lib/ai-spec-schema";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity } from "@/lib/project-access";

/**
 * POST /api/ai/spec/token
 * Verifies TaskRun ownership and issues a 1-hour run-scoped Trigger.dev public access token.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await getCurrentIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody: unknown = await req.json().catch(() => null);
    const parsed = specTokenRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request: runId is required" },
        { status: 400 }
      );
    }

    const taskRun = await prisma.taskRun.findUnique({
      where: { runId: parsed.data.runId },
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
      expirationTime: "1h",
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("POST /api/ai/spec/token error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
