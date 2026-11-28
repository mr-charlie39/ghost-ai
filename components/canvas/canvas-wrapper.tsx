"use client";

import * as React from "react";
import Link from "next/link";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useErrorListener,
  useLostConnectionListener,
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
  hasSavedCanvas?: boolean;
}

interface AuthErrorState {
  status: number;
  message: string;
  isCredentialsError: boolean;
}

interface RoomConnectionContextValue {
  roomId: string;
  isLiveblocksConfigured: boolean;
  authError: AuthErrorState | null;
  lostConnectionState: "lost" | "failed" | null;
  retryNonce: number;
  onRetry: () => void;
}

const RoomConnectionContext =
  React.createContext<RoomConnectionContextValue | null>(null);

const NON_RECOVERABLE_ROOM_ERROR_CODES = new Set([-1, 4001, 4005, 4006]);

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
      const isNonRecoverableCode = NON_RECOVERABLE_ROOM_ERROR_CODES.has(
        error.context.code
      );

      if (isCreds || isNonRecoverableCode) {
        onError({
          status: isCreds ? 502 : 0,
          message: msg,
          isCredentialsError: isCreds,
        });
      }
    }
  });

  return null;
}

function RoomLostConnectionListener({
  onLostConnectionChange,
}: {
  onLostConnectionChange: (state: "lost" | "failed" | null) => void;
}) {
  useLostConnectionListener((event) => {
    switch (event) {
      case "lost":
        onLostConnectionChange("lost");
        break;
      case "restored":
        onLostConnectionChange(null);
        break;
      case "failed":
        onLostConnectionChange("failed");
        break;
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

export interface WorkspaceRoomProviderProps {
  roomId: string;
  isLiveblocksConfigured?: boolean;
  children: React.ReactNode;
}

export function WorkspaceRoomProvider({
  roomId,
  isLiveblocksConfigured = true,
  children,
}: WorkspaceRoomProviderProps) {
  const [authError, setAuthError] = React.useState<AuthErrorState | null>(null);
  const [lostConnectionState, setLostConnectionState] = React.useState<
    "lost" | "failed" | null
  >(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

  const handleRetry = React.useCallback(() => {
    setAuthError(null);
    setLostConnectionState(null);
    setRetryNonce((n) => n + 1);
  }, []);

  const contextValue = React.useMemo<RoomConnectionContextValue>(
    () => ({
      roomId,
      isLiveblocksConfigured,
      authError,
      lostConnectionState,
      retryNonce,
      onRetry: handleRetry,
    }),
    [
      roomId,
      isLiveblocksConfigured,
      authError,
      lostConnectionState,
      retryNonce,
      handleRetry,
    ]
  );

  // Custom authEndpoint callback that controls the request lifecycle
  const authEndpointCallback = React.useCallback(
    async (room?: string) => {
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
    },
    [roomId]
  );

  if (!isLiveblocksConfigured || authError) {
    return (
      <RoomConnectionContext.Provider value={contextValue}>
        {children}
      </RoomConnectionContext.Provider>
    );
  }

  return (
    <RoomConnectionContext.Provider value={contextValue}>
      <LiveblocksProvider
        authEndpoint={authEndpointCallback}
        lostConnectionTimeout={10000}
        key={retryNonce}
      >
        <ConnectionErrorListener onError={setAuthError} />
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            thinking: false,
          }}
        >
          <RoomLostConnectionListener
            onLostConnectionChange={setLostConnectionState}
          />
          {children}
        </RoomProvider>
      </LiveblocksProvider>
    </RoomConnectionContext.Provider>
  );
}

function CanvasWrapperInner({
  roomId,
  hasSavedCanvas = false,
}: {
  roomId: string;
  hasSavedCanvas?: boolean;
}) {
  const connection = React.useContext(RoomConnectionContext);
  if (!connection) {
    throw new Error("CanvasWrapperInner must be used within WorkspaceRoomProvider");
  }

  const {
    isLiveblocksConfigured,
    authError,
    lostConnectionState,
    retryNonce,
    onRetry,
  } = connection;

  // 1. If server flagged that LIVEBLOCKS_SECRET_KEY is not configured, do not mount CanvasView
  if (!isLiveblocksConfigured) {
    return (
      <CanvasNotice
        title="Liveblocks Configuration Required"
        description="Real-time multiplayer collaboration requires a valid Liveblocks secret key configured in your environment."
        roomId={roomId}
        isConfigIssue={true}
        onRetry={onRetry}
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
        onRetry={onRetry}
      />
    );
  }

  return (
    <CanvasErrorBoundary roomId={roomId} key={retryNonce}>
      <div className="relative h-full w-full">
        {lostConnectionState && (
          <div
            role="status"
            aria-live="polite"
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-surface-border bg-surface/95 px-3.5 py-1.5 text-xs text-copy-secondary shadow-lg backdrop-blur-md"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                lostConnectionState === "failed"
                  ? "bg-state-error"
                  : "bg-state-warning animate-pulse"
              )}
            />
            <span>
              {lostConnectionState === "failed"
                ? "Connection to Liveblocks lost."
                : "Reconnecting to Liveblocks..."}
            </span>
            {lostConnectionState === "failed" && (
              <button
                type="button"
                onClick={onRetry}
                className="ml-1 font-medium text-brand hover:underline cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        )}
        <ClientSideSuspense fallback={<CanvasLoading roomId={roomId} />}>
          <CanvasView projectId={roomId} hasSavedCanvas={hasSavedCanvas} />
        </ClientSideSuspense>
      </div>
    </CanvasErrorBoundary>
  );
}

export function CanvasWrapper({
  roomId,
  isLiveblocksConfigured = true,
  hasSavedCanvas = false,
}: CanvasWrapperProps) {
  const existingConnection = React.useContext(RoomConnectionContext);

  if (existingConnection) {
    return (
      <CanvasWrapperInner roomId={roomId} hasSavedCanvas={hasSavedCanvas} />
    );
  }

  return (
    <WorkspaceRoomProvider
      roomId={roomId}
      isLiveblocksConfigured={isLiveblocksConfigured}
    >
      <CanvasWrapperInner roomId={roomId} hasSavedCanvas={hasSavedCanvas} />
    </WorkspaceRoomProvider>
  );
}

export const CollaborativeCanvas = CanvasWrapper;
