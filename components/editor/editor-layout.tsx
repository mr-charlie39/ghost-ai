"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Folder,
  LayoutTemplate,
  Loader2,
  Save,
  Share2,
  Sparkles,
} from "lucide-react";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import {
  CanvasSaveProvider,
  useCanvasSave,
} from "@/components/editor/canvas-save-context";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { EditorHome } from "@/components/editor/editor-home";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import {
  TemplateImportProvider,
  useTemplateImport,
} from "@/components/editor/template-import-context";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
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

export function EditorLayout(props: EditorLayoutProps) {
  return (
    <CanvasSaveProvider>
      <TemplateImportProvider>
        <EditorLayoutInner {...props} />
      </TemplateImportProvider>
    </CanvasSaveProvider>
  );
}

function EditorLayoutInner({
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
  const canvasSave = useCanvasSave();
  const templateImport = useTemplateImport();
  const saveStatus = canvasSave?.saveStatus ?? "idle";
  const currentActiveId = activeRoomId || activeProjectId;
  const isWorkspace = showWorkspaceActions || Boolean(currentActiveId);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = React.useState(false);

  const handleImportTemplate = React.useCallback(
    (template: CanvasTemplate) => {
      templateImport?.requestTemplateImport(template);
    },
    [templateImport]
  );

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
          {/* Save button with autosave status indicator */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void canvasSave?.triggerManualSave()}
            disabled={saveStatus === "saving"}
            aria-label={
              saveStatus === "saving"
                ? "Saving canvas"
                : saveStatus === "saved"
                  ? "Canvas saved"
                  : saveStatus === "error"
                    ? "Save failed, click to retry"
                    : "Save canvas"
            }
            className={cn(
              "h-8 gap-1.5 text-xs cursor-pointer transition-colors",
              saveStatus === "error"
                ? "text-state-error hover:text-state-error hover:bg-state-error/10"
                : "text-copy-secondary hover:text-copy-primary hover:bg-subtle"
            )}
          >
            {saveStatus === "saving" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
            ) : saveStatus === "saved" ? (
              <Check className="h-3.5 w-3.5 text-state-success" />
            ) : saveStatus === "error" ? (
              <AlertCircle className="h-3.5 w-3.5 text-state-error" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "error"
                    ? "Error"
                    : "Save"}
            </span>
          </Button>

          {/* Starter Templates button that opens StarterTemplatesModal */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsTemplatesOpen(true)}
            aria-label="Open starter templates"
            className="h-8 gap-1.5 text-xs text-copy-secondary hover:text-copy-primary hover:bg-subtle cursor-pointer transition-colors"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </Button>

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
        showUserButton={!isWorkspace}
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
        <AiSidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
          roomId={currentActiveId}
        />
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

      {/* Starter Templates Modal */}
      {isWorkspace && (
        <StarterTemplatesModal
          open={isTemplatesOpen}
          onOpenChange={setIsTemplatesOpen}
          onImport={handleImportTemplate}
        />
      )}
    </div>
  );
}
