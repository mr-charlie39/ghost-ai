"use client";

import * as React from "react";
import { Cpu, Plus, Sparkles, Users } from "lucide-react";
import { GhostLogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";

export interface EditorHomeProps {
  onNewProject: () => void;
  onOpenSidebar?: () => void;
}

export function EditorHome({ onNewProject, onOpenSidebar }: EditorHomeProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-6 select-none overflow-hidden">
      {/* Subtle workspace canvas dot-grid with radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(#2a2a30_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-base/90 pointer-events-none" />

      {/* Decorative blueprint corner marks */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-surface-border pointer-events-none opacity-50" />
      <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-surface-border pointer-events-none opacity-50" />
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-surface-border pointer-events-none opacity-50" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-surface-border pointer-events-none opacity-50" />

      {/* Center content container */}
      <div className="z-10 flex flex-col items-center justify-center text-center max-w-lg animate-in fade-in zoom-in-95 duration-300">
        {/* Ambient brand logo badge */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-surface-border shadow-[0_0_35px_rgba(0,200,212,0.2)] mb-5 hover:border-brand/40 transition-colors">
          <GhostLogoMark className="h-10 w-10" />
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand/20 border border-brand flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-brand animate-ping" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-copy-primary">
          Design system architecture <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-copy-primary via-brand to-copy-primary">
            with collaborative AI
          </span>
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-copy-muted max-w-md leading-relaxed">
          Create an empty architecture workspace or choose an existing project from the sidebar to start designing nodes, edges, and specs.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={onNewProject}
            className="gap-2 font-medium cursor-pointer bg-brand text-base hover:bg-brand/90 hover:shadow-[0_0_20px_rgba(0,200,212,0.35)] transition-all h-9 px-4 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>

          {onOpenSidebar && (
            <Button
              variant="outline"
              onClick={onOpenSidebar}
              className="gap-2 font-medium cursor-pointer border-surface-border bg-surface hover:bg-subtle text-copy-secondary hover:text-copy-primary h-9 px-4 rounded-xl"
            >
              Open Projects
            </Button>
          )}
        </div>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] text-copy-muted font-medium">
          <div className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface/60 px-2.5 py-1">
            <Cpu className="h-3 w-3 text-copy-faint" />
            <span>Interactive Graph</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface/60 px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-accent-ai" />
            <span>AI Architecture</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface/60 px-2.5 py-1">
            <Users className="h-3 w-3 text-state-success" />
            <span>Real-time Liveblocks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
