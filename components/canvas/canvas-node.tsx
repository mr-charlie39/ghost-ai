"use client";

import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasNode,
  type NodeShape,
} from "@/types/canvas";
import { ShapeVisual } from "@/components/canvas/shape-visual";
import { cn } from "@/lib/utils";

function resolveNodeTextColor(fillColor: string): string {
  const match = NODE_COLORS.find(
    (c) => c.fill.toLowerCase() === fillColor.toLowerCase()
  );
  return match?.text ?? DEFAULT_NODE_TEXT_COLOR;
}

const HANDLE_CLASS =
  "!h-2.5 !w-2.5 !rounded-full !border !border-border-default !bg-white opacity-0 transition-opacity group-hover:opacity-100";

export function CanvasNodeComponent({
  data,
  selected,
  width,
  height,
}: NodeProps<CanvasNode>) {
  const shape: NodeShape = data.shape ?? "rectangle";
  const defaultSize = SHAPE_DEFAULT_SIZES[shape];
  const nodeWidth = width ?? defaultSize.width;
  const nodeHeight = height ?? defaultSize.height;

  const fillColor = data.color ?? DEFAULT_NODE_COLOR;
  const textColor = resolveNodeTextColor(fillColor);
  const strokeColor = selected ? "var(--accent-primary)" : "var(--border-default)";

  return (
    <div
      className={cn(
        "group relative flex h-full w-full items-center justify-center select-none",
        selected && "drop-shadow-[0_0_10px_rgba(0,200,212,0.22)]"
      )}
      style={{ color: textColor }}
    >
      <div className="pointer-events-none absolute inset-0">
        <ShapeVisual
          shape={shape}
          width={nodeWidth}
          height={nodeHeight}
          fillColor={fillColor}
          strokeColor={strokeColor}
          strokeWidth={selected ? 2 : 1.5}
        />
      </div>

      <span className="relative z-10 max-w-[80%] truncate px-2 text-center text-sm font-medium">
        {data.label}
      </span>

      <Handle type="source" position={Position.Top} id="top" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Left} id="left" className={HANDLE_CLASS} />
    </div>
  );
}
