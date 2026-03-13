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
