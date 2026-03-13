/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Bot AI Types
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId, SystemId } from "./ids";

/* ── Archetypes ── */

export type Archetype =
    | "warlord"
    | "diplomat"
    | "merchant"
    | "schemer"
    | "turtle"
    | "blitzkrieg"
    | "tech-rush"
    | "opportunist";

/* ── Bot Agent ── */

export interface BotAgent {
    empireId: EmpireId;
    archetype: Archetype;
    /** How many actions per player cycle (0.5–3.0 typical) */
    momentumRating: number;
    persona: PersonaProfile;
    /** Current emotional state affects decision-making */
    emotionalState: EmotionalState;
}

export interface PersonaProfile {
    name: string;
    title: string;
    backstory: string;
    /** Speech patterns / flavour text template key */
    speechStyle: string;
}

export type Emotion =
    | "calm"
    | "aggressive"
    | "fearful"
    | "vengeful"
    | "ambitious"
    | "desperate";

export interface EmotionalState {
    current: Emotion;
    /** What triggered the current emotion */
    trigger: string;
    /** Cycle when state was last updated */
    lastUpdatedCycle: number;
}

/* ── Bot Actions ── */

export type BotActionType =
    | "claim-system"
    | "build-installation"
    | "build-unit"
    | "attack"
    | "propose-pact"
    | "break-pact"
    | "trade";

export interface BotAction {
    type: BotActionType;
    empireId: EmpireId;
    targetSystemId?: SystemId;
    targetEmpireId?: EmpireId;
    details?: Record<string, unknown>;
}
