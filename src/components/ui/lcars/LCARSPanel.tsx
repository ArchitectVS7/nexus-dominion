import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type LCARSVariant = "primary" | "secondary" | "danger" | "success" | "info";

interface LCARSPanelProps {
  title?: string;
  variant?: LCARSVariant;
  transparent?: boolean;
  compact?: boolean;
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<LCARSVariant, string> = {
  primary: "border-lcars-amber",
  secondary: "border-lcars-lavender",
  danger: "border-lcars-salmon",
  success: "border-lcars-mint",
  info: "border-lcars-blue",
};

const variantTitleStyles: Record<LCARSVariant, string> = {
  primary: "text-lcars-amber",
  secondary: "text-lcars-lavender",
  danger: "text-lcars-salmon",
  success: "text-lcars-mint",
  info: "text-lcars-blue",
};

/**
 * LCARS Panel Component
 *
 * A Star Trek LCARS-styled panel with semi-transparent background
 * and colored left border accent.
 */
export function LCARSPanel({
  title,
  variant = "primary",
  transparent = true,
  compact = false,
  className,
  children,
}: LCARSPanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-l-4",
        transparent ? "bg-gray-900/80 backdrop-blur-sm" : "bg-gray-900",
        variantStyles[variant],
        className
      )}
    >
      {title && (
        <div
          className={cn(
            "border-b border-gray-700/50",
            compact ? "px-3 py-1.5" : "px-4 py-2"
          )}
        >
          <h3
            className={cn(
              "font-display text-sm uppercase tracking-wider",
              variantTitleStyles[variant]
            )}
          >
            {title}
          </h3>
        </div>
      )}
      <div className={compact ? "p-3" : "p-4"}>{children}</div>
    </div>
  );
}
