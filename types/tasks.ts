import { z } from "zod";

export const AI_STATUS_FEED_ID = "ai-status-feed" as const;
export const AI_CHAT_FEED_ID = "ai-chat" as const;

export const aiStatusStepSchema = z.enum([
  "start",
  "processing",
  "complete",
  "error",
]);

export type AiStatusStep = z.infer<typeof aiStatusStepSchema>;

export const aiStatusFeedMessageSchema = z.object({
  text: z.string().optional(),
  message: z.string().optional(),
  step: aiStatusStepSchema.optional(),
  prompt: z.string().optional(),
  timestamp: z.string().optional(),
});

export type AiStatusFeedMessage = z.infer<typeof aiStatusFeedMessageSchema>;

export interface ValidatedAiStatusMessage {
  text: string;
  step?: AiStatusStep;
  timestamp?: string;
}

export function parseAiStatusFeedMessage(
  data: unknown
): ValidatedAiStatusMessage | null {
  const parsed = aiStatusFeedMessageSchema.safeParse(data);
  if (!parsed.success) return null;

  const rawText = parsed.data.text ?? parsed.data.message;
  const text = rawText?.trim();
  if (!text) return null;

  return {
    text,
    step: parsed.data.step,
    timestamp: parsed.data.timestamp,
  };
}

export const aiChatRoleSchema = z.enum(["user", "assistant"]);

export type AiChatRole = z.infer<typeof aiChatRoleSchema>;

export const aiChatFeedMessageSchema = z.object({
  sender: z.string().min(1),
  role: aiChatRoleSchema,
  content: z.string().min(1),
  timestamp: z.string().min(1),
});

export type AiChatFeedMessage = z.infer<typeof aiChatFeedMessageSchema>;

export interface ValidatedAiChatMessage extends AiChatFeedMessage {
  id: string;
  createdAt: number;
}

export function parseAiChatFeedMessage(
  id: string,
  createdAt: number,
  data: unknown
): ValidatedAiChatMessage | null {
  const parsed = aiChatFeedMessageSchema.safeParse(data);
  if (!parsed.success) return null;

  const sender = parsed.data.sender.trim();
  const content = parsed.data.content.trim();
  const timestamp = parsed.data.timestamp.trim();
  if (!sender || !content || !timestamp) return null;

  return {
    id,
    createdAt,
    sender,
    role: parsed.data.role,
    content,
    timestamp,
  };
}
