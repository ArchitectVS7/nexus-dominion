"use client";

/**
 * Game Header Component
 *
 * Top header bar displaying key status indicators and navigation.
 * Uses React Query for real-time data updates.
 */

import Link from "next/link";
import { useGameLayout } from "@/lib/api";
import { useGameStore } from "@/stores";

interface GameHeaderProps {
  /** Initial credits (server-rendered) */
  credits?: number;
  /** Initial food status (server-rendered) */
  foodStatus?: string;
  /** Initial population (server-rendered) */
  population?: number;
  /** Current turn number (server-rendered) */
  currentTurn?: number;
  /** Maximum turns (server-rendered) */
  turnLimit?: number;
}

/**
 * Format large numbers with K/M suffixes
 */
function formatNumber(value: number | undefined): string {
  if (value === undefined) return "---";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

/**
 * Get food status color
 */
function getFoodStatusColor(status?: string): string {
  switch (status) {
    case "surplus":
      return "text-green-400";
    case "stable":
      return "text-yellow-400";
    case "shortage":
      return "text-orange-400";
    case "famine":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

export function GameHeader({
  credits: initialCredits,
  foodStatus: initialFoodStatus,
  population: initialPopulation,
  currentTurn: initialTurn,
  turnLimit: initialTurnLimit,
}: GameHeaderProps) {
  // Use React Query for live data, falling back to server-rendered values
  const { data: layout } = useGameLayout();
  const { isProcessingTurn } = useGameStore();

  // Use live data if available, otherwise use initial props
  const credits = layout?.credits ?? initialCredits;
  const foodStatus = layout?.foodStatus ?? initialFoodStatus;
  const population = layout?.population ?? initialPopulation;
  const currentTurn = layout?.currentTurn ?? initialTurn;
  const turnLimit = layout?.turnLimit ?? initialTurnLimit;

  return (
    <header className="bg-gray-900 border-b border-lcars-amber/30 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo / Title */}
        <Link
          href="/game/starmap"
          className="text-lcars-amber font-display text-lg hover:text-lcars-gold transition-colors"
        >
          Nexus Dominion
        </Link>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Turn Counter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm hidden md:inline">Turn</span>
            <span
              className={`font-mono text-lg ${isProcessingTurn ? "text-lcars-gold animate-pulse" : "text-lcars-amber"}`}
              data-testid="turn-counter"
            >
              {currentTurn ?? "-"}/{turnLimit ?? "-"}
            </span>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">$</span>
            <span
              className="font-mono text-yellow-400"
              data-testid="header-credits"
            >
              {formatNumber(credits)}
            </span>
          </div>

          {/* Food Status */}
          <div className="hidden md:flex items-center gap-1">
            <span className="text-gray-500 text-sm">Food</span>
            <span
              className={`font-mono ${getFoodStatusColor(foodStatus)}`}
              data-testid="header-food"
            >
              {foodStatus ?? "---"}
            </span>
          </div>

          {/* Population */}
          <div className="hidden lg:flex items-center gap-1">
            <span className="text-gray-500 text-sm">Pop</span>
            <span
              className="font-mono text-blue-400"
              data-testid="header-population"
            >
              {formatNumber(population)}
            </span>
          </div>

          {/* Menu Button */}
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            aria-label="Menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default GameHeader;
