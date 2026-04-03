/* ── Nexus Dominion — Diplomacy Panel ── */

import { Panel, Button } from "../components/lcars";
import type { GameState, EmpireId } from "../engine/types";
import { relationshipKey } from "../engine/types/diplomacy";
import "./DiplomacyPanel.css";

interface DiplomacyPanelProps {
  state: GameState;
  onClose: () => void;
  onProposePact: (targetId: EmpireId, type: "stillness-accord" | "star-covenant") => void;
  onBreakPact: (pactId: string) => void;
}

export function DiplomacyPanel({ state, onClose, onProposePact, onBreakPact }: DiplomacyPanelProps) {
  const playerEmpire = state.empires.get(state.playerEmpireId);
  if (!playerEmpire) return null;

  // Global reputation
  const globalRep = playerEmpire.globalReputation ?? 50;
  const repLabel = globalRep >= 80 ? "Revered" 
                 : globalRep >= 60 ? "Respected" 
                 : globalRep >= 40 ? "Neutral" 
                 : globalRep >= 20 ? "Distrusted" 
                 : "Despised";

  // Gather relationships
  const relations = [];
  for (const [id, empire] of state.empires.entries()) {
    if (id === playerEmpire.id) continue;
    const key = relationshipKey(playerEmpire.id, id);
    const rel = state.diplomacy.relationships.get(key);
    relations.push({
      id,
      name: empire.name,
      status: rel?.status ?? "neutral",
      score: rel?.reputation ?? 0,
      power: empire.powerScore,
      tier: state.time.cosmicOrder.tiers.get(id) ?? "stricken",
    });
  }

  // Sort by score desc
  relations.sort((a, b) => b.score - a.score);

  // Active Pacts
  const myPacts = Array.from(state.diplomacy.pacts.values()).filter(
    (p) => p.active && p.memberIds.includes(playerEmpire.id)
  );

  // Active Coalitions vs Player
  const antiPlayerCoalitions = Array.from(state.diplomacy.coalitions.values()).filter(
    (c) => c.active && c.targetId === playerEmpire.id
  );

  return (
    <div className="diplomacy-panel-overlay" onClick={onClose}>
      <div className="diplomacy-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title="Galactic Diplomacy" onClose={onClose}>
          <div className="diplomacy-panel__content">
            
            {/* Global Standing */}
            <div className="diplomacy-panel__standing">
              <h4 className="diplomacy-panel__section-title">Galactic Standing</h4>
              <div className="diplomacy-panel__rep-card">
                <span className="diplomacy-panel__rep-val">{globalRep}</span>
                <span className="diplomacy-panel__rep-lbl">{repLabel}</span>
              </div>
            </div>

            {/* Coalitions Warning */}
            {antiPlayerCoalitions.length > 0 && (
              <div className="diplomacy-panel__alert">
                <span className="diplomacy-panel__alert-icon">⚠</span>
                <span>NEXUS COMPACT ACTIVE AGAINST YOU — {antiPlayerCoalitions.length} Coalition(s) Formed</span>
              </div>
            )}

            {/* Active Pacts */}
            <div className="diplomacy-panel__section">
              <h4 className="diplomacy-panel__section-title">Active Treaties</h4>
              <div className="diplomacy-panel__pacts">
                {myPacts.length > 0 ? (
                  myPacts.map((pact) => {
                    const otherId = pact.memberIds.find(id => id !== playerEmpire.id)!;
                    const otherName = state.empires.get(otherId)?.name ?? otherId;
                    return (
                      <div key={pact.id} className="diplomacy-panel__pact-item">
                        <div className="diplomacy-panel__pact-info">
                          <span className="diplomacy-panel__pact-type">{pact.type.replace(/-/g, " ")}</span>
                          <span className="diplomacy-panel__pact-target">with {otherName}</span>
                        </div>
                        <Button 
                          label="BREAK" 
                          variant="danger" 
                          size="sm" 
                          onClick={() => onBreakPact(pact.id)} 
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="diplomacy-panel__empty">No active treaties.</div>
                )}
              </div>
            </div>

            {/* Emissary List */}
            <div className="diplomacy-panel__section">
              <h4 className="diplomacy-panel__section-title">Foreign Empires</h4>
              <div className="diplomacy-panel__list">
                {relations.slice(0, 15).map((rel) => {
                  const isFriendly = rel.status === "friendly" || rel.status === "allied";
                  const isHostile = rel.status === "hostile" || rel.status === "at-war";
                  const canPact = !isHostile && myPacts.every(p => !p.memberIds.includes(rel.id));

                  return (
                    <div key={rel.id} className="diplomacy-panel__list-item">
                      <div className="diplomacy-panel__list-main">
                        <span className="diplomacy-panel__list-name">{rel.name}</span>
                        <span className="diplomacy-panel__list-tier">{rel.tier}</span>
                      </div>
                      <div className="diplomacy-panel__list-status">
                        <span className={`diplomacy-panel__status-badge ${isFriendly ? "friendly" : isHostile ? "hostile" : "neutral"}`}>
                          {rel.status.replace(/-/g, " ")} ({rel.score > 0 ? "+" : ""}{rel.score})
                        </span>
                      </div>
                      <div className="diplomacy-panel__list-actions">
                        {canPact && (
                          <Button 
                            label="PROPOSE ACCORD" 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => onProposePact(rel.id, "stillness-accord")} 
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="diplomacy-panel__empty" style={{marginTop: "8px"}}>
                Showing top 15 empires by relations.
              </div>
            </div>

          </div>
        </Panel>
      </div>
    </div>
  );
}
