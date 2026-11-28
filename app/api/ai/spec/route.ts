import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { specTriggerRequestSchema } from "@/lib/ai-spec-schema";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess, getCurrentIdentity } from "@/lib/project-access";
import type { generateSpec } from "@/src/trigger/generate-spec";

/**
 * POST /api/ai/spec
 * Validates input, resolves project access from roomId, triggers generate-spec,
 * records TaskRun ownership, and returns the Trigger.dev runId.
 */
export async function POST(req: Request) {
  try {
    const { userId, emails } = await getCurrentIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody: unknown = await req.json().catch(() => null);
    const parsed = specTriggerRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid request: roomId, chatHistory, nodes, and edges are required",
        },
        { status: 400 }
      );
    }

    const { roomId, chatHistory, nodes, edges } = parsed.data;

    const access = await checkProjectAccess(roomId, userId, emails);
    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: "Forbidden: you do not have access to this project" },
        { status: 403 }
      );
    }

    const projectId = access.project.id;

    const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
      projectId,
      roomId,
      chatHistory,
      nodes,
      edges,
    });

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId,
      },
    });

    return NextResponse.json({ runId: handle.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ai/spec error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
