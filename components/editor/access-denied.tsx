import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { GhostLogo } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccessDenied() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-6 bg-base text-copy-primary select-none">
      {/* Background dot grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#2a2a30_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Top brand header */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/editor" className="hover:opacity-85 transition-opacity">
          <GhostLogo size="sm" showWordmark />
        </Link>
      </div>

      <div className="z-10 flex flex-col items-center justify-center text-center max-w-md p-8 rounded-2xl bg-surface/50 border border-surface-border/70 backdrop-blur-xs shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-base border border-surface-border text-brand mb-4 shadow-[0_0_20px_rgba(0,200,212,0.15)]">
          <Lock className="h-7 w-7 text-brand" />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-copy-primary">
          Access Denied
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-copy-muted leading-relaxed">
          You don&apos;t have permission to access this architecture workspace, or the project does not exist.
        </p>
        <Link
          href="/editor"
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-6 gap-2 font-medium cursor-pointer bg-brand text-base hover:bg-brand/90 hover:shadow-[0_0_15px_rgba(0,200,212,0.3)] transition-all rounded-xl"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    </div>
  );
}

