/**
 * In-Memory Game State
 *
 * Maintains all game state for simulation without database persistence.
 * Designed to mirror the real game state structure while being fast and isolated.
 */

import type { BotArchetype, BotTier } from "@/lib/bots/types";
import type {
  SimEmpire,
  SimSector,
  SectorType,
  CivilStatus,
  TurnSnapshot,
  EmpireSnapshot,
  GameConfig,
  AttackRecord,
} from "../types";
import { SeededRandom } from "./seeded-random";

// =============================================================================
// CONSTANTS (aligned with PRD starting values)
// =============================================================================

const STARTING_RESOURCES = {
  credits: 100000,
  food: 1000,
  ore: 500,
  petroleum: 200,
  researchPoints: 0,
} as const;

const STARTING_MILITARY = {
  soldiers: 100,
  fighters: 0,
  stations: 0,
  lightCruisers: 0,
  heavyCruisers: 0,
  carriers: 0,
  covertAgents: 0,
} as const;

const STARTING_POPULATION = {
  population: 10000,
  populationCap: 50000,
} as const;

const STARTING_SECTORS: Array<{ type: SectorType; productionRate: number }> = [
  { type: "food", productionRate: 160 },
  { type: "food", productionRate: 160 },
  { type: "ore", productionRate: 112 },
  { type: "ore", productionRate: 112 },
  { type: "petroleum", productionRate: 92 },
  { type: "tourism", productionRate: 8000 },
  { type: "urban", productionRate: 1000 },
  { type: "government", productionRate: 300 },
  { type: "research", productionRate: 100 },
];

const ALL_ARCHETYPES: BotArchetype[] = [
  "warlord",
  "diplomat",
  "merchant",
  "schemer",
  "turtle",
  "blitzkrieg",
  "tech_rush",
  "opportunist",
];

// =============================================================================
// GAME STATE CLASS
// =============================================================================

export class InMemoryGameState {
  readonly gameId: string;
  readonly seed: number;
  readonly config: GameConfig;

  // Core state
  currentTurn: number = 1;
  empires: Map<string, SimEmpire> = new Map();
  sectors: Map<string, SimSector[]> = new Map();

  // History tracking
  turnSnapshots: TurnSnapshot[] = [];
  attackRecords: AttackRecord[] = [];

  // Error tracking
  errors: string[] = [];

  private random: SeededRandom;

  private constructor(config: GameConfig, random: SeededRandom) {
    this.gameId = config.gameId;
    this.seed = config.seed;
    this.config = config;
    this.random = random;
  }

  // =============================================================================
  // FACTORY METHOD
  // =============================================================================

  static createFromConfig(config: GameConfig, random: SeededRandom): InMemoryGameState {
    const state = new InMemoryGameState(config, random);
    state.initializeEmpires();
    return state;
  }

  private initializeEmpires(): void {
    const archetypes = this.selectArchetypes();

    for (let i = 0; i < this.config.botCount; i++) {
      const empireId = this.random.nextId();
      const archetype = archetypes[i]!;
      const tier = this.selectTierForArchetype(i);

      const empire = this.createEmpire(empireId, i, archetype, tier);
      this.empires.set(empireId, empire);

      const sectors = this.createStartingSectors(empireId);
      this.sectors.set(empireId, sectors);
    }
  }

  private selectArchetypes(): BotArchetype[] {
    const archetypes: BotArchetype[] = [];
    const distribution = this.config.archetypeDistribution ?? "balanced";

    if (distribution === "custom" && this.config.customArchetypes) {
      // Use provided archetypes, cycling if needed
      for (let i = 0; i < this.config.botCount; i++) {
        archetypes.push(
          this.config.customArchetypes[i % this.config.customArchetypes.length]!
        );
      }
    } else if (distribution === "balanced") {
      // Distribute archetypes evenly
      for (let i = 0; i < this.config.botCount; i++) {
        archetypes.push(ALL_ARCHETYPES[i % ALL_ARCHETYPES.length]!);
      }
      // Shuffle to avoid predictable ordering
      return this.random.shuffle(archetypes);
    } else {
      // Random distribution
      for (let i = 0; i < this.config.botCount; i++) {
        archetypes.push(this.random.pick(ALL_ARCHETYPES));
      }
    }

    return archetypes;
  }

  private selectTierForArchetype(index: number): BotTier {
    // Distribution: 10% T1 LLM, 15% T1 Elite, 25% T2, 25% T3, 25% T4
    const roll = this.random.next();

    if (roll < 0.1) return "tier1_llm";
    if (roll < 0.25) return "tier1_elite_scripted";
    if (roll < 0.5) return "tier2_strategic";
    if (roll < 0.75) return "tier3_simple";
    return "tier4_random";
  }

  private createEmpire(
    id: string,
    index: number,
    archetype: BotArchetype,
    tier: BotTier
  ): SimEmpire {
    const name = `${this.capitalizeFirst(archetype)} Empire ${index + 1}`;
    const emperorName = `${this.capitalizeFirst(archetype)} Lord`;

    return {
      id,
      name,
      emperorName,
      type: "bot",
      botTier: tier,
      botArchetype: archetype,

      ...STARTING_RESOURCES,
      ...STARTING_MILITARY,
      ...STARTING_POPULATION,

      civilStatus: "content",
      networth: this.calculateNetworth(STARTING_RESOURCES.credits, STARTING_SECTORS.length),
      sectorCount: STARTING_SECTORS.length,
      isEliminated: false,
      eliminatedAtTurn: null,
      turnsPlayed: 0,
      protectionTurnsRemaining: this.config.protectionTurns ?? 20,
    };
  }

  private createStartingSectors(empireId: string): SimSector[] {
    return STARTING_SECTORS.map((template, i) => ({
      id: this.random.nextId(),
      empireId,
      type: template.type,
      productionRate: template.productionRate,
    }));
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace("_", " ");
  }

  private calculateNetworth(credits: number, sectorCount: number): number {
    // Simplified networth calculation
    return Math.round(sectorCount * 10 + credits / 10000);
  }

  // =============================================================================
  // STATE ACCESSORS
  // =============================================================================

  getEmpire(id: string): SimEmpire | undefined {
    return this.empires.get(id);
  }

  getActiveEmpires(): SimEmpire[] {
    return Array.from(this.empires.values()).filter((e) => !e.isEliminated);
  }

  getAllEmpires(): SimEmpire[] {
    return Array.from(this.empires.values());
  }

  getSectorsForEmpire(empireId: string): SimSector[] {
    return this.sectors.get(empireId) ?? [];
  }

  getEmpireCount(): number {
    return this.empires.size;
  }

  getActiveEmpireCount(): number {
    return this.getActiveEmpires().length;
  }

  // =============================================================================
  // STATE MUTATORS
  // =============================================================================

  updateEmpire(empire: SimEmpire): void {
    this.empires.set(empire.id, empire);
  }

  eliminateEmpire(empireId: string, eliminatedBy?: string): void {
    const empire = this.empires.get(empireId);
    if (empire && !empire.isEliminated) {
      empire.isEliminated = true;
      empire.eliminatedAtTurn = this.currentTurn;
      this.empires.set(empireId, empire);
    }
  }

  transferSectors(fromId: string, toId: string, count: number): void {
    const fromSectors = this.sectors.get(fromId) ?? [];
    const toSectors = this.sectors.get(toId) ?? [];

    const transferred = fromSectors.splice(0, count);
    transferred.forEach((s) => (s.empireId = toId));
    toSectors.push(...transferred);

    this.sectors.set(fromId, fromSectors);
    this.sectors.set(toId, toSectors);

    // Update empire sector counts
    const fromEmpire = this.empires.get(fromId);
    const toEmpire = this.empires.get(toId);
    if (fromEmpire) {
      fromEmpire.sectorCount = fromSectors.length;
    }
    if (toEmpire) {
      toEmpire.sectorCount = toSectors.length;
    }
  }

  addSector(empireId: string, sector: SimSector): void {
    const sectors = this.sectors.get(empireId) ?? [];
    sectors.push(sector);
    this.sectors.set(empireId, sectors);

    const empire = this.empires.get(empireId);
    if (empire) {
      empire.sectorCount = sectors.length;
    }
  }

  recordAttack(record: AttackRecord): void {
    this.attackRecords.push(record);
  }

  recordError(error: string): void {
    this.errors.push(`Turn ${this.currentTurn}: ${error}`);
  }

  // =============================================================================
  // SNAPSHOT FOR METRICS
  // =============================================================================

  takeSnapshot(): TurnSnapshot {
    const snapshot: TurnSnapshot = {
      turn: this.currentTurn,
      timestamp: Date.now(),
      empireSnapshots: Array.from(this.empires.values()).map((empire) => ({
        empireId: empire.id,
        archetype: empire.botArchetype,
        networth: empire.networth,
        sectorCount: empire.sectorCount,
        militaryPower: this.calculateMilitaryPower(empire),
        credits: empire.credits,
        population: empire.population,
        isEliminated: empire.isEliminated,
        civilStatus: empire.civilStatus,
      })),
    };

    this.turnSnapshots.push(snapshot);
    return snapshot;
  }

  calculateMilitaryPower(empire: SimEmpire): number {
    return (
      empire.soldiers +
      empire.fighters * 3 +
      empire.lightCruisers * 5 +
      empire.heavyCruisers * 8 +
      empire.carriers * 12 +
      empire.stations * 50
    );
  }

  // =============================================================================
  // RANKINGS
  // =============================================================================

  getRankings(): Array<{
    position: number;
    empire: SimEmpire;
    survivalTurns: number;
  }> {
    const empires = Array.from(this.empires.values());

    // Sort by: eliminated status (alive first), then networth
    empires.sort((a, b) => {
      if (a.isEliminated !== b.isEliminated) {
        return a.isEliminated ? 1 : -1;
      }
      return b.networth - a.networth;
    });

    return empires.map((empire, index) => ({
      position: index + 1,
      empire,
      survivalTurns: empire.isEliminated
        ? empire.eliminatedAtTurn ?? this.currentTurn
        : this.currentTurn,
    }));
  }
}
