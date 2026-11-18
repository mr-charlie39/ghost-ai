"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface DialogPatternProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Standard Dialog Pattern for the Ghost AI editor.
 * Adheres to dark workspace color tokens and rounded-3xl dialog styling.
 * Supports title, description, and footer actions.
 */
export function DialogPattern({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footerActions,
  className,
  contentClassName,
}: DialogPatternProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger
          render={React.isValidElement(trigger) ? trigger : undefined}
          className={className}
        >
          {!React.isValidElement(trigger) ? trigger : null}
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(
          "rounded-3xl border border-surface-border bg-surface p-6 shadow-2xl text-copy-primary sm:max-w-md",
          contentClassName
        )}
      >
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-base font-semibold text-copy-primary">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-copy-muted">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && <div className="py-2 text-sm text-copy-secondary">{children}</div>}

        {footerActions && (
          <DialogFooter className="-mx-6 -mb-6 mt-4 flex flex-col-reverse gap-2 rounded-b-3xl border-t border-surface-border bg-subtle/40 p-4 sm:flex-row sm:justify-end">
            {footerActions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Alias for convenience
export const EditorDialog = DialogPattern;
