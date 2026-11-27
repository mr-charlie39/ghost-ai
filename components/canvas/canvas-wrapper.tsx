"use client";

import * as React from "react";
import Link from "next/link";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useErrorListener,
} from "@liveblocks/react";
import { AlertCircle, KeyRound, RefreshCw, ArrowLeft, ExternalLink } from "lucide-react";
import { CanvasView } from "@/components/canvas/canvas-view";
import { CanvasLoading } from "@/components/canvas/canvas-loading";
import { CanvasErrorBoundary } from "@/components/canvas/canvas-error-boundary";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CanvasWrapperProps {
  roomId: string;
  isLiveblocksConfigured?: boolean;
}

interface AuthErrorState {
  status: number;
  message: string;
  isCredentialsError: boolean;
}

function ConnectionErrorListener({
  onError,
}: {
  onError: (error: AuthErrorState) => void;
}) {
  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") {
      const msg = error.message || "Connection to collaborative room failed.";
      const isCreds =
        msg.includes("LIVEBLOCKS_SECRET_KEY") ||
        msg.includes("secret key") ||
        msg.includes("INVALID_CREDENTIALS") ||
        msg.includes("CONFIG_MISSING");

      onError({
        status: isCreds ? 502 : 0,
        message: msg,
        isCredentialsError: isCreds,
      });
    }
  });

  return null;
}

interface CanvasNoticeProps {
  title: string;
  description: string;
  roomId: string;
  isConfigIssue: boolean;
  onRetry: () => void;
}

function CanvasNotice({
  title,
  description,
  roomId,
  isConfigIssue,
  onRetry,
}: CanvasNoticeProps) {
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

            <h3 className="text-base font-semibold text-copy-primary">{title}</h3>
            <p className="mt-2 text-xs sm:text-sm text-copy-muted leading-relaxed">
              {description}
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
                  Add it to{" "}
                  <code className="text-brand font-mono text-[11px]">.env.local</code>:
                </li>
              </ol>
              <pre className="mt-2 p-2 rounded-lg bg-surface border border-surface-border text-[11px] font-mono text-copy-primary overflow-x-auto">
                LIVEBLOCKS_SECRET_KEY=sk_dev_your_secret_key
              </pre>
              <p className="mt-2 text-[11px] text-copy-faint">
                After adding the key, restart your Next.js development server.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-state-error/10 border border-state-error/20 text-state-error mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-semibold text-copy-primary">{title}</h3>
            <p className="mt-2 text-xs sm:text-sm text-copy-muted leading-relaxed">
              {description}
            </p>
          </>
        )}

        <div className="mt-3 px-2.5 py-1 rounded-lg bg-base border border-surface-border text-[11px] font-mono text-copy-faint">
          Room: {roomId}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onRetry}
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
      </div>
    </div>
  );
}

export function CanvasWrapper({
  roomId,
  isLiveblocksConfigured = true,
}: CanvasWrapperProps) {
  const [authError, setAuthError] = React.useState<AuthErrorState | null>(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

  const handleRetry = React.useCallback(() => {
    setAuthError(null);
    setRetryNonce((n) => n + 1);
  }, []);

  // 1. If server flagged that LIVEBLOCKS_SECRET_KEY is not configured, do not mount LiveblocksProvider
  // This prevents any unnecessary failing HTTP requests or infinite retry loops.
  if (!isLiveblocksConfigured) {
    return (
      <CanvasNotice
        title="Liveblocks Configuration Required"
        description="Real-time multiplayer collaboration requires a valid Liveblocks secret key configured in your environment."
        roomId={roomId}
        isConfigIssue={true}
        onRetry={handleRetry}
      />
    );
  }

  // 2. If a non-recoverable credentials or authentication error was captured, render the notice directly
  if (authError) {
    const isConfigIssue =
      authError.isCredentialsError ||
      authError.message.includes("LIVEBLOCKS_SECRET_KEY") ||
      authError.message.includes("secret key");

    return (
      <CanvasNotice
        title={
          isConfigIssue
            ? "Liveblocks Credentials Required"
            : "Liveblocks Connection Issue"
        }
        description={authError.message}
        roomId={roomId}
        isConfigIssue={isConfigIssue}
        onRetry={handleRetry}
      />
    );
  }

  // 3. Custom authEndpoint callback that controls the request lifecycle
  const authEndpointCallback = async (room?: string) => {
    const targetRoom = room || roomId;
    try {
      const res = await fetch("/api/liveblocks-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room: targetRoom }),
      });

      if (res.status === 200) {
        return await res.json();
      }

      // Read structured error from response
      const errData = await res.json().catch(() => ({}));
      const message =
        errData.message ||
        errData.error ||
        `Authentication failed with status ${res.status}`;

      setAuthError({
        status: res.status,
        message,
        isCredentialsError: res.status === 502 || res.status === 500,
      });

      // Returning { error: "forbidden", reason: ... } instructs Liveblocks AuthManager
      // to throw AuthForbiddenError (StopRetrying), which immediately stops Liveblocks
      // from entering an infinite retry loop on failed authorization.
      return {
        error: "forbidden",
        reason: message,
      };
    } catch (networkError) {
      const msg =
        networkError instanceof Error
          ? networkError.message
          : "Network error contacting authorization service.";

      setAuthError({
        status: 0,
        message: msg,
        isCredentialsError: false,
      });

      return {
        error: "forbidden",
        reason: msg,
      };
    }
  };

  return (
    <CanvasErrorBoundary roomId={roomId} key={retryNonce}>
      <LiveblocksProvider authEndpoint={authEndpointCallback}>
        <ConnectionErrorListener onError={setAuthError} />
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            thinking: false,
          }}
        >
          <ClientSideSuspense fallback={<CanvasLoading roomId={roomId} />}>
            <CanvasView />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
}

export const CollaborativeCanvas = CanvasWrapper;
