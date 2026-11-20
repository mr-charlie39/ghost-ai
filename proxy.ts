import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";

function toPathname(url: string) {
  try {
    return new URL(url, "http://n").pathname;
  } catch {
    return url;
  }
}

function matchesRoute(pathname: string, target: string) {
  const targetPath = toPathname(target);
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

export default clerkMiddleware(
  async (auth, req) => {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

    // Redirect root path: authenticated to /editor, unauthenticated to /sign-in
    if (pathname === "/") {
      const destination = userId ? "/editor" : signInUrl;
      return NextResponse.redirect(new URL(destination, req.url));
    }

    // Protect all other routes by default
    const isPublic =
      matchesRoute(pathname, signInUrl) ||
      matchesRoute(pathname, signUpUrl) ||
      matchesRoute(pathname, "/sign-in") ||
      matchesRoute(pathname, "/sign-up");

    if (!isPublic) {
      if (pathname.startsWith("/api/")) {
        if (!userId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return;
      }
      await auth.protect();
    }
  },
  { signInUrl, signUpUrl }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
