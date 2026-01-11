"use client";

/**
 * Crafting Page
 *
 * Manufacturing interface for crafting special items and upgrades.
 * Uses React Query for data fetching.
 *
 * @spec SPEC-CRAFTING
 * @see docs/expansion/CRAFTING.md
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHasActiveGame, useDashboard } from "@/lib/api";
import { CraftingPanel } from "@/components/game/crafting/CraftingPanel";

export default function CraftingPage() {
  const router = useRouter();
  const { data: hasGame, isLoading: checkingGame } = useHasActiveGame();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();

  // Redirect if no active game
  useEffect(() => {
    if (!checkingGame && !hasGame) {
      router.push("/game");
    }
  }, [checkingGame, hasGame, router]);

  const isLoading = checkingGame || dashboardLoading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="crafting-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">
          Manufacturing
        </h1>
        <div className="lcars-panel animate-pulse" data-testid="crafting-loading">
          <div className="h-64 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!hasGame || !dashboard) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto" data-testid="crafting-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">
        Manufacturing
      </h1>
      <CraftingPanel />
    </div>
  );
}
