"use client";

import * as React from "react";
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  RectangleHorizontal,
  Square,
  type LucideIcon,
} from "lucide-react";
import {
  SHAPE_DEFAULT_SIZES,
  SHAPE_DRAG_DATA_KEY,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";
import { cn } from "@/lib/utils";

interface ShapeItem {
  shape: NodeShape;
  label: string;
  icon: LucideIcon;
}

export interface ShapePanelProps {
  onShapeDragStart?: (shape: NodeShape, position: { x: number; y: number }) => void;
  onShapeDragEnd?: () => void;
}

const SHAPE_ITEMS: readonly ShapeItem[] = [
  { shape: "rectangle", label: "Rectangle", icon: Square },
  { shape: "diamond", label: "Diamond", icon: Diamond },
  { shape: "circle", label: "Circle", icon: Circle },
  { shape: "pill", label: "Pill", icon: RectangleHorizontal },
  { shape: "cylinder", label: "Cylinder", icon: Cylinder },
  { shape: "hexagon", label: "Hexagon", icon: Hexagon },
] as const;

export function ShapePanel({ onShapeDragStart, onShapeDragEnd }: ShapePanelProps) {
  const transparentDragImageRef = React.useRef<HTMLDivElement | null>(null);

  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, shape: NodeShape) => {
      const size = SHAPE_DEFAULT_SIZES[shape];
      const payload: ShapeDragPayload = {
        shape,
        width: size.width,
        height: size.height,
      };
      const serialized = JSON.stringify(payload);
      event.dataTransfer.setData(SHAPE_DRAG_DATA_KEY, serialized);
      event.dataTransfer.setData("text/plain", serialized);
      event.dataTransfer.effectAllowed = "copyMove";

      if (transparentDragImageRef.current) {
        event.dataTransfer.setDragImage(transparentDragImageRef.current, 0, 0);
      }

      onShapeDragStart?.(shape, { x: event.clientX, y: event.clientY });
    },
    [onShapeDragStart]
  );

  return (
    <>
      <div
        ref={transparentDragImageRef}
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-px w-px opacity-0"
      />

      <div
        role="toolbar"
        aria-label="Shape palette"
        className={cn(
          "absolute bottom-5 left-1/2 z-10 -translate-x-1/2",
          "flex items-center gap-1 rounded-full border border-surface-border",
          "bg-surface/90 px-2.5 py-1.5 shadow-xl backdrop-blur-md"
        )}
      >
        {SHAPE_ITEMS.map(({ shape, label, icon: Icon }) => (
          <div
            key={shape}
            role="button"
            tabIndex={0}
            draggable
            onDragStart={(event) => handleDragStart(event, shape)}
            onDragEnd={() => onShapeDragEnd?.()}
            title={`Drag ${label}`}
            aria-label={`Drag ${label} shape`}
            className={cn(
              "flex h-9 w-9 cursor-grab items-center justify-center rounded-full",
              "text-copy-secondary transition-colors select-none",
              "hover:bg-surface-elevated hover:text-copy-primary",
              "active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            )}
          >
            <Icon className="h-5 w-5 pointer-events-none" strokeWidth={1.75} />
          </div>
        ))}
      </div>
    </>
  );
}
