/* ── Nexus Dominion — Turn Status HUD ── */

import { useState } from "react";
import { Button, PhaseIndicator } from "../components/lcars";
import type { GameState } from "../engine/types";
import "./TurnStatus.css";

interface TurnStatusProps {
  state: GameState;
  /** Number of orders queued this cycle — drives the commit button label. */
  orderCount?: number;
  /** When true, an empty-queue commit is awaiting a confirming second click. */
  pendingPass?: boolean;
  /** When true the CycleReport modal is open — highlights the REPORT beat. */
  reportOpen?: boolean;
  onCommitCycle: () => void;
}

/** One available-action category and the panel a player uses to perform it. */
interface ActionHint {
  label: string;
  panel: string;
}

/**
 * Derives the currently-available action categories from cheap state checks.
 * These are hints, not authoritative validation — each row simply names the
 * panel that performs the action so the player knows where to go.
 */
function availableActions(state: GameState): ActionHint[] {
  const hints: ActionHint[] = [];
  const player = state.empires.get(state.playerEmpireId);
  if (!player) return hints;

  const systems = state.galaxy.systems;

  // Colonise: an unclaimed system adjacent to player territory exists.
  const canColonise = (player.systemIds ?? []).some(
    (sid) =>
      systems.get(sid)?.adjacentSystemIds?.some((aid) => {
        const a = systems.get(aid);
        return a != null && a.owner == null;
      }) ?? false,
  );
  if (canColonise) hints.push({ label: "Colonise", panel: "Star Map" });

  // Build: an owned system with an open, unlocked, empty slot.
  const canBuild = (player.systemIds ?? []).some(
    (sid) =>
      systems.get(sid)?.slots?.some((s) => !s.locked && !s.installation) ??
      false,
  );
  if (canBuild) hints.push({ label: "Build", panel: "System panel" });

  // Military: the player can afford the cheapest unit type.
  const cheapest = Math.min(
    ...[...state.unitTypes.values()].map((u) => u.buildCost),
  );
  const canMilitary =
    Number.isFinite(cheapest) && player.resources.credits >= cheapest;
  if (canMilitary) hints.push({ label: "Military", panel: "Military panel" });

  // Attack: the player has a completed unit AND a known enemy system.
  const playerUnitIds = new Set(
    [...state.fleets.values()]
      .filter((f) => f.ownerId === state.playerEmpireId)
      .flatMap((f) => f.unitIds),
  );
  const hasCompletedUnit = [...playerUnitIds].some(
    (uid) => state.units.get(uid)?.completionCycle == null,
  );
  const knownEnemySystem = [...systems.values()].some(
    (s) => s.owner != null && s.owner !== state.playerEmpireId,
  );
  if (hasCompletedUnit && knownEnemySystem)
    hints.push({ label: "Attack", panel: "Military panel" });

  // Trade: always available.
  hints.push({ label: "Trade", panel: "Market panel" });

  // Research: research points available.
  if (player.resources.researchPoints > 0)
    hints.push({ label: "Research", panel: "Research panel" });

  return hints;
}

export function TurnStatus({
  state,
  orderCount = 0,
  pendingPass = false,
  reportOpen = false,
  onCommitCycle,
}: TurnStatusProps) {
  const [expanded, setExpanded] = useState(false);

  const t = state.time;
  const tier = (
    t.cosmicOrder?.tiers?.get?.(state.playerEmpireId) ?? "—"
  ).toUpperCase();

  // Single text node — do NOT interpolate separate {} fields, or React splits
  // the readout across nodes and the exact-string assertion breaks.
  const readout = `CYCLE ${t.currentCycle} · CONFLUENCE ${t.currentConfluence} · RECKONING IN ${t.cyclesUntilReckoning} · ${tier}`;

  // Labeled pip strip — 10 pips, filled through the current cycle-in-confluence.
  const filledPips = t.currentCycle % 10;

  // Commit button label: a pending empty-queue pass needs a confirming second
  // click; a non-empty queue shows the order count; else it is a bare pass.
  const commitLabel = pendingPass
    ? "CONFIRM: PASS CYCLE"
    : orderCount > 0
      ? `⟫ COMMIT CYCLE (${orderCount})`
      : "⟫ PASS CYCLE";

  const actions = availableActions(state);

  return (
    <div className="turn-status">
      <div className="turn-status__info">
        <span className="turn-status__readout" data-testid="turn-status-readout">
          {readout}
        </span>

        {/* Labeled confluence pip strip */}
        <div className="turn-status__pips" aria-label="Confluence progress">
          <span className="turn-status__pips-label">CONFLUENCE</span>
          <div className="turn-status__pips-bar">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`turn-status__pip ${
                  i < filledPips ? "turn-status__pip--filled" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/*
          Documented simplification: the engine resolves 17 internal phases per
          cycle, but only three are player-visible beats. REPORT is highlighted
          while the CycleReport modal is open.
        */}
        <PhaseIndicator
          variant="compact"
          phases={["ORDERS", "RESOLUTION", "REPORT"]}
          currentPhase={reportOpen ? 2 : 0}
        />
      </div>

      <div className="turn-status__commit">
        <Button
          label={commitLabel}
          variant={pendingPass ? "danger" : "primary"}
          size="lg"
          onClick={onCommitCycle}
        />
        <button
          type="button"
          className="turn-status__chevron"
          aria-expanded={expanded}
          aria-label="Show available actions"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "▲" : "▾"}
        </button>

        {expanded && (
          <ul className="turn-status__actions" data-testid="turn-status-actions">
            {actions.map((a) => (
              <li key={a.label} className="turn-status__action">
                <span className="turn-status__action-name">{a.label}</span>
                <span className="turn-status__action-panel"> — {a.panel}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
