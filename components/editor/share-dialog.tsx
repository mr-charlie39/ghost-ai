"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Crown,
  Link2,
  Loader2,
  Mail,
  ShieldAlert,
  Trash2,
  User,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CollaboratorItem,
  CollaboratorsApiResponse,
  ProjectOwnerItem,
} from "@/types/collaborator";

export interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName?: string;
  isOwner?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CollaboratorAvatar({
  avatarUrl,
  name,
  email,
}: {
  avatarUrl?: string | null;
  name?: string | null;
  email: string;
}) {
  const [hasError, setHasError] = React.useState(false);
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();

  if (avatarUrl && !hasError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={avatarUrl}
        alt={name || email}
        onError={() => setHasError(true)}
        className="h-8 w-8 rounded-full object-cover ring-1 ring-surface-border shrink-0"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-subtle border border-surface-border text-copy-secondary text-xs font-semibold shrink-0 select-none">
      {initial}
    </div>
  );
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  isOwner: initialIsOwner = false,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = React.useState<CollaboratorItem[]>(
    []
  );
  const [owner, setOwner] = React.useState<ProjectOwnerItem | null>(null);
  const [apiIsOwner, setApiIsOwner] = React.useState<boolean | null>(null);
  const isOwner = apiIsOwner ?? initialIsOwner;

  const [isLoading, setIsLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = React.useState(0);
  const fetchVersion = React.useRef(0);

  // Invite state
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [isInviting, setIsInviting] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = React.useState<string | null>(null);

  // Remove state
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [removeError, setRemoveError] = React.useState<string | null>(null);

  // Link copy state
  const [linkCopied, setLinkCopied] = React.useState(false);

  // Fetch collaborators whenever dialog opens or reloadTrigger fires
  React.useEffect(() => {
    if (!open || !projectId) return;

    let isCancelled = false;
    const controller = new AbortController();
    const requestVersion = ++fetchVersion.current;

    fetch(`/api/projects/${projectId}/collaborators`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to fetch collaborators (${res.status})`
          );
        }
        return res.json();
      })
      .then((data: CollaboratorsApiResponse) => {
        if (!isCancelled && requestVersion === fetchVersion.current) {
          setCollaborators(data.collaborators || []);
          setOwner(data.owner || null);
          if (typeof data.isOwner === "boolean") {
            setApiIsOwner(data.isOwner);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (
          !isCancelled &&
          requestVersion === fetchVersion.current &&
          err.name !== "AbortError"
        ) {
          console.error("Error fetching collaborators:", err);
          setFetchError(
            err instanceof Error ? err.message : "Failed to load collaborators"
          );
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [open, projectId, reloadTrigger]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setInviteEmail("");
      setInviteError(null);
      setInviteSuccess(null);
      setRemoveError(null);
      setLinkCopied(false);
      setIsLoading(true);
      setFetchError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setFetchError(null);
    setReloadTrigger((prev) => prev + 1);
  };

  // Copy workspace link
  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Invite collaborator
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);

    const emailToInvite = inviteEmail.trim().toLowerCase();
    if (!emailToInvite) return;

    if (!EMAIL_REGEX.test(emailToInvite)) {
      setInviteError("Please enter a valid email address");
      return;
    }

    if (owner?.email && owner.email.toLowerCase() === emailToInvite) {
      setInviteError("You are the project owner and already have access");
      return;
    }

    const alreadyMember = collaborators.some(
      (c) => c.email.toLowerCase() === emailToInvite
    );
    if (alreadyMember) {
      setInviteError("This collaborator has already been invited");
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToInvite }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to invite collaborator");
      }

      // Add new collaborator to the local list
      const newCollab: CollaboratorItem = {
        id: data.id,
        email: data.email,
        name: data.name ?? null,
        avatarUrl: data.avatarUrl ?? null,
        createdAt: data.createdAt,
      };

      setCollaborators((prev) => [...prev, newCollab]);
      fetchVersion.current += 1;
      setReloadTrigger((prev) => prev + 1);
      setInviteEmail("");
      setInviteSuccess(`Invited ${emailToInvite}`);
      setTimeout(() => setInviteSuccess(null), 3500);
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to invite collaborator"
      );
    } finally {
      setIsInviting(false);
    }
  };

  // Remove collaborator
  const handleRemove = async (collabId: string) => {
    if (!isOwner) return;
    setRemoveError(null);
    setRemovingId(collabId);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators/${collabId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove collaborator");
      }

      setCollaborators((prev) => prev.filter((c) => c.id !== collabId));
    } catch (err) {
      setRemoveError(
        err instanceof Error ? err.message : "Failed to remove collaborator"
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl border border-surface-border bg-surface p-4 sm:p-6 shadow-2xl text-copy-primary w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:max-w-lg select-none box-border overflow-hidden gap-3.5 sm:gap-4">
        {/* Header */}
        <DialogHeader className="gap-1.5 text-left w-full min-w-0 pr-8">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold text-copy-primary truncate">
                Share Project
              </DialogTitle>
              {projectName && (
                <p className="text-xs text-copy-muted truncate font-mono mt-0.5">
                  {projectName}
                </p>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-copy-muted pt-0.5 leading-relaxed">
            Collaborate in real-time. Invite teammates by email to grant them access to this workspace.
          </DialogDescription>
        </DialogHeader>

        {/* Project Link Copy Section */}
        <div className="w-full min-w-0 box-border">
          <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-base/70 p-1.5 sm:p-2 text-xs w-full min-w-0 box-border">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center text-copy-muted">
              <Link2 className="h-3.5 w-3.5" />
            </div>
            <span className="flex-1 min-w-0 truncate font-mono text-[11px] text-copy-secondary">
              {typeof window !== "undefined" ? window.location.href : `/editor/${projectId}`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              aria-label="Copy project link"
              className={cn(
                "h-7 gap-1.5 px-2.5 text-xs font-medium cursor-pointer shrink-0 transition-colors",
                linkCopied
                  ? "text-state-success hover:bg-state-success/10"
                  : "text-copy-primary hover:bg-subtle"
              )}
            >
              {linkCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-state-success" />
                  <span className="font-medium text-state-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-copy-muted" />
                  <span>Copy link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Invite Form (Owners only) */}
        {isOwner ? (
          <form onSubmit={handleInvite} className="flex flex-col gap-1.5 w-full min-w-0 box-border">
            <label
              htmlFor="invite-email"
              className="text-xs font-medium text-copy-secondary flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-copy-muted shrink-0" />
              Invite collaborator by email
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0">
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (inviteError) setInviteError(null);
                }}
                placeholder="colleague@example.com"
                disabled={isInviting}
                className="flex-1 min-w-0 w-full h-9 text-xs bg-base border-surface-border text-copy-primary placeholder:text-copy-faint focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand/30"
              />
              <Button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="h-9 px-4 text-xs font-medium bg-brand text-black hover:bg-brand/90 disabled:opacity-40 cursor-pointer shrink-0 w-full sm:w-auto"
              >
                {isInviting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    Inviting...
                  </>
                ) : (
                  "Invite"
                )}
              </Button>
            </div>

            {/* Invite Feedback messages */}
            {inviteError && (
              <p className="text-[11px] text-state-destructive flex items-center gap-1 pt-0.5 animate-in fade-in min-w-0">
                <ShieldAlert className="h-3 w-3 shrink-0" />
                <span className="truncate">{inviteError}</span>
              </p>
            )}
            {inviteSuccess && (
              <p className="text-[11px] text-state-success flex items-center gap-1 pt-0.5 animate-in fade-in min-w-0">
                <Check className="h-3 w-3 shrink-0" />
                <span className="truncate">{inviteSuccess}</span>
              </p>
            )}
          </form>
        ) : (
          /* Read-only banner for collaborators */
          <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-subtle/30 px-3 py-2 text-xs text-copy-muted w-full min-w-0 box-border">
            <User className="h-3.5 w-3.5 text-copy-muted shrink-0" />
            <span className="truncate">You have read-only collaborator access to this project.</span>
          </div>
        )}

        {/* Collaborators List */}
        <div className="flex flex-col gap-2 w-full min-w-0 box-border">
          <div className="flex items-center justify-between pb-1.5 border-b border-surface-border/60 w-full min-w-0">
            <span className="text-xs font-semibold text-copy-primary uppercase tracking-wider">
              Project Members
            </span>
            <span className="text-[11px] font-mono text-copy-faint shrink-0">
              {1 + collaborators.length} {1 + collaborators.length === 1 ? "member" : "members"}
            </span>
          </div>

          {/* Remove Error Feedback */}
          {removeError && (
            <div className="text-[11px] text-state-destructive flex items-center gap-1 min-w-0">
              <ShieldAlert className="h-3 w-3 shrink-0" />
              <span className="truncate">{removeError}</span>
            </div>
          )}

          {/* Member items scroll container */}
          <div className="flex flex-col gap-1.5 max-h-56 sm:max-h-64 overflow-y-auto overflow-x-hidden w-full min-w-0 pr-0.5">
            {/* Owner Row */}
            {owner && (
              <div className="w-full min-w-0 flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-base/40 border border-surface-border/50 hover:bg-base/70 transition-colors gap-2 box-border">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <CollaboratorAvatar
                    avatarUrl={owner.avatarUrl}
                    name={owner.name}
                    email={owner.email || "Owner"}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-medium text-copy-primary truncate block">
                      {owner.name || owner.email || "Workspace Owner"}
                    </span>
                    {owner.name && owner.email && (
                      <span className="text-[10px] text-copy-muted truncate block font-mono">
                        {owner.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 border border-brand/25 px-2 py-0.5 text-[10px] font-mono font-medium text-brand">
                    <Crown className="h-2.5 w-2.5" />
                    Owner
                  </span>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-copy-muted w-full">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
                <span className="text-xs">Loading collaborators...</span>
              </div>
            )}

            {/* Fetch error */}
            {fetchError && !isLoading && (
              <div className="py-4 text-center text-xs text-state-destructive flex flex-col items-center gap-2 w-full">
                <p className="truncate max-w-full">{fetchError}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="h-7 text-xs text-copy-secondary hover:text-copy-primary hover:bg-subtle cursor-pointer"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Collaborator Rows */}
            {!isLoading &&
              collaborators.map((collab) => {
                const isRemoving = removingId === collab.id;

                return (
                  <div
                    key={collab.id}
                    className="w-full min-w-0 flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-base/30 border border-surface-border/40 hover:bg-base/60 transition-colors gap-2 box-border"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <CollaboratorAvatar
                        avatarUrl={collab.avatarUrl}
                        name={collab.name}
                        email={collab.email}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        {collab.name ? (
                          <>
                            <span className="text-xs font-medium text-copy-primary truncate block">
                              {collab.name}
                            </span>
                            <span className="text-[10px] text-copy-muted truncate block font-mono">
                              {collab.email}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-copy-primary truncate block font-mono">
                            {collab.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className="rounded-full bg-subtle border border-surface-border px-2 py-0.5 text-[10px] font-mono text-copy-secondary">
                        Collaborator
                      </span>

                      {/* Remove button: visible only for owners */}
                      {isOwner && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          disabled={isRemoving}
                          onClick={() => handleRemove(collab.id)}
                          aria-label={`Remove collaborator ${collab.email}`}
                          className="h-6 w-6 text-copy-muted hover:text-state-destructive hover:bg-state-destructive/10 cursor-pointer rounded-lg transition-colors shrink-0"
                        >
                          {isRemoving ? (
                            <Loader2 className="h-3 w-3 animate-spin text-state-destructive" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Empty collaborators state */}
            {!isLoading && collaborators.length === 0 && (
              <div className="py-4 text-center text-copy-muted text-xs w-full">
                {isOwner
                  ? "No collaborators invited yet. Enter an email above to add teammates."
                  : "No other collaborators have been added to this workspace."}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
