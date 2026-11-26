"use client";

import * as React from "react";
import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CONTROL_BUTTON_CLASS = cn(
  "flex h-8 w-8 items-center justify-center rounded-full",
  "text-copy-secondary transition-colors select-none",
  "hover:bg-elevated hover:text-copy-primary",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
  "disabled:pointer-events-none disabled:opacity-35"
);

export function CanvasControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Canvas controls"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        "absolute bottom-5 left-5 z-20",
        "flex items-center gap-1 rounded-full border border-surface-border",
        "bg-surface/90 px-2 py-1.5 shadow-xl backdrop-blur-md"
      )}
    >
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom out (-)"
          aria-label="Zoom out"
          className={CONTROL_BUTTON_CLASS}
        >
          <ZoomOut className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onFitView}
          title="Fit view"
          aria-label="Fit view"
          className={CONTROL_BUTTON_CLASS}
        >
          <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom in (+)"
          aria-label="Zoom in"
          className={CONTROL_BUTTON_CLASS}
        >
          <ZoomIn className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mx-1 h-5 w-px bg-surface-border" aria-hidden="true" />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl/Cmd+Z)"
          aria-label="Undo"
          className={CONTROL_BUTTON_CLASS}
        >
          <Undo2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl/Cmd+Shift+Z)"
          aria-label="Redo"
          className={CONTROL_BUTTON_CLASS}
        >
          <Redo2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
