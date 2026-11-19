"use client";

import * as React from "react";
import { Folder, FolderOpen, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "@/types/project";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onNewProject?: () => void;
  ownedProjects?: ProjectItem[];
  sharedProjects?: ProjectItem[];
  onRenameProject?: (project: ProjectItem) => void;
  onDeleteProject?: (project: ProjectItem) => void;
  className?: string;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
  ownedProjects = [],
  sharedProjects = [],
  onRenameProject,
  onDeleteProject,
  className,
}: ProjectSidebarProps) {
  return (
    <>
      {/* Mobile backdrop scrim: tapping outside the sidebar closes it */}
      {isOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 top-14 z-30 bg-black/60 backdrop-blur-xs md:hidden cursor-pointer"
        />
      )}

      {/* Floating Project Sidebar Overlay */}
      <aside
        aria-hidden={!isOpen}
        inert={!isOpen}
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
          <div className="px-4 pt-4 shrink-0">
            <TabsList className="grid w-full grid-cols-2 bg-subtle">
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: My Projects */}
          <TabsContent
            value="my-projects"
            className="flex-1 p-4 focus-visible:outline-none flex flex-col min-h-0"
          >
            {ownedProjects.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
                <FolderOpen className="h-8 w-8 text-copy-muted mb-3" />
                <p className="text-sm font-medium text-copy-primary">No projects yet</p>
                <p className="mt-1 text-xs text-copy-muted max-w-[200px]">
                  Create a new project to start designing your system architecture.
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-1.5 pb-2">
                  {ownedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group flex items-center justify-between gap-2 rounded-xl p-2.5 transition-colors hover:bg-subtle/80 border border-transparent hover:border-surface-border select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-base border border-surface-border text-copy-muted group-hover:text-brand">
                          <Folder className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate text-xs font-medium text-copy-primary">
                            {project.name}
                          </span>
                          <span className="truncate text-[10px] text-copy-faint font-mono">
                            {project.slug}
                          </span>
                        </div>
                      </div>

                      {/* Owned project actions: Rename & Delete */}
                      {project.isOwner && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRenameProject?.(project);
                            }}
                            aria-label={`Rename ${project.name}`}
                            className="text-copy-muted hover:text-copy-primary hover:bg-surface cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProject?.(project);
                            }}
                            aria-label={`Delete ${project.name}`}
                            className="text-copy-muted hover:text-state-error hover:bg-surface cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Tab: Shared */}
          <TabsContent
            value="shared"
            className="flex-1 p-4 focus-visible:outline-none flex flex-col min-h-0"
          >
            {sharedProjects.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
                <Users className="h-8 w-8 text-copy-muted mb-3" />
                <p className="text-sm font-medium text-copy-primary">No shared projects</p>
                <p className="mt-1 text-xs text-copy-muted max-w-[200px]">
                  Projects shared with you by other collaborators will appear here.
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-1.5 pb-2">
                  {sharedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group flex items-center justify-between gap-2 rounded-xl p-2.5 transition-colors hover:bg-subtle/80 border border-transparent hover:border-surface-border select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-base border border-surface-border text-copy-muted group-hover:text-brand">
                          <Folder className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate text-xs font-medium text-copy-primary">
                            {project.name}
                          </span>
                          <span className="truncate text-[10px] text-copy-faint font-mono">
                            {project.slug}
                          </span>
                        </div>
                      </div>
                      {/* Hide actions for shared/collaborator projects */}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom Action: Sidebar Create -> Create Dialog */}
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
    </>
  );
}
