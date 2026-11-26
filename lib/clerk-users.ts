import { clerkClient } from "@clerk/nextjs/server";

export interface EnrichedUserData {
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface EnrichedOwnerData {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

/**
 * Enriches a list of collaborator email addresses using the Clerk Backend API.
 * Returns display names and avatar URLs when available.
 * If a Clerk user is not found for an email, falls back to showing the email only.
 */
export async function enrichEmailsWithClerk(
  emails: string[]
): Promise<Map<string, EnrichedUserData>> {
  const result = new Map<string, EnrichedUserData>();
  const normalizedEmails = Array.from(
    new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))
  );

  // Pre-fill fallback entries: email only
  for (const email of normalizedEmails) {
    result.set(email, {
      email,
      name: null,
      avatarUrl: null,
    });
  }

  if (normalizedEmails.length === 0) {
    return result;
  }

  try {
    const client = await clerkClient();
    // Clerk backend API accepts up to 100 email addresses per request
    const batchSize = 100;

    for (let i = 0; i < normalizedEmails.length; i += batchSize) {
      const batch = normalizedEmails.slice(i, i + batchSize);
      const userList = await client.users.getUserList({
        emailAddress: batch,
        limit: batchSize,
      });

      for (const user of userList.data) {
        const fullName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        const displayName = fullName || user.username || null;
        const avatarUrl = user.imageUrl || null;

        for (const emailObj of user.emailAddresses) {
          const lowerEmail = emailObj.emailAddress.toLowerCase();
          if (result.has(lowerEmail)) {
            result.set(lowerEmail, {
              email: emailObj.emailAddress,
              name: displayName,
              avatarUrl,
            });
          }
        }
      }
    }
  } catch (error) {
    // If Clerk backend API call fails or is unreachable, gracefully fall back to email only
    console.warn("Clerk backend user enrichment fallback:", error);
  }

  return result;
}

/**
 * Enriches a project owner's details using their Clerk user ID.
 */
export async function getOwnerInfoFromClerk(
  ownerId: string
): Promise<EnrichedOwnerData> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(ownerId);

    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      null;

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const displayName = fullName || user.username || null;

    return {
      id: user.id,
      email: primaryEmail,
      name: displayName,
      avatarUrl: user.imageUrl || null,
    };
  } catch (error) {
    console.warn("Clerk backend owner fetch fallback:", error);
    return {
      id: ownerId,
      email: null,
      name: null,
      avatarUrl: null,
    };
  }
}
