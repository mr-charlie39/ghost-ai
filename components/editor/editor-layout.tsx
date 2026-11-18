"use client";

import * as React from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { cn } from "@/lib/utils";

export interface EditorLayoutProps {
  children?: React.ReactNode;
  centerNavbarContent?: React.ReactNode;
  rightNavbarContent?: React.ReactNode;
  className?: string;
}

export function EditorLayout({
  children,
  centerNavbarContent,
  rightNavbarContent,
  className,
}: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex h-screen w-screen flex-col overflow-hidden bg-base text-copy-primary",
        className
      )}
    >
      {/* Top Navbar */}
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        centerContent={centerNavbarContent}
        rightContent={rightNavbarContent}
      />

      {/* Floating Project Sidebar Overlay */}
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Canvas Workspace */}
      <main className="relative flex flex-1 overflow-hidden bg-base">
        {children ? (
          children
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            {/* Subtle workspace canvas dot-grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#2a2a30_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
            <div className="z-10 flex flex-col items-center justify-center text-center p-6 select-none">
              <p className="text-sm font-medium text-copy-muted">
                System Design Canvas
              </p>
              <p className="text-xs text-copy-faint mt-1 max-w-sm">
                Open the project sidebar to view existing architectures or create a new project.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
