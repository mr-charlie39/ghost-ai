"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { EditorHome } from "@/components/editor/editor-home";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { useProjectActions } from "@/hooks/use-project-actions";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "@/types/project";

export interface EditorLayoutProps {
  children?: React.ReactNode;
  centerNavbarContent?: React.ReactNode;
  rightNavbarContent?: React.ReactNode;
  className?: string;
  initialOwnedProjects?: ProjectItem[];
  initialSharedProjects?: ProjectItem[];
  activeProjectId?: string;
}

export function EditorLayout({
  children,
  centerNavbarContent,
  rightNavbarContent,
  className,
  initialOwnedProjects,
  initialSharedProjects,
  activeProjectId,
}: EditorLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const projectActions = useProjectActions({
    initialOwnedProjects,
    initialSharedProjects,
    activeProjectId,
  });

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
        centerContent={centerNavbarContent}
        rightContent={rightNavbarContent}
      />

      {/* Floating Project Sidebar Overlay */}
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={projectActions.openCreateDialog}
        ownedProjects={projectActions.ownedProjects}
        sharedProjects={projectActions.sharedProjects}
        onSelectProject={(project) => {
          setIsSidebarOpen(false);
          router.push(`/editor/${project.id}`);
        }}
        onRenameProject={projectActions.openRenameDialog}
        onDeleteProject={projectActions.openDeleteDialog}
      />

      {/* Main Canvas Workspace / Editor Home */}
      <main className="relative flex flex-1 overflow-hidden bg-base">
        {children ? (
          children
        ) : (
          <EditorHome onNewProject={projectActions.openCreateDialog} />
        )}
      </main>

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
      />
    </div>
  );
}
