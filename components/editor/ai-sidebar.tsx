"use client";

import * as React from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import {
  useCreateFeed,
  useCreateFeedMessage,
  useFeedMessages,
  useIsInsideRoom,
  useMyPresence,
  useOthers,
  useSelf,
} from "@liveblocks/react";
import {
  AlertCircle,
  Bot,
  Download,
  FileText,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  SpecPreviewModal,
  type ProjectSpecItem,
} from "@/components/editor/spec-preview-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { designAgentTask } from "@/src/trigger/design-agent";
import type { generateSpec } from "@/src/trigger/generate-spec";
import {
  AI_CHAT_FEED_ID,
  AI_STATUS_FEED_ID,
  parseAiChatFeedMessage,
  parseAiStatusFeedMessage,
  type AiChatRole,
  type ValidatedAiChatMessage,
  type ValidatedAiStatusMessage,
} from "@/types/tasks";

export interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

const MIN_TEXTAREA_HEIGHT = 72;
const MAX_TEXTAREA_HEIGHT = 160;

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ActiveDesignRun {
  runId: string;
  publicToken: string;
}

interface ChatPostPayload {
  sender: string;
  role: AiChatRole;
  content: string;
  timestamp: string;
}

const TERMINAL_FAILURE_STATUSES = new Set([
  "FAILED",
  "CRASHED",
  "CANCELED",
  "TIMED_OUT",
  "EXPIRED",
  "SYSTEM_FAILURE",
  "INTERRUPTED",
]);

function DesignRunTracker({
  runId,
  accessToken,
  onComplete,
  onError,
}: {
  runId: string;
  accessToken: string;
  onComplete: (summary: string) => void;
  onError: (message: string) => void;
}) {
  const { run, error } = useRealtimeRun<typeof designAgentTask>(runId, {
    accessToken,
  });
  const handledRef = React.useRef(false);

  React.useEffect(() => {
    handledRef.current = false;
  }, [runId]);

  React.useEffect(() => {
    if (handledRef.current) return;

    if (error) {
      handledRef.current = true;
      onError(error.message || "Design generation failed.");
      return;
    }

    if (!run) return;

    if (run.status === "COMPLETED") {
      handledRef.current = true;
      const summary =
        run.output?.summary?.trim() || "Architecture updated on the canvas.";
      onComplete(summary);
      return;
    }

    if (TERMINAL_FAILURE_STATUSES.has(run.status)) {
      handledRef.current = true;
      onError(`Design generation ended with status: ${run.status}`);
    }
  }, [error, onComplete, onError, run]);

  return null;
}

function formatSpecDate(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SpecRunTracker({
  runId,
  accessToken,
  onComplete,
  onError,
}: {
  runId: string;
  accessToken: string;
  onComplete: () => void;
  onError: (message: string) => void;
}) {
  const { run, error } = useRealtimeRun<typeof generateSpec>(runId, {
    accessToken,
  });
  const handledRef = React.useRef(false);

  React.useEffect(() => {
    handledRef.current = false;
  }, [runId]);

  React.useEffect(() => {
    if (handledRef.current) return;

    if (error) {
      handledRef.current = true;
      onError(error.message || "Spec generation failed.");
      return;
    }

    if (!run) return;

    if (run.status === "COMPLETED") {
      handledRef.current = true;
      onComplete();
      return;
    }

    if (TERMINAL_FAILURE_STATUSES.has(run.status)) {
      handledRef.current = true;
      onError(`Spec generation ended with status: ${run.status}`);
    }
  }, [error, onComplete, onError, run]);

  return null;
}

interface RoomAiState {
  isAiWorking: boolean;
  latestStatus: ValidatedAiStatusMessage | null;
  chatMessages: ValidatedAiChatMessage[];
}

function RoomAiActivityBridge({
  onStateChange,
  sendChatRef,
}: {
  onStateChange: (state: RoomAiState) => void;
  sendChatRef: React.MutableRefObject<
    ((message: Omit<ChatPostPayload, "sender"> & { sender?: string }) => Promise<void>) | null
  >;
}) {
  const others = useOthers();
  const [myPresence] = useMyPresence();
  const self = useSelf();
  const createFeed = useCreateFeed();
  const createFeedMessage = useCreateFeedMessage();
  const { messages: statusFeedMessages } = useFeedMessages(AI_STATUS_FEED_ID);
  const { messages: rawChatMessages } = useFeedMessages(AI_CHAT_FEED_ID);
  const chatFeedInitializedRef = React.useRef(false);

  const isAiWorking = React.useMemo(
    () =>
      Boolean(myPresence?.thinking) ||
      others.some((other) => Boolean(other.presence?.thinking)),
    [myPresence?.thinking, others]
  );

  const latestStatus = React.useMemo(() => {
    if (!statusFeedMessages || statusFeedMessages.length === 0) return null;

    const sorted = [...statusFeedMessages].sort(
      (a, b) => b.createdAt - a.createdAt
    );
    for (const msg of sorted) {
      const parsed = parseAiStatusFeedMessage(msg.data);
      if (parsed) return parsed;
    }

    return null;
  }, [statusFeedMessages]);

  const chatMessages = React.useMemo(() => {
    if (!rawChatMessages || rawChatMessages.length === 0) return [];

    const validated: ValidatedAiChatMessage[] = [];
    for (const msg of rawChatMessages) {
      const parsed = parseAiChatFeedMessage(msg.id, msg.createdAt, msg.data);
      if (parsed) {
        validated.push(parsed);
      }
    }

    validated.sort((a, b) => a.createdAt - b.createdAt);
    return validated;
  }, [rawChatMessages]);

  React.useEffect(() => {
    onStateChange({ isAiWorking, latestStatus, chatMessages });
  }, [isAiWorking, latestStatus, chatMessages, onStateChange]);

  React.useEffect(() => {
    const defaultSender = self?.info?.name?.trim() || "Collaborator";

    sendChatRef.current = async (message) => {
      if (!chatFeedInitializedRef.current) {
        try {
          await createFeed(AI_CHAT_FEED_ID);
        } catch {
          // Feed may already exist in this room; continue posting message
        }
        chatFeedInitializedRef.current = true;
      }

      await createFeedMessage(AI_CHAT_FEED_ID, {
        sender: message.sender ?? defaultSender,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
      });
    };

    return () => {
      sendChatRef.current = null;
    };
  }, [createFeed, createFeedMessage, self?.info?.name, sendChatRef]);

  return null;
}

export function AiSidebar({ isOpen, onClose, roomId }: AiSidebarProps) {
  const isInsideRoom = useIsInsideRoom();
  const [activeTab, setActiveTab] = React.useState<"architect" | "specs">("architect");
  const [localMessages, setLocalMessages] = React.useState<ValidatedAiChatMessage[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeRun, setActiveRun] = React.useState<ActiveDesignRun | null>(null);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [specs, setSpecs] = React.useState<ProjectSpecItem[]>([]);
  const [isSpecsLoading, setIsSpecsLoading] = React.useState(false);
  const [specsError, setSpecsError] = React.useState<string | null>(null);
  const [selectedSpec, setSelectedSpec] = React.useState<ProjectSpecItem | null>(
    null
  );
  const [isGeneratingSpec, setIsGeneratingSpec] = React.useState(false);
  const [activeSpecRun, setActiveSpecRun] =
    React.useState<ActiveDesignRun | null>(null);
  const [specGenError, setSpecGenError] = React.useState<string | null>(null);
  const [roomState, setRoomState] = React.useState<RoomAiState>({
    isAiWorking: false,
    latestStatus: null,
    chatMessages: [],
  });
  const sendChatRef = React.useRef<
    ((message: Omit<ChatPostPayload, "sender"> & { sender?: string }) => Promise<void>) | null
  >(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { isAiWorking, latestStatus } = roomState;
  const isRunActive = isSubmitting || Boolean(activeRun) || isAiWorking;
  const messages = isInsideRoom ? roomState.chatMessages : localMessages;

  const adjustTextareaHeight = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
    const nextHeight = Math.min(Math.max(el.scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);
    el.style.height = `${nextHeight}px`;
  }, []);

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [prompt, adjustTextareaHeight]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const postAssistantMessage = React.useCallback(async (content: string) => {
    const timestamp = new Date().toISOString();
    if (sendChatRef.current) {
      try {
        await sendChatRef.current({
          sender: "Ghost AI",
          role: "assistant",
          content,
          timestamp,
        });
      } catch (err) {
        setSendError(
          err instanceof Error ? err.message : "Failed to post AI response."
        );
      }
      return;
    }

    setLocalMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        createdAt: Date.now(),
        sender: "Ghost AI",
        role: "assistant",
        content,
        timestamp,
      },
    ]);
  }, []);

  const handleRunComplete = React.useCallback(
    (summary: string) => {
      setActiveRun(null);
      setIsSubmitting(false);
      void postAssistantMessage(summary);
    },
    [postAssistantMessage]
  );

  const handleRunError = React.useCallback(
    (errorMessage: string) => {
      setActiveRun(null);
      setIsSubmitting(false);
      void postAssistantMessage(`Error: ${errorMessage}`);
    },
    [postAssistantMessage]
  );

  const handleSubmit = React.useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (isRunActive) return;
      const trimmed = prompt.trim();
      if (!trimmed) return;

      setSendError(null);
      const now = new Date().toISOString();

      if (isInsideRoom && sendChatRef.current && roomId) {
        setIsSubmitting(true);
        try {
          await sendChatRef.current({
            role: "user",
            content: trimmed,
            timestamp: now,
          });
          setPrompt("");

          const designRes = await fetch("/api/ai/design", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: trimmed,
              roomId,
              projectId: roomId,
            }),
          });

          const designData = (await designRes.json().catch(() => ({}))) as {
            runId?: string;
            publicToken?: string;
            error?: string;
          };

          if (!designRes.ok || !designData.runId) {
            throw new Error(
              designData.error ||
                `Failed to start design generation (${designRes.status})`
            );
          }

          let publicToken = designData.publicToken;
          if (!publicToken) {
            const tokenRes = await fetch("/api/ai/design/token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ runId: designData.runId }),
            });

            const tokenData = (await tokenRes.json().catch(() => ({}))) as {
              token?: string;
              error?: string;
            };

            if (!tokenRes.ok || !tokenData.token) {
              throw new Error(
                tokenData.error ||
                  `Failed to authorize realtime run (${tokenRes.status})`
              );
            }

            publicToken = tokenData.token;
          }

          setActiveRun({
            runId: designData.runId,
            publicToken,
          });
        } catch (error) {
          const msg =
            error instanceof Error
              ? error.message
              : "Failed to start design generation.";
          setIsSubmitting(false);
          setActiveRun(null);
          await postAssistantMessage(`Error: ${msg}`);
        }
        return;
      }

      setLocalMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          createdAt: Date.now(),
          sender: "You",
          role: "user",
          content: trimmed,
          timestamp: now,
        },
      ]);
      setPrompt("");
    },
    [isInsideRoom, isRunActive, postAssistantMessage, prompt, roomId]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleStarterClick = React.useCallback(
    (starter: string) => {
      if (isRunActive) return;
      setSendError(null);
      setPrompt(starter);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    },
    [isRunActive]
  );

  const fetchSpecs = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!roomId) {
        setSpecs([]);
        return;
      }

      setIsSpecsLoading(true);
      setSpecsError(null);
      try {
        const res = await fetch(`/api/projects/${roomId}/specs`, { signal });
        const data = (await res.json().catch(() => ({}))) as {
          specs?: ProjectSpecItem[];
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error || `Failed to load specs (${res.status})`);
        }

        if (!signal?.aborted) {
          setSpecs(Array.isArray(data.specs) ? data.specs : []);
        }
      } catch (error) {
        if (signal?.aborted) return;
        setSpecsError(
          error instanceof Error ? error.message : "Failed to load specs."
        );
      } finally {
        if (!signal?.aborted) {
          setIsSpecsLoading(false);
        }
      }
    },
    [roomId]
  );

  React.useEffect(() => {
    if (!isOpen || activeTab !== "specs" || !roomId) return;
    const controller = new AbortController();
    void fetch(`/api/projects/${roomId}/specs`, { signal: controller.signal })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          specs?: ProjectSpecItem[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || `Failed to load specs (${res.status})`);
        }
        if (!controller.signal.aborted) {
          setSpecs(Array.isArray(data.specs) ? data.specs : []);
          setSpecsError(null);
          setIsSpecsLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setSpecsError(
          error instanceof Error ? error.message : "Failed to load specs."
        );
        setIsSpecsLoading(false);
      });
    return () => {
      controller.abort();
    };
  }, [activeTab, isOpen, roomId]);

  const handleSpecRunComplete = React.useCallback(() => {
    setActiveSpecRun(null);
    setIsGeneratingSpec(false);
    void fetchSpecs();
  }, [fetchSpecs]);

  const handleSpecRunError = React.useCallback((message: string) => {
    setActiveSpecRun(null);
    setIsGeneratingSpec(false);
    setSpecGenError(message);
  }, []);

  const handleGenerateSpec = React.useCallback(async () => {
    if (!roomId || isGeneratingSpec || Boolean(activeSpecRun)) return;

    setSpecGenError(null);
    setIsGeneratingSpec(true);

    try {
      let nodes: unknown[] = [];
      let edges: unknown[] = [];

      const canvasRes = await fetch(`/api/projects/${roomId}/canvas`).catch(
        () => null
      );
      if (canvasRes?.ok) {
        const canvasData = (await canvasRes.json().catch(() => ({}))) as {
          nodes?: unknown[];
          edges?: unknown[];
        };
        if (Array.isArray(canvasData.nodes)) nodes = canvasData.nodes;
        if (Array.isArray(canvasData.edges)) edges = canvasData.edges;
      }

      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      const triggerRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory,
          nodes,
          edges,
        }),
      });

      const triggerData = (await triggerRes.json().catch(() => ({}))) as {
        runId?: string;
        error?: string;
      };

      if (!triggerRes.ok || !triggerData.runId) {
        throw new Error(
          triggerData.error ||
            `Failed to start spec generation (${triggerRes.status})`
        );
      }

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: triggerData.runId }),
      });

      const tokenData = (await tokenRes.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };

      if (!tokenRes.ok || !tokenData.token) {
        throw new Error(
          tokenData.error ||
            `Failed to authorize spec run (${tokenRes.status})`
        );
      }

      setActiveSpecRun({
        runId: triggerData.runId,
        publicToken: tokenData.token,
      });
    } catch (error) {
      setIsGeneratingSpec(false);
      setActiveSpecRun(null);
      setSpecGenError(
        error instanceof Error
          ? error.message
          : "Failed to start spec generation."
      );
    }
  }, [activeSpecRun, isGeneratingSpec, messages, roomId]);

  const handleDownloadSpec = React.useCallback(
    (spec: ProjectSpecItem) => {
      if (!roomId) return;
      const link = document.createElement("a");
      link.href = `/api/projects/${roomId}/specs/${spec.id}/download`;
      link.download = spec.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [roomId]
  );

  return (
    <>
      {isInsideRoom && (
        <RoomAiActivityBridge
          onStateChange={setRoomState}
          sendChatRef={sendChatRef}
        />
      )}
      {activeRun && (
        <DesignRunTracker
          runId={activeRun.runId}
          accessToken={activeRun.publicToken}
          onComplete={handleRunComplete}
          onError={handleRunError}
        />
      )}
      {activeSpecRun && (
        <SpecRunTracker
          runId={activeSpecRun.runId}
          accessToken={activeSpecRun.publicToken}
          onComplete={handleSpecRunComplete}
          onError={handleSpecRunError}
        />
      )}
      {roomId && (
        <SpecPreviewModal
          projectId={roomId}
          spec={selectedSpec}
          onClose={() => setSelectedSpec(null)}
          onDownload={handleDownloadSpec}
        />
      )}
      {isOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 top-14 z-30 bg-black/60 backdrop-blur-xs md:hidden cursor-pointer"
        />
      )}
      <aside
        aria-label="AI Sidebar"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "fixed top-14 right-0 bottom-0 z-40 w-80 md:w-96 max-w-[calc(100vw-2rem)] flex flex-col bg-base/95 backdrop-blur-md border-l border-surface-border select-none transition-all duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 shadow-2xl opacity-100"
            : "translate-x-[calc(100%+1rem)] shadow-none opacity-0 pointer-events-none"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ai/15 border border-ai/30 text-ai-text">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-copy-primary truncate">
                AI Workspace
              </h3>
              <p className="text-[11px] text-copy-muted truncate">
                Collaborate with Ghost AI
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            aria-label="Close AI sidebar"
            className="text-copy-muted hover:text-copy-primary hover:bg-subtle cursor-pointer rounded-lg shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Tabbed Content */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "architect" | "specs")}
          className="flex flex-1 flex-col overflow-hidden gap-0"
        >
          <div className="px-4 pt-3 pb-2 border-b border-surface-border shrink-0">
            <TabsList className="grid w-full grid-cols-2 bg-surface border border-surface-border p-1 h-9 rounded-xl">
              <TabsTrigger
                value="architect"
                className="rounded-lg text-xs font-medium text-copy-muted data-active:bg-ai/15 data-active:text-ai-text data-active:border-ai/30 cursor-pointer transition-colors"
              >
                AI Architect
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="rounded-lg text-xs font-medium text-copy-muted data-active:bg-ai/15 data-active:text-ai-text data-active:border-ai/30 cursor-pointer transition-colors"
              >
                Specs
              </TabsTrigger>
            </TabsList>
          </div>

          {/* AI Architect Tab */}
          <TabsContent
            value="architect"
            className="flex flex-1 flex-col overflow-hidden mt-0"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center px-2 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-elevated border border-surface-border text-ai-text mb-3">
                    <Bot className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-copy-primary">
                    Describe your architecture
                  </p>
                  <p className="mt-1 text-xs text-copy-muted max-w-[240px] leading-relaxed">
                    Prompt Ghost AI to map services, databases, and connections onto the shared canvas.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {STARTER_PROMPTS.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        disabled={isRunActive}
                        onClick={() => handleStarterClick(starter)}
                        className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-ai-text border border-surface-border hover:border-ai/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const formattedTime = formatMessageTime(message.timestamp);
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex flex-col w-full gap-1",
                          isUser ? "items-end" : "items-start"
                        )}
                      >
                        <div className="flex items-center gap-1.5 px-1 text-[10px] text-copy-muted">
                          <span className="font-medium text-copy-secondary">
                            {message.sender}
                          </span>
                          {formattedTime && (
                            <>
                              <span aria-hidden="true">·</span>
                              <time dateTime={message.timestamp}>
                                {formattedTime}
                              </time>
                            </>
                          )}
                        </div>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap select-text",
                            isUser
                              ? "bg-state-success text-base font-medium"
                              : "bg-elevated border border-surface-border text-copy-primary"
                          )}
                        >
                          {message.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input Area */}
            <form
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
              className="p-4 pt-3 border-t border-surface-border shrink-0 space-y-2"
            >
              {isRunActive && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2 rounded-xl bg-base border border-state-success/30 px-3 py-1.5 text-xs text-copy-secondary"
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-state-success animate-pulse shrink-0"
                  />
                  <span
                    className="truncate"
                    title={latestStatus?.text ?? "Ghost AI is working..."}
                  >
                    {latestStatus?.text ?? "Ghost AI is working..."}
                  </span>
                </div>
              )}
              {sendError && (
                <div
                  role="alert"
                  className="flex items-center gap-1.5 rounded-xl bg-state-error/10 border border-state-error/30 px-2.5 py-1.5 text-[11px] text-state-error"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{sendError}</span>
                </div>
              )}
              <div className="relative flex flex-col gap-2 rounded-2xl bg-surface border border-surface-border p-2.5 focus-within:border-state-success/50 transition-colors">
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => {
                    if (sendError) setSendError(null);
                    setPrompt(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isRunActive}
                  placeholder={
                    isRunActive
                      ? "AI is working..."
                      : "Describe a system architecture..."
                  }
                  className="min-h-[72px] max-h-[160px] w-full resize-none overflow-y-auto border-0 bg-transparent p-1 text-xs text-copy-primary placeholder:text-copy-muted focus-visible:ring-0 focus-visible:border-0 shadow-none disabled:opacity-50"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-copy-muted px-1">
                    {isRunActive
                      ? "Generation in progress..."
                      : "Enter to send · Shift+Enter for newline"}
                  </span>
                  <Button
                    type="submit"
                    size="icon-sm"
                    disabled={isRunActive || !prompt.trim()}
                    aria-label={isRunActive ? "AI is working" : "Send prompt"}
                    className="bg-state-success text-base hover:bg-state-success/90 disabled:opacity-40 cursor-pointer shrink-0 rounded-xl"
                  >
                    {isRunActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* Specs Tab */}
          <TabsContent
            value="specs"
            className="flex flex-1 flex-col overflow-hidden p-4 gap-3 mt-0"
          >
            <Button
              type="button"
              disabled={!roomId || isGeneratingSpec || Boolean(activeSpecRun)}
              onClick={() => void handleGenerateSpec()}
              className="w-full bg-ai text-white hover:bg-ai/90 rounded-xl gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isGeneratingSpec || activeSpecRun ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Spec...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Spec
                </>
              )}
            </Button>

            {specGenError && (
              <div
                role="alert"
                className="flex items-center gap-1.5 rounded-xl bg-state-error/10 border border-state-error/30 px-2.5 py-1.5 text-[11px] text-state-error shrink-0"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{specGenError}</span>
              </div>
            )}

            <ScrollArea className="flex-1 min-h-0 -mx-1 px-1">
              {isSpecsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-copy-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-ai-text" />
                  <span className="text-xs">Loading specs...</span>
                </div>
              ) : specsError ? (
                <div
                  role="alert"
                  className="flex items-center gap-1.5 rounded-xl bg-state-error/10 border border-state-error/30 px-2.5 py-2 text-xs text-state-error"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{specsError}</span>
                </div>
              ) : specs.length === 0 ? (
                <div className="rounded-2xl bg-elevated border border-surface-border p-4 text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-subtle border border-surface-border text-ai-text">
                    <FileText className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-medium text-copy-primary">
                    No specs generated yet
                  </p>
                  <p className="mt-1 text-[11px] text-copy-muted leading-relaxed">
                    Generate a technical specification from your current canvas and chat history.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pb-2">
                  {specs.map((spec) => (
                    <div
                      key={spec.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSpec(spec)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedSpec(spec);
                        }
                      }}
                      className="group flex items-center justify-between gap-2 rounded-xl bg-elevated border border-surface-border px-3 py-2.5 hover:border-ai/40 hover:bg-subtle/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subtle border border-surface-border text-ai-text">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium font-mono text-copy-primary truncate">
                            {spec.filename}
                          </p>
                          <p className="text-[11px] text-copy-muted truncate">
                            {formatSpecDate(spec.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Download ${spec.filename}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSpec(spec);
                        }}
                        className="shrink-0 rounded-lg text-copy-muted hover:text-copy-primary hover:bg-surface cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>
    </>
  );
}
