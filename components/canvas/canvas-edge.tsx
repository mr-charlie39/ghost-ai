"use client";

import * as React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { cn } from "@/lib/utils";

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const label = typeof data?.label === "string" ? data.label : "";
  const isActive = Boolean(selected || isHovered || isEditing);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  React.useEffect(() => {
    if (!isEditing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [isEditing]);

  const handleStartEditing = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleStopEditing = () => {
    setIsEditing(false);
  };

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateEdgeData(id, { label: event.target.value });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setIsEditing(false);
    }
  };

  const resolvedStroke = selected
    ? "var(--accent-primary)"
    : isHovered
      ? "var(--text-primary)"
      : (style?.stroke ?? "var(--text-secondary)");

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleStartEditing}
      >
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          interactionWidth={20}
          style={{
            ...style,
            stroke: resolvedStroke,
            strokeWidth: style?.strokeWidth ?? 1.5,
            strokeLinecap: "round",
            opacity: isActive ? 1 : 0.6,
            transition: "opacity 150ms ease, stroke 150ms ease",
          }}
        />
      </g>

      {(isEditing || label || isActive) ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={handleStartEditing}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag nopan nowheel z-10"
          >
            {isEditing ? (
              <div className="relative inline-grid items-center">
                <span
                  aria-hidden="true"
                  className="invisible col-start-1 row-start-1 whitespace-pre px-2.5 py-0.5 text-xs font-medium"
                >
                  {label || "Add label"}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={label}
                  placeholder="Add label"
                  onChange={handleLabelChange}
                  onBlur={handleStopEditing}
                  onKeyDown={handleKeyDown}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  aria-label="Edge label"
                  className="nodrag nopan nowheel col-start-1 row-start-1 w-full min-w-[4rem] rounded-full border border-brand bg-elevated px-2.5 py-0.5 text-center text-xs font-medium text-copy-primary shadow-md placeholder:text-copy-faint focus:outline-none"
                />
              </div>
            ) : label ? (
              <span
                className={cn(
                  "inline-block cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-xs backdrop-blur-xs transition-colors",
                  selected
                    ? "border-brand bg-elevated text-copy-primary"
                    : isHovered
                      ? "border-border-subtle bg-elevated text-copy-primary"
                      : "border-surface-border bg-surface/90 text-copy-secondary"
                )}
              >
                {label}
              </span>
            ) : (
              <span className="inline-block cursor-pointer rounded-full border border-surface-border/70 bg-surface/80 px-2.5 py-0.5 text-[11px] font-medium text-copy-faint backdrop-blur-xs transition-opacity">
                Add label
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
