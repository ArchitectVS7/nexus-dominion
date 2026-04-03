/* ── Nexus Dominion — Empire Panel ── */

import { Panel, DataReadout, Button } from "../components/lcars";
import type { GameState, Resources } from "../engine/types";
import "./EmpirePanel.css";

interface EmpirePanelProps {
  state: GameState;
  previousResources?: Resources | null;
  onClose: () => void;
  onOpenAchievements?: () => void;
}

export function EmpirePanel({ state, previousResources, onClose, onOpenAchievements }: EmpirePanelProps) {
  const empire = state.empires.get(state.playerEmpireId);
  if (!empire) return null;

  const res = empire.resources;
  const prev = previousResources;

  const delta = (key: keyof Resources): number | undefined => {
    if (!prev) return undefined;
    return res[key] - prev[key];
  };

  // Count systems by biome
  const biomeCount = new Map<string, number>();
  for (const sysId of empire.systemIds) {
    const sys = state.galaxy.systems.get(sysId);
    if (sys) {
      biomeCount.set(sys.biome, (biomeCount.get(sys.biome) ?? 0) + 1);
    }
  }

  // Total fleet units
  let totalUnits = 0;
  for (const fid of empire.fleetIds) {
    const fleet = state.fleets.get(fid as any);
    if (fleet) totalUnits += fleet.unitIds.length;
  }

  return (
    <div className="empire-panel-overlay" onClick={onClose}>
      <div className="empire-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title="Empire Status" onClose={onClose}>
          <div className="empire-panel__content">
            {/* Empire identity */}
            <div className="empire-panel__identity">
              <h3 className="empire-panel__name">{empire.name}</h3>
              <div className="empire-panel__meta">
                <span className="empire-panel__stability" data-level={empire.stabilityLevel}>
                  {empire.stabilityLevel.toUpperCase()}
                </span>
                <span className="empire-panel__pop">
                  Pop: {empire.population.toLocaleString()} / {empire.populationCapacity.toLocaleString()}
                </span>
              </div>
              {onOpenAchievements && (
                <div style={{ marginTop: "var(--space-2)" }}>
                   <Button label="VIEW ACHIEVEMENTS" variant="primary" size="sm" onClick={onOpenAchievements} />
                </div>
              )}
            </div>

            {/* Resource ledger */}
            <div className="empire-panel__section">
              <h4 className="empire-panel__section-title">Resource Ledger</h4>
              <div className="empire-panel__resources">
                <DataReadout label="Credits" value={res.credits} delta={delta("credits")} />
                <DataReadout label="Food" value={res.food} delta={delta("food")} />
                <DataReadout label="Ore" value={res.ore} delta={delta("ore")} />
                <DataReadout label="Fuel Cells" value={res.fuelCells} delta={delta("fuelCells")} />
                <DataReadout label="Research Pts" value={res.researchPoints} delta={delta("researchPoints")} />
                <DataReadout label="Intel Pts" value={res.intelligencePoints} delta={delta("intelligencePoints")} />
              </div>
            </div>

            {/* Territory */}
            <div className="empire-panel__section">
              <h4 className="empire-panel__section-title">Territory</h4>
              <div className="empire-panel__territory">
                <DataReadout label="Systems" value={empire.systemIds.length} />
                <DataReadout label="Fleets" value={empire.fleetIds.length} />
                <DataReadout label="Units" value={totalUnits} />
                <DataReadout label="Research Tier" value={empire.researchTier} maxValue={8} />
                <DataReadout label="Power Score" value={empire.powerScore} />
              </div>
            </div>

            {/* Biome breakdown */}
            {biomeCount.size > 0 && (
              <div className="empire-panel__section">
                <h4 className="empire-panel__section-title">System Types</h4>
                <div className="empire-panel__biomes">
                  {Array.from(biomeCount.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([biome, count]) => (
                      <div key={biome} className="empire-panel__biome-row">
                        <span className="empire-panel__biome-name">
                          {biome.replace(/-/g, " ")}
                        </span>
                        <span className="empire-panel__biome-count">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
