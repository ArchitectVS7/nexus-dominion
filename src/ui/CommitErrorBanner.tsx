/* ── Nexus Dominion — Commit Error HUD Banner ── */

import { Button } from "../components/lcars";
import "./CommitErrorBanner.css";

interface CommitErrorBannerProps {
  /** The error message from a failed-commit CycleResult. */
  message: string;
  onDismiss: () => void;
}

/**
 * A dismissible HUD banner that surfaces a failed cycle commit (Tier-1 atomic
 * failure) to the player, replacing the previous silent-failure behaviour.
 */
export function CommitErrorBanner({ message, onDismiss }: CommitErrorBannerProps) {
  return (
    <div className="commit-error-banner" role="alert" data-testid="commit-error-banner">
      <span className="commit-error-banner__icon">⚠</span>
      <span className="commit-error-banner__text">COMMIT FAILED — {message}</span>
      <Button label="DISMISS" variant="danger" size="sm" onClick={onDismiss} />
    </div>
  );
}
