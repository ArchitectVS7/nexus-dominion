/* ── Nexus Dominion — Covert Ops Panel ── */

import { useState } from "react";
import { Panel, Button, DataReadout } from "../components/lcars";
import type { GameState, EmpireId } from "../engine/types";
import { COVERT_OPERATION_DEFS } from "../engine/types/covert";
import "./CovertOpsPanel.css";

interface CovertOpsPanelProps {
  state: GameState;
  onClose: () => void;
  onLaunchOperation: (targetId: EmpireId, opType: string) => void;
}

export function CovertOpsPanel({ state, onClose, onLaunchOperation }: CovertOpsPanelProps) {
  const [selectedTarget, setSelectedTarget] = useState<EmpireId | null>(null);

  const empire = state.empires.get(state.playerEmpireId);
  const covertState = state.covert?.empireStates.get(state.playerEmpireId);
  if (!empire) return null;

  const agentPool = covertState?.agentPool || 0;
  const intelLevel = covertState?.intelLevel || 0;

  const ops = Object.values(COVERT_OPERATION_DEFS);
  
  // Filter other empires for targets
  const targets = Array.from(state.empires.values()).filter(e => e.id !== empire.id);

  return (
    <div className="covert-panel-overlay" onClick={onClose}>
      <div className="covert-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title="Intelligence Agency" onClose={onClose} variant="info">
          <div className="covert-panel__content">
            
            {/* Status Header */}
            <div className="covert-panel__header">
              <div className="covert-panel__tier-badge">
                <span className="covert-panel__tier-lbl">INTEL LEVEL</span>
                <span className="covert-panel__tier-val">{intelLevel} / 5</span>
              </div>
              
              <div className="covert-panel__points">
                <DataReadout label="Agents Ready" value={agentPool} />
              </div>
            </div>

            {/* Target Selection */}
            <div className="covert-panel__section">
              <h4 className="covert-panel__section-title">Select Target</h4>
              <select 
                className="covert-panel__target-select" 
                value={selectedTarget || ""}
                onChange={(e) => setSelectedTarget(e.target.value as EmpireId)}
              >
                <option value="" disabled>Select an Empire...</option>
                {targets.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Operations */}
            <div className="covert-panel__section">
              <h4 className="covert-panel__section-title">Launch Operation</h4>
              <p className="covert-panel__desc">Operations cost 200 Intel Agents to dispatch.</p>
              <div className="covert-panel__ops">
                {ops.map((op) => {
                  const locked = agentPool < 200 || !selectedTarget;
                  const detectionRisk = op.baseDetectionRisk * 100;
                  
                   return (
                     <div key={op.id} className={`covert-panel__op ${locked ? "locked" : ""}`}>
                        <div className="covert-panel__op-info">
                          <span className="covert-panel__op-name">{op.id.replace(/-/g, " ")}</span>
                          <span className="covert-panel__op-cost">
                             {locked && !selectedTarget ? "AWAITING TARGET" : `Risk: ${detectionRisk}%`}
                          </span>
                        </div>
                        <Button 
                          label="EXECUTE" 
                          variant="danger" 
                          size="sm" 
                          disabled={locked}
                          onClick={() => selectedTarget && onLaunchOperation(selectedTarget, op.id)} 
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
