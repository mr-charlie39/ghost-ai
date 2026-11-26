import * as React from "react";
import { GhostLogo } from "@/components/brand";

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-base text-copy-primary">
      {/* Left panel: visible on large screens */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-surface border-r border-surface-border select-none">
        {/* Compact Logo */}
        <GhostLogo size="md" showWordmark />

        {/* Tagline & Feature List */}
        <div className="max-w-md space-y-6">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-copy-primary">
              System architecture at the speed of thought.
            </h1>
            <p className="mt-2 text-sm text-copy-muted">
              Real-time collaborative system design workspace with intelligent generation and spec export.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-xs font-mono uppercase tracking-wider text-copy-faint mb-3">
              Core Capabilities
            </p>
            <ul className="space-y-2.5 text-sm text-copy-secondary">
              <li className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                <span>Natural language prompt to system architecture</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                <span>Real-time collaborative canvas with live cursors</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                <span>Curated starter system design template library</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                <span>Automated Markdown technical specification generation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Minimal Footer Info */}
        <div className="text-xs text-copy-faint font-mono">
          Ghost AI &copy; System Design Workspace
        </div>
      </div>

      {/* Right panel: centered Clerk form (form only on small screens) */}
      <div className="flex flex-1 items-center justify-center p-6 bg-base">
        <div className="w-full max-w-md flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
