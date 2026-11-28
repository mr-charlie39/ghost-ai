import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess, getCurrentIdentity } from "@/lib/project-access";

interface RouteParams {
  params: Promise<{
    projectId: string;
    specId: string;
  }>;
}

/**
 * GET /api/projects/[projectId]/specs/[specId]/download
 * Authenticates the user, verifies project access and spec ownership,
 * fetches the Markdown spec from Vercel Blob, and returns it as an attachment.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { userId, emails } = await getCurrentIdentity();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, specId } = await params;
    if (!projectId || !specId) {
      return NextResponse.json(
        { error: "Project ID and Spec ID are required" },
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

    const spec = await prisma.projectSpec.findFirst({
      where: {
        id: specId,
        projectId,
      },
      select: {
        id: true,
        filePath: true,
      },
    });

    if (!spec) {
      return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    }

    const blobResult = await get(spec.filePath, {
      access: "private",
      useCache: false,
    });

    if (!blobResult) {
      return NextResponse.json(
        { error: "Spec file not found in storage" },
        { status: 404 }
      );
    }

    if (blobResult.statusCode !== 200) {
      return NextResponse.json(
        { error: "Failed to fetch spec from storage" },
        { status: 502 }
      );
    }

    return new NextResponse(blobResult.stream, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="spec-${spec.id}.md"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "GET /api/projects/[projectId]/specs/[specId]/download error:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
