import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        collaborators: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    const name = rawName.length > 0 ? rawName : "Untitled Project";
    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    const rawId =
      typeof body.id === "string" && body.id.trim().length > 0
        ? body.id.trim()
        : typeof body.roomId === "string" && body.roomId.trim().length > 0
        ? body.roomId.trim()
        : undefined;

    const project = await prisma.project.create({
      data: {
        ...(rawId ? { id: rawId } : {}),
        ownerId: userId,
        name,
        description,
      },
      include: {
        collaborators: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
