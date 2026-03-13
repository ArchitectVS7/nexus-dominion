/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Engine Interface Contracts
   
   These abstract interfaces define the contracts that each
   engine subsystem must implement. Milestones fill these in.
   ══════════════════════════════════════════════════════════════ */

import type { GameState, CycleReport, Galaxy, GalaxyConfig, Fleet, CombatResult, StarSystem, BotAgent, BotAction } from "../types";

/* ── Cycle Processor (Milestone 1.5) ── */

export interface ICycleProcessor {
    /** Process one full cycle: production, consumption, events */
    process(state: GameState): { next: GameState; report: CycleReport };
}

/* ── Galaxy Generator (Milestone 1.3) ── */

export interface IGalaxyGenerator {
    /** Generate a new galaxy with empires placed */
    generate(config: GalaxyConfig): Galaxy;
}

/* ── Combat Resolver (Milestone 1.10) ── */

export interface ICombatResolver {
    /** Resolve a fleet engagement / ground assault */
    resolve(
        attacker: Fleet,
        defender: Fleet,
        terrain: StarSystem,
        state: GameState,
    ): CombatResult;
}

/* ── Bot Decision Engine (Milestone 1.7) ── */

export interface IBotDecisionEngine {
    /** Generate bot actions for one cycle */
    decide(bot: BotAgent, state: GameState): BotAction[];
}

/* ── State Persistence (Milestone 1.3) ── */

export interface IStatePersistence {
    /** Save the current game state */
    save(state: GameState): Promise<void>;
    /** Load a saved game state */
    load(campaignId: string): Promise<GameState | null>;
    /** List available save files */
    listSaves(): Promise<Array<{ id: string; name: string; savedAt: string }>>;
    /** Delete a save file */
    deleteSave(campaignId: string): Promise<void>;
}
