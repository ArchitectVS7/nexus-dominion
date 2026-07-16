/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Orders Queue (pure module)

   The turn-model refactor (PRD:158): player actions are queued locally
   and committed once per cycle instead of committing per-action.

   IMPORTANT — LIFETIME: queued orders live in React component state ONLY.
   They are never part of GameState, never persisted, and never saved.
   They exist only between a player's clicks and the COMMIT CYCLE that
   flushes them through the engine; a page reload discards them.

   This module is pure: no DOM, no localStorage, no Math.random, no Date,
   no id counters. Order ids are supplied by the caller (App keeps a ref
   counter) so this module stays fully deterministic and unit-testable.
   ══════════════════════════════════════════════════════════════ */

export interface QueuedOrder {
  /** Caller-supplied stable id (e.g. `ord-0`). Preserved across merges. */
  id: string;
  /** Engine action type (kebab-case), passed through unchanged to the engine. */
  type: string;
  /** Engine action details, passed through unchanged to the engine. */
  details: Record<string, unknown>;
  /** Human-readable label built by the caller at enqueue time. */
  label: string;
  /** Dedupe key; null means the order is freely stackable. */
  dedupeKey: string | null;
}

/** Input to {@link enqueueOrder} — id supplied by caller, dedupeKey derived here. */
export interface OrderInput {
  id: string;
  type: string;
  details: Record<string, unknown>;
  label: string;
}

/**
 * Dedupe strategy for an action family:
 * - `last-wins`   the incoming order replaces any existing order sharing its key
 * - `merge`       quantities of a numeric field are summed into the existing order
 * - `idempotent`  a duplicate (same key) is dropped; the first one stands
 * - `stackable`   no key — every order is independent (null dedupeKey)
 */
type DedupeKind = "last-wins" | "merge" | "idempotent" | "stackable";

interface RuleEntry {
  kind: DedupeKind;
  /** Derives the dedupe key from the action details. Absent for stackable rules. */
  keyOf?: (details: Record<string, unknown>) => string;
  /** For `merge` rules: the numeric details field whose values are summed. */
  mergeField?: string;
}

/* ── Table-driven dedupe rule registry ──
   One entry per engine action type. Any type NOT in the table falls back to
   the `default` rule (stackable) so an unmapped type never throws. */

const RULES: Record<string, RuleEntry> = {
  // system-intent family: colonise + attack on the same system share a key,
  // last-wins across the family (an attack replaces a queued colonise, etc.)
  "claim-system": {
    kind: "last-wins",
    keyOf: (d) => `system-intent:${d.systemId}`,
  },
  attack: {
    kind: "last-wins",
    keyOf: (d) => `system-intent:${d.targetSystemId}`,
  },

  // merges: repeated trades / funding sum their quantities
  trade: {
    kind: "merge",
    keyOf: (d) => `trade:${d.resource}:${d.direction}`,
    mergeField: "quantity",
  },
  "fund-syndicate": {
    kind: "merge",
    keyOf: () => `fund-syndicate`,
    mergeField: "amount",
  },

  // stackable: each build-unit is its own order
  "build-unit": { kind: "stackable" },

  // last-wins singles
  "move-fleet": { kind: "last-wins", keyOf: (d) => `move-fleet:${d.fleetId}` },
  "propose-pact": { kind: "last-wins", keyOf: (d) => `pact:${d.targetId}` },
  "launch-covert-op": { kind: "last-wins", keyOf: (d) => `covert:${d.targetId}` },
  research: { kind: "last-wins", keyOf: () => `research` },
  "select-doctrine": { kind: "last-wins", keyOf: () => `doctrine` },
  "select-specialization": { kind: "last-wins", keyOf: () => `specialization` },
  "build-wormhole": {
    kind: "last-wins",
    keyOf: (d) => `wormhole:${d.targetSystemId}`,
  },

  // idempotent: a duplicate order is a no-op
  "break-pact": { kind: "idempotent", keyOf: (d) => `break-pact:${d.pactId}` },
  "purchase-black-register": {
    kind: "idempotent",
    keyOf: (d) => `br:${d.itemId}`,
  },

  // build-installation: NOT specified in the task body. PLANNER DECISION —
  // idempotent per (systemId, installationType) so a double-tap on the same
  // installation for the same system doesn't stack, while different systems
  // or types remain independent. Flagged in the PR note for review; a switch
  // to stackable (null key) is a one-line change here.
  "build-installation": {
    kind: "idempotent",
    keyOf: (d) => `install:${d.systemId}:${d.installationType}`,
  },
};

/** Fallback for any action type not present in {@link RULES}. */
const DEFAULT_RULE: RuleEntry = { kind: "stackable" };

function ruleFor(type: string): RuleEntry {
  return RULES[type] ?? DEFAULT_RULE;
}

/**
 * Compute the dedupe key for an action. Returns null for stackable actions.
 * Exported for direct unit testing of the rule table.
 */
export function computeDedupeKey(
  type: string,
  details: Record<string, unknown>,
): string | null {
  const rule = ruleFor(type);
  if (rule.kind === "stackable" || !rule.keyOf) return null;
  return rule.keyOf(details);
}

/**
 * Recompute a merged order's label purely from its (merged) details. These
 * labels are pure functions of details — no game state needed — which is why
 * the merge path can own them. They MUST match the labels App builds at
 * enqueue time so merges stay visually consistent.
 */
function mergeLabel(type: string, details: Record<string, unknown>): string {
  if (type === "trade") {
    const direction = details.direction as string;
    const quantity = details.quantity as number;
    const resource = (details.resource as string).toUpperCase();
    return `${direction === "buy" ? "BUY" : "SELL"} ${quantity} ${resource}`;
  }
  if (type === "fund-syndicate") {
    return `FUND SYNDICATE — ${details.amount as number} CT`;
  }
  return "";
}

/**
 * Enqueue an order, applying the table-driven dedupe rule for its type.
 * Pure: returns a new array (or the same reference when an idempotent
 * duplicate is dropped and nothing changes).
 */
export function enqueueOrder(
  orders: QueuedOrder[],
  input: OrderInput,
): QueuedOrder[] {
  const rule = ruleFor(input.type);
  const dedupeKey = computeDedupeKey(input.type, input.details);

  const incoming: QueuedOrder = { ...input, dedupeKey };

  // Stackable — always append as an independent order.
  if (dedupeKey === null) {
    return [...orders, incoming];
  }

  const existingIndex = orders.findIndex((o) => o.dedupeKey === dedupeKey);

  // No existing order with this key — append.
  if (existingIndex === -1) {
    return [...orders, incoming];
  }

  // Idempotent — drop the duplicate, keep the existing order untouched.
  if (rule.kind === "idempotent") {
    return orders;
  }

  // Last-wins — replace the whole order in place at the existing index,
  // preserving tray ordering. The incoming type/details/label/id win, so
  // an attack can overwrite a queued colonise for the same system.
  if (rule.kind === "last-wins") {
    const next = orders.slice();
    next[existingIndex] = incoming;
    return next;
  }

  // Merge — sum the numeric field into a clone of the existing order,
  // recompute the label, keep the existing id + position.
  if (rule.kind === "merge" && rule.mergeField) {
    const existing = orders[existingIndex];
    const field = rule.mergeField;
    const mergedDetails = {
      ...existing.details,
      [field]:
        (existing.details[field] as number) + (incoming.details[field] as number),
    };
    const merged: QueuedOrder = {
      ...existing,
      details: mergedDetails,
      label: mergeLabel(input.type, mergedDetails),
    };
    const next = orders.slice();
    next[existingIndex] = merged;
    return next;
  }

  // Unreachable given the rule kinds above, but keep a safe fallback.
  return [...orders, incoming];
}

/** Remove an order by id. Pure. */
export function removeOrder(orders: QueuedOrder[], id: string): QueuedOrder[] {
  return orders.filter((o) => o.id !== id);
}

/**
 * Project the queue down to the engine action shape ({ type, details }),
 * dropping the UI-only id/label/dedupeKey and preserving order.
 */
export function toEngineActions(
  orders: QueuedOrder[],
): { type: string; details: Record<string, unknown> }[] {
  return orders.map((o) => ({ type: o.type, details: o.details }));
}
