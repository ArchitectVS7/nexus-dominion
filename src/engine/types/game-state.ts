/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Master GameState Container
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId, UnitId } from "./ids";
import type { Galaxy } from "./galaxy";
import type { Empire } from "./empire";
import type { Fleet, Unit, UnitType } from "./military";
import type { DiplomacyState } from "./diplomacy";
import type { BotAgent } from "./bot";
import type { TimeState } from "./time";
import type { GameEvent } from "./events";
import type { SyndicateState } from "./syndicate";
import type { CovertState } from "./covert";

/* ── Market State ── */

export interface MarketPrices {
    food: number;
    ore: number;
    fuelCells: number;
}

export interface MarketState {
    prices: MarketPrices;
    basePrices: MarketPrices;
    priceHistory: MarketPrices[];
    /** Net trade volume this cycle: positive = net bought (demand), negative = net sold (supply) */
    cycleVolume?: { food: number; ore: number; fuelCells: number };
}

/* ── Tutorial State ── */

/**
 * Opt-in directed-start tutorial state. Plain arrays/objects only so the
 * generic Map/Set state serializer round-trips it without changes; old saves
 * (no `tutorial` key) deserialize with `tutorial === undefined`.
 */
export interface TutorialState {
    /** Whether the tutorial is currently guiding the player */
    active: boolean;
    /** Index into the ordered objective list of the current objective */
    objectiveIndex: number;
    /** Objective ids completed so far, in order */
    completed: string[];
    /** UI/action-reported signals recorded toward objectives */
    signals: string[];
    /** Player unit count (incl. build queue) captured at tutorial start */
    baselineUnitCount: number;
    /** Whether the player explicitly skipped the tutorial */
    skipped: boolean;
}

/* ── Game State ── */

export interface GameState {
    /** Galaxy map: sectors and star systems */
    galaxy: Galaxy;
    /** All empires (player + bots) */
    empires: Map<EmpireId, Empire>;
    /** The player's empire ID */
    playerEmpireId: EmpireId;
    /** All unit type definitions (shared registry) */
    unitTypes: Map<string, UnitType>;
    /** All unit instances */
    units: Map<UnitId, Unit>;
    /** All fleets */
    fleets: Map<string, Fleet>;
    /** Bot AI agents */
    bots: Map<EmpireId, BotAgent>;
    /** Diplomatic state */
    diplomacy: DiplomacyState;
    /** Time tracking and Cosmic Order */
    time: TimeState;
    /** Event log for the current cycle */
    currentCycleEvents: GameEvent[];
    /** Campaign metadata */
    campaign: CampaignMeta;
    /** Market state for resource trading */
    market?: MarketState;
    /** Rolling power history for cosmic order (last 5 cycles per empire) */
    powerHistory?: Map<EmpireId, number[]>;
    /** Earned achievements per empire */
    earnedAchievements?: Map<EmpireId, Set<string>>;
    /** Bot action accumulation for fractional momentum */
    botAccumulated?: Map<EmpireId, number>;
    /** Galactic Syndicate state — absent until first empire discovers the Syndicate */
    syndicate?: SyndicateState;
    /** Covert operations state — absent until any empire has a covert program */
    covert?: CovertState;
    /** Owned black register items per empire */
    ownedBlackRegisterItems?: Map<EmpireId, Set<string>>;
    /** Convergence alerts already sent (empire::achievement keys) to prevent duplicates */
    convergenceAlertsSent?: Set<string>;
    /** Opt-in directed-start tutorial; absent unless the campaign enabled it */
    tutorial?: TutorialState;
}

export interface CampaignMeta {
    id: string;
    name: string;
    createdAt: string;
    lastSavedAt: string;
    /** Galaxy generation seed for reproducibility */
    seed: number;
}

/* ── Save File ── */

export interface SaveFile {
    version: string;
    savedAt: string;
    state: GameState;
}
