"use client";

import * as React from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useOthers } from "@liveblocks/react/suspense";

const MAX_VISIBLE_COLLABORATORS = 5;
const emptySubscribe = () => () => {};

interface CollaboratorPresence {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function CollaboratorAvatarItem({
  collaborator,
}: {
  collaborator: CollaboratorPresence;
}) {
  const [hasImageError, setHasImageError] = React.useState(false);
  const showImage = Boolean(collaborator.avatar) && !hasImageError;

  return (
    <div
      title={collaborator.name}
      aria-label={collaborator.name}
      className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-elevated text-[11px] font-semibold text-copy-primary ring-2 ring-base select-none pointer-events-none overflow-hidden"
      style={{
        boxShadow: `0 0 0 1px ${collaborator.color}`,
      }}
    >
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={collaborator.avatar}
          alt={collaborator.name}
          onError={() => setHasImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(collaborator.name)}</span>
      )}
    </div>
  );
}

export function PresenceAvatars() {
  const { userId } = useAuth();
  const others = useOthers();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const collaborators = React.useMemo(() => {
    const seen = new Set<string>();
    const list: CollaboratorPresence[] = [];

    for (const other of others) {
      if (userId && other.id === userId) continue;
      if (seen.has(other.id)) continue;
      seen.add(other.id);

      list.push({
        id: other.id,
        name: other.info?.name || "Collaborator",
        avatar: other.info?.avatar || "",
        color: other.info?.color || "var(--accent-primary)",
      });
    }

    return list;
  }, [others, userId]);

  const visibleCollaborators = collaborators.slice(0, MAX_VISIBLE_COLLABORATORS);
  const overflowCount = Math.max(0, collaborators.length - MAX_VISIBLE_COLLABORATORS);

  return (
    <div
      aria-label="Active room participants"
      className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-surface-border bg-surface/90 px-2 py-1.5 backdrop-blur-md shadow-lg"
    >
      {collaborators.length > 0 && (
        <>
          <div className="flex items-center -space-x-2 pointer-events-none select-none">
            {visibleCollaborators.map((collaborator) => (
              <CollaboratorAvatarItem
                key={collaborator.id}
                collaborator={collaborator}
              />
            ))}
            {overflowCount > 0 && (
              <div
                aria-label={`${overflowCount} more collaborators`}
                className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-subtle text-[11px] font-semibold text-copy-secondary ring-2 ring-base border border-surface-border select-none pointer-events-none"
              >
                +{overflowCount}
              </div>
            )}
          </div>
          <div className="h-4 w-px bg-surface-border" aria-hidden="true" />
        </>
      )}

      <div className="flex h-7 w-7 items-center justify-center shrink-0">
        {mounted && (
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-7 w-7 ring-2 ring-base hover:ring-brand/60 transition-all",
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
