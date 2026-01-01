import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  fetchDashboardDataAction,
  hasActiveGameAction,
} from "@/app/actions/game-actions";
import { PLANET_TYPE_LABELS } from "@/lib/game/constants";
import type { Planet } from "@/lib/db/schema";
import { BuyPlanetPanel } from "@/components/game/planets/BuyPlanetPanel";
import { PlanetsList } from "@/components/game/planets/PlanetsList";
import { SectorIcons } from "@/lib/theme/icons";

async function PlanetsContent() {
  const hasGame = await hasActiveGameAction();

  if (!hasGame) {
    redirect("/game");
  }

  const data = await fetchDashboardDataAction();

  if (!data) {
    redirect("/game");
  }

  // Group planets by type
  const planetsByType = data.planets.reduce<Record<string, Planet[]>>(
    (acc, planet) => {
      const existing = acc[planet.type];
      if (existing) {
        existing.push(planet);
      } else {
        acc[planet.type] = [planet];
      }
      return acc;
    },
    {}
  );

  // Sort types by count (descending)
  const sortedTypes = Object.entries(planetsByType).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <div data-testid="planets-page">
      {/* Summary Section */}
      <div className="lcars-panel mb-6">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Empire Holdings
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedTypes.map(([type, planets]) => {
            const label = PLANET_TYPE_LABELS[type as keyof typeof PLANET_TYPE_LABELS] || type;
            const IconComponent = SectorIcons[type as keyof typeof SectorIcons];
            return (
              <div
                key={type}
                className="text-center p-2 bg-gray-800/50 rounded"
                data-testid={`planet-summary-${type}`}
              >
                <div className="text-2xl mb-1 flex justify-center">
                  {IconComponent ? <IconComponent className="w-7 h-7" /> : <span>?</span>}
                </div>
                <div className="text-lcars-amber font-mono text-xl">
                  {planets.length}
                </div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buy Planet Section */}
      <div className="mb-6">
        <BuyPlanetPanel credits={data.resources.credits} />
      </div>

      {/* Detailed Planet Cards with Release Option */}
      <PlanetsList planets={data.planets} planetCount={data.stats.planetCount} />
    </div>
  );
}

function PlanetsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="lcars-panel h-32 bg-gray-800/50 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="lcars-panel h-24 bg-gray-800/50" />
        ))}
      </div>
    </div>
  );
}

export default function PlanetsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">
        Planets
      </h1>
      <Suspense fallback={<PlanetsSkeleton />}>
        <PlanetsContent />
      </Suspense>
    </div>
  );
}
