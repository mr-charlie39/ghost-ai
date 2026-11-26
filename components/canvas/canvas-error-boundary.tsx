"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, KeyRound, RefreshCw, ArrowLeft, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CanvasErrorBoundaryProps {
  children: React.ReactNode;
  roomId?: string;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends React.Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  constructor(props: CanvasErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): CanvasErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Canvas room error captured by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || "";
      const isConfigIssue =
        errorMessage.includes("LIVEBLOCKS_SECRET_KEY") ||
        errorMessage.includes("secret key") ||
        errorMessage.includes("CONFIG_ERROR") ||
        errorMessage.includes("INVALID_SECRET_KEY");

      return (
        <div className="relative flex h-full w-full items-center justify-center p-6 bg-base select-none">
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#2a2a30_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          <div className="z-10 flex flex-col items-center justify-center text-center max-w-lg p-6 sm:p-8 rounded-2xl bg-surface border border-surface-border shadow-2xl">
            {isConfigIssue ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                  <KeyRound className="h-6 w-6" />
                </div>

                <h3 className="text-base font-semibold text-copy-primary">
                  Liveblocks Configuration Required
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-copy-muted leading-relaxed">
                  Real-time multiplayer collaboration requires a valid Liveblocks secret key configured in your environment.
                </p>

                <div className="w-full mt-4 p-3.5 rounded-xl bg-base border border-surface-border text-left">
                  <p className="text-[11px] font-semibold text-copy-secondary uppercase tracking-wider mb-2">
                    Setup Instructions:
                  </p>
                  <ol className="text-xs text-copy-muted space-y-1.5 list-decimal list-inside">
                    <li>
                      Get your secret key from the{" "}
                      <a
                        href="https://liveblocks.io/dashboard/apikeys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand hover:underline inline-flex items-center gap-0.5"
                      >
                        Liveblocks Dashboard <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>
                      Add it to <code className="text-brand font-mono text-[11px]">.env.local</code>:
                    </li>
                  </ol>
                  <pre className="mt-2 p-2 rounded-lg bg-surface border border-surface-border text-[11px] font-mono text-copy-primary overflow-x-auto">
                    LIVEBLOCKS_SECRET_KEY=sk_dev_your_secret_key
                  </pre>
                  <p className="mt-2 text-[11px] text-copy-faint">
                    After adding the key, restart your Next.js development server.
                  </p>
                </div>

                {this.props.roomId && (
                  <div className="mt-3 px-2.5 py-1 rounded-lg bg-base border border-surface-border text-[11px] font-mono text-copy-faint">
                    Room: {this.props.roomId}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={this.handleReset}
                    className="gap-1.5 cursor-pointer bg-brand hover:bg-brand/90 text-surface font-medium"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Connection
                  </Button>
                  <Link
                    href="/editor"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1.5 border-surface-border text-copy-primary hover:bg-surface-elevated"
                    )}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Projects
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-state-error/10 border border-state-error/20 text-state-error mb-4">
                  <AlertCircle className="h-6 w-6" />
                </div>

                <h3 className="text-base font-semibold text-copy-primary">
                  Liveblocks Connection Issue
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-copy-muted leading-relaxed">
                  {errorMessage ||
                    "Unable to connect to the collaborative room. Check your network or authorization."}
                </p>

                {this.props.roomId && (
                  <div className="mt-3 px-2.5 py-1 rounded-lg bg-base border border-surface-border text-[11px] font-mono text-copy-faint">
                    Room: {this.props.roomId}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={this.handleReset}
                    className="gap-1.5 cursor-pointer bg-brand hover:bg-brand/90 text-surface font-medium"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reconnect Room
                  </Button>
                  <Link
                    href="/editor"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1.5 border-surface-border text-copy-primary hover:bg-surface-elevated"
                    )}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Projects
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
