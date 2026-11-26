"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bot, Folder, Send, Share2, Sparkles, X } from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { EditorHome } from "@/components/editor/editor-home";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { Button } from "@/components/ui/button";
import { useProjectActions } from "@/hooks/use-project-actions";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "@/types/project";

export interface EditorLayoutProps {
  children?: React.ReactNode;
  projectName?: string;
  centerNavbarContent?: React.ReactNode;
  rightNavbarContent?: React.ReactNode;
  showWorkspaceActions?: boolean;
  className?: string;
  initialOwnedProjects?: ProjectItem[];
  initialSharedProjects?: ProjectItem[];
  activeProjectId?: string;
  activeRoomId?: string;
  isOwner?: boolean;
}

export function EditorLayout({
  children,
  projectName,
  centerNavbarContent,
  rightNavbarContent,
  showWorkspaceActions,
  className,
  initialOwnedProjects,
  initialSharedProjects,
  activeProjectId,
  activeRoomId,
  isOwner = false,
}: EditorLayoutProps) {
  const router = useRouter();
  const currentActiveId = activeRoomId || activeProjectId;
  const isWorkspace = showWorkspaceActions || Boolean(currentActiveId);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiStatusMessage, setAiStatusMessage] = React.useState<string | null>(null);

  const handleSendPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiStatusMessage(`Prompt "${aiPrompt.trim()}" queued for AI generation.`);
    setTimeout(() => setAiStatusMessage(null), 3500);
  };

  const projectActions = useProjectActions({
    initialOwnedProjects,
    initialSharedProjects,
    activeProjectId: currentActiveId,
    activeRoomId: currentActiveId,
  });

  const centerContent = centerNavbarContent || (
    projectName ? (
      <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-base/60 px-3 py-1 shadow-xs">
        <div className="flex h-4 w-4 items-center justify-center text-brand">
          <Folder className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs sm:text-sm font-medium text-copy-primary truncate max-w-[160px] sm:max-w-xs md:max-w-md">
          {projectName}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 pl-1.5 text-[10px] font-mono text-copy-faint border-l border-surface-border">
          <span className="h-1.5 w-1.5 rounded-full bg-state-success animate-pulse" />
          Ready
        </span>
      </div>
    ) : null
  );

  const rightContent = (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {rightNavbarContent}
      {isWorkspace && (
        <>
          {/* Share button that opens ShareDialog */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsShareOpen(true)}
            aria-label="Open share dialog"
            className="h-8 gap-1.5 text-xs text-copy-secondary hover:text-copy-primary hover:bg-subtle cursor-pointer transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          {/* AI sidebar toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAiSidebarOpen((prev) => !prev)}
            aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            className={cn(
              "h-8 gap-1.5 text-xs cursor-pointer transition-colors",
              isAiSidebarOpen
                ? "bg-accent-ai/15 text-accent-ai-text hover:bg-accent-ai/25 ring-1 ring-accent-ai/30"
                : "text-copy-secondary hover:text-copy-primary hover:bg-subtle"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-ai" />
            <span className="hidden sm:inline">AI</span>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex h-screen w-screen flex-col overflow-hidden bg-base text-copy-primary",
        className
      )}
    >
      {/* Top Navbar */}
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        centerContent={centerContent}
        rightContent={rightContent}
      />

      {/* Floating Project Sidebar Overlay */}
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={projectActions.openCreateDialog}
        ownedProjects={projectActions.ownedProjects}
        sharedProjects={projectActions.sharedProjects}
        activeRoomId={currentActiveId}
        activeProjectId={currentActiveId}
        onSelectProject={(project) => {
          setIsSidebarOpen(false);
          router.push(`/editor/${project.id}`);
        }}
        onRenameProject={projectActions.openRenameDialog}
        onDeleteProject={projectActions.openDeleteDialog}
      />

      {/* Main Workspace Body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Central Canvas Area: fills remaining space */}
        <main className="relative flex flex-1 overflow-hidden bg-base">
          {children ? (
            children
          ) : (
            <EditorHome
              onNewProject={projectActions.openCreateDialog}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          )}
        </main>

        {/* Floating Right AI Sidebar Overlay */}
        {isAiSidebarOpen && (
          <div
            role="presentation"
            aria-hidden="true"
            onClick={() => setIsAiSidebarOpen(false)}
            className="fixed inset-0 top-14 z-30 bg-black/60 backdrop-blur-xs md:hidden cursor-pointer"
          />
        )}
        <aside
          aria-label="AI Sidebar"
          aria-hidden={!isAiSidebarOpen}
          inert={!isAiSidebarOpen}
          className={cn(
            "fixed top-14 right-0 bottom-0 z-40 w-80 md:w-96 max-w-[calc(100vw-2rem)] flex flex-col bg-surface/95 backdrop-blur-md border-l border-surface-border select-none transition-all duration-300 ease-in-out",
            isAiSidebarOpen
              ? "translate-x-0 shadow-2xl opacity-100"
              : "translate-x-[calc(100%+1rem)] shadow-none opacity-0 pointer-events-none"
          )}
        >
          {/* AI Sidebar Header */}
          <div className="flex h-14 items-center justify-between px-4 border-b border-surface-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-ai/10 border border-accent-ai/30 text-accent-ai">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-copy-primary">AI Architect</h3>
                <p className="text-[10px] text-copy-muted font-mono">Durable agent runner</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsAiSidebarOpen(false)}
              aria-label="Close AI sidebar"
              className="text-copy-muted hover:text-copy-primary hover:bg-subtle cursor-pointer rounded-lg"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* AI Assistant Chat Body Placeholder */}
          <div className="flex flex-1 flex-col justify-between p-4 overflow-hidden">
            <div className="flex flex-col items-center justify-center text-center my-auto px-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base border border-surface-border text-accent-ai mb-3 shadow-[0_0_20px_rgba(100,87,249,0.15)]">
                <Bot className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-copy-primary">Describe your architecture</p>
              <p className="mt-1 text-[11px] text-copy-muted max-w-[240px] leading-relaxed">
                The AI agent maps plain English system requirements into nodes and edges on the canvas.
              </p>

              {/* Example prompt pills */}
              <div className="mt-5 flex flex-col gap-1.5 w-full text-left">
                <span className="text-[10px] font-medium text-copy-faint uppercase tracking-wider px-1">
                  Try suggesting:
                </span>
                <button
                  type="button"
                  onClick={() => setAiPrompt("Event-driven microservices with Kafka and Redis")}
                  className="text-[11px] text-left text-copy-secondary bg-base border border-surface-border rounded-lg px-2.5 py-1.5 hover:border-accent-ai/50 hover:text-accent-ai transition-colors cursor-pointer"
                >
                  &ldquo;Event-driven microservices with Kafka&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt("Serverless REST API with Redis cache and Auth0")}
                  className="text-[11px] text-left text-copy-secondary bg-base border border-surface-border rounded-lg px-2.5 py-1.5 hover:border-accent-ai/50 hover:text-accent-ai transition-colors cursor-pointer"
                >
                  &ldquo;Serverless REST API with Redis cache&rdquo;
                </button>
              </div>
            </div>

            {/* Status notification toast */}
            {aiStatusMessage && (
              <div className="mb-2 p-2 rounded-lg bg-accent-ai/10 border border-accent-ai/30 text-[11px] text-accent-ai animate-in fade-in slide-in-from-bottom-1">
                {aiStatusMessage}
              </div>
            )}

            {/* Prompt input bar at bottom */}
            <form onSubmit={handleSendPrompt} className="pt-3 border-t border-surface-border">
              <div className="relative flex items-center rounded-xl bg-base border border-surface-border px-3 py-2 focus-within:border-accent-ai/50 focus-within:ring-1 focus-within:ring-accent-ai/30 transition-all">
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI to design system..."
                  className="w-full bg-transparent text-xs text-copy-primary placeholder:text-copy-faint outline-none"
                />
                <button
                  type="submit"
                  disabled={!aiPrompt.trim()}
                  aria-label="Send prompt"
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-ai/15 text-accent-ai hover:bg-accent-ai hover:text-white disabled:opacity-30 disabled:hover:bg-accent-ai/15 disabled:hover:text-accent-ai shrink-0 ml-1 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-copy-faint">
                <span>Trigger.dev background worker</span>
                <span className="font-mono text-emerald-400/90 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Ready
                </span>
              </div>
            </form>
          </div>
        </aside>
      </div>

      {/* Project Dialogs (Create, Rename, Delete) */}
      <ProjectDialogs
        isCreateOpen={projectActions.isCreateOpen}
        onCloseCreate={projectActions.closeCreateDialog}
        createName={projectActions.createName}
        onChangeCreateName={projectActions.setCreateName}
        roomIdPreview={projectActions.roomIdPreview}
        onSubmitCreate={projectActions.handleCreateProject}
        isRenameOpen={projectActions.isRenameOpen}
        onCloseRename={projectActions.closeRenameDialog}
        renameName={projectActions.renameName}
        onChangeRenameName={projectActions.setRenameName}
        targetProject={projectActions.selectedProject}
        onSubmitRename={projectActions.handleRenameProject}
        isDeleteOpen={projectActions.isDeleteOpen}
        onCloseDelete={projectActions.closeDeleteDialog}
        onSubmitDelete={projectActions.handleDeleteProject}
        isLoading={projectActions.isLoading}
        mutationError={projectActions.error}
      />

      {/* Share Dialog */}
      {currentActiveId && (
        <ShareDialog
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          projectId={currentActiveId}
          projectName={projectName}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}
