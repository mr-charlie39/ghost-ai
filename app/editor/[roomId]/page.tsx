import { Suspense } from "react";
import { redirect } from "next/navigation";
import { EditorLayout, AccessDenied } from "@/components/editor";
import { CanvasWrapper, WorkspaceRoomProvider } from "@/components/canvas";
import { getCurrentIdentity, checkProjectAccess } from "@/lib/project-access";
import { getUserProjects } from "@/lib/projects";
import { isLiveblocksConfigured } from "@/lib/liveblocks";

export const instant = false;

interface WorkspacePageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { roomId } = await params;
  const { userId, emails } = await getCurrentIdentity();

  // Unauthenticated users redirect to /sign-in
  if (!userId) {
    redirect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in");
  }

  // Check project access: returns { hasAccess, isOwner, project }
  const access = await checkProjectAccess(roomId, userId, emails);

  // Users without project access or non-existent projects see AccessDenied
  if (!access.hasAccess || !access.project) {
    return <AccessDenied />;
  }

  const { ownedProjects, sharedProjects } = await getUserProjects(
    userId,
    emails
  );

  const liveblocksReady = isLiveblocksConfigured();

  return (
    <Suspense fallback={null}>
      <WorkspaceRoomProvider
        roomId={roomId}
        isLiveblocksConfigured={liveblocksReady}
      >
        <EditorLayout
          activeRoomId={roomId}
          projectName={access.project.name}
          isOwner={access.isOwner}
          showWorkspaceActions
          initialOwnedProjects={ownedProjects}
          initialSharedProjects={sharedProjects}
        >
          <CanvasWrapper
            roomId={roomId}
            isLiveblocksConfigured={liveblocksReady}
            hasSavedCanvas={Boolean(access.project.canvasJsonPath)}
          />
        </EditorLayout>
      </WorkspaceRoomProvider>
    </Suspense>
  );
}
