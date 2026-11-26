"use client";

import * as React from "react";
import { Check, Compass, Copy, Maximize2, Minus, Plus } from "lucide-react";
import { GhostLogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";

export interface WorkspaceCanvasPlaceholderProps {
  projectName: string;
  roomId: string;
}

export function WorkspaceCanvasPlaceholder({
  projectName,
  roomId,
}: WorkspaceCanvasPlaceholderProps) {
  const [copied, setCopied] = React.useState(false);
  const [copyError, setCopyError] = React.useState<string | null>(null);

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard access is unavailable");
      }
      await navigator.clipboard.writeText(roomId);
      setCopyError(null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy Room ID:", error);
      setCopied(false);
      setCopyError("Could not copy Room ID. Check clipboard permissions.");
    }
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center p-6 select-none bg-base overflow-hidden">
      {/* Background dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#2a2a30_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Blueprint corner guides */}
      <div className="absolute top-6 left-6 w-5 h-5 border-t border-l border-surface-border pointer-events-none opacity-60" />
      <div className="absolute top-6 right-6 w-5 h-5 border-t border-r border-surface-border pointer-events-none opacity-60" />
      <div className="absolute bottom-6 left-6 w-5 h-5 border-b border-l border-surface-border pointer-events-none opacity-60" />
      <div className="absolute bottom-6 right-6 w-5 h-5 border-b border-r border-surface-border pointer-events-none opacity-60" />

      {/* Center canvas hero card */}
      <div className="z-10 flex flex-col items-center justify-center text-center max-w-md p-6 rounded-2xl bg-surface/50 border border-surface-border/70 backdrop-blur-xs shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-base border border-surface-border mb-4 shadow-[0_0_25px_rgba(0,200,212,0.2)]">
          <GhostLogoMark className="h-9 w-9" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-state-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-state-success" />
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-copy-primary">
          {projectName}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-copy-muted leading-relaxed max-w-xs">
          Shared collaborative canvas. React Flow nodes, edges, and cursors will mount here.
        </p>

        {/* Room ID Badge with Copy Action */}
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-surface-border bg-base px-3 py-1.5 text-xs font-mono">
          <span className="text-copy-faint">Room:</span>
          <span className="text-brand font-medium truncate max-w-[160px] sm:max-w-[200px]">
            {roomId}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
            aria-label="Copy Room ID"
            className="text-copy-muted hover:text-copy-primary hover:bg-subtle cursor-pointer ml-1"
          >
            {copied ? (
              <Check className="h-3 w-3 text-state-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        {copyError && (
          <p role="status" className="mt-2 text-[11px] text-state-error">
            {copyError}
          </p>
        )}

        {/* Live status chips */}
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-copy-faint">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-base border border-surface-border">
            <span className="h-1.5 w-1.5 rounded-full bg-state-success" />
            Liveblocks Ready
          </span>
          <span className="px-2 py-0.5 rounded-md bg-base border border-surface-border">
            Nodes: 0
          </span>
          <span className="px-2 py-0.5 rounded-md bg-base border border-surface-border">
            Edges: 0
          </span>
        </div>
      </div>

      {/* Floating Bottom Canvas Controls Preview */}
      <div className="absolute bottom-6 z-20 flex items-center gap-1 rounded-xl bg-surface/90 border border-surface-border px-2 py-1 shadow-lg backdrop-blur-md">
        <Button
          variant="ghost"
          size="icon-xs"
          disabled
          aria-label="Zoom in"
          className="text-copy-muted opacity-60"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          disabled
          aria-label="Zoom out"
          className="text-copy-muted opacity-60"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <div className="h-4 w-px bg-surface-border mx-0.5" />
        <Button
          variant="ghost"
          size="icon-xs"
          disabled
          aria-label="Fit view"
          className="text-copy-muted opacity-60"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          disabled
          aria-label="Minimap"
          className="text-copy-muted opacity-60"
        >
          <Compass className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
