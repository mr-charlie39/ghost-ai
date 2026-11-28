import { MarkerType } from "@xyflow/react";
import { z } from "zod";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  NODE_COLORS,
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type NodeColorConfig,
  type NodeShape,
} from "@/types/canvas";

export const MIN_NODE_WIDTH = 80;
export const MIN_NODE_HEIGHT = 48;

export const ALLOWED_COLOR_NAMES = [
  "neutral",
  "blue",
  "purple",
  "orange",
  "red",
  "pink",
  "green",
  "teal",
] as const;

export type ColorName = (typeof ALLOWED_COLOR_NAMES)[number];

const COLOR_MAP: Record<ColorName, NodeColorConfig> = {
  neutral: NODE_COLORS[0] ?? {
    fill: DEFAULT_NODE_COLOR,
    text: DEFAULT_NODE_TEXT_COLOR,
    character: "Neutral dark",
  },
  blue: NODE_COLORS[1],
  purple: NODE_COLORS[2],
  orange: NODE_COLORS[3],
  red: NODE_COLORS[4],
  pink: NODE_COLORS[5],
  green: NODE_COLORS[6],
  teal: NODE_COLORS[7],
};

const HANDLE_SIDES = ["top", "right", "bottom", "left"] as const;

export const canvasActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("add_node"),
    id: z.string().min(1),
    label: z.string().min(1),
    shape: z.enum(NODE_SHAPES),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    color: z.enum(ALLOWED_COLOR_NAMES).optional(),
  }),
  z.object({
    type: z.literal("move_node"),
    id: z.string().min(1),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal("resize_node"),
    id: z.string().min(1),
    width: z.number(),
    height: z.number(),
  }),
  z.object({
    type: z.literal("update_node_data"),
    id: z.string().min(1),
    label: z.string().optional(),
    shape: z.enum(NODE_SHAPES).optional(),
    color: z.enum(ALLOWED_COLOR_NAMES).optional(),
  }),
  z.object({
    type: z.literal("delete_node"),
    id: z.string().min(1),
  }),
  z.object({
    type: z.literal("add_edge"),
    id: z.string().optional(),
    source: z.string().min(1),
    target: z.string().min(1),
    sourceHandle: z.enum(HANDLE_SIDES).optional(),
    targetHandle: z.enum(HANDLE_SIDES).optional(),
    label: z.string().optional(),
  }),
  z.object({
    type: z.literal("delete_edge"),
    id: z.string().min(1),
  }),
]);

export const designPlanSchema = z.object({
  summary: z.string().min(1),
  actions: z.array(canvasActionSchema).min(1),
});

export type CanvasAction = z.infer<typeof canvasActionSchema>;
export type DesignPlan = z.infer<typeof designPlanSchema>;

export function resolveColorPair(color?: ColorName): NodeColorConfig {
  if (!color) return COLOR_MAP.neutral;
  return COLOR_MAP[color] ?? COLOR_MAP.neutral;
}

export function clampDimension(value: number, min: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.round(value));
}

export function buildCanvasNode(action: Extract<CanvasAction, { type: "add_node" }>): CanvasNode {
  const shape: NodeShape = action.shape;
  const defaults = SHAPE_DEFAULT_SIZES[shape];
  const width = clampDimension(action.width ?? defaults.width, MIN_NODE_WIDTH);
  const height = clampDimension(action.height ?? defaults.height, MIN_NODE_HEIGHT);
  const palette = resolveColorPair(action.color);

  return {
    id: action.id,
    type: "canvasNode",
    position: {
      x: Math.round(action.x),
      y: Math.round(action.y),
    },
    width,
    height,
    style: { width, height },
    data: {
      label: action.label.trim(),
      shape,
      color: palette.fill,
      textColor: palette.text,
    },
  };
}

export function buildCanvasEdge(
  action: Extract<CanvasAction, { type: "add_edge" }>,
  fallbackIndex: number
): CanvasEdge {
  const id =
    action.id && action.id.trim().length > 0
      ? action.id.trim()
      : `edge-${action.source}-${action.target}-${fallbackIndex}`;

  return {
    id,
    source: action.source,
    target: action.target,
    sourceHandle: action.sourceHandle ?? "right",
    targetHandle: action.targetHandle ?? "left",
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
    data: {
      label: action.label?.trim() ?? "",
    },
  };
}

export const DESIGN_SYSTEM_PROMPT = `You are Ghost AI, a collaborative system architecture designer.
Convert the user's natural language request into structured canvas operations on a React Flow diagram.

Allowed node shapes (use semantically):
- "hexagon": external systems, clients, users, third-party boundaries
- "diamond": API gateways, load balancers, routers, decision points
- "pill": microservices, workers, background processes, serverless functions
- "rectangle": general services, web apps, modules, components
- "cylinder": databases, caches, queues, object storage
- "circle": events, webhooks, triggers, endpoints

Allowed node color names (dark-canvas calibrated):
- "neutral": general / default components
- "blue": APIs, web services, core compute
- "purple": AI / ML services, orchestration, workers
- "orange": queues, event buses, streaming
- "red": security, auth, critical gateways
- "pink": frontend, clients, notifications
- "green": databases, persistent storage, caches
- "teal": external integrations, CDNs, edge

Layout and spacing rules:
1. Arrange components in a clean left-to-right (or top-to-bottom) flow without overlapping nodes.
2. Space columns at least 280px apart horizontally and rows at least 170px apart vertically.
3. Keep labels concise (2-5 words). Use short, clear edge labels for protocols or data flow (e.g. "HTTPS", "gRPC", "SQL", "Events").
4. Minimum node size is 80x48; omit width/height to use shape defaults unless a larger container is needed.
5. When the canvas already has nodes/edges, preserve and connect to existing node IDs when extending the design, and place new nodes clear of existing positions unless asked to move/resize/delete them.
6. Use unique kebab-case IDs for new nodes (e.g. "api-gateway", "users-db").`;
