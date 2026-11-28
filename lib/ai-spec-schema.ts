import { z } from "zod";

export const specChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  sender: z.string().optional(),
  timestamp: z.string().optional(),
});

export type SpecChatMessage = z.infer<typeof specChatMessageSchema>;

export const specNodeSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().optional(),
    position: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    data: z
      .object({
        label: z.string().optional(),
        shape: z.string().optional(),
        color: z.string().optional(),
        textColor: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type SpecNodeInput = z.infer<typeof specNodeSchema>;

export const specEdgeSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    type: z.string().optional(),
    data: z
      .object({
        label: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type SpecEdgeInput = z.infer<typeof specEdgeSchema>;

export const specTriggerRequestSchema = z.object({
  roomId: z.string().trim().min(1, "roomId is required"),
  chatHistory: z.array(specChatMessageSchema),
  nodes: z.array(specNodeSchema),
  edges: z.array(specEdgeSchema),
});

export type SpecTriggerRequest = z.infer<typeof specTriggerRequestSchema>;

export const specTokenRequestSchema = z.object({
  runId: z.string().trim().min(1, "runId is required"),
});

export type SpecTokenRequest = z.infer<typeof specTokenRequestSchema>;

export const generateSpecPayloadSchema = specTriggerRequestSchema.extend({
  projectId: z.string().trim().min(1, "projectId is required"),
});

export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>;

export const SPEC_SYSTEM_PROMPT = `You are a principal systems architect writing a clear, comprehensive technical specification in plain Markdown.

You will be given:
1. Project and room identifiers
2. The architecture canvas graph (nodes and edges)
3. The collaborator/AI chat history

Produce a well-structured Markdown technical specification that accurately reflects the provided architecture and conversation context. Include:
- Title and Executive Summary
- System Architecture & Components (describing each node, its role, and its shape/category if helpful)
- Data Flow & Component Interactions (describing the edges, protocols/labels, and request or event paths)
- Data Storage, State & Persistence (if applicable from the graph/chat)
- Scalability, Reliability & Observability
- Security & Operational Considerations

Rules:
- Output ONLY plain Markdown.
- Do not wrap the entire document in a \`\`\`markdown code fence.
- Do not invent major external systems that contradict the canvas; base the spec on the nodes, edges, and chat history, noting reasonable engineering assumptions where details are unspecified.`;
