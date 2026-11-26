"use client";

import * as React from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { GhostLogoMark } from "@/components/brand";
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

const emptySubscribe = () => () => {};

export function EditorNavbar({
  isSidebarOpen = false,
  onToggleSidebar,
  leftContent,
  centerContent,
  rightContent,
  className,
}: EditorNavbarProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <header
      className={cn(
        "h-14 w-full bg-surface/90 backdrop-blur-md border-b border-surface-border px-3 sm:px-4 flex items-center justify-between select-none relative z-30 shrink-0",
        className
      )}
    >
      {/* Left section: Toggle button & Logo / Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="text-copy-secondary hover:text-copy-primary hover:bg-subtle cursor-pointer transition-colors"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>

        {/* Brand mark */}
        <Link
          href="/editor"
          aria-label="GHOST.AI editor home"
          className="flex items-center gap-2.5 text-copy-primary hover:opacity-90 transition-opacity group focus-visible:outline-none"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-base/80 border border-surface-border group-hover:border-brand/40 group-hover:shadow-[0_0_12px_rgba(0,200,212,0.25)] transition-all">
            <GhostLogoMark className="h-5 w-5" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-semibold text-xs tracking-wider text-copy-primary font-sans">
              GHOST<span className="text-brand font-mono font-bold">.AI</span>
            </span>
          </div>
        </Link>

        {leftContent && (
          <div className="flex items-center gap-2 pl-1 border-l border-surface-border">
            {leftContent}
          </div>
        )}
      </div>

      {/* Center section: Project Context / Title */}
      <div className="flex items-center justify-center min-w-0 px-2 flex-1 max-w-xl">
        {centerContent}
      </div>

      {/* Right section: Actions & User Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {rightContent}
        <div className="pl-1 sm:pl-2 border-l border-surface-border flex items-center min-w-7 h-7">
          {mounted && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7 ring-1 ring-surface-border hover:ring-brand/50 transition-all",
                },
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
