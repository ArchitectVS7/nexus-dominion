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
import type { SyndicateRank } from "./syndicate";
import type { CovertOperationType } from "./covert";

/* ── Event Union ── */

export type GameEvent =
    | ResourceEvent
    | ColonisationEvent
    | CombatEvent
    | DiplomacyEvent
    | ReckoningEvent
    | AchievementEvent
    | ResearchEvent
    | MarketEvent
    | BuildCompleteEvent
    | ConvergenceAlertEvent
    | NexusSignalEvent
    | SyndicateEvent
    | CovertEvent;

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

export interface ResearchEvent {
    type: "research";
    empireId: EmpireId;
    cycle: number;
    newTier: number;
    pathId?: string;
    specializationId?: string;
}

export interface MarketEvent {
    type: "market";
    cycle: number;
    eventKind: "supply-shock" | "bumper-harvest" | "famine" | "mining-boom" | "ore-shortage" | "fuel-crisis" | "refinery-glut" | "free-trade" | "trade-war";
    affectedResource?: string;
    priceChange: number;
}

export interface BuildCompleteEvent {
    type: "build-complete";
    empireId: EmpireId;
    cycle: number;
    unitTypeId: string;
    systemId: SystemId;
}

export interface ConvergenceAlertEvent {
    type: "convergence-alert";
    empireId: EmpireId;
    cycle: number;
    achievementId: string;
    progress: number;
}

export interface NexusSignalEvent {
    type: "nexus-signal";
    cycle: number;
    message: string;
}

export interface SyndicateEvent {
    type: "syndicate";
    cycle: number;
    kind:
      | "rank-up"
      | "controller-changed"
      | "empire-exposed"
      | "purge-coalition-formed"
      | "contract-completed";
    empireId: EmpireId;
    /** New rank (rank-up events) */
    newRank?: SyndicateRank;
    /** Previous controller (controller-changed events) */
    previousControllerId?: EmpireId | null;
}

export interface CovertEvent {
    type: "covert";
    cycle: number;
    kind: "op-succeeded" | "op-failed" | "op-detected";
    attackerId: EmpireId;
    targetId: EmpireId;
    operationType: CovertOperationType;
    /** Whether the operation succeeded (present on all covert events) */
    succeeded: boolean;
    /** For 'frame-another-empire', the empire that the target thinks committed the act */
    framedEmpireId?: EmpireId;
    /** Reputation penalty applied to the attacker (detection events only) */
    reputationHit?: number;
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
