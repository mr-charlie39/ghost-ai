import { MarkerType } from "@xyflow/react";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type NodeColorConfig,
  type NodeShape,
} from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

type ColorCharacter =
  | "neutral"
  | "blue"
  | "purple"
  | "orange"
  | "red"
  | "pink"
  | "green"
  | "teal";

const PALETTE_BY_NAME: Record<ColorCharacter, NodeColorConfig> = {
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

interface TemplateNodeInput {
  id: string;
  label: string;
  shape: NodeShape;
  x: number;
  y: number;
  color?: ColorCharacter;
  width?: number;
  height?: number;
}

interface TemplateEdgeInput {
  id: string;
  source: string;
  target: string;
  sourceHandle?: "top" | "right" | "bottom" | "left";
  targetHandle?: "top" | "right" | "bottom" | "left";
  label?: string;
}

function createTemplateNode({
  id,
  label,
  shape,
  x,
  y,
  color = "neutral",
  width,
  height,
}: TemplateNodeInput): CanvasNode {
  const defaultSize = SHAPE_DEFAULT_SIZES[shape];
  const nodeWidth = width ?? defaultSize.width;
  const nodeHeight = height ?? defaultSize.height;
  const palette = PALETTE_BY_NAME[color];

  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width: nodeWidth,
    height: nodeHeight,
    style: {
      width: nodeWidth,
      height: nodeHeight,
    },
    data: {
      label,
      shape,
      color: palette.fill,
      textColor: palette.text,
    },
  };
}

function createTemplateEdge({
  id,
  source,
  target,
  sourceHandle = "right",
  targetHandle = "left",
  label = "",
}: TemplateEdgeInput): CanvasEdge {
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
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
    data: { label },
  };
}

export const CANVAS_TEMPLATES: readonly CanvasTemplate[] = [
  {
    id: "microservices-architecture",
    name: "Microservices Architecture",
    description:
      "API gateway routing requests across independent Auth, Orders, and Billing services with dedicated data stores.",
    nodes: [
      createTemplateNode({
        id: "ms-client",
        label: "Web & Mobile Clients",
        shape: "hexagon",
        x: 0,
        y: 170,
        color: "neutral",
      }),
      createTemplateNode({
        id: "ms-gateway",
        label: "API Gateway",
        shape: "diamond",
        x: 240,
        y: 155,
        color: "teal",
      }),
      createTemplateNode({
        id: "ms-auth",
        label: "Auth Service",
        shape: "pill",
        x: 500,
        y: 20,
        color: "blue",
      }),
      createTemplateNode({
        id: "ms-orders",
        label: "Orders Service",
        shape: "pill",
        x: 500,
        y: 198,
        color: "purple",
      }),
      createTemplateNode({
        id: "ms-billing",
        label: "Billing Service",
        shape: "pill",
        x: 500,
        y: 376,
        color: "orange",
      }),
      createTemplateNode({
        id: "ms-cache",
        label: "Redis Session Cache",
        shape: "cylinder",
        x: 780,
        y: -18,
        color: "red",
      }),
      createTemplateNode({
        id: "ms-orders-db",
        label: "Orders DB",
        shape: "cylinder",
        x: 780,
        y: 160,
        color: "green",
      }),
      createTemplateNode({
        id: "ms-stripe",
        label: "Payment Provider",
        shape: "hexagon",
        x: 780,
        y: 348,
        color: "pink",
      }),
    ],
    edges: [
      createTemplateEdge({
        id: "ms-e1",
        source: "ms-client",
        target: "ms-gateway",
        label: "HTTPS",
      }),
      createTemplateEdge({
        id: "ms-e2",
        source: "ms-gateway",
        target: "ms-auth",
        sourceHandle: "top",
        targetHandle: "left",
        label: "JWT",
      }),
      createTemplateEdge({
        id: "ms-e3",
        source: "ms-gateway",
        target: "ms-orders",
        label: "gRPC",
      }),
      createTemplateEdge({
        id: "ms-e4",
        source: "ms-gateway",
        target: "ms-billing",
        sourceHandle: "bottom",
        targetHandle: "left",
        label: "REST",
      }),
      createTemplateEdge({
        id: "ms-e5",
        source: "ms-auth",
        target: "ms-cache",
      }),
      createTemplateEdge({
        id: "ms-e6",
        source: "ms-orders",
        target: "ms-orders-db",
        label: "SQL",
      }),
      createTemplateEdge({
        id: "ms-e7",
        source: "ms-billing",
        target: "ms-stripe",
        label: "Webhooks",
      }),
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "Automated source-to-production workflow with lint, tests, container build, security scan, and canary deploy.",
    nodes: [
      createTemplateNode({
        id: "ci-repo",
        label: "Git Push / PR",
        shape: "circle",
        x: 0,
        y: 140,
        color: "neutral",
      }),
      createTemplateNode({
        id: "ci-lint",
        label: "Lint & Typecheck",
        shape: "rectangle",
        x: 190,
        y: 50,
        color: "blue",
      }),
      createTemplateNode({
        id: "ci-test",
        label: "Unit & E2E Tests",
        shape: "rectangle",
        x: 190,
        y: 230,
        color: "purple",
      }),
      createTemplateNode({
        id: "ci-build",
        label: "Docker Build",
        shape: "pill",
        x: 440,
        y: 158,
        color: "teal",
      }),
      createTemplateNode({
        id: "ci-gate",
        label: "Security & Policy Gate",
        shape: "diamond",
        x: 680,
        y: 115,
        color: "orange",
      }),
      createTemplateNode({
        id: "ci-registry",
        label: "Container Registry",
        shape: "cylinder",
        x: 695,
        y: 330,
        color: "neutral",
      }),
      createTemplateNode({
        id: "ci-prod",
        label: "Production Cluster",
        shape: "hexagon",
        x: 930,
        y: 130,
        color: "green",
      }),
    ],
    edges: [
      createTemplateEdge({
        id: "ci-e1",
        source: "ci-repo",
        target: "ci-lint",
        sourceHandle: "top",
        targetHandle: "left",
      }),
      createTemplateEdge({
        id: "ci-e2",
        source: "ci-repo",
        target: "ci-test",
        sourceHandle: "bottom",
        targetHandle: "left",
      }),
      createTemplateEdge({
        id: "ci-e3",
        source: "ci-lint",
        target: "ci-build",
        sourceHandle: "right",
        targetHandle: "top",
      }),
      createTemplateEdge({
        id: "ci-e4",
        source: "ci-test",
        target: "ci-build",
        sourceHandle: "right",
        targetHandle: "bottom",
      }),
      createTemplateEdge({
        id: "ci-e5",
        source: "ci-build",
        target: "ci-gate",
        label: "Scan",
      }),
      createTemplateEdge({
        id: "ci-e6",
        source: "ci-gate",
        target: "ci-registry",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Push",
      }),
      createTemplateEdge({
        id: "ci-e7",
        source: "ci-gate",
        target: "ci-prod",
        label: "Canary",
      }),
    ],
  },
  {
    id: "event-driven-system",
    name: "Event-Driven System",
    description:
      "Asynchronous pub/sub topology with producers, event broker, parallel consumers, and dead-letter handling.",
    nodes: [
      createTemplateNode({
        id: "ed-producer",
        label: "Checkout API",
        shape: "pill",
        x: 0,
        y: 170,
        color: "blue",
      }),
      createTemplateNode({
        id: "ed-broker",
        label: "Kafka Event Bus",
        shape: "rectangle",
        x: 250,
        y: 162,
        color: "purple",
      }),
      createTemplateNode({
        id: "ed-inventory",
        label: "Inventory Worker",
        shape: "pill",
        x: 510,
        y: 30,
        color: "teal",
      }),
      createTemplateNode({
        id: "ed-notify",
        label: "Notification Worker",
        shape: "pill",
        x: 510,
        y: 170,
        color: "green",
      }),
      createTemplateNode({
        id: "ed-analytics",
        label: "Analytics Stream",
        shape: "pill",
        x: 510,
        y: 310,
        color: "orange",
      }),
      createTemplateNode({
        id: "ed-dlq",
        label: "Dead Letter Queue",
        shape: "cylinder",
        x: 270,
        y: 330,
        color: "red",
      }),
      createTemplateNode({
        id: "ed-warehouse",
        label: "Data Warehouse",
        shape: "cylinder",
        x: 780,
        y: 272,
        color: "neutral",
      }),
      createTemplateNode({
        id: "ed-email",
        label: "Email & Push",
        shape: "hexagon",
        x: 770,
        y: 142,
        color: "pink",
      }),
    ],
    edges: [
      createTemplateEdge({
        id: "ed-e1",
        source: "ed-producer",
        target: "ed-broker",
        label: "OrderPlaced",
      }),
      createTemplateEdge({
        id: "ed-e2",
        source: "ed-broker",
        target: "ed-inventory",
        sourceHandle: "top",
        targetHandle: "left",
        label: "Reserve",
      }),
      createTemplateEdge({
        id: "ed-e3",
        source: "ed-broker",
        target: "ed-notify",
        label: "Dispatch",
      }),
      createTemplateEdge({
        id: "ed-e4",
        source: "ed-broker",
        target: "ed-analytics",
        sourceHandle: "bottom",
        targetHandle: "left",
        label: "Ingest",
      }),
      createTemplateEdge({
        id: "ed-e5",
        source: "ed-broker",
        target: "ed-dlq",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Retries=0",
      }),
      createTemplateEdge({
        id: "ed-e6",
        source: "ed-notify",
        target: "ed-email",
      }),
      createTemplateEdge({
        id: "ed-e7",
        source: "ed-analytics",
        target: "ed-warehouse",
        label: "Batch",
      }),
    ],
  },
  {
    id: "serverless-ai-app",
    name: "Serverless AI Backend",
    description:
      "Edge-routed serverless API with background job queue, vector database, and LLM inference.",
    nodes: [
      createTemplateNode({
        id: "sv-edge",
        label: "Edge CDN / Router",
        shape: "hexagon",
        x: 0,
        y: 150,
        color: "teal",
      }),
      createTemplateNode({
        id: "sv-fn",
        label: "Serverless Function",
        shape: "pill",
        x: 230,
        y: 178,
        color: "blue",
      }),
      createTemplateNode({
        id: "sv-queue",
        label: "Background Worker",
        shape: "rectangle",
        x: 480,
        y: 60,
        color: "purple",
      }),
      createTemplateNode({
        id: "sv-vector",
        label: "Vector Store",
        shape: "cylinder",
        x: 495,
        y: 250,
        color: "green",
      }),
      createTemplateNode({
        id: "sv-llm",
        label: "LLM Inference API",
        shape: "circle",
        x: 740,
        y: 150,
        color: "orange",
      }),
    ],
    edges: [
      createTemplateEdge({
        id: "sv-e1",
        source: "sv-edge",
        target: "sv-fn",
        label: "Invoke",
      }),
      createTemplateEdge({
        id: "sv-e2",
        source: "sv-fn",
        target: "sv-queue",
        sourceHandle: "top",
        targetHandle: "left",
        label: "Enqueue",
      }),
      createTemplateEdge({
        id: "sv-e3",
        source: "sv-fn",
        target: "sv-vector",
        sourceHandle: "bottom",
        targetHandle: "left",
        label: "RAG Query",
      }),
      createTemplateEdge({
        id: "sv-e4",
        source: "sv-queue",
        target: "sv-llm",
        sourceHandle: "right",
        targetHandle: "top",
        label: "Prompt",
      }),
      createTemplateEdge({
        id: "sv-e5",
        source: "sv-vector",
        target: "sv-llm",
        sourceHandle: "right",
        targetHandle: "bottom",
        label: "Context",
      }),
    ],
  },
];
