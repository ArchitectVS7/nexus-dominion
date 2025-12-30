import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface LCARSSidebarProps {
  position?: "left" | "right";
  width?: "narrow" | "normal" | "wide";
  className?: string;
  children: ReactNode;
}

const widthStyles = {
  narrow: "w-64",
  normal: "w-80",
  wide: "w-96",
};

/**
 * LCARS Sidebar Component
 *
 * A Star Trek LCARS-styled sidebar with semi-transparent background
 * and accent bar on the edge.
 */
export function LCARSSidebar({
  position = "right",
  width = "normal",
  className,
  children,
}: LCARSSidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full",
        "bg-gray-900/90 backdrop-blur-sm",
        position === "left" ? "border-r-4" : "border-l-4",
        "border-lcars-lavender",
        widthStyles[width],
        className
      )}
    >
      {/* Top accent bar */}
      <div
        className={cn(
          "h-8 bg-lcars-lavender/80",
          position === "left" ? "rounded-br-[16px]" : "rounded-bl-[16px]"
        )}
      />

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">{children}</div>

      {/* Bottom accent bar */}
      <div
        className={cn(
          "h-4 bg-lcars-lavender/60",
          position === "left" ? "rounded-tr-[8px]" : "rounded-tl-[8px]"
        )}
      />
    </div>
  );
}
