"use client";

import * as React from "react";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";

export interface CanvasSaveContextValue {
  saveStatus: CanvasSaveStatus;
  setSaveStatus: (status: CanvasSaveStatus) => void;
  triggerManualSave: () => Promise<void>;
  registerSaveHandler: (handler: () => Promise<void>) => () => void;
}

const CanvasSaveContext = React.createContext<CanvasSaveContextValue | null>(
  null
);

export function CanvasSaveProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [saveStatus, setSaveStatus] = React.useState<CanvasSaveStatus>("idle");
  const saveHandlerRef = React.useRef<(() => Promise<void>) | null>(null);

  const registerSaveHandler = React.useCallback(
    (handler: () => Promise<void>) => {
      saveHandlerRef.current = handler;
      return () => {
        if (saveHandlerRef.current === handler) {
          saveHandlerRef.current = null;
        }
      };
    },
    []
  );

  const triggerManualSave = React.useCallback(async () => {
    if (saveHandlerRef.current) {
      await saveHandlerRef.current();
    }
  }, []);

  const value = React.useMemo(
    () => ({
      saveStatus,
      setSaveStatus,
      triggerManualSave,
      registerSaveHandler,
    }),
    [saveStatus, triggerManualSave, registerSaveHandler]
  );

  return (
    <CanvasSaveContext.Provider value={value}>
      {children}
    </CanvasSaveContext.Provider>
  );
}

export function useCanvasSave(): CanvasSaveContextValue | null {
  return React.useContext(CanvasSaveContext);
}
