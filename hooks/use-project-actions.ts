"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { generateRoomId, generateShortSuffix } from "@/lib/slug";
import type { ProjectItem } from "@/types/project";

export interface UseProjectActionsOptions {
  initialOwnedProjects?: ProjectItem[];
  initialSharedProjects?: ProjectItem[];
  activeProjectId?: string;
}

export function useProjectActions(options: UseProjectActionsOptions = {}) {
  const {
    initialOwnedProjects = [],
    initialSharedProjects = [],
    activeProjectId,
  } = options;
  const router = useRouter();

  // Project lists (initialized from server-fetched props)
  const [ownedProjects, setOwnedProjects] = React.useState<ProjectItem[]>(initialOwnedProjects);
  const [sharedProjects, setSharedProjects] = React.useState<ProjectItem[]>(initialSharedProjects);

  // Sync state during render when server revalidates props (React 19 pattern)
  const [prevInitialOwned, setPrevInitialOwned] = React.useState(initialOwnedProjects);
  if (prevInitialOwned !== initialOwnedProjects) {
    setPrevInitialOwned(initialOwnedProjects);
    setOwnedProjects(initialOwnedProjects);
  }

  const [prevInitialShared, setPrevInitialShared] = React.useState(initialSharedProjects);
  if (prevInitialShared !== initialSharedProjects) {
    setPrevInitialShared(initialSharedProjects);
    setSharedProjects(initialSharedProjects);
  }

  // Dialog visibility state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Active target project for rename or delete
  const [selectedProject, setSelectedProject] = React.useState<ProjectItem | null>(null);

  // Form states
  const [createName, setCreateName] = React.useState("");
  const [renameName, setRenameName] = React.useState("");
  const [suffix, setSuffix] = React.useState(() => generateShortSuffix(6));

  // Mutation loading and error state
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Live room ID preview derived from input name + stable suffix
  const roomIdPreview = React.useMemo(() => {
    return generateRoomId(createName, suffix);
  }, [createName, suffix]);

  // Dialog Openers / Closers
  const openCreateDialog = React.useCallback(() => {
    setCreateName("");
    setSuffix(generateShortSuffix(6));
    setError(null);
    setIsCreateOpen(true);
  }, []);

  const closeCreateDialog = React.useCallback(() => {
    setIsCreateOpen(false);
    setCreateName("");
    setError(null);
  }, []);

  const openRenameDialog = React.useCallback((project: ProjectItem) => {
    setSelectedProject(project);
    setRenameName(project.name);
    setError(null);
    setIsRenameOpen(true);
  }, []);

  const closeRenameDialog = React.useCallback(() => {
    setIsRenameOpen(false);
    setSelectedProject(null);
    setRenameName("");
    setError(null);
  }, []);

  const openDeleteDialog = React.useCallback((project: ProjectItem) => {
    setSelectedProject(project);
    setError(null);
    setIsDeleteOpen(true);
  }, []);

  const closeDeleteDialog = React.useCallback(() => {
    setIsDeleteOpen(false);
    setSelectedProject(null);
    setError(null);
  }, []);

  // Form Submission Handlers
  const handleCreateProject = React.useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const trimmed = createName.trim();
      const finalName = trimmed || "Untitled Project";
      const roomId = generateRoomId(trimmed, suffix);

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: finalName,
            id: roomId,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to create project");
        }

        const project = await res.json();
        closeCreateDialog();

        // Navigate to the new workspace and refresh data
        router.push(`/editor/${project.id}`);
        router.refresh();
      } catch (err: unknown) {
        console.error("Failed to create project:", err);
        setError(err instanceof Error ? err.message : "Failed to create project");
      } finally {
        setIsLoading(false);
      }
    },
    [createName, suffix, closeCreateDialog, router]
  );

  const handleRenameProject = React.useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!selectedProject) return;

      const trimmed = renameName.trim();
      if (!trimmed) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/projects/${selectedProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to rename project");
        }

        const updated = await res.json();

        // Optimistically update local state
        setOwnedProjects((prev) =>
          prev.map((proj) =>
            proj.id === selectedProject.id
              ? { ...proj, name: updated.name || trimmed }
              : proj
          )
        );

        closeRenameDialog();
        router.refresh();
      } catch (err: unknown) {
        console.error("Failed to rename project:", err);
        setError(err instanceof Error ? err.message : "Failed to rename project");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedProject, renameName, closeRenameDialog, router]
  );

  const handleDeleteProject = React.useCallback(async () => {
    if (!selectedProject) return;

    const targetId = selectedProject.id;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${targetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete project");
      }

      // Optimistically remove from local state
      setOwnedProjects((prev) => prev.filter((proj) => proj.id !== targetId));
      closeDeleteDialog();

      // Redirect to /editor if deleting the active workspace; otherwise refresh
      if (activeProjectId && targetId === activeProjectId) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Failed to delete project:", err);
      setError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, activeProjectId, closeDeleteDialog, router]);

  return {
    // Project Lists
    ownedProjects,
    sharedProjects,
    setOwnedProjects,
    setSharedProjects,
    selectedProject,

    // Dialog Visibility & Controls
    isCreateOpen,
    isRenameOpen,
    isDeleteOpen,
    openCreateDialog,
    closeCreateDialog,
    openRenameDialog,
    closeRenameDialog,
    openDeleteDialog,
    closeDeleteDialog,

    // Form States
    createName,
    setCreateName,
    renameName,
    setRenameName,
    roomIdPreview,
    slugPreview: roomIdPreview,

    // Async State
    isLoading,
    error,

    // Handlers
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
  };
}

export type UseProjectActionsReturn = ReturnType<typeof useProjectActions>;
