"use client";

import * as React from "react";
import { FolderOpen, Plus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onNewProject?: () => void;
  className?: string;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
  className,
}: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed top-14 left-0 bottom-0 z-40 w-80 max-w-[calc(100vw-2rem)] flex flex-col bg-surface/95 backdrop-blur-md border-r border-surface-border shadow-2xl transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-surface-border shrink-0">
        <h2 className="text-sm font-semibold tracking-tight text-copy-primary">
          Projects
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close sidebar"
          className="text-copy-secondary hover:text-copy-primary hover:bg-subtle cursor-pointer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-projects" className="flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 bg-subtle">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: My Projects */}
        <TabsContent
          value="my-projects"
          className="flex-1 p-4 focus-visible:outline-none flex flex-col"
        >
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
            <FolderOpen className="h-8 w-8 text-copy-muted mb-3" />
            <p className="text-sm font-medium text-copy-primary">No projects yet</p>
            <p className="mt-1 text-xs text-copy-muted max-w-[200px]">
              Create a new project to start designing your system architecture.
            </p>
          </div>
        </TabsContent>

        {/* Tab: Shared */}
        <TabsContent
          value="shared"
          className="flex-1 p-4 focus-visible:outline-none flex flex-col"
        >
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
            <Users className="h-8 w-8 text-copy-muted mb-3" />
            <p className="text-sm font-medium text-copy-primary">No shared projects</p>
            <p className="mt-1 text-xs text-copy-muted max-w-[200px]">
              Projects shared with you by other collaborators will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Action */}
      <div className="p-4 border-t border-surface-border bg-surface shrink-0">
        <Button
          variant="default"
          className="w-full gap-2 font-medium cursor-pointer"
          onClick={onNewProject}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
