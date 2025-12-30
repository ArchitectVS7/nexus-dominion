import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type LCARSButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";
export type LCARSButtonSize = "sm" | "md" | "lg";

interface LCARSButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LCARSButtonVariant;
  size?: LCARSButtonSize;
  children: ReactNode;
}

const variantStyles: Record<LCARSButtonVariant, string> = {
  primary:
    "bg-lcars-amber text-gray-950 hover:bg-lcars-amber/90 active:bg-lcars-amber/80",
  secondary:
    "bg-lcars-lavender text-gray-950 hover:bg-lcars-lavender/90 active:bg-lcars-lavender/80",
  danger:
    "bg-lcars-salmon text-gray-950 hover:bg-lcars-salmon/90 active:bg-lcars-salmon/80",
  success:
    "bg-lcars-mint text-gray-950 hover:bg-lcars-mint/90 active:bg-lcars-mint/80",
  ghost:
    "bg-transparent text-lcars-amber border border-lcars-amber/30 hover:bg-lcars-amber/10 active:bg-lcars-amber/20",
};

const sizeStyles: Record<LCARSButtonSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * LCARS Button Component
 *
 * A Star Trek LCARS-styled button with pill shape and color variants.
 */
export function LCARSButton({
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
  ...props
}: LCARSButtonProps) {
  return (
    <button
      className={cn(
        "font-semibold rounded-lcars-pill transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-lcars-amber/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
