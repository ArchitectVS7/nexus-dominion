"use client";

/**
 * Panel Group Component
 *
 * Orchestrates staggered entrance animations for multiple panels.
 * Child elements with .lcars-panel class will animate in sequence.
 */

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface PanelGroupProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
}

export function PanelGroup({
  children,
  staggerDelay = 0.1,
  className = "",
  direction = "left",
}: PanelGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (containerRef.current && !hasAnimated.current) {
      hasAnimated.current = true;

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const panels = containerRef.current.querySelectorAll(".lcars-panel");

      if (prefersReducedMotion) {
        // Skip animation, just show elements
        gsap.set(panels, { opacity: 1 });
        return;
      }

      const directions = {
        left: { x: -20, y: 0 },
        right: { x: 20, y: 0 },
        up: { x: 0, y: -20 },
        down: { x: 0, y: 20 },
      };

      gsap.fromTo(
        panels,
        { opacity: 0, ...directions[direction] },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.4,
          stagger: staggerDelay,
          ease: "power2.out",
        }
      );
    }
  }, [staggerDelay, direction]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
