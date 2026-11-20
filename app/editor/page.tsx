import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EditorLayout } from "@/components/editor";
import { getUserProjects } from "@/lib/projects";

export const instant = false;

export default async function EditorPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in");
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
        initialOwnedProjects={ownedProjects}
        initialSharedProjects={sharedProjects}
      />
    </Suspense>
  );
}
