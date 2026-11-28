import { isLiveblocksConfigured, liveblocks } from "@/lib/liveblocks";
import { AI_STATUS_FEED_ID, type AiStatusStep } from "@/types/tasks";

export const AI_AGENT_USER_ID = "ghost-ai";
export { AI_STATUS_FEED_ID };
export type { AiStatusStep };

const AI_AGENT_INFO = {
  name: "Ghost AI",
  avatar: "",
  color: "#8b82ff",
};

export interface AiStatusMessageData {
  [key: string]: string | undefined;
  step: AiStatusStep;
  text: string;
  message: string;
  prompt?: string;
  timestamp: string;
}

/**
 * Updates Ghost AI's ephemeral presence (cursor + thinking indicator) in the room.
 */
export async function setAiPresence(
  roomId: string,
  cursor: { x: number; y: number } | null,
  thinking: boolean
): Promise<void> {
  if (!isLiveblocksConfigured()) return;

  try {
    await liveblocks.setPresence(roomId, {
      userId: AI_AGENT_USER_ID,
      userInfo: AI_AGENT_INFO,
      data: {
        cursor,
        thinking,
      },
      ttl: 60,
    });
  } catch (error) {
    console.warn("Failed to update AI presence:", error);
  }
}

/**
 * Clears Ghost AI's cursor and thinking state when the task finishes.
 */
export async function clearAiPresence(roomId: string): Promise<void> {
  if (!isLiveblocksConfigured()) return;

  try {
    await liveblocks.setPresence(roomId, {
      userId: AI_AGENT_USER_ID,
      userInfo: AI_AGENT_INFO,
      data: {
        cursor: null,
        thinking: false,
      },
      ttl: 2,
    });
  } catch (error) {
    console.warn("Failed to clear AI presence:", error);
  }
}

/**
 * Publishes an AI progress message to the room's shared status feed.
 */
export async function publishAiStatus(
  roomId: string,
  step: AiStatusStep,
  message: string,
  prompt?: string
): Promise<void> {
  if (!isLiveblocksConfigured()) return;

  try {
    try {
      await liveblocks.createFeed({
        roomId,
        feedId: AI_STATUS_FEED_ID,
      });
    } catch {
      // Feed may already exist (409 Conflict); continue to post message
    }

    const data: AiStatusMessageData = {
      step,
      text: message,
      message,
      timestamp: new Date().toISOString(),
      ...(prompt ? { prompt } : {}),
    };

    await liveblocks.createFeedMessage({
      roomId,
      feedId: AI_STATUS_FEED_ID,
      data,
    });
  } catch (error) {
    console.warn("Failed to publish AI status message:", error);
  }
}
