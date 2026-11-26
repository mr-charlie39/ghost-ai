import { Suspense } from "react";
import { redirect } from "next/navigation";
import { EditorLayout } from "@/components/editor";
import { getUserProjects } from "@/lib/projects";
import { getCurrentIdentity } from "@/lib/project-access";

export const instant = false;

export default async function EditorPage() {
  const { userId, emails } = await getCurrentIdentity();
  if (!userId) {
    redirect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in");
  }

  const { ownedProjects, sharedProjects } = await getUserProjects(
    userId,
    emails
  );

  return (
    <Suspense fallback={null}>
      <EditorLayout
        initialOwnedProjects={ownedProjects}
        initialSharedProjects={sharedProjects}
      />
    </Suspense>
  );
}
