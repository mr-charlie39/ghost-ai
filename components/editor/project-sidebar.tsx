"use client";

import * as React from "react";
import {
  Folder,
  FolderGit2,
  FolderOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  activeRoomId?: string;
  activeProjectId?: string;
  onSelectProject?: (project: ProjectItem) => void;
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
  activeRoomId,
  activeProjectId,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
  className,
}: ProjectSidebarProps) {
  const activeId = activeRoomId || activeProjectId;
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredOwned = React.useMemo(() => {
    if (!searchQuery.trim()) return ownedProjects;
    const q = searchQuery.toLowerCase();
    return ownedProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [ownedProjects, searchQuery]);

  const filteredShared = React.useMemo(() => {
    if (!searchQuery.trim()) return sharedProjects;
    const q = searchQuery.toLowerCase();
    return sharedProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [sharedProjects, searchQuery]);

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
          "fixed top-14 left-0 bottom-0 z-40 w-80 max-w-[calc(100vw-2rem)] flex flex-col bg-surface/95 backdrop-blur-md border-r border-surface-border transition-all duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 shadow-2xl opacity-100"
            : "-translate-x-[calc(100%+1rem)] shadow-none opacity-0 pointer-events-none",
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-base border border-surface-border text-brand">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold tracking-tight text-copy-primary">
                Workspaces
              </h2>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-subtle text-copy-muted border border-surface-border/50">
                {ownedProjects.length + sharedProjects.length}
              </span>
            </div>
          </div>
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

        {/* Search bar */}
        <div className="px-4 pt-3 shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-copy-muted pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter workspaces..."
              className="h-8 pl-8 text-xs bg-base border-surface-border text-copy-primary placeholder:text-copy-faint rounded-lg focus-visible:ring-1 focus-visible:ring-brand/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-copy-faint hover:text-copy-primary text-xs"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-projects" className="flex flex-col flex-1 min-h-0">
          <div className="px-4 pt-3 shrink-0">
            <TabsList className="grid w-full grid-cols-2 bg-subtle h-8 p-0.5 rounded-lg">
              <TabsTrigger
                value="my-projects"
                className="text-xs gap-1.5 cursor-pointer data-[state=active]:bg-surface data-[state=active]:text-copy-primary data-[state=active]:shadow-xs"
              >
                <Folder className="h-3.5 w-3.5 text-copy-muted" />
                <span>Mine</span>
                <span className="text-[10px] opacity-70 font-mono">
                  ({filteredOwned.length})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="shared"
                className="text-xs gap-1.5 cursor-pointer data-[state=active]:bg-surface data-[state=active]:text-copy-primary data-[state=active]:shadow-xs"
              >
                <Users className="h-3.5 w-3.5 text-copy-muted" />
                <span>Shared</span>
                <span className="text-[10px] opacity-70 font-mono">
                  ({filteredShared.length})
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: My Projects */}
          <TabsContent
            value="my-projects"
            className="flex-1 p-4 focus-visible:outline-none flex flex-col min-h-0"
          >
            {filteredOwned.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
                <FolderOpen className="h-8 w-8 text-copy-muted mb-3" />
                <p className="text-sm font-medium text-copy-primary">
                  {searchQuery ? "No matching projects" : "No projects yet"}
                </p>
                <p className="mt-1 text-xs text-copy-muted max-w-[200px]">
                  {searchQuery
                    ? "Try a different search query."
                    : "Create a new project to start designing your system architecture."}
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-1.5 pb-2">
                  {filteredOwned.map((project) => {
                    const isActive = project.id === activeId;
                    return (
                      <div
                        key={project.id}
                        className={cn(
                          "group relative flex items-center justify-between gap-2 rounded-xl p-2.5 transition-all select-none cursor-pointer border",
                          isActive
                            ? "bg-subtle border-surface-border text-copy-primary shadow-xs ring-1 ring-brand/40"
                            : "border-transparent hover:border-surface-border hover:bg-subtle/80"
                        )}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand" />
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectProject?.(project)}
                          className="flex items-center gap-2.5 min-w-0 flex-1 pl-0.5 text-left"
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                              isActive
                                ? "bg-brand/10 border-brand/40 text-brand"
                                : "bg-base border-surface-border text-copy-muted group-hover:text-brand group-hover:border-brand/30"
                            )}
                          >
                            <Folder className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "truncate text-xs font-medium",
                                  isActive ? "text-brand font-semibold" : "text-copy-primary"
                                )}
                              >
                                {project.name}
                              </span>
                              {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-state-success shrink-0" />
                              )}
                            </div>
                            <span className="truncate text-[10px] text-copy-faint font-mono">
                              {project.slug}
                            </span>
                          </div>
                        </button>

                        {/* Owned project actions: Rename & Delete */}
                        {project.isOwner && (
                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => onRenameProject?.(project)}
                              aria-label={`Rename ${project.name}`}
                              className="text-copy-muted hover:text-copy-primary hover:bg-surface cursor-pointer rounded-lg"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => onDeleteProject?.(project)}
                              aria-label={`Delete ${project.name}`}
                              className="text-copy-muted hover:text-state-error hover:bg-surface cursor-pointer rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Tab: Shared */}
          <TabsContent
            value="shared"
            className="flex-1 p-4 focus-visible:outline-none flex flex-col min-h-0"
          >
            {filteredShared.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
                <Users className="h-8 w-8 text-copy-muted mb-3" />
                <p className="text-sm font-medium text-copy-primary">
                  {searchQuery ? "No matching projects" : "No shared projects"}
                </p>
                <p className="mt-1 text-xs text-copy-muted max-w-[200px]">
                  {searchQuery
                    ? "Try a different search query."
                    : "Projects shared with you by other collaborators will appear here."}
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-1.5 pb-2">
                  {filteredShared.map((project) => {
                    const isActive = project.id === activeId;
                    return (
                      <div
                        key={project.id}
                        className={cn(
                          "group relative flex items-center justify-between gap-2 rounded-xl p-2.5 transition-all select-none cursor-pointer border",
                          isActive
                            ? "bg-subtle border-surface-border text-copy-primary shadow-xs ring-1 ring-brand/40"
                            : "border-transparent hover:border-surface-border hover:bg-subtle/80"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand" />
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectProject?.(project)}
                          className="flex items-center gap-2.5 min-w-0 flex-1 pl-0.5 text-left"
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                              isActive
                                ? "bg-brand/10 border-brand/40 text-brand"
                                : "bg-base border-surface-border text-copy-muted group-hover:text-brand"
                            )}
                          >
                            <Folder className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "truncate text-xs font-medium",
                                  isActive ? "text-brand font-semibold" : "text-copy-primary"
                                )}
                              >
                                {project.name}
                              </span>
                              {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-state-success shrink-0" />
                              )}
                            </div>
                            <span className="truncate text-[10px] text-copy-faint font-mono">
                              {project.slug}
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom Action: Sidebar Create -> Create Dialog */}
        <div className="p-3 border-t border-surface-border bg-surface shrink-0">
          <Button
            variant="default"
            className="w-full gap-2 font-medium cursor-pointer bg-brand text-base hover:bg-brand/90 hover:shadow-[0_0_15px_rgba(0,200,212,0.25)] transition-all h-9 rounded-xl"
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
