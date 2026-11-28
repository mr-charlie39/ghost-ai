import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess, getCurrentIdentity } from "@/lib/project-access";
import type { designAgentTask } from "@/src/trigger/design-agent";

interface DesignTriggerRequest {
  prompt: string;
  roomId: string;
  projectId: string;
}

function parseDesignTriggerRequest(raw: unknown): DesignTriggerRequest | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }

  const body = raw as Record<string, unknown>;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const roomId = typeof body.roomId === "string" ? body.roomId.trim() : "";
  const projectId =
    typeof body.projectId === "string" ? body.projectId.trim() : "";

  if (!prompt || !roomId || !projectId) {
    return null;
  }

  return { prompt, roomId, projectId };
}

/**
 * POST /api/ai/design
 * Validates project access, triggers the Trigger.dev design task, records the TaskRun, and returns its runId.
 */
export async function POST(req: Request) {
  try {
    const { userId, emails } = await getCurrentIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody: unknown = await req.json().catch(() => null);
    const payload = parseDesignTriggerRequest(rawBody);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid request: prompt, roomId, and projectId are required" },
        { status: 400 }
      );
    }

    const access = await checkProjectAccess(payload.projectId, userId, emails);
    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: "Forbidden: you do not have access to this project" },
        { status: 403 }
      );
    }

    const handle = await tasks.trigger<typeof designAgentTask>(
      "design-agent",
      {
        prompt: payload.prompt,
        roomId: payload.roomId,
      }
    );

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: payload.projectId,
        userId,
      },
    });

    return NextResponse.json({ runId: handle.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ai/design error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
