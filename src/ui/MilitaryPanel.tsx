/* ── Nexus Dominion — Military Panel ── */

import { Panel, Button, DataReadout } from "../components/lcars";
import type { GameState } from "../engine/types";
import { UNIT_TYPES } from "../engine/military/unit-registry";
import "./MilitaryPanel.css";

interface MilitaryPanelProps {
  state: GameState;
  onClose: () => void;
  onBuildUnit: (unitTypeId: string) => void;
}

export function MilitaryPanel({ state, onClose, onBuildUnit }: MilitaryPanelProps) {
  const empireId = state.playerEmpireId;
  const empire = state.empires.get(empireId);
  const homeSystem = empire?.homeSystemId ? state.galaxy.systems.get(empire?.homeSystemId) : null;

  if (!empire) return null;

  const currentGen = empire.resources;
  const buildQueue = empire.buildQueue || [];

  // Categorise owned units
  let totalUnits = 0;
  let activeUnits = 0;
  let fleetUnits = 0;
  let groundUnits = 0;
  
  for (const fleetId of empire.fleetIds) {
    const fleet = state.fleets.get(fleetId);
    if (!fleet) continue;
    for (const uid of fleet.unitIds) {
      const unit = state.units.get(uid);
      if (!unit) continue;
      totalUnits++;
      if (unit.completionCycle === null) {
        activeUnits++;
        const typeInfo = state.unitTypes.get(unit.typeId);
        if (typeInfo?.category === "fleet") fleetUnits++;
        if (typeInfo?.category === "ground") groundUnits++;
      }
    }
  }

  // Calculate unlock conditions
  const researchTier = empire.researchTier;
  const requiredDreadnoughtTier = 8; // Max tier requires Total Mobilisation capstone under War Machine

  const isWarMachine = empire.researchPath === "war-machine";
  const canBuildDreadnought = isWarMachine && researchTier >= requiredDreadnoughtTier;

  return (
    <div className="military-panel-overlay" onClick={onClose}>
      <div className="military-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title="Military Command" onClose={onClose} variant="alert">
          <div className="military-panel__content">

            {/* Fleet Overview */}
            <div className="military-panel__section">
              <h4 className="military-panel__section-title">Armed Forces Overview</h4>
              <div className="military-panel__stats">
                <DataReadout label="Total Power" value={Math.round(empire.powerScore)} />
                <DataReadout label="Active Units" value={activeUnits} />
                <DataReadout label="Fleet Divs" value={fleetUnits} />
                <DataReadout label="Ground Divs" value={groundUnits} />
              </div>
            </div>

            {/* Build Queue */}
            <div className="military-panel__section">
              <h4 className="military-panel__section-title">Production Queue ({buildQueue.length})</h4>
              <div className="military-panel__queue">
                {buildQueue.length > 0 ? (
                  buildQueue.map((entry, idx) => {
                    const typeInfo = state.unitTypes.get(entry.unitTypeId);
                    const cyclesLeft = entry.completionCycle - state.time.currentCycle;
                    return (
                      <div key={idx} className="military-panel__queue-item">
                        <span className="military-panel__queue-name">{typeInfo?.name ?? entry.unitTypeId}</span>
                        <span className="military-panel__queue-time">{cyclesLeft} Cyc</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="military-panel__empty">Yards and Barracks are idle.</div>
                )}
              </div>
              <div className="military-panel__production-note">
                Producing at: {homeSystem?.name ?? "Home World"}
              </div>
            </div>

            {/* Production Options */}
            <div className="military-panel__section">
              <h4 className="military-panel__section-title">Shipyards & Barracks</h4>
              <div className="military-panel__build-list">
                {UNIT_TYPES.map((unitType) => {
                  // Only show dreadnought if condition met (or tease if they are War Machine path)
                  if (unitType.id === "dreadnought" && (!isWarMachine || (!canBuildDreadnought && researchTier < 6))) return null;

                  const canAfford = currentGen.credits >= unitType.buildCost;
                  const isLocked = unitType.id === "dreadnought" && !canBuildDreadnought;

                  return (
                    <div key={unitType.id} className={`military-panel__build-item ${isLocked ? "locked" : ""}`}>
                      <div className="military-panel__build-info">
                        <span className="military-panel__build-name">
                          {unitType.name}
                          {isLocked && " [LOCKED]"}
                        </span>
                        <div className="military-panel__build-stats">
                          <span>{unitType.buildCost} CT</span>
                          <span>ATK: {unitType.attack}</span>
                          <span>DEF: {unitType.defence}</span>
                          <span>HP: {unitType.hp}</span>
                        </div>
                      </div>
                      <Button
                        label={isLocked ? "REQ. TIER 8" : "BUILD"}
                        variant={"secondary"}
                        size="sm"
                        disabled={!canAfford || isLocked}
                        onClick={() => onBuildUnit(unitType.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </Panel>
      </div>
    </div>
  );
}
