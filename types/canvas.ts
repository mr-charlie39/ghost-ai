import type { Node, Edge } from "@xyflow/react";

/**
 * 6 supported node shapes defined in ui-context.md
 */
export type NodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

export const NODE_SHAPES: readonly NodeShape[] = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export interface ShapeSize {
  width: number;
  height: number;
}

export const SHAPE_DEFAULT_SIZES: Record<NodeShape, ShapeSize> = {
  rectangle: { width: 160, height: 80 },
  diamond: { width: 150, height: 150 },
  circle: { width: 100, height: 100 },
  pill: { width: 160, height: 64 },
  cylinder: { width: 120, height: 140 },
  hexagon: { width: 140, height: 120 },
};

export const SHAPE_DRAG_DATA_KEY = "application/x-ghost-shape";

export interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

/**
 * 8 defined node color pairs tuned for dark canvas readability
 */
export interface NodeColorConfig {
  fill: string;
  text: string;
  character: string;
}

export const NODE_COLORS: readonly NodeColorConfig[] = [
  { fill: "#1F1F1F", text: "#EDEDED", character: "Neutral dark" },
  { fill: "#10233D", text: "#52A8FF", character: "Blue" },
  { fill: "#2E1938", text: "#BF7AF0", character: "Purple" },
  { fill: "#331B00", text: "#FF990A", character: "Orange" },
  { fill: "#3C1618", text: "#FF6166", character: "Red" },
  { fill: "#3A1726", text: "#F75F8F", character: "Pink" },
  { fill: "#0F2E18", text: "#62C073", character: "Green" },
  { fill: "#062822", text: "#0AC7B4", character: "Teal" },
] as const;

export const DEFAULT_NODE_COLOR = "#1F1F1F";
export const DEFAULT_NODE_TEXT_COLOR = "#EDEDED";
export const DEFAULT_EDGE_COLOR = "#06090C";

/**
 * Node data payload supporting label, color, and shape
 */
export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  shape?: NodeShape;
}

/**
 * Edge data payload
 */
export type CanvasEdgeData = Record<string, unknown>;

/**
 * Custom node type definition
 */
export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type canvasNode = CanvasNode;

/**
 * Custom edge type definition
 */
export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">;
export type canvasEdge = CanvasEdge;
