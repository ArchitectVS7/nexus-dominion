/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Tutorial Engine

   Opt-in directed-start tutorial subsystem. Five objectives are
   completed strictly in order and evaluated once per cycle by
   `advanceTutorial`, called late in processCycle Tier-1.

   Pure module: no UI imports, no DOM/localStorage access, no RNG.
   All logic is derived deterministically from GameState.
   ══════════════════════════════════════════════════════════════ */

import type { GameState, TutorialState } from "../types/game-state";

/** Ordered objective ids. Objectives are completed strictly in this order. */
export const TUTORIAL_OBJECTIVES = [
  "explore",
  "expand",
  "military",
  "market",
  "combat-prep",
] as const;

/** Tutorial hard-deactivates on/after this cycle regardless of progress. */
export const TUTORIAL_MAX_CYCLE = 10;

/**
 * Count the player's units, including units queued in the build queue.
 * Ownership is via fleet membership (units carry no ownerId), so we sum
 * unit ids across player-owned fleets, plus the player's build-queue length.
 */
export function countPlayerUnits(state: GameState): number {
  const playerId = state.playerEmpireId;
  let count = 0;
  for (const fleet of state.fleets.values()) {
    if (fleet.ownerId === playerId) {
      count += fleet.unitIds.length;
    }
  }
  const player = state.empires.get(playerId);
  count += player?.buildQueue?.length ?? 0;
  return count;
}

/**
 * Create a fresh, active tutorial state anchored to the player's current
 * unit count as the military-objective baseline.
 */
export function createTutorialState(state: GameState): TutorialState {
  return {
    active: true,
    objectiveIndex: 0,
    completed: [],
    signals: [],
    baselineUnitCount: countPlayerUnits(state),
    skipped: false,
  };
}

/**
 * Record a signal toward the current tutorial objective (e.g. UI reporting
 * `"explored"`). No-op when the tutorial is absent or inactive. Deduplicated.
 */
export function markTutorialSignal(state: GameState, signal: string): void {
  const t = state.tutorial;
  if (!t || !t.active) return;
  if (!t.signals.includes(signal)) {
    t.signals.push(signal);
  }
}

/**
 * Record an action-success signal from the cycle processor (e.g. `"market"`,
 * `"move-fleet"`, `"attack"`). Semantically distinct call site from
 * markTutorialSignal but appends to the same signal list.
 */
export function markTutorialAction(state: GameState, action: string): void {
  markTutorialSignal(state, action);
}

/**
 * Skip the tutorial. Pure: returns a new state with the tutorial deactivated
 * and flagged skipped. No-op (returns the same state) when no tutorial exists.
 */
export function skipTutorial(state: GameState): GameState {
  if (!state.tutorial) return state;
  return {
    ...state,
    tutorial: { ...state.tutorial, active: false, skipped: true },
  };
}

/**
 * Whether tutorial protection is active. Guards bot passivity (reduced
 * defender casualties). Both skip and hard-deactivation set `active=false`,
 * so this single check covers every deactivation path.
 */
export function isTutorialProtectionActive(state: GameState): boolean {
  return state.tutorial?.active === true;
}

/**
 * Evaluate the current tutorial objective. Called once per cycle late in
 * processCycle Tier-1. Self-guards when the tutorial is absent/inactive.
 *
 * Only the objective at the current index is evaluated, guaranteeing strict
 * in-order completion (a later objective's condition being met early does
 * nothing). At most one objective advances per call.
 */
export function advanceTutorial(state: GameState): void {
  const t = state.tutorial;
  if (!t || !t.active) return;

  // Hard deactivation after the max cycle — no further objective progress.
  // The cycle counter is pre-incremented in advanceCycle, so this fires on
  // the 10th processed cycle onward.
  if (state.time.currentCycle >= TUTORIAL_MAX_CYCLE) {
    t.active = false;
    return;
  }

  const objective = TUTORIAL_OBJECTIVES[t.objectiveIndex];
  if (!objective) return; // all objectives already complete

  let completed = false;
  switch (objective) {
    case "explore":
      completed = t.signals.includes("explored");
      break;
    case "expand": {
      const player = state.empires.get(state.playerEmpireId);
      completed = (player?.systemIds.length ?? 0) >= 2;
      break;
    }
    case "military":
      completed = countPlayerUnits(state) > t.baselineUnitCount;
      break;
    case "market":
      completed = t.signals.includes("market");
      break;
    case "combat-prep":
      completed =
        t.signals.includes("move-fleet") || t.signals.includes("attack");
      break;
  }

  if (completed) {
    t.completed.push(objective);
    t.objectiveIndex += 1;
  }
}
