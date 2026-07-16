/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — First-Play Flag (UI-side only)

   Tiny localStorage helper that remembers whether the player has ever
   started a campaign. Lives in the UI layer so the engine stays pure
   (no DOM/localStorage access). This module is the SOLE owner of the
   first-play key — read it via `isFirstPlay()`, set it via
   `markFirstPlayDone()`.
   ══════════════════════════════════════════════════════════════ */

/** localStorage key. Must remain exactly this string (persisted for players). */
const FIRST_PLAY_KEY = "nexus-dominion-first-play-complete";

/**
 * True when the player has never completed the first-play marker (i.e. this is
 * their first campaign). Fails safe to `true` when storage is unavailable
 * (private mode / SSR) so a new player always gets the tutorial.
 */
export function isFirstPlay(): boolean {
  try {
    return localStorage.getItem(FIRST_PLAY_KEY) === null;
  } catch {
    return true;
  }
}

/**
 * Mark the first play as done so subsequent NEW CAMPAIGN starts skip the
 * tutorial. Called immediately on the first NEW CAMPAIGN so abandoning that
 * campaign does not re-trigger the directed start.
 */
export function markFirstPlayDone(): void {
  try {
    localStorage.setItem(FIRST_PLAY_KEY, "1");
  } catch {
    /* storage unavailable — nothing to persist */
  }
}
