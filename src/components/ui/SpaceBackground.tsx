"use client";

/**
 * Space Background Component
 *
 * Renders NASA imagery as atmospheric backgrounds.
 * Supports multiple variants with configurable opacity.
 * Falls back gracefully if images are unavailable.
 */

interface SpaceBackgroundProps {
  variant?: "nebula" | "stars" | "deep-field";
  opacity?: number;
  className?: string;
}

const BACKGROUNDS = {
  nebula: "/images/backgrounds/nebula.jpg",
  stars: "/images/backgrounds/starfield.jpg",
  "deep-field": "/images/backgrounds/deep-field.jpg",
} as const;

export function SpaceBackground({
  variant = "stars",
  opacity = 0.3,
  className = "",
}: SpaceBackgroundProps) {
  return (
    <div
      className={`fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${BACKGROUNDS[variant]})`,
        opacity,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Procedural Star Background Component
 *
 * A CSS-only alternative that doesn't require image assets.
 * Generates a starfield effect using CSS gradients.
 */
interface ProceduralStarsProps {
  density?: "sparse" | "normal" | "dense";
  opacity?: number;
  className?: string;
}

export function ProceduralStars({
  density = "normal",
  opacity = 0.6,
  className = "",
}: ProceduralStarsProps) {
  const densityValues = {
    sparse: { count: 50, size: "1px" },
    normal: { count: 100, size: "1px" },
    dense: { count: 200, size: "2px" },
  };

  const { size } = densityValues[density];

  return (
    <div
      className={`fixed inset-0 -z-10 ${className}`}
      style={{
        opacity,
        background: `
          radial-gradient(${size} ${size} at 20% 30%, white, transparent),
          radial-gradient(${size} ${size} at 40% 70%, white, transparent),
          radial-gradient(${size} ${size} at 50% 20%, white, transparent),
          radial-gradient(${size} ${size} at 60% 80%, white, transparent),
          radial-gradient(${size} ${size} at 80% 40%, white, transparent),
          radial-gradient(${size} ${size} at 90% 60%, white, transparent),
          radial-gradient(${size} ${size} at 10% 90%, white, transparent),
          radial-gradient(${size} ${size} at 30% 50%, white, transparent),
          radial-gradient(${size} ${size} at 70% 10%, white, transparent),
          radial-gradient(2px 2px at 15% 85%, rgba(255,255,255,0.8), transparent),
          radial-gradient(2px 2px at 85% 15%, rgba(255,255,255,0.8), transparent),
          radial-gradient(2px 2px at 45% 55%, rgba(255,255,255,0.6), transparent),
          linear-gradient(to bottom, #0a0a1a, #050510)
        `,
      }}
      aria-hidden="true"
    />
  );
}
