import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess, getCurrentIdentity } from "@/lib/project-access";

interface RouteParams {
  params: Promise<{
    projectId: string;
  }>;
}

/**
 * GET /api/projects/[projectId]/specs
 * Returns metadata (id, filename, createdAt) for all specs belonging to the project.
 * Never exposes raw Vercel Blob URLs.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { userId, emails } = await getCurrentIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const access = await checkProjectAccess(projectId, userId, emails);
    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: "Forbidden: you do not have access to this project" },
        { status: 403 }
      );
    }

    const specs = await prisma.projectSpec.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      specs: specs.map((spec) => ({
        id: spec.id,
        filename: `spec-${spec.id}.md`,
        createdAt: spec.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/projects/[projectId]/specs error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
