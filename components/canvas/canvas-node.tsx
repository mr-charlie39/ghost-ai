"use client";

import * as React from "react";
import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasNode,
  type NodeColorConfig,
  type NodeShape,
} from "@/types/canvas";
import { NodeColorToolbar } from "@/components/canvas/node-color-toolbar";
import { ShapeVisual } from "@/components/canvas/shape-visual";
import { cn } from "@/lib/utils";

const MIN_NODE_WIDTH = 80;
const MIN_NODE_HEIGHT = 48;
const PLACEHOLDER_LABEL = "Label";

function resolveNodeTextColor(fillColor: string): string {
  const match = NODE_COLORS.find(
    (c) => c.fill.toLowerCase() === fillColor.toLowerCase()
  );
  return match?.text ?? DEFAULT_NODE_TEXT_COLOR;
}

const HANDLE_CLASS =
  "!h-2.5 !w-2.5 !rounded-full !border !border-border-default !bg-white opacity-0 transition-opacity group-hover:opacity-100";

export function CanvasNodeComponent({
  id,
  data,
  selected,
  width,
  height,
}: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode>();
  const [isEditing, setIsEditing] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const shape: NodeShape = data.shape ?? "rectangle";
  const defaultSize = SHAPE_DEFAULT_SIZES[shape];
  const nodeWidth = width ?? defaultSize.width;
  const nodeHeight = height ?? defaultSize.height;

  const fillColor = data.color ?? DEFAULT_NODE_COLOR;
  const textColor = data.textColor ?? resolveNodeTextColor(fillColor);
  const strokeColor = selected ? "var(--accent-primary)" : "var(--border-default)";

  React.useEffect(() => {
    if (!isEditing) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.select();
  }, [isEditing]);

  const handleSelectColor = (colorPair: NodeColorConfig) => {
    updateNodeData(id, {
      color: colorPair.fill,
      textColor: colorPair.text,
    });
  };

  const handleStartEditing = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleStopEditing = () => {
    setIsEditing(false);
  };

  const handleLabelChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { label: event.target.value });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setIsEditing(false);
    }
  };

  const displayText = data.label
    ? isEditing && data.label.endsWith("\n")
      ? `${data.label}\u200b`
      : data.label
    : PLACEHOLDER_LABEL;

  return (
    <div
      className={cn(
        "group relative flex h-full w-full items-center justify-center select-none",
        selected && "drop-shadow-[0_0_10px_rgba(0,200,212,0.22)]"
      )}
      style={{ color: textColor }}
    >
      <NodeColorToolbar
        isVisible={Boolean(selected)}
        activeColor={fillColor}
        onSelectColor={handleSelectColor}
      />

      <NodeResizer
        isVisible={Boolean(selected)}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        lineClassName="!border-brand/50"
        handleClassName="!h-2 !w-2 !rounded-sm !border !border-brand !bg-surface"
      />

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

      <div
        onDoubleClick={handleStartEditing}
        className="relative z-10 flex max-h-[85%] w-[80%] max-w-[80%] items-center justify-center overflow-hidden"
      >
        <span
          aria-hidden={isEditing}
          className={cn(
            "w-full whitespace-pre-wrap break-words px-1 py-0.5 text-center text-sm font-medium leading-snug",
            !data.label && "opacity-40",
            isEditing && "invisible"
          )}
        >
          {displayText}
        </span>

        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={data.label}
            placeholder={PLACEHOLDER_LABEL}
            onChange={handleLabelChange}
            onBlur={handleStopEditing}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            rows={1}
            aria-label="Node label"
            className="nodrag nopan nowheel absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent px-1 py-0.5 text-center text-sm font-medium leading-snug select-text placeholder:opacity-40 focus:outline-none"
            style={{ color: textColor }}
          />
        ) : null}
      </div>

      <Handle type="source" position={Position.Top} id="top" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Left} id="left" className={HANDLE_CLASS} />
    </div>
  );
}
