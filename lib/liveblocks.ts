import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
  verifiedRooms: Set<string> | undefined;
};

/**
 * Validates whether a real Liveblocks secret key has been configured in the environment.
 * Valid keys start with either `sk_dev_` or `sk_prod_` and are not default placeholders.
 */
export function isLiveblocksConfigured(): boolean {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY?.trim();
  if (!secret) return false;
  if (
    secret.startsWith("sk_dev_placeholder") ||
    secret.includes("placeholder") ||
    secret.includes("your_liveblocks")
  ) {
    return false;
  }
  return secret.startsWith("sk_dev_") || secret.startsWith("sk_prod_");
}

function createLiveblocksClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY?.trim();
  return new Liveblocks({
    secret: secret || "sk_dev_placeholder_key",
  });
}

export const liveblocks =
  globalForLiveblocks.liveblocks ?? createLiveblocksClient();

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks;
}

/**
 * In-memory registry of rooms verified and created with Liveblocks in the current process.
 * Eliminates redundant getOrCreateRoom REST calls on subsequent auth requests for the same room.
 */
const verifiedRooms: Set<string> =
  globalForLiveblocks.verifiedRooms ?? new Set<string>();

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.verifiedRooms = verifiedRooms;
}

export function isRoomVerified(roomId: string): boolean {
  return verifiedRooms.has(roomId);
}

export function markRoomVerified(roomId: string): void {
  verifiedRooms.add(roomId);
}

/**
 * Fixed palette of vivid colors for collaborative presence & cursors.
 * Tuned for contrast on dark canvas surfaces.
 */
export const USER_COLORS = [
  "#00c8d4", // Cyan (Brand)
  "#8b82ff", // Indigo / Purple (AI)
  "#52a8ff", // Sky Blue
  "#34d399", // Emerald Green
  "#fbbf24", // Amber Yellow
  "#ff6166", // Coral Red
  "#f75f8f", // Pink
  "#bf7af0", // Violet
  "#0ac7b4", // Teal
  "#ff990a", // Orange
] as const;

/**
 * Deterministically maps a user ID to a consistent color from USER_COLORS.
 */
export function getUserColor(userId: string): string {
  if (!userId) {
    return USER_COLORS[0];
  }
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}
