"use client";

/**
 * Mobile Bottom Bar
 *
 * Compact bottom bar for mobile devices showing:
 * - Key status indicators
 * - END TURN button (always accessible)
 * - Button to open full action sheet
 *
 * Visible only on mobile (< lg breakpoint)
 */

import { RESOURCE_ICONS, UI_LABELS } from "@/lib/theme/names";

interface MobileBottomBarProps {
  currentTurn: number;
  turnLimit: number;
  credits: number;
  foodStatus: "surplus" | "stable" | "deficit" | "critical";
  armyStrength: "strong" | "moderate" | "weak" | "critical";
  unreadMessages?: number;
  onEndTurn: () => void;
  onOpenActions: () => void;
  isProcessing?: boolean;
}

const FOOD_COLORS = {
  surplus: "text-green-400",
  stable: "text-blue-400",
  deficit: "text-yellow-400",
  critical: "text-red-400",
};

const ARMY_COLORS = {
  strong: "text-green-400",
  moderate: "text-blue-400",
  weak: "text-yellow-400",
  critical: "text-red-400",
};

export function MobileBottomBar({
  currentTurn,
  turnLimit,
  credits,
  foodStatus,
  armyStrength,
  unreadMessages = 0,
  onEndTurn,
  onOpenActions,
  isProcessing = false,
}: MobileBottomBarProps) {
  const formatCompact = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-lcars-amber/30 z-30"
      data-testid="mobile-bottom-bar"
    >
      {/* Status row */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        {/* Turn */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">T:</span>
          <span className="text-sm font-mono text-lcars-lavender">{currentTurn}</span>
          <span className="text-xs text-gray-600">/{turnLimit}</span>
        </div>

        {/* Credits */}
        <div className="flex items-center gap-1">
          <span className="text-sm">{RESOURCE_ICONS.credits}</span>
          <span className="text-sm font-mono text-lcars-amber">{formatCompact(credits)}</span>
        </div>

        {/* Food status indicator */}
        <div className="flex items-center gap-1">
          <span className="text-sm">{RESOURCE_ICONS.food}</span>
          <span className={`text-xs ${FOOD_COLORS[foodStatus]}`}>
            {foodStatus.charAt(0).toUpperCase() + foodStatus.slice(1)}
          </span>
        </div>

        {/* Army status indicator */}
        <div className="flex items-center gap-1">
          <span className="text-sm">⚔️</span>
          <span className={`text-xs ${ARMY_COLORS[armyStrength]}`}>
            {armyStrength.charAt(0).toUpperCase() + armyStrength.slice(1)}
          </span>
        </div>

        {/* Open actions button */}
        <button
          onClick={onOpenActions}
          className="relative p-2 text-gray-400 hover:text-white"
          aria-label="Open actions"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          )}
        </button>
      </div>

      {/* End Turn button row */}
      <div className="p-2">
        <button
          onClick={onEndTurn}
          disabled={isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-display text-base transition-all ${
            isProcessing
              ? "bg-gray-700 text-gray-400 cursor-wait animate-pulse"
              : "bg-lcars-amber text-gray-900 hover:bg-lcars-amber/90 active:scale-[0.98]"
          }`}
          data-testid="mobile-end-turn"
        >
          {isProcessing ? "PROCESSING..." : UI_LABELS.endTurn.toUpperCase()}
        </button>
      </div>
    </div>
  );
}

export default MobileBottomBar;
