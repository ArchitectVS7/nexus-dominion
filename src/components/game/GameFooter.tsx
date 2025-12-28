"use client";

/**
 * GameFooter Component
 *
 * Displays real-time game status in the footer:
 * - Current turn / Turn limit
 * - Credits
 * - Networth
 *
 * Polls dashboard data to stay updated.
 */

import { useState, useEffect } from "react";
import { fetchDashboardDataAction } from "@/app/actions/game-actions";

interface FooterData {
  currentTurn: number;
  turnLimit: number;
  credits: number;
  networth: number;
}

export function GameFooter() {
  const [data, setData] = useState<FooterData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const dashboardData = await fetchDashboardDataAction();
        if (dashboardData) {
          setData({
            currentTurn: dashboardData.turn.currentTurn,
            turnLimit: dashboardData.turn.turnLimit,
            credits: dashboardData.resources.credits,
            networth: dashboardData.stats.networth,
          });
        }
      } catch {
        // Silent fail - footer will show placeholder
      }
    }

    loadData();

    // Refresh every 5 seconds to catch updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <footer className="bg-gray-900 border-t border-lcars-amber/30 px-4 py-2 text-center text-sm text-gray-500">
        Loading game status...
      </footer>
    );
  }

  return (
    <footer
      className="bg-gray-900 border-t border-lcars-amber/30 px-4 py-2 text-center text-sm text-gray-400"
      data-testid="game-footer"
    >
      <span className="text-lcars-lavender">Turn {data.currentTurn}</span>
      <span className="text-gray-600"> / </span>
      <span className="text-gray-500">{data.turnLimit}</span>
      <span className="text-gray-700 mx-3">|</span>
      <span className="text-gray-500">Credits: </span>
      <span className="text-lcars-amber font-mono">
        {data.credits.toLocaleString()}
      </span>
      <span className="text-gray-700 mx-3">|</span>
      <span className="text-gray-500">Networth: </span>
      <span className="text-lcars-blue font-mono">
        {data.networth.toLocaleString()}
      </span>
    </footer>
  );
}
