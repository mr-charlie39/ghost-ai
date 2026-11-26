"use client";

import * as React from "react";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

export interface TemplateImportRequest {
  template: CanvasTemplate;
  requestId: number;
}

export interface TemplateImportContextValue {
  pendingImport: TemplateImportRequest | null;
  requestTemplateImport: (template: CanvasTemplate) => void;
  clearTemplateImport: (requestId: number) => void;
}

const TemplateImportContext = React.createContext<TemplateImportContextValue | null>(
  null
);

export function TemplateImportProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingImport, setPendingImport] =
    React.useState<TemplateImportRequest | null>(null);
  const requestIdRef = React.useRef(0);

  const requestTemplateImport = React.useCallback((template: CanvasTemplate) => {
    requestIdRef.current += 1;
    setPendingImport({
      template,
      requestId: requestIdRef.current,
    });
  }, []);

  const clearTemplateImport = React.useCallback((requestId: number) => {
    setPendingImport((current) =>
      current && current.requestId === requestId ? null : current
    );
  }, []);

  const value = React.useMemo(
    () => ({
      pendingImport,
      requestTemplateImport,
      clearTemplateImport,
    }),
    [pendingImport, requestTemplateImport, clearTemplateImport]
  );

  return (
    <TemplateImportContext.Provider value={value}>
      {children}
    </TemplateImportContext.Provider>
  );
}

export function useTemplateImport(): TemplateImportContextValue | null {
  return React.useContext(TemplateImportContext);
}
