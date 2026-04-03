/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — GameState Serializer

   Handles JSON round-tripping of Map and Set instances that
   appear throughout the GameState tree. Uses tagged-object
   encoding: Maps → { __t: "Map", e: [...entries] },
   Sets → { __t: "Set", v: [...values] }.
   ══════════════════════════════════════════════════════════════ */

import type { GameState } from "../types/game-state";

/* ── Replacer: Map/Set → tagged plain objects ── */

function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Map) {
    return { __t: "Map", e: Array.from(value.entries()) };
  }
  if (value instanceof Set) {
    return { __t: "Set", v: Array.from(value) };
  }
  return value;
}

/* ── Reviver: tagged plain objects → Map/Set ── */

function reviver(_key: string, value: unknown): unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    "__t" in (value as Record<string, unknown>)
  ) {
    const tagged = value as Record<string, unknown>;
    if (tagged.__t === "Map" && Array.isArray(tagged.e)) {
      return new Map(tagged.e as [unknown, unknown][]);
    }
    if (tagged.__t === "Set" && Array.isArray(tagged.v)) {
      return new Set(tagged.v as unknown[]);
    }
  }
  return value;
}

/* ── Public API ── */

/**
 * Serialize a GameState to a JSON string.
 * All Map and Set instances are converted to tagged arrays
 * that can be losslessly restored by deserializeGameState.
 */
export function serializeGameState(state: GameState): string {
  return JSON.stringify(state, replacer);
}

/**
 * Deserialize a JSON string back into a GameState.
 * All tagged Map/Set structures are restored to native instances.
 */
export function deserializeGameState(json: string): GameState {
  return JSON.parse(json, reviver) as GameState;
}
