import * as React from "react";
import { cn } from "@/lib/utils";

export interface GhostLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "h-5 w-5",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

/**
 * Professional Ghost AI Logo Mark
 * Represents a distributed architecture graph with interconnected nodes and AI core.
 */
export function GhostLogoMark({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        {/* Cyan brand gradient */}
        <linearGradient id="ghostCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5f2" />
          <stop offset="100%" stopColor="#009ba6" />
        </linearGradient>
        {/* Indigo AI gradient */}
        <linearGradient id="ghostAi" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b82ff" />
          <stop offset="100%" stopColor="#6457f9" />
        </linearGradient>
        {/* Ambient glow filter */}
        <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal architectural grid frame */}
      <polygon
        points="16,3 27,9.5 27,22.5 16,29 5,22.5 5,9.5"
        stroke="var(--border-subtle)"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        fill="var(--bg-surface)"
        fillOpacity="0.75"
      />

      {/* Graph edges connecting outer architecture nodes */}
      <line x1="16" y1="16" x2="16" y2="6.5" stroke="var(--border-subtle)" strokeWidth="1.2" />
      <line x1="16" y1="16" x2="24.5" y2="21" stroke="var(--border-subtle)" strokeWidth="1.2" />
      <line x1="16" y1="16" x2="7.5" y2="21" stroke="var(--border-subtle)" strokeWidth="1.2" />

      {/* Primary active flow edge */}
      <line
        x1="16"
        y1="16"
        x2="24.5"
        y2="11"
        stroke="url(#ghostCyan)"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />

      {/* Satellite service nodes */}
      <circle cx="16" cy="6.5" r="2" fill="url(#ghostAi)" />
      <circle cx="24.5" cy="11" r="2.2" fill="url(#ghostCyan)" />
      <circle cx="24.5" cy="21" r="2" fill="var(--text-faint)" />
      <circle cx="7.5" cy="21" r="2" fill="url(#ghostAi)" />
      <circle cx="7.5" cy="11" r="1.8" fill="var(--text-faint)" />

      {/* Central Core AI Node with cyan glow */}
      <circle
        cx="16"
        cy="16"
        r="4.5"
        fill="var(--bg-base)"
        stroke="url(#ghostCyan)"
        strokeWidth="1.6"
        filter="url(#coreGlow)"
      />
      <circle cx="16" cy="16" r="2" fill="url(#ghostCyan)" />
    </svg>
  );
}

/**
 * Full Ghost AI Brand Component with mark + typography.
 */
export function GhostLogo({
  size = "md",
  showWordmark = true,
  className,
}: GhostLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div
        className={cn(
          sizeMap[size],
          "flex items-center justify-center rounded-xl transition-all"
        )}
      >
        <GhostLogoMark className="w-full h-full" />
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-semibold tracking-wider text-copy-primary text-sm sm:text-base font-sans">
            GHOST<span className="text-brand font-mono font-bold">.AI</span>
          </span>
          <span className="text-[9px] font-mono tracking-widest text-copy-faint uppercase mt-0.5">
            Architecture Engine
          </span>
        </div>
      )}
    </div>
  );
}
