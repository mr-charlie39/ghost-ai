import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { mutateFlow } from "@liveblocks/react-flow/node";
import { AbortTaskRunError, logger, metadata, task } from "@trigger.dev/sdk";
import { generateText, Output } from "ai";
import {
  buildCanvasEdge,
  buildCanvasNode,
  clampDimension,
  DESIGN_SYSTEM_PROMPT,
  designPlanSchema,
  MIN_NODE_HEIGHT,
  MIN_NODE_WIDTH,
  resolveColorPair,
  type CanvasAction,
} from "@/lib/ai-design-schema";
import { isLiveblocksConfigured, liveblocks } from "@/lib/liveblocks";
import {
  clearAiPresence,
  publishAiStatus,
  setAiPresence,
} from "@/lib/liveblocks-ai";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

function getCursorForAction(
  action: CanvasAction,
  nodesById: Map<string, CanvasNode>
): { x: number; y: number } | null {
  switch (action.type) {
    case "add_node":
    case "move_node":
      return { x: Math.round(action.x), y: Math.round(action.y) };
    case "resize_node":
    case "update_node_data":
    case "delete_node": {
      const node = nodesById.get(action.id);
      return node ? { x: node.position.x, y: node.position.y } : null;
    }
    case "add_edge": {
      const target = nodesById.get(action.target) ?? nodesById.get(action.source);
      return target ? { x: target.position.x, y: target.position.y } : null;
    }
    case "delete_edge":
      return null;
  }
}

const DESIGN_AGENT_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
] as const;

const MODEL_CALL_TIMEOUT_MS = 20_000;

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    const { prompt, roomId } = payload;

    if (!isLiveblocksConfigured()) {
      throw new AbortTaskRunError("LIVEBLOCKS_SECRET_KEY is not configured.");
    }

    const googleApiKey =
      process.env.GOOGLE_AI_API_KEY?.trim() ??
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

    if (!googleApiKey) {
      throw new AbortTaskRunError("GOOGLE_AI_API_KEY is not configured.");
    }

    metadata.set("status", "start").set("message", "Starting design generation");
    await setAiPresence(roomId, { x: 0, y: 0 }, true);
    await publishAiStatus(
      roomId,
      "start",
      "Ghost AI started analyzing your prompt.",
      prompt
    );

    try {
      let existingNodes: readonly CanvasNode[] = [];
      let existingEdges: readonly CanvasEdge[] = [];

      await mutateFlow<CanvasNode, CanvasEdge>(
        { client: liveblocks, roomId },
        (flow) => {
          existingNodes = flow.nodes;
          existingEdges = flow.edges;
        }
      );

      metadata
        .set("status", "processing")
        .set("message", "Generating architecture plan");
      await publishAiStatus(
        roomId,
        "processing",
        "Generating architecture plan with Gemini..."
      );

      const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
      const canvasContext = JSON.stringify({
        nodes: existingNodes.map((n) => ({
          id: n.id,
          label: n.data?.label ?? "",
          shape: n.data?.shape ?? "rectangle",
          position: n.position,
          width: n.width,
          height: n.height,
        })),
        edges: existingEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.data?.label ?? "",
        })),
      });

      let plan: { summary: string; actions: CanvasAction[] } | undefined;
      let lastModelError: unknown;

      for (const modelId of DESIGN_AGENT_MODELS) {
        try {
          const result = await generateText({
            model: google(modelId),
            maxRetries: 0,
            abortSignal: AbortSignal.timeout(MODEL_CALL_TIMEOUT_MS),
            output: Output.object({
              schema: designPlanSchema,
            }),
            system: DESIGN_SYSTEM_PROMPT,
            prompt: `User prompt: ${prompt}\n\nCurrent canvas state:\n${canvasContext}`,
          });
          plan = result.output;
          break;
        } catch (modelError) {
          lastModelError = modelError;
          logger.warn("Design agent model attempt failed, trying fallback", {
            modelId,
            error:
              modelError instanceof Error
                ? modelError.message
                : String(modelError),
          });
        }
      }

      if (!plan && lastModelError) {
        throw lastModelError;
      }

      if (!plan || plan.actions.length === 0) {
        throw new Error("Gemini returned an empty design plan.");
      }

      metadata
        .set("status", "processing")
        .set("message", `Applying ${plan.actions.length} canvas updates`);
      await publishAiStatus(
        roomId,
        "processing",
        `Applying ${plan.actions.length} canvas updates...`
      );

      const nodesById = new Map<string, CanvasNode>(
        existingNodes.map((node) => [node.id, node])
      );

      const firstCursor = getCursorForAction(plan.actions[0], nodesById);
      if (firstCursor) {
        await setAiPresence(roomId, firstCursor, true);
      }

      await mutateFlow<CanvasNode, CanvasEdge>(
        { client: liveblocks, roomId },
        (flow) => {
          let edgeCounter = 0;

          for (const action of plan.actions) {
            switch (action.type) {
              case "add_node": {
                const node = buildCanvasNode(action);
                flow.addNode(node);
                nodesById.set(node.id, node);
                break;
              }
              case "move_node": {
                flow.updateNode(action.id, {
                  position: {
                    x: Math.round(action.x),
                    y: Math.round(action.y),
                  },
                });
                break;
              }
              case "resize_node": {
                const width = clampDimension(action.width, MIN_NODE_WIDTH);
                const height = clampDimension(action.height, MIN_NODE_HEIGHT);
                flow.updateNode(action.id, (node) => ({
                  ...node,
                  width,
                  height,
                  style: { ...node.style, width, height },
                }));
                break;
              }
              case "update_node_data": {
                const existing = flow.getNode(action.id);
                if (!existing) break;
                const palette = action.color
                  ? resolveColorPair(action.color)
                  : undefined;
                flow.updateNodeData(action.id, {
                  ...(action.label !== undefined
                    ? { label: action.label.trim() }
                    : {}),
                  ...(action.shape !== undefined ? { shape: action.shape } : {}),
                  ...(palette
                    ? { color: palette.fill, textColor: palette.text }
                    : {}),
                });
                break;
              }
              case "delete_node": {
                const connectedEdgeIds = flow.edges
                  .filter(
                    (edge) =>
                      edge.source === action.id || edge.target === action.id
                  )
                  .map((edge) => edge.id);
                if (connectedEdgeIds.length > 0) {
                  flow.removeEdges(connectedEdgeIds);
                }
                flow.removeNode(action.id);
                nodesById.delete(action.id);
                break;
              }
              case "add_edge": {
                edgeCounter += 1;
                flow.addEdge(buildCanvasEdge(action, edgeCounter));
                break;
              }
              case "delete_edge": {
                flow.removeEdge(action.id);
                break;
              }
            }
          }
        }
      );

      const lastAction = plan.actions[plan.actions.length - 1];
      const lastCursor = getCursorForAction(lastAction, nodesById);
      if (lastCursor) {
        await setAiPresence(roomId, lastCursor, true);
      }

      metadata
        .set("status", "complete")
        .set("message", plan.summary);
      await publishAiStatus(roomId, "complete", plan.summary);

      logger.info("Design agent completed", {
        roomId,
        actionCount: plan.actions.length,
        summary: plan.summary,
      });

      return {
        roomId,
        summary: plan.summary,
        actionCount: plan.actions.length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown design agent error";
      logger.error("Design agent failed", { roomId, error: message });
      metadata.set("status", "error").set("message", message);
      await publishAiStatus(
        roomId,
        "error",
        `Design generation failed: ${message}`
      );
      throw error;
    } finally {
      await clearAiPresence(roomId);
    }
  },
});
