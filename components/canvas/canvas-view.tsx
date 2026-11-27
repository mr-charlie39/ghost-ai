"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type DefaultEdgeOptions,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import {
  useCanRedo,
  useCanUndo,
  useMyPresence,
  useRedo,
  useRoom,
  useUndo,
} from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  SHAPE_DRAG_DATA_KEY,
  type CanvasNode,
  type CanvasEdge,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";
import { CanvasControls } from "@/components/canvas/canvas-controls";
import { CanvasEdgeComponent } from "@/components/canvas/canvas-edge";
import { CanvasNodeComponent } from "@/components/canvas/canvas-node";
import { LiveCursors } from "@/components/canvas/live-cursors";
import { PresenceAvatars } from "@/components/canvas/presence-avatars";
import { ShapePanel } from "@/components/canvas/shape-panel";
import { ShapeVisual } from "@/components/canvas/shape-visual";
import { useTemplateImport } from "@/components/editor/template-import-context";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
} satisfies NodeTypes;

const edgeTypes = {
  canvasEdge: CanvasEdgeComponent,
} satisfies EdgeTypes;

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "canvasEdge",
  style: {
    stroke: "var(--text-secondary)",
    strokeWidth: 1.5,
    strokeLinecap: "round",
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--text-secondary)",
    width: 16,
    height: 16,
  },
};

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

interface DragPreviewState {
  shape: NodeShape;
  x: number;
  y: number;
}

function CanvasFlowInner() {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition } = reactFlow;
  const room = useRoom();
  const templateImport = useTemplateImport();
  const lastHandledImportIdRef = React.useRef<number | null>(null);
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [, updateMyPresence] = useMyPresence();

  useKeyboardShortcuts({
    reactFlow,
    onUndo: undo,
    onRedo: redo,
  });

  const [dragPreview, setDragPreview] = React.useState<DragPreviewState | null>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
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

  const pendingImport = templateImport?.pendingImport ?? null;
  const clearTemplateImport = templateImport?.clearTemplateImport;

  React.useEffect(() => {
    if (!pendingImport || !clearTemplateImport) return;
    if (lastHandledImportIdRef.current === pendingImport.requestId) return;
    lastHandledImportIdRef.current = pendingImport.requestId;

    const { template, requestId } = pendingImport;

    room.batch(() => {
      if (nodes.length > 0 || edges.length > 0) {
        onDelete({ nodes, edges });
      }
      if (template.nodes.length > 0) {
        onNodesChange(
          template.nodes.map((node) => ({
            type: "add",
            item: node,
          }))
        );
      }
      if (template.edges.length > 0) {
        onEdgesChange(
          template.edges.map((edge) => ({
            type: "add",
            item: edge,
          }))
        );
      }
    });

    clearTemplateImport(requestId);

    requestAnimationFrame(() => {
      void reactFlow.fitView({ padding: 0.15, duration: 250 });
    });
  }, [
    pendingImport,
    clearTemplateImport,
    room,
    nodes,
    edges,
    onDelete,
    onNodesChange,
    onEdgesChange,
    reactFlow,
  ]);

  const handleConnect = React.useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const newEdge: CanvasEdge = {
        id: `edge-${connection.source}-${connection.sourceHandle ?? "s"}-${connection.target}-${connection.targetHandle ?? "t"}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
        type: "canvasEdge",
        style: defaultEdgeOptions.style,
        markerEnd: defaultEdgeOptions.markerEnd,
        data: { label: "" },
      };
      onEdgesChange([{ type: "add", item: newEdge }]);
    },
    [onEdgesChange]
  );

  const hasDragPreview = dragPreview !== null;

  React.useEffect(() => {
    if (!hasDragPreview) return;
    const clearPreview = () => setDragPreview(null);
    window.addEventListener("dragend", clearPreview);
    window.addEventListener("drop", clearPreview);
    return () => {
      window.removeEventListener("dragend", clearPreview);
      window.removeEventListener("drop", clearPreview);
    };
  }, [hasDragPreview]);

  const handleShapeDragStart = React.useCallback(
    (shape: NodeShape, position: { x: number; y: number }) => {
      setDragPreview({ shape, x: position.x, y: position.y });
    },
    []
  );

  const handleShapeDragEnd = React.useCallback(() => {
    setDragPreview(null);
  }, []);

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const nextX = event.clientX;
      const nextY = event.clientY;
      setDragPreview((prev) => {
        if (!prev) return null;
        if (prev.x === nextX && prev.y === nextY) return prev;
        return { ...prev, x: nextX, y: nextY };
      });
    },
    []
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragPreview(null);

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

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      updateMyPresence({ cursor: position });
    },
    [screenToFlowPosition, updateMyPresence]
  );

  const handleMouseLeave = React.useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

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
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDelete={onDelete}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
        <LiveCursors />
      </ReactFlow>
      <PresenceAvatars />
      <CanvasControls
        onZoomIn={() => void reactFlow.zoomIn({ duration: 200 })}
        onZoomOut={() => void reactFlow.zoomOut({ duration: 200 })}
        onFitView={() => void reactFlow.fitView({ duration: 250 })}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <ShapePanel
        onShapeDragStart={handleShapeDragStart}
        onShapeDragEnd={handleShapeDragEnd}
      />
      {dragPreview ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 opacity-70"
          style={{
            left: dragPreview.x,
            top: dragPreview.y,
            width: SHAPE_DEFAULT_SIZES[dragPreview.shape].width,
            height: SHAPE_DEFAULT_SIZES[dragPreview.shape].height,
            transform: "translate(-50%, -50%)",
          }}
        >
          <ShapeVisual
            shape={dragPreview.shape}
            width={SHAPE_DEFAULT_SIZES[dragPreview.shape].width}
            height={SHAPE_DEFAULT_SIZES[dragPreview.shape].height}
            fillColor={DEFAULT_NODE_COLOR}
            strokeColor="var(--accent-primary)"
            strokeWidth={1.5}
          />
        </div>
      ) : null}
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
