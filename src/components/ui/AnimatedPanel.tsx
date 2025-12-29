"use client";

/**
 * Animated Panel Component
 *
 * A wrapper that adds smooth entrance animations to panels.
 * Uses GSAP for performant slide-in transitions.
 */

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface AnimatedPanelProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
}

export function AnimatedPanel({
  children,
  className = "",
  delay = 0,
  direction = "left",
  duration = 0.5,
}: AnimatedPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate once on mount
    if (panelRef.current && !hasAnimated.current) {
      hasAnimated.current = true;

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        // Skip animation, just show element
        gsap.set(panelRef.current, { opacity: 1 });
        return;
      }

      const directions = {
        left: { x: -30, y: 0 },
        right: { x: 30, y: 0 },
        up: { x: 0, y: -30 },
        down: { x: 0, y: 30 },
      };

      gsap.fromTo(
        panelRef.current,
        {
          opacity: 0,
          ...directions[direction],
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
        }
      );
    }
  }, [delay, direction, duration]);

  return (
    <div ref={panelRef} className={`lcars-panel ${className}`} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
