"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlowProvider,
  useEdges,
  useNodes,
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
import { useCanvasSave } from "@/components/editor/canvas-save-context";
import { useTemplateImport } from "@/components/editor/template-import-context";
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave";
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
      offsetX:
        typeof candidate.offsetX === "number" && Number.isFinite(candidate.offsetX)
          ? candidate.offsetX
          : 0,
      offsetY:
        typeof candidate.offsetY === "number" && Number.isFinite(candidate.offsetY)
          ? candidate.offsetY
          : 0,
    };
  } catch {
    return null;
  }
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }
  return target.isContentEditable;
}

interface DragPreviewState {
  shape: NodeShape;
  x: number;
  y: number;
}

export interface CanvasViewProps {
  projectId: string;
  hasSavedCanvas?: boolean;
}

function CanvasFlowInner({ projectId, hasSavedCanvas = false }: CanvasViewProps) {
  const canvasWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition } = reactFlow;
  const flowNodes = useNodes<CanvasNode>();
  const flowEdges = useEdges<CanvasEdge>();
  const room = useRoom();
  const canvasSave = useCanvasSave();
  const templateImport = useTemplateImport();
  const lastHandledImportIdRef = React.useRef<number | null>(null);
  const hasCheckedInitialLoadRef = React.useRef(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = React.useState(
    () => !hasSavedCanvas
  );
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

  const nodesRef = React.useRef(nodes);
  const edgesRef = React.useRef(edges);
  React.useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  // Load saved canvas from Vercel Blob only when the Liveblocks room is empty
  const isRoomEmpty = nodes.length === 0 && edges.length === 0;
  const effectiveIsLoaded = isInitialLoadComplete || !isRoomEmpty;

  React.useEffect(() => {
    if (hasCheckedInitialLoadRef.current) return;
    hasCheckedInitialLoadRef.current = true;

    if (!isRoomEmpty || !hasSavedCanvas) {
      return;
    }

    let isCancelled = false;

    const loadSavedCanvas = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load saved canvas (${response.status})`);
        }
        const data = (await response.json()) as {
          nodes?: CanvasNode[];
          edges?: CanvasEdge[];
          hasSavedCanvas?: boolean;
        };

        if (
          isCancelled ||
          !data.hasSavedCanvas ||
          nodesRef.current.length > 0 ||
          edgesRef.current.length > 0
        ) {
          return;
        }

        const savedNodes = Array.isArray(data.nodes) ? data.nodes : [];
        const savedEdges = Array.isArray(data.edges) ? data.edges : [];

        if (savedNodes.length > 0 || savedEdges.length > 0) {
          room.batch(() => {
            if (savedNodes.length > 0) {
              onNodesChange(
                savedNodes.map((node) => ({
                  type: "add",
                  item: node,
                }))
              );
            }
            if (savedEdges.length > 0) {
              onEdgesChange(
                savedEdges.map((edge) => ({
                  type: "add",
                  item: edge,
                }))
              );
            }
          });

          requestAnimationFrame(() => {
            void reactFlow.fitView({ padding: 0.15, duration: 250 });
          });
        }
      } catch (error) {
        console.error("Error loading saved canvas:", error);
      } finally {
        if (!isCancelled) {
          setIsInitialLoadComplete(true);
        }
      }
    };

    void loadSavedCanvas();

    return () => {
      isCancelled = true;
    };
  }, [
    projectId,
    hasSavedCanvas,
    isRoomEmpty,
    room,
    onNodesChange,
    onEdgesChange,
    reactFlow,
  ]);

  const setSaveStatus = canvasSave?.setSaveStatus;
  const registerSaveHandler = canvasSave?.registerSaveHandler;

  const { saveNow } = useCanvasAutosave({
    projectId,
    nodes,
    edges,
    isLoaded: effectiveIsLoaded,
    onStatusChange: setSaveStatus,
  });

  React.useEffect(() => {
    if (!registerSaveHandler) return;
    return registerSaveHandler(saveNow);
  }, [registerSaveHandler, saveNow]);

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

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (isEditableTarget(event.target)) return;

      const selectedNodes = flowNodes.filter((node) => node.selected);
      const selectedEdges = flowEdges.filter((edge) => edge.selected);

      if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

      event.preventDefault();
      onDelete({ nodes: selectedNodes, edges: selectedEdges });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [flowNodes, flowEdges, onDelete]);

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

      const bounds = canvasWrapperRef.current?.getBoundingClientRect();
      const viewport = reactFlow.getViewport();
      const dropPosition = bounds
        ? {
            x: (event.clientX - bounds.left - viewport.x) / viewport.zoom,
            y: (event.clientY - bounds.top - viewport.y) / viewport.zoom,
          }
        : screenToFlowPosition({
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
    [onNodesChange, reactFlow, screenToFlowPosition]
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
      ref={canvasWrapperRef}
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
        deleteKeyCode={null}
        nodesDraggable
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
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

export function CanvasView({ projectId, hasSavedCanvas = false }: CanvasViewProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner projectId={projectId} hasSavedCanvas={hasSavedCanvas} />
    </ReactFlowProvider>
  );
}
