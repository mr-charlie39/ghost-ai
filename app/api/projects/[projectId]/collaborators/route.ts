import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { enrichEmailsWithClerk, getOwnerInfoFromClerk } from "@/lib/clerk-users";

interface RouteParams {
  params: Promise<{
    projectId: string;
  }>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * GET /api/projects/[projectId]/collaborators
 * Lists collaborators for the project. Accessible by the project owner and existing collaborators.
 * Collaborator data is enriched with Clerk display names and avatars when available.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborators: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const isOwner = project.ownerId === userId;

    // If not the owner, verify collaborator access
    if (!isOwner) {
      const user = await currentUser();
      const userEmails =
        user?.emailAddresses
          ?.filter((email) => email.verification?.status === "verified")
          .map((email) => email.emailAddress.toLowerCase()) ?? [];

      const hasCollaboratorAccess = project.collaborators.some((c) =>
        userEmails.includes(c.email.toLowerCase())
      );

      if (!hasCollaboratorAccess) {
        return NextResponse.json(
          { error: "Forbidden: you do not have access to this project" },
          { status: 403 }
        );
      }
    }

    // Enrich collaborator emails with Clerk user data
    const emails = project.collaborators.map((c) => c.email);
    const [enrichedMap, ownerInfo] = await Promise.all([
      enrichEmailsWithClerk(emails),
      getOwnerInfoFromClerk(project.ownerId),
    ]);

    const collaborators = project.collaborators.map((c) => {
      const enriched = enrichedMap.get(c.email.toLowerCase());
      return {
        id: c.id,
        email: c.email,
        name: enriched?.name ?? null,
        avatarUrl: enriched?.avatarUrl ?? null,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      isOwner,
      owner: ownerInfo,
      collaborators,
    });
  } catch (error) {
    console.error("GET /api/projects/[projectId]/collaborators error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[projectId]/collaborators
 * Invites a new collaborator by email. Strictly enforced for project owners only.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborators: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Server-side ownership enforcement: only the owner can invite collaborators
    if (project.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: only the project owner can invite collaborators" },
        { status: 403 }
      );
    }

    const body: unknown = await req.json().catch(() => null);
    if (!isJsonObject(body)) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }
    const rawEmail =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Prevent inviting the owner's own email
    const user = await currentUser();
    const ownerEmails =
      user?.emailAddresses
        ?.filter((email) => email.verification?.status === "verified")
        .map((email) => email.emailAddress.toLowerCase()) ?? [];
    if (ownerEmails.includes(rawEmail)) {
      return NextResponse.json(
        { error: "You are the project owner and already have full access" },
        { status: 400 }
      );
    }

    // Check if collaborator already invited
    const isAlreadyInvited = project.collaborators.some(
      (c) => c.email.toLowerCase() === rawEmail
    );
    if (isAlreadyInvited) {
      return NextResponse.json(
        { error: "This collaborator has already been invited" },
        { status: 409 }
      );
    }

    // Persist new collaborator to database
    const newCollaborator = await prisma.projectCollaborator.create({
      data: {
        projectId: project.id,
        email: rawEmail,
      },
    });

    // Enrich with Clerk user data if user exists in Clerk
    const enrichedMap = await enrichEmailsWithClerk([rawEmail]);
    const enriched = enrichedMap.get(rawEmail);

    return NextResponse.json(
      {
        id: newCollaborator.id,
        email: newCollaborator.email,
        name: enriched?.name ?? null,
        avatarUrl: enriched?.avatarUrl ?? null,
        createdAt: newCollaborator.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects/[projectId]/collaborators error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/collaborators
 * Allows removing a collaborator via request body or query parameter:
 * DELETE ?collaboratorId=xxx or DELETE { collaboratorId: "xxx" } or { email: "xxx" }
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Server-side ownership enforcement
    if (project.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: only the project owner can remove collaborators" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const queryCollaboratorId = url.searchParams.get("collaboratorId");
    const queryEmail =
      url.searchParams.get("email")?.trim().toLowerCase() || null;

    const bodyText = await req.text();
    let body: Record<string, unknown> = {};
    if (bodyText) {
      let parsedBody: unknown;
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        return NextResponse.json(
          { error: "Collaborator ID or email is required" },
          { status: 400 }
        );
      }
      if (!isJsonObject(parsedBody)) {
        return NextResponse.json(
          { error: "Collaborator ID or email is required" },
          { status: 400 }
        );
      }
      body = parsedBody;
    }
    const collaboratorId =
      queryCollaboratorId ||
      (typeof body.collaboratorId === "string" ? body.collaboratorId : null);
    const email =
      queryEmail ||
      (typeof body.email === "string" ? body.email.trim().toLowerCase() : null);

    if (!collaboratorId && !email) {
      return NextResponse.json(
        { error: "Collaborator ID or email is required" },
        { status: 400 }
      );
    }

    const target = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        ...(collaboratorId ? { id: collaboratorId } : { email: email! }),
      },
    });

    if (!target) {
      return NextResponse.json(
        { error: "Collaborator not found" },
        { status: 404 }
      );
    }

    await prisma.projectCollaborator.delete({
      where: { id: target.id },
    });

    return NextResponse.json({ success: true, id: target.id });
  } catch (error) {
    console.error("DELETE /api/projects/[projectId]/collaborators error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
