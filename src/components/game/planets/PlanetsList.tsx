"use client";

/**
 * Planets List Component
 *
 * Client-side wrapper for planet cards that handles refresh on release.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Planet } from "@/lib/db/schema";
import { PlanetCard } from "./PlanetCard";

interface PlanetsListProps {
  planets: Planet[];
  planetCount: number;
}

export function PlanetsList({ planets, planetCount }: PlanetsListProps) {
  const router = useRouter();
  const [currentPlanetCount, setCurrentPlanetCount] = useState(planetCount);

  const handleRelease = useCallback(() => {
    // Decrement local count immediately for optimistic UI
    setCurrentPlanetCount((prev) => Math.max(1, prev - 1));
    // Refresh the page to get updated data
    router.refresh();
  }, [router]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {planets.map((planet) => (
        <PlanetCard
          key={planet.id}
          planet={planet}
          planetCount={currentPlanetCount}
          onRelease={handleRelease}
        />
      ))}
    </div>
  );
}
