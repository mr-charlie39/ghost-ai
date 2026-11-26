import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    projectId: string;
    collaboratorId: string;
  }>;
}

/**
 * DELETE /api/projects/[projectId]/collaborators/[collaboratorId]
 * Removes a collaborator from the project by collaborator ID.
 * Strictly enforced for project owners only.
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, collaboratorId } = await params;
    if (!projectId || !collaboratorId) {
      return NextResponse.json(
        { error: "Project ID and Collaborator ID are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Server-side ownership enforcement: only the owner can remove collaborators
    if (project.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: only the project owner can remove collaborators" },
        { status: 403 }
      );
    }

    const collaborator = await prisma.projectCollaborator.findFirst({
      where: {
        id: collaboratorId,
        projectId,
      },
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: "Collaborator not found" },
        { status: 404 }
      );
    }

    await prisma.projectCollaborator.delete({
      where: { id: collaborator.id },
    });

    return NextResponse.json({ success: true, id: collaborator.id });
  } catch (error) {
    console.error(
      "DELETE /api/projects/[projectId]/collaborators/[collaboratorId] error:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
