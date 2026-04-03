/* ── Nexus Dominion — Cycle Report Modal ── */

import { Panel, Button } from "../components/lcars";
import type { CycleReport, GameEvent } from "../engine/types";
import "./CycleReport.css";

interface CycleReportModalProps {
  report: CycleReport;
  onClose: () => void;
}

export function CycleReportModal({ report, onClose }: CycleReportModalProps) {
  const { cycle, events, playerResourceDeltas, reckoningOccurred } = report;

  // Categorise events
  const combatEvents = events.filter((e) => e.type === "combat");
  const diplomacyEvents = events.filter((e) => e.type === "diplomacy");
  const colonisationEvents = events.filter((e) => e.type === "colonisation");
  const achievementEvents = events.filter((e) => e.type === "achievement");
  const researchEvents = events.filter((e) => e.type === "research");
  const otherEvents = events.filter(
    (e) => !["resource", "combat", "diplomacy", "colonisation", "achievement", "research"].includes(e.type),
  );

  return (
    <div className="cycle-report-overlay" onClick={onClose}>
      <div className="cycle-report-modal" onClick={(e) => e.stopPropagation()}>
        <Panel
          title={`Cycle ${cycle} Report`}
          variant={reckoningOccurred ? "alert" : "default"}
          onClose={onClose}
        >
          <div className="cycle-report__content">
            {reckoningOccurred && (
              <div className="cycle-report__reckoning">
                <span className="cycle-report__reckoning-icon">⟡</span>
                <span>NEXUS RECKONING — The Cosmic Order has been recalculated</span>
              </div>
            )}

            {/* Resource summary */}
            {Object.keys(playerResourceDeltas).length > 0 && (
              <div className="cycle-report__section">
                <h4 className="cycle-report__section-title">Resource Changes</h4>
                <div className="cycle-report__deltas">
                  {Object.entries(playerResourceDeltas).map(([key, val]) => (
                    <div key={key} className="cycle-report__delta-row">
                      <span className="cycle-report__delta-key">{key}</span>
                      <span
                        className={`cycle-report__delta-val ${
                          (val as number) > 0 ? "positive" : (val as number) < 0 ? "negative" : ""
                        }`}
                      >
                        {(val as number) > 0 ? "+" : ""}
                        {(val as number).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event sections */}
            {colonisationEvents.length > 0 && (
              <EventSection title="Colonisation" events={colonisationEvents} icon="🌍" />
            )}
            {combatEvents.length > 0 && (
              <EventSection title="Combat" events={combatEvents} icon="⚔" />
            )}
            {diplomacyEvents.length > 0 && (
              <EventSection title="Diplomacy" events={diplomacyEvents} icon="🤝" />
            )}
            {achievementEvents.length > 0 && (
              <EventSection title="Achievements" events={achievementEvents} icon="🏆" />
            )}
            {researchEvents.length > 0 && (
              <EventSection title="Research" events={researchEvents} icon="🔬" />
            )}
            {otherEvents.length > 0 && (
              <EventSection title="Other Events" events={otherEvents} icon="◉" />
            )}

            {events.length === 0 && (
              <div className="cycle-report__empty">
                <span>A quiet cycle. The galaxy holds its breath.</span>
              </div>
            )}

            <div className="cycle-report__footer">
              <Button label="CONTINUE" variant="primary" onClick={onClose} />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function EventSection({ title, events, icon }: { title: string; events: GameEvent[]; icon: string }) {
  return (
    <div className="cycle-report__section">
      <h4 className="cycle-report__section-title">
        <span className="cycle-report__section-icon">{icon}</span>
        {title}
        <span className="cycle-report__section-count">{events.length}</span>
      </h4>
      <div className="cycle-report__events">
        {events.slice(0, 15).map((event, i) => (
          <div key={i} className="cycle-report__event-row">
            <span className="cycle-report__event-type">{formatEventType(event)}</span>
            <span className="cycle-report__event-detail">
              {renderEventDetail(event)}
            </span>
          </div>
        ))}
        {events.length > 15 && (
          <div className="cycle-report__more">…and {events.length - 15} more events</div>
        )}
      </div>
    </div>
  );
}

function formatEventType(event: any): string {
  if (event.type === "combat") return event.result?.phase || "combat";
  if (event.type === "diplomacy") return event.action?.replace(/-/g, " ");
  if (event.type === "achievement") return "Unlock";
  return event.type;
}

function renderEventDetail(event: any): React.ReactNode {
  if (event.type === "combat") {
    const res = event.result;
    return (
      <>
        <span>Attacker: {res.attackerId} vs Defender: {res.defenderId} at {res.systemId}. </span>
        <span>Victor: <strong style={{color: "var(--lcars-warning)"}}>{res.victor}</strong>. </span>
        {res.systemCaptured && <span>System Captured! </span>}
        {res.moraleBreak && <span>Forces routed (Morale Break). </span>}
        <span>Casualties: {res.attackerLosses?.length || 0} Attacker / {res.defenderLosses?.length || 0} Defender.</span>
      </>
    );
  }
  if (event.type === "diplomacy") {
    if (event.action === "pact-formed" || event.action === "pact-broken") {
       return `Pact ${event.pactType} between ${event.involvedEmpires?.join(" and ")}`;
    }
  }
  if (event.type === "achievement") {
     return `${event.empireId} achieved: ${event.achievementName}`;
  }
  
  let out = "";
  if (event.empireId) out += `Empire: ${event.empireId} `;
  if (event.systemId) out += `System: ${event.systemId} `;
  return out;
}
