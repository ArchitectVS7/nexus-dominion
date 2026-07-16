/* ── Nexus Dominion — System Panel ── */

import { useState } from "react";
import { Panel, Button, DataReadout } from "../components/lcars";
import type { GameState, SystemId, UnitId, InstallationType } from "../engine/types";
import { BIOME_ALLOWED_INSTALLATIONS, INSTALLATION_COSTS, canBuildInstallation } from "../engine/installation/installation-registry";
import type { OrdersSummary } from "./orders";
import "./SystemPanel.css";

interface SystemPanelProps {
  systemId: SystemId;
  state: GameState;
  summary: OrdersSummary;
  onClose: () => void;
  onColonise?: (systemId: SystemId) => void;
  onBuild?: (systemId: SystemId, type: InstallationType) => void;
  onBuildWormhole?: (targetSystemId: SystemId) => void;
  onAttack?: (systemId: SystemId, unitIds: UnitId[]) => void;
}

export function SystemPanel({ systemId, state, summary, onClose, onColonise, onBuild, onBuildWormhole, onAttack }: SystemPanelProps) {
  const [selectedUnitIds, setSelectedUnitIds] = useState<UnitId[]>([]);

  const system = state.galaxy.systems.get(systemId);
  if (!system) return null;

  const playerEmpireId = state.playerEmpireId;
  const isOwned = system.owner === playerEmpireId;
  const isUnclaimed = !system.owner;
  const isEnemy = !!system.owner && system.owner !== playerEmpireId;

  // Queued intent against THIS system (colonise/attack/wormhole), if any.
  // Used to show a banner and disable the matching action button so the
  // player cannot re-queue an intent that is already pending this cycle.
  const intent = summary.systemIntents.get(systemId);

  // Player's built (active) military units, gathered across their fleets.
  const availableUnits: { id: UnitId; name: string; category: string }[] = [];
  if (isEnemy && onAttack) {
    const playerEmpire = state.empires.get(playerEmpireId);
    for (const fleetId of playerEmpire?.fleetIds ?? []) {
      const fleet = state.fleets.get(fleetId);
      if (!fleet) continue;
      for (const uid of fleet.unitIds) {
        const unit = state.units.get(uid);
        if (!unit || unit.completionCycle !== null) continue;
        const typeInfo = state.unitTypes.get(unit.typeId);
        availableUnits.push({
          id: unit.id,
          name: typeInfo?.name ?? unit.typeId,
          category: typeInfo?.category ?? "unit",
        });
      }
    }
  }

  const toggleUnit = (id: UnitId) => {
    setSelectedUnitIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );
  };

  const allSelected =
    availableUnits.length > 0 && selectedUnitIds.length === availableUnits.length;
  const toggleSelectAll = () => {
    setSelectedUnitIds(allSelected ? [] : availableUnits.map((u) => u.id));
  };

  // Check if player can colonise (adjacent to a system they own)
  const canColonise = isUnclaimed && system.adjacentSystemIds.some((adjId) => {
    const adj = state.galaxy.systems.get(adjId);
    return adj?.owner === playerEmpireId;
  });

  // Count installations
  const installations = system.slots.filter((s) => !s.locked && s.installation).length;
  const openSlots = system.slots.filter((s) => !s.locked && !s.installation).length;
  const lockedSlots = system.slots.filter((s) => s.locked).length;

  // Sector name
  const sector = state.galaxy.sectors.get(system.sectorId);

  return (
    <div className="system-panel-overlay" onClick={onClose}>
      <div className="system-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title={system.name} onClose={onClose} variant={isOwned ? "info" : "default"}>
          <div className="system-panel__content">
            {/* Header info */}
            <div className="system-panel__header-info">
              <div className="system-panel__biome-badge">
                {system.biome.replace(/-/g, " ")}
              </div>
              <span className="system-panel__sector">
                {sector?.name ?? system.sectorId}
              </span>
            </div>

            {/* Owner */}
            <div className="system-panel__owner">
              {isOwned ? (
                <span className="system-panel__owner-you">Your Territory</span>
              ) : system.owner ? (
                <span className="system-panel__owner-other">
                  Controlled by: {state.empires.get(system.owner)?.name ?? system.owner}
                </span>
              ) : (
                <span className="system-panel__owner-unclaimed">Unclaimed</span>
              )}
            </div>

            {/* Queued-intent banner — an order against this system is pending
                this cycle. The matching action button below is disabled to
                prevent re-queuing. */}
            {intent && (
              <div className={`system-panel__queued-banner system-panel__queued-banner--${intent}`}>
                {intent === "colonise"
                  ? "COLONISATION QUEUED"
                  : intent === "attack"
                  ? "ATTACK QUEUED"
                  : "WORMHOLE QUEUED"}
              </div>
            )}

            {/* Development slots */}
            <div className="system-panel__section">
              <h4 className="system-panel__section-title">Development</h4>
              <div className="system-panel__slots">
                {system.slots.map((slot, i) => (
                  <div
                    key={i}
                    className={`system-panel__slot ${
                      slot.locked ? "locked" : slot.installation ? "filled" : "empty"
                    }`}
                  >
                    {slot.locked ? (
                      <span className="system-panel__slot-icon">🔒</span>
                    ) : slot.installation ? (
                      <>
                        <span className="system-panel__slot-type">
                          {slot.installation.type.replace(/-/g, " ")}
                        </span>
                        <span className="system-panel__slot-condition">
                          {Math.round(slot.installation.condition * 100)}%
                        </span>
                      </>
                    ) : (
                      <span className="system-panel__slot-empty">Empty Slot</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="system-panel__slot-summary">
                <DataReadout label="Installations" value={installations} />
                <DataReadout label="Open Slots" value={openSlots} />
                {lockedSlots > 0 && <DataReadout label="Locked" value={lockedSlots} />}
              </div>
            </div>

            {/* Adjacency */}
            <div className="system-panel__section">
              <h4 className="system-panel__section-title">
                Adjacent Systems ({system.adjacentSystemIds.length})
              </h4>
              <div className="system-panel__adjacent-list">
                {system.adjacentSystemIds.slice(0, 6).map((adjId) => {
                  const adj = state.galaxy.systems.get(adjId);
                  if (!adj) return null;
                  return (
                    <div key={adjId} className="system-panel__adjacent-item">
                      <span className="system-panel__adj-name">{adj.name}</span>
                      <span className={`system-panel__adj-owner ${
                        adj.owner === playerEmpireId ? "you" : adj.owner ? "other" : "unclaimed"
                      }`}>
                        {adj.owner === playerEmpireId
                          ? "Yours"
                          : adj.owner
                          ? "Hostile"
                          : "Unclaimed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Build Menu */}
            {isOwned && openSlots > 0 && (
              <div className="system-panel__section">
                <h4 className="system-panel__section-title">Available Installations</h4>
                <div className="system-panel__build-list">
                  {(BIOME_ALLOWED_INSTALLATIONS[system.biome] || []).map((type) => {
                    const cost = INSTALLATION_COSTS[type];
                    const canAfford = (state.empires.get(playerEmpireId)?.resources.credits ?? 0) >= cost.credits;
                    const canBuild = canBuildInstallation(system, type);
                    
                    // Don't show options we already built
                    if (!canBuild && system.slots.some(s => s.installation?.type === type)) {
                        return null;
                    }
                    
                    return (
                      <div key={type} className="system-panel__build-item">
                        <div className="system-panel__build-info">
                          <span className="system-panel__build-type">{type.replace(/-/g, " ")}</span>
                          <span className="system-panel__build-cost">{cost.credits} CR • {cost.buildTime} Cyc</span>
                        </div>
                        <Button 
                          label="BUILD" 
                          variant="secondary" 
                          size="sm"
                          disabled={!canAfford || !canBuild}
                          onClick={() => onBuild?.(systemId, type)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Military Assault (enemy-owned systems only) */}
            {isEnemy && onAttack && (
              <div className="system-panel__section">
                <h4 className="system-panel__section-title">Military Assault</h4>
                {availableUnits.length === 0 ? (
                  <>
                    <p className="system-panel__desc" role="note">
                      No military units available to deploy.
                    </p>
                    <div className="system-panel__actions">
                      <Button
                        label="⚔ LAUNCH ATTACK"
                        variant="danger"
                        disabled
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="system-panel__attack-list">
                      <label className="system-panel__attack-unit">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all units"
                        />
                        <span>Select all</span>
                      </label>
                      {availableUnits.map((unit) => (
                        <label key={unit.id} className="system-panel__attack-unit">
                          <input
                            type="checkbox"
                            checked={selectedUnitIds.includes(unit.id)}
                            onChange={() => toggleUnit(unit.id)}
                            aria-label={`${unit.name} (${unit.category})`}
                          />
                          <span>
                            {unit.name} <em>({unit.category})</em>
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="system-panel__actions">
                      <Button
                        label="⚔ LAUNCH ATTACK"
                        variant="danger"
                        onClick={() => onAttack(systemId, selectedUnitIds)}
                        disabled={selectedUnitIds.length === 0 || intent === "attack"}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Actions */}
            {canColonise && (
              <div className="system-panel__actions">
                <Button
                  label="⟫ COLONISE (50 Credits)"
                  variant="primary"
                  onClick={() => onColonise?.(systemId)}
                  disabled={(state.empires.get(playerEmpireId)?.resources.credits ?? 0) < 50 || intent === "colonise"}
                />
              </div>
            )}
            {/* Wormhole Construction */}
            {onBuildWormhole && systemId !== state.empires.get(playerEmpireId)?.homeSystemId && (
              <div className="system-panel__section">
                <h4 className="system-panel__section-title">Sub-Space Construction</h4>
                <p className="system-panel__desc" style={{ marginBottom: "var(--space-2)" }}>
                  Construct a stabilised wormhole from your Home World to {system.name}. 
                  Costs 20,000 CT and 5,000 Ore. Enables instant fleet transit.
                </p>
                <div className="system-panel__actions">
                  <Button
                    label="BUILD WORMHOLE"
                    variant="primary"
                    onClick={() => onBuildWormhole(systemId)}
                    disabled={(state.empires.get(playerEmpireId)?.resources.credits ?? 0) < 20000 || (state.empires.get(playerEmpireId)?.resources.ore ?? 0) < 5000 || intent === "wormhole"}
                  />
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
