"use client";

import * as React from "react";
import type { ReactFlowInstance } from "@xyflow/react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export interface UseKeyboardShortcutsOptions {
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  onUndo: () => void;
  onRedo: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }
  if (target.isContentEditable) {
    return true;
  }
  return Boolean(target.closest("[contenteditable='true']"));
}

export function useKeyboardShortcuts({
  reactFlow,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const hasModifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (hasModifier && !event.altKey) {
        if (key === "z" && !event.shiftKey) {
          event.preventDefault();
          onUndo();
          return;
        }
        if ((key === "z" && event.shiftKey) || (key === "y" && !event.shiftKey)) {
          event.preventDefault();
          onRedo();
          return;
        }
      }

      if (!hasModifier && !event.altKey) {
        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          void reactFlow.zoomIn({ duration: 200 });
          return;
        }
        if (event.key === "-") {
          event.preventDefault();
          void reactFlow.zoomOut({ duration: 200 });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onRedo, onUndo, reactFlow]);
}
