/* ── Nexus Dominion — Combat Report Modal ── */

import { Panel, Button, DataReadout, PhaseIndicator } from "../components/lcars";
import type { CombatEvent, CombatResult, CombatPhase, EmpireId } from "../engine/types";
import "./CombatReport.css";

interface CombatReportModalProps {
  event: CombatEvent;
  playerEmpireId: EmpireId;
  onClose: () => void;
}

const PHASE_LABELS: Record<CombatPhase, string> = {
  "fleet-engagement": "Fleet Engagement",
  "orbital-bombardment": "Orbital Bombardment",
  "ground-assault": "Ground Assault",
};

export function CombatReportModal({ event, playerEmpireId, onClose }: CombatReportModalProps) {
  const phases: CombatResult[] = event.results ?? [event.result];

  // Overall outcome, framed from the player's perspective.
  const victor = event.victor ?? event.result.victor;
  const playerWon = victor === playerEmpireId;

  /** Render an empire id, tagging the player's own id. */
  const side = (id: EmpireId) => (id === playerEmpireId ? `${id} (You)` : id);

  return (
    <div className="combat-report-overlay" onClick={onClose}>
      <div className="combat-report-modal" onClick={(e) => e.stopPropagation()}>
        <Panel title="Combat Report" variant="alert" onClose={onClose}>
          <div className="combat-report__content">
            <PhaseIndicator
              phases={phases.map((p) => PHASE_LABELS[p.phase])}
              currentPhase={phases.length - 1}
            />

            {phases.map((phase, i) => (
              <section
                key={i}
                className="combat-report__phase"
                data-phase={phase.phase}
              >
                <h4 className="combat-report__phase-title">{PHASE_LABELS[phase.phase]}</h4>
                <div className="combat-report__casualties">
                  <DataReadout
                    label="Attacker Losses"
                    value={phase.attackerLosses.length}
                  />
                  <DataReadout
                    label="Defender Losses"
                    value={phase.defenderLosses.length}
                  />
                </div>
                {(phase.moraleBreak || phase.retreated) && (
                  <div className="combat-report__morale">
                    Morale Break — forces routed
                  </div>
                )}
                {phase.infrastructureDamage !== undefined && phase.infrastructureDamage > 0 && (
                  <div className="combat-report__infra">
                    Infrastructure Damage: {phase.infrastructureDamage}%
                  </div>
                )}
                <div className="combat-report__phase-victor">
                  Phase Victor: <strong>{side(phase.victor)}</strong>
                </div>
              </section>
            ))}

            <div className="combat-report__footer">
              <div className="combat-report__outcome">
                Outcome: <strong>{playerWon ? "Victory" : "Defeat"}</strong> — victor {side(victor)}
              </div>
              <div className="combat-report__ownership">
                Ownership:{" "}
                {event.ownershipChanged
                  ? `System captured — ownership transferred to ${side(victor)}`
                  : "No ownership change."}
              </div>
              <Button label="DISMISS" variant="primary" onClick={onClose} />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
