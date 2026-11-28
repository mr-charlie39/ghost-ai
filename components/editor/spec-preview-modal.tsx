"use client";

import * as React from "react";
import { AlertCircle, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ProjectSpecItem {
  id: string;
  filename: string;
  createdAt: string;
}

export interface SpecPreviewModalProps {
  projectId: string;
  spec: ProjectSpecItem | null;
  onClose: () => void;
  onDownload: (spec: ProjectSpecItem) => void;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={`inline-${key++}`}
          className="rounded-md bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-brand border border-surface-border"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong
          key={`inline-${key++}`}
          className="font-semibold text-copy-primary"
        >
          {renderInlineMarkdown(token.slice(2, -2))}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={`inline-${key++}`} className="italic text-copy-secondary">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      elements.push(
        <pre
          key={`code-${key++}`}
          className="my-3 overflow-x-auto rounded-xl bg-base border border-surface-border p-3 font-mono text-xs text-copy-secondary leading-relaxed"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      elements.push(
        <hr key={`hr-${key++}`} className="my-4 border-surface-border" />
      );
      i += 1;
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const headingClass =
        level === 1
          ? "text-base font-semibold text-copy-primary mt-4 mb-2 pb-1.5 border-b border-surface-border"
          : level === 2
            ? "text-sm font-semibold text-copy-primary mt-4 mb-1.5"
            : "text-xs font-semibold text-copy-primary mt-3 mb-1";

      elements.push(
        <div key={`h-${key++}`} className={headingClass}>
          {renderInlineMarkdown(text)}
        </div>
      );
      i += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`bq-${key++}`}
          className="my-2 border-l-2 border-ai/50 pl-3 text-xs italic text-copy-muted"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      i += 1;
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i += 1;
      }
      elements.push(
        <ul
          key={`ul-${key++}`}
          className="my-2 list-disc space-y-1 pl-5 text-xs text-copy-secondary leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      elements.push(
        <ol
          key={`ol-${key++}`}
          className="my-2 list-decimal space-y-1 pl-5 text-xs text-copy-secondary leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s+|```|>\s+|[-*+]\s+|\d+\.\s+|---+$|\*\*\*+$)/.test(
        lines[i].trim()
      )
    ) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }

    elements.push(
      <p
        key={`p-${key++}`}
        className="my-2 text-xs text-copy-secondary leading-relaxed"
      >
        {renderInlineMarkdown(paragraphLines.join(" "))}
      </p>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

function SpecPreviewBody({
  projectId,
  spec,
  onClose,
  onDownload,
}: {
  projectId: string;
  spec: ProjectSpecItem;
  onClose: () => void;
  onDownload: (spec: ProjectSpecItem) => void;
}) {
  const [content, setContent] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    void fetch(`/api/projects/${projectId}/specs/${spec.id}/download`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error || `Failed to load spec (${res.status})`);
        }
        return res.text();
      })
      .then((markdown) => {
        if (!controller.signal.aborted) {
          setContent(markdown);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load spec preview."
        );
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [projectId, spec.id]);

  const formattedDate = React.useMemo(() => {
    const date = new Date(spec.createdAt);
    if (Number.isNaN(date.getTime())) return spec.createdAt;
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [spec.createdAt]);

  return (
    <>
      <DialogHeader className="px-6 py-4 border-b border-surface-border shrink-0">
        <div className="flex items-center gap-2.5 pr-8">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-elevated border border-surface-border text-ai-text">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-sm font-semibold text-copy-primary font-mono truncate">
              {spec.filename}
            </DialogTitle>
            <DialogDescription className="text-xs text-copy-muted">
              Generated {formattedDate}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 min-h-0 overflow-hidden px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-copy-muted">
            <Loader2 className="h-5 w-5 animate-spin text-ai-text" />
            <span className="text-xs">Loading technical specification...</span>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl bg-state-error/10 border border-state-error/30 px-3 py-2.5 text-xs text-state-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : content ? (
          <MarkdownPreview content={content} />
        ) : (
          <p className="text-xs text-copy-muted">
            This specification is empty.
          </p>
        )}
      </ScrollArea>

      <DialogFooter className="mx-0 mb-0 px-6 py-3.5 border-t border-surface-border bg-base/40 shrink-0 sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="rounded-xl text-copy-secondary hover:text-copy-primary hover:bg-subtle cursor-pointer"
        >
          Close
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onDownload(spec)}
          className="rounded-xl bg-ai text-white hover:bg-ai/90 gap-1.5 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Download .md
        </Button>
      </DialogFooter>
    </>
  );
}

export function SpecPreviewModal({
  projectId,
  spec,
  onClose,
  onDownload,
}: SpecPreviewModalProps) {
  return (
    <Dialog
      open={Boolean(spec)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="bg-surface border-surface-border rounded-3xl sm:max-w-2xl h-[85vh] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        {spec && (
          <SpecPreviewBody
            key={spec.id}
            projectId={projectId}
            spec={spec}
            onClose={onClose}
            onDownload={onDownload}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
