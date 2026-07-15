/* ── Nexus Dominion — Sector Panel ── */

import { useEffect } from "react";
import { Panel } from "../components/lcars";
import type { GameState, SectorId, EmpireId } from "../engine/types";
import { computeSectorDominance } from "../engine/galaxy/sector-dominance";
import { getEmpireColour } from "../engine/galaxy/galaxy-generator";
import "./SectorPanel.css";

interface SectorPanelProps {
  sectorId: SectorId;
  state: GameState;
  onClose: () => void;
}

export function SectorPanel({ sectorId, state, onClose }: SectorPanelProps) {
  // Dismiss via Escape key (backdrop click + Panel × handle the other paths).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const sector = state.galaxy.sectors.get(sectorId);
  if (!sector) return null;

  const playerEmpireId = state.playerEmpireId;
  const dominance = computeSectorDominance(state.galaxy, sectorId);
  const totalSystems = sector.systemIds.length;

  // Resolve a display label for an empire owner.
  const ownerLabel = (owner: EmpireId | null): string => {
    if (!owner) return "Unclaimed";
    if (owner === playerEmpireId) return "Yours";
    return state.empires.get(owner)?.name ?? owner;
  };

  // Ownership breakdown rows (per empire), plus a derived Unclaimed row.
  const ownershipRows = Array.from(dominance.ownership.entries());
  const ownedCount = ownershipRows.reduce((sum, [, count]) => sum + count, 0);
  const unclaimedCount = totalSystems - ownedCount;

  const dominantName = dominance.dominantEmpire
    ? ownerLabel(dominance.dominantEmpire)
    : null;

  return (
    <div className="sector-panel-overlay" onClick={onClose}>
      <div className="sector-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title={sector.name} onClose={onClose}>
          <div className="sector-panel__content">
            {/* Dominance line */}
            <p className="sector-panel__dominance" role="status">
              {dominantName
                ? `Dominated by ${dominantName}`
                : "Contested — no dominant empire"}
            </p>

            {/* Ownership breakdown by empire */}
            <div className="sector-panel__section">
              <h4 className="sector-panel__section-title">Ownership Breakdown</h4>
              <div className="sector-panel__ownership-list">
                {ownershipRows.map(([empireId, count]) => (
                  <div key={empireId} className="sector-panel__ownership-row">
                    <span
                      className="sector-panel__swatch"
                      style={{
                        background:
                          empireId === playerEmpireId
                            ? "var(--lcars-blue-light)"
                            : getEmpireColour(empireId),
                      }}
                    />
                    <span className="sector-panel__ownership-name">
                      {ownerLabel(empireId)}
                    </span>
                    <span className="sector-panel__ownership-count">{count}</span>
                  </div>
                ))}
                <div className="sector-panel__ownership-row">
                  <span className="sector-panel__swatch sector-panel__swatch--unclaimed" />
                  <span className="sector-panel__ownership-name">Unclaimed</span>
                  <span className="sector-panel__ownership-count">
                    {unclaimedCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Systems list */}
            <div className="sector-panel__section">
              <h4 className="sector-panel__section-title">
                Systems ({totalSystems})
              </h4>
              <div className="sector-panel__systems-list">
                {sector.systemIds.map((systemId) => {
                  const system = state.galaxy.systems.get(systemId);
                  if (!system) return null;
                  const isYours = system.owner === playerEmpireId;
                  const cls = isYours
                    ? "you"
                    : system.owner
                      ? "other"
                      : "unclaimed";
                  return (
                    <div key={systemId} className="sector-panel__system-item">
                      <span className="sector-panel__system-name">
                        {system.name}
                      </span>
                      <span className={`sector-panel__system-owner ${cls}`}>
                        {ownerLabel(system.owner)}
                      </span>
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
