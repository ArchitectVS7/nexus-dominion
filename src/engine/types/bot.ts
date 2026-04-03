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
    /** Intelligence tier (1=Apex, 2=Tactical, 3=Reactive, 4=Entropic) */
    intelligenceTier?: 1 | 2 | 3 | 4;
    /** Schemer betrayal clock — increments each cycle in pact */
    betrayalClock?: number;
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
    /** Emotional intensity (0.0–1.0). At 0.0, emotion has no mechanical effect. Decays each cycle. */
    resonance: number;
}

/* ── Bot Actions ── */

export type BotActionType =
    | "claim-system"
    | "build-installation"
    | "build-unit"
    | "attack"
    | "propose-pact"
    | "break-pact"
    | "trade"
    | "research"
    | "fortify";

export interface BotAction {
    type: BotActionType;
    empireId: EmpireId;
    targetSystemId?: SystemId;
    targetEmpireId?: EmpireId;
    details?: Record<string, unknown>;
}
