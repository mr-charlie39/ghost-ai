"use client";

import * as React from "react";
import { generateSlug } from "@/lib/slug";
import type { ProjectItem } from "@/types/project";

export const INITIAL_MOCK_OWNED_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    name: "Cloud E-Commerce Platform",
    slug: "cloud-e-commerce-platform",
    isOwner: true,
    updatedAt: "2 hours ago",
  },
  {
    id: "proj-2",
    name: "Payment Gateway Microservices",
    slug: "payment-gateway-microservices",
    isOwner: true,
    updatedAt: "Yesterday",
  },
  {
    id: "proj-3",
    name: "Real-time Analytics Pipeline",
    slug: "real-time-analytics-pipeline",
    isOwner: true,
    updatedAt: "3 days ago",
  },
];

export const INITIAL_MOCK_SHARED_PROJECTS: ProjectItem[] = [
  {
    id: "proj-4",
    name: "Auth & Identity Mesh",
    slug: "auth-identity-mesh",
    isOwner: false,
    updatedAt: "5 days ago",
  },
];

export function useProjectDialogs(initialOwned = INITIAL_MOCK_OWNED_PROJECTS, initialShared = INITIAL_MOCK_SHARED_PROJECTS) {
  // Projects mock state
  const [ownedProjects, setOwnedProjects] = React.useState<ProjectItem[]>(initialOwned);
  const [sharedProjects, setSharedProjects] = React.useState<ProjectItem[]>(initialShared);

  // Dialog visibility state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Active target project for rename or delete
  const [selectedProject, setSelectedProject] = React.useState<ProjectItem | null>(null);

  // Form states
  const [createName, setCreateName] = React.useState("");
  const [renameName, setRenameName] = React.useState("");

  // Loading state
  const [isLoading, setIsLoading] = React.useState(false);

  // Live slug preview updates as user types createName
  const slugPreview = React.useMemo(() => generateSlug(createName), [createName]);

  // Open & Close Dialog Actions
  const openCreateDialog = React.useCallback(() => {
    setCreateName("");
    setIsCreateOpen(true);
  }, []);

  const closeCreateDialog = React.useCallback(() => {
    setIsCreateOpen(false);
    setCreateName("");
  }, []);

  const openRenameDialog = React.useCallback((project: ProjectItem) => {
    setSelectedProject(project);
    setRenameName(project.name);
    setIsRenameOpen(true);
  }, []);

  const closeRenameDialog = React.useCallback(() => {
    setIsRenameOpen(false);
    setSelectedProject(null);
    setRenameName("");
  }, []);

  const openDeleteDialog = React.useCallback((project: ProjectItem) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  }, []);

  const closeDeleteDialog = React.useCallback(() => {
    setIsDeleteOpen(false);
    setSelectedProject(null);
  }, []);

  // Form Submission Handlers
  const handleCreateProject = React.useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = createName.trim();
    if (!trimmed) return;

    setIsLoading(true);
    try {
      const newProject: ProjectItem = {
        id: `proj-${Date.now()}`,
        name: trimmed,
        slug: generateSlug(trimmed) || "untitled-project",
        isOwner: true,
        updatedAt: "Just now",
      };
      setOwnedProjects((prev) => [newProject, ...prev]);
      closeCreateDialog();
    } finally {
      setIsLoading(false);
    }
  }, [createName, closeCreateDialog]);

  const handleRenameProject = React.useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProject) return;
    const trimmed = renameName.trim();
    if (!trimmed) return;

    setIsLoading(true);
    try {
      const updatedSlug = generateSlug(trimmed) || selectedProject.slug;
      setOwnedProjects((prev) =>
        prev.map((proj) =>
          proj.id === selectedProject.id
            ? { ...proj, name: trimmed, slug: updatedSlug, updatedAt: "Just now" }
            : proj
        )
      );
      closeRenameDialog();
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, renameName, closeRenameDialog]);

  const handleDeleteProject = React.useCallback(async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      setOwnedProjects((prev) => prev.filter((proj) => proj.id !== selectedProject.id));
      closeDeleteDialog();
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, closeDeleteDialog]);

  return {
    // Project Lists
    ownedProjects,
    sharedProjects,
    setOwnedProjects,
    setSharedProjects,
    selectedProject,

    // Dialog Open State & Openers/Closers
    isCreateOpen,
    isRenameOpen,
    isDeleteOpen,
    openCreateDialog,
    closeCreateDialog,
    openRenameDialog,
    closeRenameDialog,
    openDeleteDialog,
    closeDeleteDialog,

    // Form State
    createName,
    setCreateName,
    renameName,
    setRenameName,
    slugPreview,

    // Loading State
    isLoading,

    // Submission Handlers
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
  };
}

export type UseProjectDialogsReturn = ReturnType<typeof useProjectDialogs>;
