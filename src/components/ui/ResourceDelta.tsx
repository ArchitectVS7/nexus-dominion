"use client";

/**
 * Resource Delta Component
 *
 * Shows a temporary indicator for resource changes.
 * Positive deltas appear green with +, negative appear red.
 * Auto-hides after 2 seconds with fade animation.
 */

import { useEffect, useState } from "react";

interface ResourceDeltaProps {
  delta: number;
  show: boolean;
  className?: string;
}

export function ResourceDelta({ delta, show, className = "" }: ResourceDeltaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show && delta !== 0) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [show, delta]);

  if (!visible || delta === 0) return null;

  const isPositive = delta > 0;
  const colorClass = isPositive ? "text-green-400" : "text-red-400";
  const prefix = isPositive ? "+" : "";

  return (
    <span className={`ml-2 text-sm ${colorClass} animate-fade-out ${className}`}>
      {prefix}{delta.toLocaleString()}
    </span>
  );
}
