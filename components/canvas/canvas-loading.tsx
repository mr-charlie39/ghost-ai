"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { GhostLogoMark } from "@/components/brand";

interface CanvasLoadingProps {
  roomId?: string;
}

export function CanvasLoading({ roomId }: CanvasLoadingProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-6 bg-base select-none overflow-hidden">
      {/* Background dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#2a2a30_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Center loading card */}
      <div className="z-10 flex flex-col items-center justify-center text-center max-w-xs p-6 rounded-2xl bg-surface/60 border border-surface-border/80 backdrop-blur-xs shadow-xl animate-in fade-in duration-150">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-base border border-surface-border mb-3 shadow-[0_0_20px_rgba(0,200,212,0.15)]">
          <GhostLogoMark className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand" />
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-copy-primary">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
          <span>Connecting to collaborative canvas...</span>
        </div>

        {roomId && (
          <p className="mt-2 text-[11px] font-mono text-copy-faint truncate max-w-[200px]">
            Room: {roomId}
          </p>
        )}
      </div>
    </div>
  );
}
