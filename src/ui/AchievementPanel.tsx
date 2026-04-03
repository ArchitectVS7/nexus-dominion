/* ── Nexus Dominion — Achievement Panel ── */

import { Panel } from "../components/lcars";
import type { GameState } from "../engine/types";
import { getAchievementProgressDetailed, type AchievementContext } from "../engine/achievement/achievement-checker";
import { computeFuelCellsProductionShare } from "../engine/syndicate/syndicate-engine";
import { calculateProduction } from "../engine/economy/economy-engine";
import { STABILITY_MULTIPLIERS } from "../engine/types/empire";
import "./AchievementPanel.css";

interface AchievementPanelProps {
  state: GameState;
  onClose: () => void;
}

export function buildAchievementContext(state: GameState): AchievementContext {
  const fuelCellsProduction = new Map([...state.empires.entries()].map(([id]) => {
     const ownedSystems = [...state.galaxy.systems.values()].filter(s => s.owner === id);
     return [id, calculateProduction(ownedSystems, STABILITY_MULTIPLIERS["content"]).fuelCells];
  }));

  const covertOpsStats = state.covert
    ? new Map([...state.covert.empireStates.entries()].map(([id, cs]) => [
        id, { totalOpsCompleted: cs.totalOpsCompleted, timesDetectedAsAttacker: cs.timesDetectedAsAttacker }
      ]))
    : undefined;

  // Track eliminated empires and coalition leaders if these were officially recorded 
  // For UI display, we approximate these based on existing state where missing.
  // Gap E1/E2 says they are missing from Engine, so we default to maps/0.

  return {
    totalEmpires: state.empires.size,
    eliminatedCount: 0,
    maxResearchTier: 8,
    empireNetWorth: new Map([...state.empires.entries()].map(([id, e]) => [id, e.powerScore])),
    coalitionsSurvived: new Map(),
    syndicateController: state.syndicate?.controllerId ?? null,
    syndicateExposed: state.syndicate?.exposedEmpires ?? new Set(),
    earnedAchievements: state.earnedAchievements ?? new Map(),
    fuelCellsProductionShare: computeFuelCellsProductionShare(fuelCellsProduction),
    covertOpsStats,
    coalitionLeaderships: new Map(),
  };
}

export function AchievementPanel({ state, onClose }: AchievementPanelProps) {
  const empire = state.empires.get(state.playerEmpireId);
  if (!empire) return null;

  const ctx = buildAchievementContext(state);
  const progressList = getAchievementProgressDetailed(empire.id, empire, state.galaxy, ctx);

  return (
    <div className="achievement-panel-overlay" onClick={onClose}>
      <div className="achievement-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title="Nexus Convergence (Achievements)" onClose={onClose} variant="info">
          <div className="achievement-panel__content">
            <p className="achievement-panel__desc">
              Track your progress toward total Galactic Ascension. Reach 100% in any of these conditions
              to trigger a Nexus Convergence and secure victory.
            </p>

            <div className="achievement-panel__list">
              {progressList.map(item => {
                const percent = Math.min(100, Math.floor(item.progress * 100));
                return (
                  <div key={item.id} className={`achievement-panel__item ${item.earned ? "earned" : ""}`}>
                    <div className="achievement-panel__header">
                      <span className="achievement-panel__name">{item.name}</span>
                      <span className="achievement-panel__pct">{item.earned ? "ASCENDED" : `${percent}%`}</span>
                    </div>
                    {/* Simplified description matching since we already computed it */}
                    {!item.earned && (
                      <div className="achievement-panel__bar-bg">
                        <div className="achievement-panel__bar-fg" style={{ width: `${percent}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </Panel>
      </div>
    </div>
  );
}
