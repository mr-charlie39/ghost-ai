import { cache } from "react";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Project, ProjectCollaborator } from "@/app/generated/prisma/client";

export interface CurrentIdentity {
  userId: string | null;
  email: string | null;
  emails: string[];
  name?: string | null;
  avatarUrl?: string | null;
}

/**
 * Checks whether an error was caused by a cancelled or aborted request.
 */
function isAbortError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === "object") {
    const err = error as {
      name?: string;
      message?: string;
      errors?: Array<{ code?: string; message?: string }>;
    };
    if (err.name === "AbortError" || err.message?.includes("aborted")) {
      return true;
    }
    if (Array.isArray(err.errors)) {
      return err.errors.some(
        (e) => e.code === "unexpected_error" && e.message?.includes("aborted")
      );
    }
  }
  return false;
}

/**
 * Gets the current authenticated Clerk identity: userId + primary email and all verified user emails.
 * Uses React cache() for request-level memoization.
 * Implements resilient fallbacks if the client request is aborted or external Clerk API experiences latency.
 */
export const getCurrentIdentity = cache(
  async function getCurrentIdentity(): Promise<CurrentIdentity> {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return { userId: null, email: null, emails: [], name: null, avatarUrl: null };
    }

    // Safely extract email from session claims if available
    const claimRecord = sessionClaims as Record<string, unknown> | null | undefined;
    const rawClaim =
      typeof sessionClaims?.email === "string"
        ? sessionClaims.email
        : typeof claimRecord?.primary_email_address === "string"
        ? (claimRecord.primary_email_address as string)
        : null;
    const claimEmail = rawClaim ? rawClaim.toLowerCase() : null;

    try {
      const user = await currentUser();
      if (user) {
        const emails =
          user.emailAddresses
            ?.filter((email) => email.verification?.status === "verified")
            .map((email) => email.emailAddress.toLowerCase()) ?? [];
        const primaryEmailAddress = user.primaryEmailAddress;
        const primaryEmail =
          primaryEmailAddress?.verification?.status === "verified"
            ? primaryEmailAddress.emailAddress.toLowerCase()
            : emails[0] ?? claimEmail;

        const allEmails = Array.from(
          new Set(emails.concat(primaryEmail ? [primaryEmail] : []))
        );

        const fullName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        const displayName = fullName || user.username || null;

        return {
          userId,
          email: primaryEmail,
          emails: allEmails,
          name: displayName,
          avatarUrl: user.imageUrl || null,
        };
      }
    } catch (error) {
      if (isAbortError(error)) {
        // Log clean notice for benign stream/prefetch abort
        console.info("Clerk currentUser request cancelled by client lifecycle.");
      } else {
        console.warn(
          "Could not fetch currentUser from request context, attempting isolated backend fallback:",
          (error as Error)?.message || error
        );
      }
    }

    // Secondary fallback: Attempt isolated backend API retrieval (not tied to request AbortSignal)
    try {
      const client = await clerkClient();
      const backendUser = await client.users.getUser(userId);
      if (backendUser) {
        const emails =
          backendUser.emailAddresses
            ?.filter((e) => e.verification?.status === "verified")
            .map((e) => e.emailAddress.toLowerCase()) ?? [];
        const primary =
          backendUser.emailAddresses.find(
            (e) => e.id === backendUser.primaryEmailAddressId
          )?.emailAddress.toLowerCase() ??
          emails[0] ??
          claimEmail;

        const fullName = [backendUser.firstName, backendUser.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        const displayName = fullName || backendUser.username || null;

        return {
          userId,
          email: primary,
          emails: Array.from(new Set(emails.concat(primary ? [primary] : []))),
          name: displayName,
          avatarUrl: backendUser.imageUrl || null,
        };
      }
    } catch (backendError) {
      if (!isAbortError(backendError)) {
        console.warn(
          "Clerk backend fallback user retrieval failed:",
          (backendError as Error)?.message || backendError
        );
      }
    }

    // Graceful fallback with session token claims
    return {
      userId,
      email: claimEmail,
      emails: claimEmail ? [claimEmail] : [],
      name: null,
      avatarUrl: null,
    };
  }
);

export interface ProjectAccessResult {
  hasAccess: boolean;
  isOwner: boolean;
  project: (Project & { collaborators: ProjectCollaborator[] }) | null;
}

/**
 * Checks whether the user has access to a project by project ID / room ID.
 * Access is granted if the user is the project owner or a collaborator.
 */
export async function checkProjectAccess(
  projectId: string,
  userId: string,
  userEmails: string[] | string = []
): Promise<ProjectAccessResult> {
  const emails = Array.isArray(userEmails)
    ? userEmails
    : userEmails
    ? [userEmails]
    : [];

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: true,
    },
  });

  if (!project) {
    return {
      hasAccess: false,
      isOwner: false,
      project: null,
    };
  }

  // Check ownership
  if (project.ownerId === userId) {
    return {
      hasAccess: true,
      isOwner: true,
      project,
    };
  }

  // Check collaborator membership by email
  const isCollaborator = project.collaborators.some((collab) =>
    emails.includes(collab.email.toLowerCase())
  );

  if (isCollaborator) {
    return {
      hasAccess: true,
      isOwner: false,
      project,
    };
  }

  return {
    hasAccess: false,
    isOwner: false,
    project: null,
  };
}
