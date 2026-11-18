import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EditorLayout } from "@/components/editor";

export const instant = false;

export default async function EditorPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in");
  }

  return (
    <Suspense fallback={null}>
      <EditorLayout />
    </Suspense>
  );
}
