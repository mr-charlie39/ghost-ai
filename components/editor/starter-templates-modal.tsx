"use client";

import * as React from "react";
import { ArrowDownToLine, LayoutTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  SHAPE_DEFAULT_SIZES,
  type CanvasNode,
  type NodeShape,
} from "@/types/canvas";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";

export interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

const PREVIEW_WIDTH = 280;
const PREVIEW_HEIGHT = 148;
const PREVIEW_PADDING = 14;

interface PreviewRect {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  shape: NodeShape;
  fillColor: string;
  strokeColor: string;
}

function getNodeSize(node: CanvasNode): { width: number; height: number } {
  const shape: NodeShape = node.data.shape ?? "rectangle";
  const fallback = SHAPE_DEFAULT_SIZES[shape];
  return {
    width: node.width ?? fallback.width,
    height: node.height ?? fallback.height,
  };
}

function renderPreviewShape(nodeId: string, rect: PreviewRect) {
  const { x, y, width, height, cx, cy, shape, fillColor, strokeColor } = rect;
  const strokeOpacity = 0.55;
  const strokeWidth = 1.25;

  switch (shape) {
    case "diamond": {
      const points = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`;
      return (
        <polygon
          key={nodeId}
          points={points}
          fill={fillColor}
          stroke={strokeColor}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      );
    }

    case "circle": {
      return (
        <ellipse
          key={nodeId}
          cx={cx}
          cy={cy}
          rx={width / 2}
          ry={height / 2}
          fill={fillColor}
          stroke={strokeColor}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
        />
      );
    }

    case "pill": {
      return (
        <rect
          key={nodeId}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={height / 2}
          ry={height / 2}
          fill={fillColor}
          stroke={strokeColor}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
        />
      );
    }

    case "cylinder": {
      const ry = Math.max(Math.min(height * 0.16, 6), 2);
      const rx = width / 2;
      const topY = y + ry;
      const bottomY = y + height - ry;
      const bodyPath = [
        `M ${x} ${topY}`,
        `L ${x} ${bottomY}`,
        `A ${rx} ${ry} 0 0 0 ${x + width} ${bottomY}`,
        `L ${x + width} ${topY}`,
        `Z`,
      ].join(" ");
      return (
        <g key={nodeId}>
          <path
            d={bodyPath}
            fill={fillColor}
            stroke={strokeColor}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <ellipse
            cx={cx}
            cy={topY}
            rx={rx}
            ry={ry}
            fill={fillColor}
            stroke={strokeColor}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
          />
        </g>
      );
    }

    case "hexagon": {
      const inset = Math.min(width * 0.22, 10);
      const points = [
        `${x + inset},${y}`,
        `${x + width - inset},${y}`,
        `${x + width},${cy}`,
        `${x + width - inset},${y + height}`,
        `${x + inset},${y + height}`,
        `${x},${cy}`,
      ].join(" ");
      return (
        <polygon
          key={nodeId}
          points={points}
          fill={fillColor}
          stroke={strokeColor}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      );
    }

    case "rectangle":
    default: {
      return (
        <rect
          key={nodeId}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          ry={4}
          fill={fillColor}
          stroke={strokeColor}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
        />
      );
    }
  }
}

function TemplateDiagramPreview({ template }: { template: CanvasTemplate }) {
  const layout = React.useMemo(() => {
    if (template.nodes.length === 0) {
      return { rects: new Map<string, PreviewRect>() };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of template.nodes) {
      const size = getNodeSize(node);
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + size.width);
      maxY = Math.max(maxY, node.position.y + size.height);
    }

    const boundsWidth = Math.max(maxX - minX, 1);
    const boundsHeight = Math.max(maxY - minY, 1);
    const innerWidth = PREVIEW_WIDTH - PREVIEW_PADDING * 2;
    const innerHeight = PREVIEW_HEIGHT - PREVIEW_PADDING * 2;
    const scale = Math.min(innerWidth / boundsWidth, innerHeight / boundsHeight);

    const offsetX =
      PREVIEW_PADDING + (innerWidth - boundsWidth * scale) / 2 - minX * scale;
    const offsetY =
      PREVIEW_PADDING + (innerHeight - boundsHeight * scale) / 2 - minY * scale;

    const rects = new Map<string, PreviewRect>();
    for (const node of template.nodes) {
      const size = getNodeSize(node);
      const x = node.position.x * scale + offsetX;
      const y = node.position.y * scale + offsetY;
      const width = Math.max(size.width * scale, 6);
      const height = Math.max(size.height * scale, 4);
      rects.set(node.id, {
        x,
        y,
        width,
        height,
        cx: x + width / 2,
        cy: y + height / 2,
        shape: node.data.shape ?? "rectangle",
        fillColor: node.data.color ?? DEFAULT_NODE_COLOR,
        strokeColor: node.data.textColor ?? DEFAULT_NODE_TEXT_COLOR,
      });
    }

    return { rects };
  }, [template.nodes]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-surface-border bg-base">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border-default)_1px,transparent_1px)] [background-size:14px_14px] opacity-40" />
      <svg
        viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
        className="relative z-10 block h-36 w-full"
        aria-hidden="true"
      >
        {template.edges.map((edge) => {
          const source = layout.rects.get(edge.source);
          const target = layout.rects.get(edge.target);
          if (!source || !target) return null;
          return (
            <line
              key={edge.id}
              x1={source.cx}
              y1={source.cy}
              x2={target.cx}
              y2={target.cy}
              stroke="var(--text-muted)"
              strokeOpacity={0.6}
              strokeWidth={1.25}
              strokeLinecap="round"
            />
          );
        })}
        {template.nodes.map((node) => {
          const rect = layout.rects.get(node.id);
          if (!rect) return null;
          return renderPreviewShape(node.id, rect);
        })}
      </svg>
    </div>
  );
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  const handleImport = (template: CanvasTemplate) => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] flex-col overflow-hidden rounded-3xl border border-surface-border bg-surface p-0 text-copy-primary shadow-2xl sm:max-w-3xl">
        <DialogHeader className="border-b border-surface-border px-6 py-5 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand/30 bg-accent-dim text-brand">
              <LayoutTemplate className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-copy-primary">
                Starter Templates
              </DialogTitle>
              <DialogDescription className="text-xs text-copy-muted">
                Import a pre-built architecture diagram. Importing replaces the current canvas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex flex-col justify-between gap-3.5 rounded-2xl border border-surface-border bg-elevated/60 p-4 transition-colors hover:border-border-subtle"
              >
                <div className="space-y-3">
                  <TemplateDiagramPreview template={template} />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-copy-primary">
                        {template.name}
                      </h3>
                      <span className="shrink-0 font-mono text-[10px] text-copy-faint">
                        {template.nodes.length} nodes · {template.edges.length} edges
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-copy-muted">
                      {template.description}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleImport(template)}
                  className="w-full cursor-pointer gap-1.5 rounded-xl bg-brand font-medium text-surface hover:bg-brand/90"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  Import Template
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
