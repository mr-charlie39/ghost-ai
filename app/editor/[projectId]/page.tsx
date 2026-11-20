import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EditorLayout } from "@/components/editor";
import { getProjectById, getUserProjects } from "@/lib/projects";

export const instant = false;

interface WorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in");
  }

  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    redirect("/editor");
  }

  const user = await currentUser();
  const emails =
    user?.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) ?? [];

  const { ownedProjects, sharedProjects } = await getUserProjects(
    userId,
    emails
  );

  return (
    <Suspense fallback={null}>
      <EditorLayout
        activeProjectId={projectId}
        initialOwnedProjects={ownedProjects}
        initialSharedProjects={sharedProjects}
        centerNavbarContent={
          <span className="text-xs font-medium text-copy-primary truncate max-w-[240px]">
            {project.name}
          </span>
        }
      >
        {/* Workspace Canvas Surface */}
        <div className="relative flex h-full w-full items-center justify-center p-6 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#2a2a30_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
          <div className="z-10 flex flex-col items-center justify-center text-center max-w-lg">
            <h2 className="text-lg font-semibold text-copy-primary">
              {project.name}
            </h2>
            <p className="mt-1 text-xs text-copy-muted font-mono">
              Room ID: {project.id}
            </p>
          </div>
        </div>
      </EditorLayout>
    </Suspense>
  );
}
