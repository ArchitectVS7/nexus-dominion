/* ── Nexus Dominion — Convergence Alert HUD Banner ── */

import { Button } from "../components/lcars";
import type { ConvergenceAlertEvent } from "../engine/types";
import "./ConvergenceAlert.css";

interface ConvergenceAlertProps {
  event: ConvergenceAlertEvent;
  /** Resolved display name of the empire nearing victory. */
  empireName: string;
  /** Resolved display name of the threatened achievement. */
  achievementName: string;
  onDismiss: () => void;
}

/**
 * A prominent HUD banner that surfaces a convergence alert — a rival empire
 * closing in on a victory achievement. Names both the empire and the
 * threatened achievement so the player can react.
 */
export function ConvergenceAlert({ event, empireName, achievementName, onDismiss }: ConvergenceAlertProps) {
  const pct = Math.round(event.progress * 100);
  return (
    <div className="convergence-alert" role="alert" data-testid="convergence-alert">
      <span className="convergence-alert__icon">⚠</span>
      <span className="convergence-alert__text">
        CONVERGENCE IMMINENT — <strong>{empireName}</strong> nears{" "}
        <strong>{achievementName}</strong> ({pct}%)
      </span>
      <Button label="DISMISS" variant="danger" size="sm" onClick={onDismiss} />
    </div>
  );
}
