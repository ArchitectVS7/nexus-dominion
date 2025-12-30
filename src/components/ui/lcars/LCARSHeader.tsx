import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface LCARSHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * LCARS Header Component
 *
 * A Star Trek LCARS-styled header with curved corner accent
 * and optional action buttons.
 */
export function LCARSHeader({
  title,
  subtitle,
  actions,
  className,
}: LCARSHeaderProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-between",
        "bg-gray-900/80 backdrop-blur-sm",
        "border-b-4 border-lcars-amber",
        "px-6 py-4",
        className
      )}
    >
      {/* Left curved accent */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-lcars-amber rounded-br-[24px]" />

      <div className="ml-6">
        <h1 className="font-display text-2xl text-lcars-amber tracking-wider">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
