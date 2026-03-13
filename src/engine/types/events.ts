/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Game Event Types
   
   Events are produced during cycle processing and consumed
   by the UI (Cycle Report, notifications, combat modals).
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId, SystemId } from "./ids";
import type { Resources } from "./empire";
import type { CombatResult } from "./military";
import type { CosmicOrder } from "./time";
import type { PactType } from "./diplomacy";

/* ── Event Union ── */

export type GameEvent =
    | ResourceEvent
    | ColonisationEvent
    | CombatEvent
    | DiplomacyEvent
    | ReckoningEvent
    | AchievementEvent;

/* ── Specific Events ── */

export interface ResourceEvent {
    type: "resource";
    empireId: EmpireId;
    cycle: number;
    /** Net resource change this cycle */
    deltas: Partial<Resources>;
    /** Any deficit warnings */
    deficits: string[];
}

export interface ColonisationEvent {
    type: "colonisation";
    empireId: EmpireId;
    systemId: SystemId;
    cycle: number;
    cost: number;
}

export interface CombatEvent {
    type: "combat";
    cycle: number;
    result: CombatResult;
}

export interface DiplomacyEvent {
    type: "diplomacy";
    cycle: number;
    action: "pact-formed" | "pact-broken" | "coalition-formed" | "coalition-dissolved";
    involvedEmpires: EmpireId[];
    pactType?: PactType;
}

export interface ReckoningEvent {
    type: "reckoning";
    cycle: number;
    confluence: number;
    cosmicOrder: CosmicOrder;
}

export interface AchievementEvent {
    type: "achievement";
    empireId: EmpireId;
    cycle: number;
    achievementId: string;
    achievementName: string;
}

/* ── Cycle Report ── */

export interface CycleReport {
    cycle: number;
    events: GameEvent[];
    /** Summary stats for the player */
    playerResourceDeltas: Partial<Resources>;
    /** Whether a Nexus Reckoning occurred this cycle */
    reckoningOccurred: boolean;
}
