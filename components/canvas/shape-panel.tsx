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
  DEFAULT_NODE_COLOR,
  SHAPE_DEFAULT_SIZES,
  SHAPE_DRAG_DATA_KEY,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";
import { ShapeVisual } from "@/components/canvas/shape-visual";
import { cn } from "@/lib/utils";

interface ShapeItem {
  shape: NodeShape;
  label: string;
  icon: LucideIcon;
}

const SHAPE_ITEMS: readonly ShapeItem[] = [
  { shape: "rectangle", label: "Rectangle", icon: Square },
  { shape: "diamond", label: "Diamond", icon: Diamond },
  { shape: "circle", label: "Circle", icon: Circle },
  { shape: "pill", label: "Pill", icon: RectangleHorizontal },
  { shape: "cylinder", label: "Cylinder", icon: Cylinder },
  { shape: "hexagon", label: "Hexagon", icon: Hexagon },
] as const;

export function ShapePanel() {
  const previewRefs = React.useRef<Partial<Record<NodeShape, HTMLDivElement | null>>>({});

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

      const previewEl = previewRefs.current[shape];
      if (previewEl) {
        event.dataTransfer.setDragImage(previewEl, size.width / 2, size.height / 2);
      }
    },
    []
  );

  return (
    <>
      {/* Offscreen exact-shape drag previews so dragging shows the actual canvas shape */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] -top-[9999px]"
      >
        {SHAPE_ITEMS.map(({ shape }) => {
          const size = SHAPE_DEFAULT_SIZES[shape];
          return (
            <div
              key={shape}
              ref={(el) => {
                previewRefs.current[shape] = el;
              }}
              style={{ width: size.width, height: size.height }}
            >
              <ShapeVisual
                shape={shape}
                width={size.width}
                height={size.height}
                fillColor={DEFAULT_NODE_COLOR}
                strokeColor="#00c8d4"
                strokeWidth={1.5}
              />
            </div>
          );
        })}
      </div>

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
