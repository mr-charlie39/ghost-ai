"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { useOthers } from "@liveblocks/react/suspense";
import { useViewport } from "@xyflow/react";

export function LiveCursors() {
  const { userId } = useAuth();
  const others = useOthers();
  const { x: viewportX, y: viewportY, zoom } = useViewport();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden select-none"
    >
      {others.map((other) => {
        if (userId && other.id === userId) return null;
        const cursor = other.presence?.cursor;
        if (!cursor) return null;

        const color = other.info?.color || "var(--accent-primary)";
        const name = other.info?.name || "Collaborator";
        const screenX = cursor.x * zoom + viewportX;
        const screenY = cursor.y * zoom + viewportY;

        return (
          <div
            key={other.connectionId}
            className="absolute top-0 left-0 will-change-transform"
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              <path
                d="M2.5 2L7.2 15.5L9.4 9.8L15.2 7.6L2.5 2Z"
                fill={color}
                stroke="var(--bg-base)"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="ml-3.5 -mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium leading-tight text-white shadow-md whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
