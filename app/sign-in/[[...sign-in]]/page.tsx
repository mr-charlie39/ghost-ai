import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth";

export const instant = false;

export default function SignInPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <SignIn />
      </Suspense>
    </AuthLayout>
  );
}
