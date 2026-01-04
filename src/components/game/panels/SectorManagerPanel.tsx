"use client";

/**
 * Sector Manager Panel (Phase 3.3)
 *
 * A collapsible, grouped sector list for the slide-out panel.
 * Solves the 50+ sectors management problem by:
 * - Grouping sectors by type with collapsible headers
 * - Showing summary stats per type
 * - Scrollable groups with max height
 *
 * Based on: docs/redesign-01-02-2026 Phase 3 spec
 */

import { useState, useMemo } from "react";
import type { Planet } from "@/lib/db/schema";
import { PLANET_TYPE_LABELS } from "@/lib/game/constants";
import { SectorIcons } from "@/lib/theme/icons";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";

interface SectorManagerPanelProps {
  sectors: Planet[];
  totalIncome?: number;
  onSectorSelect?: (sector: Planet) => void;
}

interface SectorGroup {
  type: string;
  label: string;
  sectors: Planet[];
  count: number;
}

// Max visible rows before scrolling
const MAX_VISIBLE_ROWS = 6;
const ROW_HEIGHT = 40; // px

export function SectorManagerPanel({
  sectors,
  totalIncome = 0,
  onSectorSelect,
}: SectorManagerPanelProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  // Group sectors by type
  const sectorGroups = useMemo<SectorGroup[]>(() => {
    const groups: Record<string, Planet[]> = {};

    for (const sector of sectors) {
      const existing = groups[sector.type];
      if (existing) {
        existing.push(sector);
      } else {
        groups[sector.type] = [sector];
      }
    }

    return Object.entries(groups)
      .map(([type, typeSectors]) => ({
        type,
        label: PLANET_TYPE_LABELS[type as keyof typeof PLANET_TYPE_LABELS] || type,
        sectors: typeSectors,
        count: typeSectors.length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [sectors]);

  const toggleExpand = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4" data-testid="sector-manager-panel">
      {/* Summary Header */}
      <div className="pb-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Total Sectors</span>
          <span className="text-lcars-amber font-mono text-xl">
            {sectors.length}
          </span>
        </div>
        {totalIncome > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Income/Cycle</span>
            <span className="text-green-400 font-mono">
              +{totalIncome.toLocaleString()} MC
            </span>
          </div>
        )}
      </div>

      {/* Collapsible Groups */}
      <div className="space-y-2">
        {sectorGroups.map((group) => {
          const isExpanded = expandedTypes.has(group.type);
          const IconComponent = SectorIcons[group.type as keyof typeof SectorIcons];

          return (
            <div
              key={group.type}
              className="bg-gray-800/30 rounded overflow-hidden"
            >
              {/* Group Header */}
              <button
                onClick={() => toggleExpand(group.type)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-lcars-lavender">
                  {IconComponent ? (
                    <IconComponent className="w-5 h-5" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </span>
                <span className="flex-1 text-left text-gray-200">
                  {group.label}
                </span>
                <span className="text-lcars-amber font-mono">
                  {group.count}
                </span>
              </button>

              {/* Expanded Content - Virtualized List */}
              {isExpanded && (
                <div className="border-t border-gray-700">
                  {group.count <= MAX_VISIBLE_ROWS ? (
                    // Simple render for small lists
                    <div>
                      {group.sectors.map((sector) => (
                        <div
                          key={sector.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800/50 cursor-pointer transition-colors border-b border-gray-800/50 last:border-b-0"
                          onClick={() => onSectorSelect?.(sector)}
                        >
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="flex-1 text-sm text-gray-300 truncate">
                            {sector.name || `Sector ${sector.id.slice(0, 8)}`}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            +{parseFloat(sector.productionRate).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Scrollable list for large groups
                    <div
                      className="overflow-y-auto"
                      style={{ maxHeight: MAX_VISIBLE_ROWS * ROW_HEIGHT }}
                    >
                      {group.sectors.map((sector) => (
                        <div
                          key={sector.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800/50 cursor-pointer transition-colors border-b border-gray-800/50 last:border-b-0"
                          style={{ height: ROW_HEIGHT }}
                          onClick={() => onSectorSelect?.(sector)}
                        >
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="flex-1 text-sm text-gray-300 truncate">
                            {sector.name || `Sector ${sector.id.slice(0, 8)}`}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            +{parseFloat(sector.productionRate).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sectors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No sectors controlled</p>
          <p className="text-sm mt-1">Colonize sectors to expand your empire</p>
        </div>
      )}
    </div>
  );
}

export default SectorManagerPanel;
