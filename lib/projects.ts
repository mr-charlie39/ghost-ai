import { prisma } from "@/lib/prisma";
import type { ProjectItem } from "@/types/project";

/**
 * Fetches all projects owned by the specified user.
 */
export async function getOwnedProjects(userId: string): Promise<ProjectItem[]> {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.id,
    isOwner: true,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));
}

/**
 * Fetches projects shared with the user by matching collaborator email addresses.
 */
export async function getSharedProjects(userEmails: string[]): Promise<ProjectItem[]> {
  if (!userEmails || userEmails.length === 0) {
    return [];
  }

  const projects = await prisma.project.findMany({
    where: {
      collaborators: {
        some: {
          email: {
            in: userEmails,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.id,
    isOwner: false,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));
}

/**
 * Fetches both owned and shared projects for the authenticated user server-side.
 */
export async function getUserProjects(
  userId: string,
  userEmails: string[] = []
): Promise<{
  ownedProjects: ProjectItem[];
  sharedProjects: ProjectItem[];
}> {
  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    getSharedProjects(userEmails),
  ]);

  return {
    ownedProjects,
    sharedProjects,
  };
}

/**
 * Fetches a single project by ID with its collaborators.
 */
export async function getProjectById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: true,
    },
  });
}
