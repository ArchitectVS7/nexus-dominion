/**
 * Forced-Choice Events (Phase 2.1)
 *
 * Event-driven crises that present player choices and create dramatic moments.
 * Events trigger every 10-15 turns and require player decisions.
 *
 * Based on: docs/redesign-01-02-2026/RESEARCH-REDESIGN.md Phase 2 (Dramatic Moments)
 */

// ============================================
// TYPES
// ============================================

export type ForcedEventType =
  | "pirate_armada"
  | "market_crash"
  | "border_dispute"
  | "coalition_forming";

export type EventEffectType =
  | "avoid_combat"
  | "pirate_battle"
  | "coalition_defense"
  | "economic_stimulus"
  | "market_freeze"
  | "diplomatic_resolution"
  | "military_escalation";

export interface EventChoice {
  label: string;
  cost?: {
    credits?: number;
    sectors?: number;
    units?: number;
  };
  effect: EventEffectType;
  description: string;
}

export interface ForcedChoiceEvent {
  id: string;
  type: ForcedEventType;
  title: string;
  description: string;
  choices: EventChoice[];
  /** Turn at which this event was triggered */
  turn?: number;
}

// ============================================
// EVENT TEMPLATES
// ============================================

export const FORCED_EVENT_TEMPLATES: Record<ForcedEventType, Omit<ForcedChoiceEvent, "id" | "turn">> = {
  pirate_armada: {
    type: "pirate_armada",
    title: "PIRATE ARMADA DETECTED",
    description: "A massive pirate fleet approaches your territory. Intelligence reports 5,000 fighters and 20 heavy cruisers. Pay tribute, defend your sectors, or request coalition aid.",
    choices: [
      {
        label: "Pay Tribute",
        cost: { credits: 50000 },
        effect: "avoid_combat",
        description: "Avoid battle but lose 50,000 credits. Peaceful resolution.",
      },
      {
        label: "Defend Your Sectors",
        effect: "pirate_battle",
        description: "Fight the pirates. Risk heavy casualties but maintain honor.",
      },
      {
        label: "Request Coalition Aid",
        effect: "coalition_defense",
        description: "Call for allied support. Shares the burden but incurs diplomatic debt.",
      },
    ],
  },

  market_crash: {
    type: "market_crash",
    title: "GALACTIC MARKET CRASH",
    description: "A sudden market collapse has destabilized trade routes. Food and ore prices plummet 40%. Choose your response to this economic crisis.",
    choices: [
      {
        label: "Stockpile Resources",
        cost: { credits: 30000 },
        effect: "economic_stimulus",
        description: "Buy resources at low prices. Long-term benefit, immediate cost.",
      },
      {
        label: "Freeze Trading",
        effect: "market_freeze",
        description: "Suspend market operations until prices stabilize. No risk, no reward.",
      },
    ],
  },

  border_dispute: {
    type: "border_dispute",
    title: "BORDER DISPUTE ESCALATES",
    description: "A neighboring empire claims 3 of your sectors. Tensions are high. Yield territory, negotiate, or prepare for war.",
    choices: [
      {
        label: "Yield Territory",
        cost: { sectors: 3 },
        effect: "diplomatic_resolution",
        description: "Concede 3 sectors to avoid war. Peaceful but costly.",
      },
      {
        label: "Negotiate Border Treaty",
        cost: { credits: 25000 },
        effect: "diplomatic_resolution",
        description: "Pay diplomatic costs to resolve peacefully. Keep all sectors.",
      },
      {
        label: "Military Escalation",
        effect: "military_escalation",
        description: "Refuse all demands. High chance of war within 5 turns.",
      },
    ],
  },

  coalition_forming: {
    type: "coalition_forming",
    title: "ANTI-HEGEMONY COALITION",
    description: "The galaxy's weaker empires are forming a coalition against the dominant power. Join them for safety, or stand alone and face potential isolation.",
    choices: [
      {
        label: "Join Coalition",
        cost: { credits: 15000 },
        effect: "coalition_defense",
        description: "Contribute to coalition defense fund. Gain +10% defense vs leader.",
      },
      {
        label: "Remain Neutral",
        effect: "diplomatic_resolution",
        description: "Avoid entanglement. No benefits, no obligations.",
      },
    ],
  },
};

// ============================================
// EVENT TRIGGERING
// ============================================

/**
 * Minimum turns between forced-choice events
 */
export const MIN_TURNS_BETWEEN_EVENTS = 10;

/**
 * Maximum turns between forced-choice events
 */
export const MAX_TURNS_BETWEEN_EVENTS = 15;

/**
 * Turn at which forced events can start
 */
export const FORCED_EVENTS_START_TURN = 20;

/**
 * Get a random event template
 */
export function getRandomEventTemplate(): ForcedChoiceEvent {
  const eventTypes: ForcedEventType[] = ["pirate_armada", "market_crash", "border_dispute", "coalition_forming"];
  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] ?? "pirate_armada";
  const template = FORCED_EVENT_TEMPLATES[randomType];

  return {
    ...template,
    id: `${randomType}_${Date.now()}`,
  };
}

/**
 * Check if a forced event should trigger this turn
 */
export function shouldForcedEventTrigger(
  currentTurn: number,
  lastEventTurn: number
): boolean {
  if (currentTurn < FORCED_EVENTS_START_TURN) {
    return false;
  }

  const turnsSinceLast = currentTurn - lastEventTurn;
  const randomThreshold = MIN_TURNS_BETWEEN_EVENTS + Math.floor(Math.random() * (MAX_TURNS_BETWEEN_EVENTS - MIN_TURNS_BETWEEN_EVENTS));

  return turnsSinceLast >= randomThreshold;
}
