"use client";

import * as React from "react";
import type { NodeShape } from "@/types/canvas";

export interface ShapeVisualProps {
  shape: NodeShape;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth?: number;
}

export function ShapeVisual({
  shape,
  width,
  height,
  fillColor,
  strokeColor,
  strokeWidth = 1.5,
}: ShapeVisualProps) {
  const pad = strokeWidth;
  const w = Math.max(width - pad * 2, 4);
  const h = Math.max(height - pad * 2, 4);

  switch (shape) {
    case "diamond": {
      const cx = width / 2;
      const cy = height / 2;
      const points = `${cx},${pad} ${width - pad},${cy} ${cx},${height - pad} ${pad},${cy}`;
      return (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="pointer-events-none block h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <polygon
            points={points}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    }

    case "circle": {
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none h-full w-full rounded-full border transition-colors"
          style={{
            backgroundColor: fillColor,
            borderColor: strokeColor,
            borderWidth: strokeWidth,
          }}
        />
      );
    }

    case "pill": {
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none h-full w-full rounded-full border transition-colors"
          style={{
            backgroundColor: fillColor,
            borderColor: strokeColor,
            borderWidth: strokeWidth,
          }}
        />
      );
    }

    case "cylinder": {
      const ry = Math.min(14, h * 0.16);
      const rx = w / 2;
      const cx = width / 2;
      const topY = pad + ry;
      const bottomY = height - pad - ry;
      const bodyPath = [
        `M ${pad} ${topY}`,
        `L ${pad} ${bottomY}`,
        `A ${rx} ${ry} 0 0 0 ${width - pad} ${bottomY}`,
        `L ${width - pad} ${topY}`,
        `Z`,
      ].join(" ");
      return (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="pointer-events-none block h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <path
            d={bodyPath}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx={cx}
            cy={topY}
            rx={rx}
            ry={ry}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    }

    case "hexagon": {
      const inset = Math.min(width * 0.22, 28);
      const cy = height / 2;
      const points = [
        `${pad + inset},${pad}`,
        `${width - pad - inset},${pad}`,
        `${width - pad},${cy}`,
        `${width - pad - inset},${height - pad}`,
        `${pad + inset},${height - pad}`,
        `${pad},${cy}`,
      ].join(" ");
      return (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="pointer-events-none block h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <polygon
            points={points}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    }

    case "rectangle":
    default: {
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none h-full w-full rounded-xl border transition-colors"
          style={{
            backgroundColor: fillColor,
            borderColor: strokeColor,
            borderWidth: strokeWidth,
          }}
        />
      );
    }
  }
}
