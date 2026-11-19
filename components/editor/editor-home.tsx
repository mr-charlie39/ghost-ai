"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EditorHomeProps {
  onNewProject: () => void;
}

export function EditorHome({ onNewProject }: EditorHomeProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-6 select-none">
      {/* Subtle workspace canvas dot-grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#2a2a30_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Minimal center content - not wrapped in cards */}
      <div className="z-10 flex flex-col items-center justify-center text-center max-w-lg">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="mt-2 text-sm text-copy-muted leading-relaxed">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
        <Button
          onClick={onNewProject}
          className="mt-6 gap-2 font-medium cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  );
}
