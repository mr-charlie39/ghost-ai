"use client";

import * as React from "react";
import { NodeToolbar, Position } from "@xyflow/react";
import { NODE_COLORS, type NodeColorConfig } from "@/types/canvas";
import { cn } from "@/lib/utils";

export interface NodeColorToolbarProps {
  isVisible: boolean;
  activeColor: string;
  onSelectColor: (colorPair: NodeColorConfig) => void;
}

export function NodeColorToolbar({
  isVisible,
  activeColor,
  onSelectColor,
}: NodeColorToolbarProps) {
  const [hoveredFill, setHoveredFill] = React.useState<string | null>(null);

  return (
    <NodeToolbar
      isVisible={isVisible}
      position={Position.Top}
      offset={12}
      className="nodrag nopan nowheel"
    >
      <div
        role="toolbar"
        aria-label="Node color theme"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="nodrag nopan nowheel flex items-center gap-1.5 rounded-full border border-surface-border bg-surface/95 px-2 py-1.5 shadow-lg backdrop-blur-md"
      >
        {NODE_COLORS.map((pair) => {
          const isActive = pair.fill.toLowerCase() === activeColor.toLowerCase();
          const isHovered = hoveredFill === pair.fill;

          return (
            <button
              key={pair.fill}
              type="button"
              aria-label={`${pair.character} theme`}
              aria-pressed={isActive}
              title={pair.character}
              onClick={(e) => {
                e.stopPropagation();
                onSelectColor(pair);
              }}
              onMouseEnter={() => setHoveredFill(pair.fill)}
              onMouseLeave={() => setHoveredFill(null)}
              className={cn(
                "nodrag nopan relative flex h-5 w-5 items-center justify-center rounded-full border transition-transform duration-150 focus:outline-none",
                isActive
                  ? "scale-110 ring-2 ring-copy-primary/90 ring-offset-1 ring-offset-surface"
                  : "hover:scale-105"
              )}
              style={{
                backgroundColor: pair.fill,
                borderColor: isActive ? pair.text : `${pair.text}80`,
                boxShadow: isHovered ? `0 0 8px 1px ${pair.text}66` : undefined,
              }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: pair.text }}
              />
            </button>
          );
        })}
      </div>
    </NodeToolbar>
  );
}
