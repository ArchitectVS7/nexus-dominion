"use client";

/**
 * Planet Card Component
 *
 * Displays a single planet with its production info and release option.
 */

import { PLANET_TYPE_LABELS, PLANET_PRODUCTION } from "@/lib/game/constants";
import type { Planet } from "@/lib/db/schema";
import { ReleasePlanetButton } from "./ReleasePlanetButton";
import { SectorIcons } from "@/lib/theme/icons";
import { Globe } from "lucide-react";

const PLANET_TYPE_COLORS: Record<string, string> = {
  food: "border-green-500",
  ore: "border-gray-500",
  petroleum: "border-yellow-500",
  tourism: "border-amber-500",
  urban: "border-blue-500",
  education: "border-purple-500",
  government: "border-red-500",
  research: "border-cyan-500",
  supply: "border-orange-500",
  anti_pollution: "border-green-300",
};

interface PlanetCardProps {
  planet: Planet;
  planetCount: number;
  onRelease?: () => void;
}

export function PlanetCard({ planet, planetCount, onRelease }: PlanetCardProps) {
  const borderColor = PLANET_TYPE_COLORS[planet.type] || "border-gray-600";
  const IconComponent = SectorIcons[planet.type as keyof typeof SectorIcons] || Globe;
  const label = PLANET_TYPE_LABELS[planet.type as keyof typeof PLANET_TYPE_LABELS] || planet.type;
  const production = PLANET_PRODUCTION[planet.type as keyof typeof PLANET_PRODUCTION] || 0;

  const productionUnit = (() => {
    switch (planet.type) {
      case "tourism":
      case "urban":
        return "credits/turn";
      case "government":
        return "agent capacity";
      case "research":
        return "RP/turn";
      case "food":
        return "food/turn";
      case "ore":
        return "ore/turn";
      case "petroleum":
        return "petro/turn";
      default:
        return "/turn";
    }
  })();

  return (
    <div
      className={`lcars-panel border-l-4 ${borderColor}`}
      data-testid={`planet-card-${planet.id}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconComponent className="w-6 h-6" />
          <h3 className="text-lg font-semibold text-lcars-lavender">{label}</h3>
        </div>
        <span className="text-sm text-gray-500">#{planet.id.slice(-6)}</span>
      </div>
      <div className="text-gray-300 space-y-1">
        <div className="flex justify-between">
          <span>Production:</span>
          <span className="font-mono text-lcars-amber">
            {production.toLocaleString()} {productionUnit}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Base Value:</span>
          <span className="font-mono text-gray-400">
            {planet.purchasePrice.toLocaleString()} credits
          </span>
        </div>
      </div>
      {/* Release Button */}
      <div className="mt-3 pt-2 border-t border-gray-700/50 flex justify-end">
        <ReleasePlanetButton
          planetId={planet.id}
          planetType={label}
          purchasePrice={planet.purchasePrice}
          planetCount={planetCount}
          onRelease={onRelease}
        />
      </div>
    </div>
  );
}
