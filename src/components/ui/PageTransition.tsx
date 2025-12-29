"use client";

/**
 * Page Transition Component
 *
 * Wraps page content with a fade-in animation on mount.
 * Provides smooth transition between pages.
 */

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function PageTransition({
  children,
  className = "",
  duration = 0.3,
}: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (containerRef.current && !hasAnimated.current) {
      hasAnimated.current = true;

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(containerRef.current, { opacity: 1 });
        return;
      }

      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration, ease: "power2.out" }
      );
    }
  }, [duration]);

  return (
    <div ref={containerRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
