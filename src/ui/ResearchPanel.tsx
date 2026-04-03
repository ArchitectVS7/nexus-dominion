/* ── Nexus Dominion — Research Panel ── */

import { Panel, Button, DataReadout } from "../components/lcars";
import type { GameState } from "../engine/types";
import { 
  RESEARCH_PATHS, 
  MAX_RESEARCH_TIER, 
  researchCost, 
  DOCTRINE_TIER, 
  SPECIALIZATION_TIER 
} from "../engine/research/research-engine";
import "./ResearchPanel.css";

interface ResearchPanelProps {
  state: GameState;
  onClose: () => void;
  onResearch: () => void;
  onSelectDoctrine: (pathId: string) => void;
  onSelectSpecialization: (specId: string) => void;
}

export function ResearchPanel({ 
  state, 
  onClose, 
  onResearch, 
  onSelectDoctrine, 
  onSelectSpecialization 
}: ResearchPanelProps) {
  const empire = state.empires.get(state.playerEmpireId);
  if (!empire) return null;

  const currentTier = empire.researchTier;
  const currentPoints = empire.resources.researchPoints;
  const nextCost = researchCost(currentTier);
  const canResearch = currentTier < MAX_RESEARCH_TIER && currentPoints >= nextCost;

  const needsDoctrine = currentTier >= DOCTRINE_TIER && !empire.researchPath;
  const needsSpec = currentTier >= SPECIALIZATION_TIER && empire.researchPath && !empire.specialization;

  return (
    <div className="research-panel-overlay" onClick={onClose}>
      <div className="research-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title="Research & Development" onClose={onClose} variant={needsDoctrine || needsSpec ? "alert" : "info"}>
          <div className="research-panel__content">
            
            {/* Status Header */}
            <div className="research-panel__header">
              <div className="research-panel__tier-badge">
                <span className="research-panel__tier-lbl">CURRENT TIER</span>
                <span className="research-panel__tier-val">{currentTier} / {MAX_RESEARCH_TIER}</span>
              </div>
              
              <div className="research-panel__points">
                <DataReadout label="Available RP" value={currentPoints} />
                {currentTier < MAX_RESEARCH_TIER && (
                  <DataReadout label="Next Tier Cost" value={nextCost} />
                )}
              </div>
            </div>

            {/* Advance Action */}
            {currentTier < MAX_RESEARCH_TIER && !needsDoctrine && !needsSpec && (
              <div className="research-panel__action">
                <Button 
                  label={`⟫ ADVANCE TO TIER ${currentTier + 1}`}
                  variant="primary" 
                  disabled={!canResearch}
                  onClick={onResearch}
                />
              </div>
            )}

            {/* Draft Alerts */}
            {needsDoctrine && (
              <div className="research-panel__draft-alert">
                <span className="research-panel__draft-icon">◈</span>
                <span>DOCTRINE DRAFT AVAILABLE — Selection Required to Proceed</span>
              </div>
            )}
            
            {needsSpec && (
              <div className="research-panel__draft-alert">
                <span className="research-panel__draft-icon">◈</span>
                <span>SPECIALIZATION DRAFT AVAILABLE — Selection Required to Proceed</span>
              </div>
            )}

            {/* Tech Tree */}
            <div className="research-panel__tree">
              {RESEARCH_PATHS.map((path) => {
                const isSelectedPath = empire.researchPath === path.id;
                const isOtherPathSelected = empire.researchPath && !isSelectedPath;
                
                return (
                  <div 
                    key={path.id} 
                    className={`research-panel__path ${isSelectedPath ? "selected" : ""} ${isOtherPathSelected ? "locked" : ""}`}
                  >
                    <div className="research-panel__path-header">
                      <h4 className="research-panel__path-name">{path.name}</h4>
                      {needsDoctrine && (
                        <Button 
                          label="DRAFT" 
                          variant="primary" 
                          size="sm" 
                          onClick={() => onSelectDoctrine(path.id)} 
                        />
                      )}
                    </div>

                    {/* Specializations */}
                    <div className="research-panel__specs">
                      {path.specializations?.map((specId) => {
                        const isSelectedSpec = empire.specialization === specId;
                        const isOtherSpecSelected = empire.specialization && !isSelectedSpec;
                        
                        return (
                          <div 
                            key={specId} 
                            className={`research-panel__spec ${isSelectedSpec ? "selected" : ""} ${isOtherSpecSelected || isOtherPathSelected ? "locked" : ""}`}
                          >
                            <span className="research-panel__spec-name">{specId.replace(/-/g, " ")}</span>
                            {needsSpec && isSelectedPath && (
                              <Button 
                                label="DRAFT" 
                                variant="primary" 
                                size="sm" 
                                onClick={() => onSelectSpecialization(specId)} 
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Capstone */}
                    <div className="research-panel__capstone">
                      <span className="research-panel__capstone-lbl">CAPSTONE:</span>
                      <span className="research-panel__capstone-name">{path.capstone}</span>
                    </div>

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
