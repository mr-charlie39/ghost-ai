"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import {
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  SHAPE_DRAG_DATA_KEY,
  type CanvasNode,
  type CanvasEdge,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";
import { CanvasNodeComponent } from "@/components/canvas/canvas-node";
import { ShapePanel } from "@/components/canvas/shape-panel";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
} satisfies NodeTypes;

let nodeIdCounter = 0;

function generateNodeId(shape: NodeShape): string {
  nodeIdCounter += 1;
  return `${shape}-${Date.now()}-${nodeIdCounter}`;
}

function parseShapeDragPayload(raw: string): ShapeDragPayload | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const candidate = parsed as Record<string, unknown>;
    if (
      typeof candidate.shape !== "string" ||
      !NODE_SHAPES.includes(candidate.shape as NodeShape)
    ) {
      return null;
    }
    if (
      typeof candidate.width !== "number" ||
      typeof candidate.height !== "number" ||
      !Number.isFinite(candidate.width) ||
      !Number.isFinite(candidate.height) ||
      candidate.width <= 0 ||
      candidate.height <= 0
    ) {
      return null;
    }
    return {
      shape: candidate.shape as NodeShape,
      width: candidate.width,
      height: candidate.height,
    };
  } catch {
    return null;
  }
}

function CanvasFlowInner() {
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
  } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
    nodes: {
      initial: [],
    },
    edges: {
      initial: [],
    },
  });

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    []
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const rawPayload =
        event.dataTransfer.getData(SHAPE_DRAG_DATA_KEY) ||
        event.dataTransfer.getData("text/plain");
      const payload = parseShapeDragPayload(rawPayload);
      if (!payload) return;

      const dropPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: CanvasNode = {
        id: generateNodeId(payload.shape),
        type: "canvasNode",
        position: {
          x: dropPosition.x - payload.width / 2,
          y: dropPosition.y - payload.height / 2,
        },
        width: payload.width,
        height: payload.height,
        style: {
          width: payload.width,
          height: payload.height,
        },
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          shape: payload.shape,
        },
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [onNodesChange, screenToFlowPosition]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative h-full w-full bg-base overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodesDraggable
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
        className="ghost-canvas !bg-base"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.25}
          color="var(--border-subtle)"
          className="!bg-base"
        />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          ariaLabel="Canvas mini map"
          className="!bg-surface/80 !border !border-surface-border rounded-xl shadow-lg backdrop-blur-xs"
          maskColor="rgba(8, 8, 9, 0.75)"
          nodeColor="#1F1F1F"
        />
        <Cursors />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

export function CanvasView() {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner />
    </ReactFlowProvider>
  );
}
