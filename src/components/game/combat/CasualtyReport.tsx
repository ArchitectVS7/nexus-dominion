/**
 * CasualtyReport Component
 *
 * Displays casualties from a battle, broken down by unit type.
 * Can be shown in compact or full mode.
 */

import type { Forces } from "@/lib/combat";
import { UnitIcons } from "@/lib/theme/icons";
import type { LucideIcon } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface CasualtyReportProps {
  /** Casualties by unit type */
  casualties: Partial<Forces>;
  /** Label for this casualty report (e.g., empire name) */
  label?: string;
  /** Compact mode for inline display */
  compact?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const UNIT_DISPLAY: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  soldiers: { label: "Soldiers", icon: UnitIcons.soldiers, color: "text-green-400" },
  fighters: { label: "Fighters", icon: UnitIcons.fighters, color: "text-blue-400" },
  stations: { label: "Stations", icon: UnitIcons.stations, color: "text-purple-400" },
  lightCruisers: { label: "L. Cruisers", icon: UnitIcons.lightCruisers, color: "text-cyan-400" },
  heavyCruisers: { label: "H. Cruisers", icon: UnitIcons.heavyCruisers, color: "text-orange-400" },
  carriers: { label: "Carriers", icon: UnitIcons.carriers, color: "text-red-400" },
};

type UnitKey = keyof Forces & keyof typeof UNIT_DISPLAY;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function getTotalCasualties(casualties: Partial<Forces>): number {
  let total = 0;
  for (const key of Object.keys(UNIT_DISPLAY) as UnitKey[]) {
    total += casualties[key] ?? 0;
  }
  return total;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CasualtyReport({ casualties, label, compact = false }: CasualtyReportProps) {
  const total = getTotalCasualties(casualties);
  const unitKeys = Object.keys(UNIT_DISPLAY) as UnitKey[];
  const casualtyEntries = unitKeys.filter(key => (casualties[key] ?? 0) > 0);

  if (compact) {
    // Compact mode: single line summary
    if (total === 0) {
      return (
        <div className="text-xs text-gray-500">
          {label && <span className="text-gray-400">{label}: </span>}
          No casualties
        </div>
      );
    }

    return (
      <div className="text-xs" data-testid="casualty-report-compact">
        {label && <div className="text-gray-400 mb-1">{label}</div>}
        <div className="flex flex-wrap gap-1">
          {casualtyEntries.map(key => {
            const count = casualties[key] ?? 0;
            const config = UNIT_DISPLAY[key];
            if (!config) return null;
            const IconComponent = config.icon;
            return (
              <span
                key={key}
                className={`${config.color} bg-black/30 px-1 rounded flex items-center gap-0.5`}
                title={config.label}
              >
                <IconComponent className="w-3 h-3" /> {formatNumber(count)}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // Full mode: detailed breakdown
  return (
    <div className="bg-gray-900/50 rounded-lg p-3" data-testid="casualty-report">
      {label && (
        <h4 className="text-sm font-semibold text-gray-300 mb-2">{label}</h4>
      )}

      {total === 0 ? (
        <p className="text-gray-500 text-sm">No casualties</p>
      ) : (
        <>
          <div className="space-y-1">
            {unitKeys.map(key => {
              const count = casualties[key] ?? 0;
              if (count === 0) return null;

              const config = UNIT_DISPLAY[key];
              if (!config) return null;
              const IconComponent = config.icon;
              return (
                <div
                  key={key}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="flex items-center gap-1">
                    <IconComponent className={`w-4 h-4 ${config.color}`} />
                    <span className="text-gray-400">{config.label}</span>
                  </span>
                  <span className={`font-mono ${config.color}`}>
                    -{formatNumber(count)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total Lost</span>
            <span className="font-mono text-red-400 font-semibold">
              -{formatNumber(total)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================================
// STYLED VARIANTS
// =============================================================================

/**
 * CasualtyReportInline - Ultra-compact inline display
 */
export function CasualtyReportInline({ casualties }: { casualties: Partial<Forces> }) {
  const total = getTotalCasualties(casualties);

  if (total === 0) {
    return <span className="text-gray-500">0 losses</span>;
  }

  return (
    <span className="text-red-400 font-mono">
      -{formatNumber(total)} units
    </span>
  );
}
