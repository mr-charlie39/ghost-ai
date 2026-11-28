import { randomUUID } from "node:crypto";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AbortTaskRunError, logger, metadata, task } from "@trigger.dev/sdk";
import { put } from "@vercel/blob";
import { generateText } from "ai";
import {
  generateSpecPayloadSchema,
  SPEC_SYSTEM_PROMPT,
  type GenerateSpecPayload,
} from "@/lib/ai-spec-schema";
import { prisma } from "@/lib/prisma";

const SPEC_AGENT_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
] as const;

const MODEL_CALL_TIMEOUT_MS = 45_000;

function stripOuterMarkdownFence(text: string): string {
  const trimmed = text.trim();
  const match = /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i.exec(trimmed);
  return match ? match[1].trim() : trimmed;
}

export const generateSpec = task({
  id: "generate-spec",
  run: async (payload: GenerateSpecPayload): Promise<string> => {
    const parsed = generateSpecPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new AbortTaskRunError(
        `Invalid generate-spec payload: ${parsed.error.issues
          .map((issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`)
          .join("; ")}`
      );
    }

    const { projectId, roomId, chatHistory, nodes, edges } = parsed.data;

    const googleApiKey =
      process.env.GOOGLE_AI_API_KEY?.trim() ??
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

    if (!googleApiKey) {
      throw new AbortTaskRunError("GOOGLE_AI_API_KEY is not configured.");
    }

    metadata
      .set("status", "start")
      .set("message", "Starting technical specification generation");

    logger.info("Starting spec generation", {
      projectId,
      roomId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      chatMessageCount: chatHistory.length,
    });

    try {
      metadata
        .set("status", "processing")
        .set("message", "Generating Markdown technical specification");

      const google = createGoogleGenerativeAI({ apiKey: googleApiKey });

      const architectureContext = JSON.stringify(
        {
          projectId,
          roomId,
          nodes: nodes.map((node) => ({
            id: node.id,
            label: node.data?.label ?? "",
            shape: node.data?.shape ?? "rectangle",
            position: node.position,
          })),
          edges: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.data?.label ?? "",
          })),
          chatHistory: chatHistory.map((msg) => ({
            role: msg.role,
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
        },
        null,
        2
      );

      let specMarkdown = "";
      let lastModelError: unknown;

      for (const modelId of SPEC_AGENT_MODELS) {
        try {
          const result = await generateText({
            model: google(modelId),
            maxRetries: 0,
            abortSignal: AbortSignal.timeout(MODEL_CALL_TIMEOUT_MS),
            system: SPEC_SYSTEM_PROMPT,
            prompt: `Generate a complete Markdown technical specification for this workspace:\n\n${architectureContext}`,
          });

          const cleaned = stripOuterMarkdownFence(result.text);
          if (!cleaned) {
            throw new Error("Gemini returned an empty specification.");
          }

          specMarkdown = cleaned;
          break;
        } catch (modelError) {
          lastModelError = modelError;
          logger.warn("Spec generation model attempt failed, trying fallback", {
            modelId,
            error:
              modelError instanceof Error
                ? modelError.message
                : String(modelError),
          });
        }
      }

      if (!specMarkdown && lastModelError) {
        throw lastModelError;
      }

      if (!specMarkdown) {
        throw new Error("Gemini failed to generate specification content.");
      }

      metadata
        .set("status", "processing")
        .set("message", "Saving generated technical specification");

      const specId = randomUUID();
      const blob = await put(`specs/${projectId}/${specId}.md`, specMarkdown, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "text/markdown; charset=utf-8",
      });

      const projectSpec = await prisma.projectSpec.create({
        data: {
          id: specId,
          projectId,
          filePath: blob.url,
        },
      });

      metadata
        .set("status", "complete")
        .set("message", "Technical specification generated")
        .set("specId", projectSpec.id);

      logger.info("Spec generation completed", {
        projectId,
        roomId,
        specId: projectSpec.id,
        outputLength: specMarkdown.length,
      });

      return specMarkdown;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown spec generation error";
      logger.error("Spec generation failed", {
        projectId,
        roomId,
        error: message,
      });
      metadata.set("status", "error").set("message", message);
      throw error;
    }
  },
});
