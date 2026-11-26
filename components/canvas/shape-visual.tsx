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
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none block h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <polygon
            points={points}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    case "circle": {
      const rx = w / 2;
      const ry = h / 2;
      return (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none block h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <ellipse
            cx={width / 2}
            cy={height / 2}
            rx={rx}
            ry={ry}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    }

    case "pill": {
      const rx = h / 2;
      return (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none block h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <rect
            x={pad}
            y={pad}
            width={w}
            height={h}
            rx={rx}
            ry={rx}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
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
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none block h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <path
            d={bodyPath}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <ellipse
            cx={cx}
            cy={topY}
            rx={rx}
            ry={ry}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
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
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none block h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <polygon
            points={points}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    case "rectangle":
    default: {
      return (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none block h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <rect
            x={pad}
            y={pad}
            width={w}
            height={h}
            rx={12}
            ry={12}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    }
  }
}
