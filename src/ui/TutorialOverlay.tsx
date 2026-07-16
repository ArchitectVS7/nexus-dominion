/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Tutorial Overlay (Directed Start)

   Blue-tinted, non-intrusive LCARS overlay anchored to the LEFT column,
   clear of the Star Map centre and above the Orders Queue tray (per
   PROGRESSIVE-SYSTEMS §6). Renders a 5-item directed-start checklist
   tracking the player's tutorial objectives.

   Purely presentational: it reflects the engine's `TutorialState` and
   exposes a single `onSkip` callback. Skip confirmation and collapse are
   local component state. All tutorial mutation happens in App via the pure
   tutorial engine (`skipTutorial`, `markTutorialSignal`).
   ══════════════════════════════════════════════════════════════ */

import { useState } from "react";
import { Panel, Button } from "../components/lcars";
import type { TutorialState } from "../engine/types";
import { TUTORIAL_OBJECTIVES } from "../engine/tutorial/tutorial-engine";
import "./TutorialOverlay.css";

interface TutorialOverlayProps {
  /** The active tutorial state. App only renders this when `active` is true. */
  tutorial: TutorialState;
  /** Dispatches SET_STATE with skipTutorial(state) in App. */
  onSkip: () => void;
}

/**
 * Static per-objective presentation table, keyed to the engine's ordered
 * TUTORIAL_OBJECTIVES ids. `signals` lists the signal ids that would satisfy
 * this objective — used to render a pending tick the moment the UI reports a
 * signal, before the engine confirms it on the next commit.
 */
interface ObjectiveItem {
  id: (typeof TUTORIAL_OBJECTIVES)[number];
  label: string;
  instruction: string;
  signals: string[];
}

const ITEMS: ObjectiveItem[] = [
  {
    id: "explore",
    label: "Scan the neighbourhood",
    instruction: "Select a star system on the map to scan it.",
    signals: ["explored"],
  },
  {
    id: "expand",
    label: "Colonise a second system",
    instruction: "Queue COLONISE on a system, then COMMIT CYCLE.",
    signals: [],
  },
  {
    id: "military",
    label: "Build your first units",
    instruction: "Queue BUILD in the Military panel, then COMMIT CYCLE.",
    signals: [],
  },
  {
    id: "market",
    label: "Make a market trade",
    instruction: "Queue a BUY/SELL in the Market panel, then COMMIT CYCLE.",
    signals: ["market"],
  },
  {
    id: "combat-prep",
    label: "Move a fleet into contested space",
    instruction: "Queue MOVE or ATTACK, then COMMIT CYCLE.",
    signals: ["move-fleet", "attack"],
  },
];

const TOTAL = ITEMS.length;

type ItemStatus = "done" | "current" | "current-pending" | "future";

function statusFor(item: ObjectiveItem, i: number, t: TutorialState): ItemStatus {
  if (i < t.objectiveIndex || t.completed.includes(item.id)) return "done";
  if (i === t.objectiveIndex) {
    const pending = item.signals.some((s) => t.signals.includes(s));
    return pending ? "current-pending" : "current";
  }
  return "future";
}

const PIP: Record<ItemStatus, string> = {
  done: "●",
  current: "○",
  "current-pending": "◐",
  future: "○",
};

export function TutorialOverlay({ tutorial, onSkip }: TutorialOverlayProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);

  const handleSkipClick = () => {
    if (!confirmSkip) {
      setConfirmSkip(true);
      return;
    }
    onSkip();
  };

  return (
    <div className="tutorial-overlay" data-testid="tutorial-overlay">
      <Panel
        title={`DIRECTED START ${tutorial.completed.length}/${TOTAL}`}
        variant="info"
        className="tutorial-overlay__panel"
      >
        <button
          type="button"
          className="tutorial-overlay__toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "expand tutorial" : "collapse tutorial"}
        >
          <span className="tutorial-overlay__caret">{collapsed ? "▸" : "▾"}</span>
          <span className="tutorial-overlay__toggle-label">
            {collapsed ? "SHOW CHECKLIST" : "HIDE CHECKLIST"}
          </span>
        </button>

        {!collapsed && (
          <>
            <ol className="tutorial-overlay__list">
              {ITEMS.map((item, i) => {
                const status = statusFor(item, i, tutorial);
                const isCurrent =
                  status === "current" || status === "current-pending";
                return (
                  <li
                    key={item.id}
                    className={`tutorial-overlay__item tutorial-overlay__item--${status}`}
                    data-status={status}
                  >
                    <span className="tutorial-overlay__pip" aria-hidden="true">
                      {PIP[status]}
                    </span>
                    <div className="tutorial-overlay__body">
                      <span className="tutorial-overlay__label">{item.label}</span>
                      {isCurrent && (
                        <span className="tutorial-overlay__instruction">
                          {item.instruction}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="tutorial-overlay__foot">
              <Button
                label={confirmSkip ? "CONFIRM SKIP" : "SKIP TUTORIAL"}
                variant="danger"
                size="sm"
                onClick={handleSkipClick}
              />
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
