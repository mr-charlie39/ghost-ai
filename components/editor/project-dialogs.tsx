"use client";

import * as React from "react";
import { AlertTriangle, Hash } from "lucide-react";
import { DialogPattern } from "@/components/editor/dialog-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectItem } from "@/types/project";

/* -------------------------------------------------------------------------- */
/* Create Project Dialog                                                      */
/* -------------------------------------------------------------------------- */

export interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onChangeName: (name: string) => void;
  slugPreview?: string;
  roomIdPreview?: string;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  projectName,
  onChangeName,
  slugPreview,
  roomIdPreview,
  onSubmit,
  isLoading = false,
  errorMessage,
}: CreateProjectDialogProps) {
  const displayPreview = roomIdPreview || slugPreview || "untitled-project";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || isLoading) return;
    onSubmit(e);
  };

  return (
    <DialogPattern
      open={open}
      onOpenChange={onOpenChange}
      title="Create Project"
      description="Start a new architecture workspace for your system design."
      footerActions={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="cursor-pointer text-copy-muted hover:text-copy-primary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-project-form"
            disabled={!projectName.trim() || isLoading}
            className="cursor-pointer font-medium"
          >
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && <p role="alert" className="text-xs text-state-error">{errorMessage}</p>}
        <div className="space-y-1.5">
          <label
            htmlFor="create-project-name"
            className="text-xs font-medium text-copy-secondary"
          >
            Project Name
          </label>
          <Input
            id="create-project-name"
            placeholder="e.g. Cloud E-Commerce Platform"
            value={projectName}
            onChange={(e) => onChangeName(e.target.value)}
            autoFocus
            disabled={isLoading}
            className="bg-base border-surface-border text-copy-primary placeholder:text-copy-faint"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-copy-muted flex items-center gap-1.5">
            <Hash className="h-3 w-3 text-brand" />
            <span>Room ID Preview</span>
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-base px-3 py-2 text-xs">
            <span className="font-mono text-brand font-medium">
              {displayPreview}
            </span>
          </div>
        </div>
      </form>
    </DialogPattern>
  );
}

/* -------------------------------------------------------------------------- */
/* Rename Project Dialog                                                      */
/* -------------------------------------------------------------------------- */

export interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onChangeName: (name: string) => void;
  targetProject: ProjectItem | null;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  projectName,
  onChangeName,
  targetProject,
  onSubmit,
  isLoading = false,
  errorMessage,
}: RenameProjectDialogProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus input when dialog opens
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || isLoading) return;
    onSubmit(e);
  };

  return (
    <DialogPattern
      open={open}
      onOpenChange={onOpenChange}
      title="Rename Project"
      description={
        targetProject
          ? `Current project: "${targetProject.name}". Enter a new name below.`
          : "Enter a new project name below."
      }
      footerActions={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="cursor-pointer text-copy-muted hover:text-copy-primary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="rename-project-form"
            disabled={!projectName.trim() || isLoading}
            className="cursor-pointer font-medium"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </>
      }
    >
      <form id="rename-project-form" onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && <p role="alert" className="text-xs text-state-error">{errorMessage}</p>}
        <div className="space-y-1.5">
          <label
            htmlFor="rename-project-name"
            className="text-xs font-medium text-copy-secondary"
          >
            Project Name
          </label>
          <Input
            ref={inputRef}
            id="rename-project-name"
            value={projectName}
            onChange={(e) => onChangeName(e.target.value)}
            disabled={isLoading}
            autoFocus
            className="bg-base border-surface-border text-copy-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
      </form>
    </DialogPattern>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete Project Dialog                                                      */
/* -------------------------------------------------------------------------- */

export interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetProject: ProjectItem | null;
  onSubmit: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  targetProject,
  onSubmit,
  isLoading = false,
  errorMessage,
}: DeleteProjectDialogProps) {
  return (
    <DialogPattern
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Project"
      description={
        targetProject
          ? `Are you sure you want to delete "${targetProject.name}"? This action cannot be undone.`
          : "Are you sure you want to delete this project? This action cannot be undone."
      }
      footerActions={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="cursor-pointer text-copy-muted hover:text-copy-primary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onSubmit}
            disabled={isLoading}
            className="cursor-pointer font-medium bg-state-error text-white hover:bg-state-error/90"
          >
            {isLoading ? "Deleting..." : "Delete Project"}
          </Button>
        </>
      }
    >
      {/* Destructive confirmation warning box */}
      <div className="flex items-start gap-2.5 rounded-xl border border-state-error/30 bg-state-error/10 p-3 text-xs text-state-error">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          All architecture diagrams, specs, and collaborator data associated with this project will be permanently removed.
        </span>
      </div>
      {errorMessage && <p role="alert" className="text-xs text-state-error">{errorMessage}</p>}
    </DialogPattern>
  );
}

/* -------------------------------------------------------------------------- */
/* Combined Project Dialogs                                                   */
/* -------------------------------------------------------------------------- */

export interface ProjectDialogsProps {
  isCreateOpen: boolean;
  onCloseCreate: () => void;
  createName: string;
  onChangeCreateName: (name: string) => void;
  slugPreview?: string;
  roomIdPreview?: string;
  onSubmitCreate: (e?: React.FormEvent) => void;

  isRenameOpen: boolean;
  onCloseRename: () => void;
  renameName: string;
  onChangeRenameName: (name: string) => void;
  targetProject: ProjectItem | null;
  onSubmitRename: (e?: React.FormEvent) => void;

  isDeleteOpen: boolean;
  onCloseDelete: () => void;
  onSubmitDelete: () => void;

  isLoading?: boolean;
  mutationError?: string | null;
}

export function ProjectDialogs({
  isCreateOpen,
  onCloseCreate,
  createName,
  onChangeCreateName,
  slugPreview,
  roomIdPreview,
  onSubmitCreate,

  isRenameOpen,
  onCloseRename,
  renameName,
  onChangeRenameName,
  targetProject,
  onSubmitRename,

  isDeleteOpen,
  onCloseDelete,
  onSubmitDelete,

  isLoading = false,
  mutationError,
}: ProjectDialogsProps) {
  return (
    <>
      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={(open) => !open && onCloseCreate()}
        projectName={createName}
        onChangeName={onChangeCreateName}
        slugPreview={slugPreview}
        roomIdPreview={roomIdPreview}
        onSubmit={onSubmitCreate}
        isLoading={isLoading}
        errorMessage={mutationError}
      />

      <RenameProjectDialog
        open={isRenameOpen}
        onOpenChange={(open) => !open && onCloseRename()}
        projectName={renameName}
        onChangeName={onChangeRenameName}
        targetProject={targetProject}
        onSubmit={onSubmitRename}
        isLoading={isLoading}
        errorMessage={mutationError}
      />

      <DeleteProjectDialog
        open={isDeleteOpen}
        onOpenChange={(open) => !open && onCloseDelete()}
        targetProject={targetProject}
        onSubmit={onSubmitDelete}
        isLoading={isLoading}
        errorMessage={mutationError}
      />
    </>
  );
}
