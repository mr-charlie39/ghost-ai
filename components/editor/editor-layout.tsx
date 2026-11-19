"use client";

import * as React from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { EditorHome } from "@/components/editor/editor-home";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import { cn } from "@/lib/utils";

export interface EditorLayoutProps {
  children?: React.ReactNode;
  centerNavbarContent?: React.ReactNode;
  rightNavbarContent?: React.ReactNode;
  className?: string;
}

export function EditorLayout({
  children,
  centerNavbarContent,
  rightNavbarContent,
  className,
}: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const projectDialogs = useProjectDialogs();

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
        onNewProject={projectDialogs.openCreateDialog}
        ownedProjects={projectDialogs.ownedProjects}
        sharedProjects={projectDialogs.sharedProjects}
        onRenameProject={projectDialogs.openRenameDialog}
        onDeleteProject={projectDialogs.openDeleteDialog}
      />

      {/* Main Canvas Workspace / Editor Home */}
      <main className="relative flex flex-1 overflow-hidden bg-base">
        {children ? (
          children
        ) : (
          <EditorHome onNewProject={projectDialogs.openCreateDialog} />
        )}
      </main>

      {/* Project Dialogs (Create, Rename, Delete) */}
      <ProjectDialogs
        isCreateOpen={projectDialogs.isCreateOpen}
        onCloseCreate={projectDialogs.closeCreateDialog}
        createName={projectDialogs.createName}
        onChangeCreateName={projectDialogs.setCreateName}
        slugPreview={projectDialogs.slugPreview}
        onSubmitCreate={projectDialogs.handleCreateProject}
        isRenameOpen={projectDialogs.isRenameOpen}
        onCloseRename={projectDialogs.closeRenameDialog}
        renameName={projectDialogs.renameName}
        onChangeRenameName={projectDialogs.setRenameName}
        targetProject={projectDialogs.selectedProject}
        onSubmitRename={projectDialogs.handleRenameProject}
        isDeleteOpen={projectDialogs.isDeleteOpen}
        onCloseDelete={projectDialogs.closeDeleteDialog}
        onSubmitDelete={projectDialogs.handleDeleteProject}
        isLoading={projectDialogs.isLoading}
      />
    </div>
  );
}
