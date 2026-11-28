"use client";

import * as React from "react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

export interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  isLoaded: boolean;
  debounceMs?: number;
  onStatusChange?: (status: CanvasSaveStatus) => void;
}

export interface UseCanvasAutosaveResult {
  status: CanvasSaveStatus;
  saveNow: () => Promise<void>;
}

const DEFAULT_DEBOUNCE_MS = 1500;
const STATUS_RESET_MS = 2000;

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  isLoaded,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  onStatusChange,
}: UseCanvasAutosaveOptions): UseCanvasAutosaveResult {
  const [status, setStatus] = React.useState<CanvasSaveStatus>("idle");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusResetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = React.useRef(0);
  const initializedRef = React.useRef(false);
  const lastSavedSnapshotRef = React.useRef<string | null>(null);
  const onStatusChangeRef = React.useRef(onStatusChange);

  React.useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const updateStatus = React.useCallback((nextStatus: CanvasSaveStatus) => {
    if (statusResetTimerRef.current) {
      clearTimeout(statusResetTimerRef.current);
      statusResetTimerRef.current = null;
    }
    setStatus(nextStatus);
    onStatusChangeRef.current?.(nextStatus);

    if (nextStatus === "saved" || nextStatus === "error") {
      statusResetTimerRef.current = setTimeout(() => {
        statusResetTimerRef.current = null;
        setStatus("idle");
        onStatusChangeRef.current?.("idle");
      }, STATUS_RESET_MS);
    }
  }, []);

  const serializedSnapshot = React.useMemo(
    () => JSON.stringify({ nodes, edges }),
    [nodes, edges]
  );

  const latestSnapshotRef = React.useRef(serializedSnapshot);
  React.useEffect(() => {
    latestSnapshotRef.current = serializedSnapshot;
  }, [serializedSnapshot]);

  const performSave = React.useCallback(
    async (snapshot: string) => {
      if (!projectId) return;
      requestIdRef.current += 1;
      const currentRequestId = requestIdRef.current;

      updateStatus("saving");

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: snapshot,
        });

        if (!response.ok) {
          throw new Error(`Failed to save canvas (${response.status})`);
        }

        if (currentRequestId === requestIdRef.current) {
          lastSavedSnapshotRef.current = snapshot;
          updateStatus("saved");
        }
      } catch (error) {
        console.error("Canvas autosave error:", error);
        if (currentRequestId === requestIdRef.current) {
          updateStatus("error");
        }
      }
    },
    [projectId, updateStatus]
  );

  const saveNow = React.useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await performSave(latestSnapshotRef.current);
  }, [performSave]);

  React.useEffect(() => {
    if (!isLoaded) return;

    // Record baseline snapshot once initial load completes to avoid redundant initial save
    if (!initializedRef.current) {
      initializedRef.current = true;
      lastSavedSnapshotRef.current = serializedSnapshot;
      return;
    }

    if (serializedSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void performSave(serializedSnapshot);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoaded, serializedSnapshot, debounceMs, performSave]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (statusResetTimerRef.current) {
        clearTimeout(statusResetTimerRef.current);
        statusResetTimerRef.current = null;
      }
    };
  }, []);

  return {
    status,
    saveNow,
  };
}
