/**
 * Generates a URL-friendly slug from a string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim leading and trailing hyphens
}

/**
 * Generates a short URL-friendly random alphanumeric suffix.
 */
export function generateShortSuffix(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a Liveblocks room ID from a project name and an optional suffix.
 * Keeps project ID and room ID aligned.
 */
export function generateRoomId(name: string, suffix?: string): string {
  const baseSlug = generateSlug(name) || "untitled-project";
  const s = suffix || generateShortSuffix(6);
  return `${baseSlug}-${s}`;
}

