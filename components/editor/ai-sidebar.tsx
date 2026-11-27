"use client";

import * as React from "react";
import { Bot, Download, FileText, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

const MIN_TEXTAREA_HEIGHT = 72;
const MAX_TEXTAREA_HEIGHT = 160;

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<"architect" | "specs">("architect");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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

  const handleSubmit = React.useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const trimmed = prompt.trim();
      if (!trimmed) return;

      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: trimmed,
        },
      ]);
      setPrompt("");
    },
    [prompt]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleStarterClick = React.useCallback((starter: string) => {
    setPrompt(starter);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  return (
    <>
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
                        onClick={() => handleStarterClick(starter)}
                        className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-ai-text border border-surface-border hover:border-ai/40 transition-colors cursor-pointer"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-full",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap select-text",
                          message.role === "user"
                            ? "bg-accent-dim border-2 border-brand/50 text-copy-primary"
                            : "bg-elevated border border-surface-border text-ai-text"
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input Area */}
            <form
              onSubmit={handleSubmit}
              className="p-4 pt-3 border-t border-surface-border shrink-0"
            >
              <div className="relative flex flex-col gap-2 rounded-2xl bg-surface border border-surface-border p-2.5 focus-within:border-ai/50 transition-colors">
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe a system architecture..."
                  className="min-h-[72px] max-h-[160px] w-full resize-none overflow-y-auto border-0 bg-transparent p-1 text-xs text-copy-primary placeholder:text-copy-muted focus-visible:ring-0 focus-visible:border-0 shadow-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-copy-muted px-1">
                    Enter to send · Shift+Enter for newline
                  </span>
                  <Button
                    type="submit"
                    size="icon-sm"
                    disabled={!prompt.trim()}
                    aria-label="Send prompt"
                    className="bg-ai text-white hover:bg-ai/90 disabled:opacity-40 cursor-pointer shrink-0 rounded-xl"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* Specs Tab */}
          <TabsContent
            value="specs"
            className="flex flex-1 flex-col overflow-y-auto p-4 gap-4 mt-0"
          >
            <Button
              type="button"
              className="w-full bg-ai text-white hover:bg-ai/90 rounded-xl gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Generate Spec
            </Button>

            <div className="rounded-2xl bg-elevated border border-surface-border p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-subtle border border-surface-border text-ai-text">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-copy-primary truncate">
                    System Architecture Spec
                  </h4>
                  <p className="mt-1 text-xs text-copy-muted leading-relaxed line-clamp-3">
                    Technical specification summarizing services, data stores, edge contracts, and deployment boundaries from the current canvas graph.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                <span className="text-[11px] font-mono text-copy-muted">
                  architecture-spec.md
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="gap-1.5 rounded-xl border-surface-border text-copy-muted"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </aside>
    </>
  );
}
