import { NextResponse } from "next/server";
import { get, put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, checkProjectAccess } from "@/lib/project-access";

interface RouteParams {
  params: Promise<{
    projectId: string;
  }>;
}

interface CanvasSnapshotPayload {
  nodes: unknown[];
  edges: unknown[];
}

function parseCanvasSnapshot(raw: unknown): CanvasSnapshotPayload | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }
  const candidate = raw as Record<string, unknown>;
  if (!Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges)) {
    return null;
  }
  return {
    nodes: candidate.nodes,
    edges: candidate.edges,
  };
}

/**
 * GET /api/projects/[projectId]/canvas
 * Reads the project's saved canvas blob URL from Prisma and fetches the JSON from Vercel Blob.
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

    const blobUrl = access.project.canvasJsonPath;
    if (!blobUrl) {
      return NextResponse.json({
        nodes: [],
        edges: [],
        hasSavedCanvas: false,
      });
    }

    const blobResult = await get(blobUrl, {
      access: "private",
      useCache: false,
    });
    if (!blobResult || blobResult.statusCode !== 200) {
      return NextResponse.json(
        { error: "Failed to fetch saved canvas from storage" },
        { status: 502 }
      );
    }

    const rawData: unknown = await new Response(blobResult.stream)
      .json()
      .catch(() => null);
    const snapshot = parseCanvasSnapshot(rawData);
    if (!snapshot) {
      return NextResponse.json(
        { error: "Saved canvas data is malformed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      hasSavedCanvas: true,
    });
  } catch (error) {
    console.error("GET /api/projects/[projectId]/canvas error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[projectId]/canvas
 * Uploads the latest canvas JSON to Vercel Blob and stores the returned blob URL in Prisma.
 */
export async function PUT(req: Request, { params }: RouteParams) {
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

    const rawBody: unknown = await req.json().catch(() => null);
    const snapshot = parseCanvasSnapshot(rawBody);
    if (!snapshot) {
      return NextResponse.json(
        { error: "Invalid canvas payload: nodes and edges arrays are required" },
        { status: 400 }
      );
    }

    const blob = await put(
      `canvas/${projectId}.json`,
      JSON.stringify({
        nodes: snapshot.nodes,
        edges: snapshot.edges,
      }),
      {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      }
    );

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        canvasJsonPath: blob.url,
      },
      select: {
        id: true,
        canvasJsonPath: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      url: updatedProject.canvasJsonPath,
      updatedAt: updatedProject.updatedAt,
    });
  } catch (error) {
    console.error("PUT /api/projects/[projectId]/canvas error:", error);
    return NextResponse.json(
      { error: "Failed to save canvas" },
      { status: 500 }
    );
  }
}
