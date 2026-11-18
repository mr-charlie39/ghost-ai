"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EditorNavbarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen = false,
  onToggleSidebar,
  leftContent,
  centerContent,
  rightContent,
  className,
}: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "h-14 w-full bg-surface border-b border-surface-border px-4 flex items-center justify-between select-none relative z-30 shrink-0",
        className
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="text-copy-secondary hover:text-copy-primary hover:bg-subtle cursor-pointer"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
        {leftContent}
      </div>

      {/* Center section */}
      <div className="flex items-center justify-center">
        {centerContent}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {rightContent}
      </div>
    </header>
  );
}
