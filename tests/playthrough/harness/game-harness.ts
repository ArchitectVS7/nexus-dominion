/**
 * Game Harness - Simulation Orchestrator
 *
 * Runs complete game simulations in-memory without database persistence.
 * Uses existing pure functions from src/lib/ for calculations.
 *
 * Key Design Principles:
 * 1. IMPORT pure functions (don't reimplement)
 * 2. INJECT randomness via SeededRandom
 * 3. SKIP non-essential systems (market, events, messages)
 * 4. PRESERVE weak-first initiative ordering
 */

import type {
  HarnessConfig,
  GameConfig,
  GameResult,
  VictoryCondition,
  SimEmpire,
  SimSector,
  DecisionRecord,
  AttackRecord,
  CasualtyReport,
  EmpireRanking,
} from "../types";
import type { BotArchetype, BotDecision, BotDecisionContext, EmpireTarget } from "@/lib/bots/types";
import type { Empire, Sector } from "@/lib/db/schema";

import { SeededRandom } from "./seeded-random";
import { InMemoryGameState } from "./game-state";

// =============================================================================
// IMPORTS FROM EXISTING PURE FUNCTIONS
// =============================================================================

// Resource calculations (100% pure - no DB calls)
import { calculateProduction } from "@/lib/game/services/economy/resource-engine";

// Population mechanics (100% pure - no DB calls)
import {
  calculateFoodConsumption,
  calculatePopulationGrowth,
  calculateStarvation,
} from "@/lib/game/services/population/population";

// Bot decision engine (pure when given random parameters)
import { generateBotDecision } from "@/lib/bots/decision-engine";

// Civil status evaluation (pure function)
import { getIncomeMultiplier } from "@/lib/game/services/population/civil-status";

// =============================================================================
// HARNESS CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: Partial<HarnessConfig> = {
  difficulty: "normal",
  protectionTurns: 20,
  archetypeDistribution: "balanced",
  debug: false,
  personalityVariance: false,
};

// =============================================================================
// TYPE ADAPTERS
// =============================================================================

/**
 * Convert SimEmpire to the Empire type shape expected by BotDecisionContext.
 *
 * This adapter bridges the in-memory simulation type (SimEmpire) to the
 * database schema type (Empire) required by the decision engine.
 * Default values are used for fields not tracked in simulation.
 */
function simEmpireToContextEmpire(empire: SimEmpire, gameId: string): Empire {
  return {
    // Identity
    id: empire.id,
    gameId,
    name: empire.name,
    emperorName: empire.emperorName,
    type: empire.type,

    // Bot-specific
    botTier: empire.botTier,
    botArchetype: empire.botArchetype,
    llmEnabled: false, // Harness doesn't use LLM

    // Resources
    credits: empire.credits,
    food: empire.food,
    ore: empire.ore,
    petroleum: empire.petroleum,
    researchPoints: empire.researchPoints,

    // Population
    population: empire.population,
    populationCap: empire.populationCap,
    civilStatus: empire.civilStatus,

    // Military
    soldiers: empire.soldiers,
    fighters: empire.fighters,
    stations: empire.stations,
    lightCruisers: empire.lightCruisers,
    heavyCruisers: empire.heavyCruisers,
    carriers: empire.carriers,
    covertAgents: empire.covertAgents,

    // Combat stats (defaults for simulation)
    armyEffectiveness: "85.00",
    covertPoints: 0,
    fundamentalResearchLevel: 0,

    // Computed stats
    networth: empire.networth,
    sectorCount: empire.sectorCount,
    reputation: 50, // Neutral reputation

    // Game state
    isEliminated: empire.isEliminated,
    eliminatedAtTurn: empire.eliminatedAtTurn,
    isBoss: false,
    bossEmergenceTurn: null,

    // Timestamps (not relevant for simulation)
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Validate that a string is a valid BotArchetype.
 * Returns the archetype or null if invalid.
 */
function validateArchetype(archetype: string): BotArchetype | null {
  const validArchetypes: BotArchetype[] = [
    "warlord",
    "diplomat",
    "merchant",
    "schemer",
    "turtle",
    "blitzkrieg",
    "tech_rush",
    "opportunist",
  ];
  return validArchetypes.includes(archetype as BotArchetype)
    ? (archetype as BotArchetype)
    : null;
}

// =============================================================================
// GAME HARNESS CLASS
// =============================================================================

export class GameHarness {
  private state: InMemoryGameState;
  private random: SeededRandom;
  private config: GameConfig;
  private startTime: number = 0;

  constructor(config: HarnessConfig) {
    const seed = config.seed ?? Date.now();
    this.random = new SeededRandom(seed);

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      gameId: this.random.nextId(),
      seed,
    } as GameConfig;

    this.state = InMemoryGameState.createFromConfig(this.config, this.random);
  }

  // =============================================================================
  // MAIN SIMULATION LOOP
  // =============================================================================

  async runGame(): Promise<GameResult> {
    this.startTime = Date.now();

    if (this.config.debug) {
      console.log(`\n=== Starting Game ${this.config.gameId} ===`);
      console.log(`Seed: ${this.config.seed}`);
      console.log(`Bots: ${this.config.botCount}`);
      console.log(`Max Turns: ${this.config.maxTurns}`);
    }

    // Take initial snapshot
    this.state.takeSnapshot();

    // Main game loop
    while (!this.isGameComplete()) {
      try {
        await this.processTurn();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.state.recordError(`Turn processing failed: ${message}`);

        if (this.config.debug) {
          console.error(`Turn ${this.state.currentTurn} error:`, error);
        }
      }

      this.state.currentTurn++;

      // Safety check to prevent infinite loops
      if (this.state.currentTurn > this.config.maxTurns + 10) {
        this.state.recordError("Game exceeded max turns safety limit");
        break;
      }
    }

    return this.buildResult();
  }

  // =============================================================================
  // TURN PROCESSING
  // =============================================================================

  private async processTurn(): Promise<void> {
    if (this.config.debug && this.state.currentTurn % 10 === 0) {
      console.log(`\n--- Turn ${this.state.currentTurn} ---`);
    }

    const activeEmpires = this.state.getActiveEmpires();

    // Phase 1-3: Economy for all empires (PURE FUNCTIONS)
    for (const empire of activeEmpires) {
      this.processEmpireEconomy(empire);
    }

    // Phase 5: Generate bot decisions (with seeded random)
    const decisions = this.generateAllBotDecisions(activeEmpires);

    // Separate attacks from non-attacks
    const attacks: DecisionRecord[] = [];
    const nonAttacks: DecisionRecord[] = [];

    for (const decision of decisions) {
      if (decision.decision.type === "attack") {
        attacks.push(decision);
      } else {
        nonAttacks.push(decision);
      }
    }

    // Phase 5b: Execute non-attacks SEQUENTIALLY (prevent race conditions)
    for (const record of nonAttacks) {
      this.executeDecision(record);
    }

    // Phase 5c: Execute attacks in WEAK-FIRST order
    const sortedAttacks = this.sortAttacksWeakFirst(attacks);
    for (const record of sortedAttacks) {
      this.executeDecision(record);
    }

    // Decrement protection turns
    for (const empire of this.state.getActiveEmpires()) {
      if (empire.protectionTurnsRemaining > 0) {
        empire.protectionTurnsRemaining--;
      }
      empire.turnsPlayed++;
    }

    // Check for eliminations
    this.checkEliminations();

    // Take turn snapshot for metrics
    this.state.takeSnapshot();
  }

  // =============================================================================
  // PHASE 1-3: ECONOMY (using pure functions from src/lib/)
  // =============================================================================

  private processEmpireEconomy(empire: SimEmpire): void {
    const sectors = this.state.getSectorsForEmpire(empire.id);

    // Convert SimSector[] to Sector[] for calculateProduction
    const sectorData = sectors.map((s) => ({
      id: s.id,
      empireId: s.empireId,
      gameId: this.config.gameId,
      type: s.type,
      name: null,
      productionRate: String(s.productionRate),
      purchasePrice: 0,
      acquiredAtTurn: 1,
      createdAt: new Date(),
    })) as Sector[];

    // Phase 1: Calculate production (PURE FUNCTION)
    const production = calculateProduction(sectorData);

    // Apply civil status income multiplier (PURE FUNCTION)
    const incomeMultiplier = getIncomeMultiplier(empire.civilStatus);
    const adjustedCredits = Math.floor(production.credits * incomeMultiplier);

    // Phase 2: Population (PURE FUNCTIONS)
    const foodConsumed = calculateFoodConsumption(empire.population);
    const foodBalance = empire.food + production.food - foodConsumed;

    let populationChange = 0;
    if (foodBalance >= 0) {
      // Fed - calculate growth
      populationChange = calculatePopulationGrowth(empire.population, empire.populationCap);
      empire.food = foodBalance;
    } else {
      // Starving - calculate loss
      const deficit = Math.abs(foodBalance);
      populationChange = calculateStarvation(empire.population, deficit);
      empire.food = 0;
    }

    // Apply changes
    empire.credits += adjustedCredits;
    empire.food += production.food;
    empire.ore += production.ore;
    empire.petroleum += production.petroleum;
    empire.researchPoints += production.researchPoints;
    empire.population = Math.max(0, empire.population + populationChange);

    // Update networth (simplified calculation)
    empire.networth = this.calculateNetworth(empire);

    this.state.updateEmpire(empire);
  }

  private calculateNetworth(empire: SimEmpire): number {
    const militaryValue =
      empire.soldiers * 0.05 +
      empire.fighters * 1 +
      empire.lightCruisers * 5 +
      empire.heavyCruisers * 10 +
      empire.carriers * 20 +
      empire.stations * 15;

    const sectorValue = empire.sectorCount * 10;
    const creditValue = empire.credits / 10000;

    return Math.round(sectorValue + creditValue + militaryValue);
  }

  // =============================================================================
  // PHASE 5: BOT DECISIONS (using decision-engine.ts)
  // =============================================================================

  private generateAllBotDecisions(empires: SimEmpire[]): DecisionRecord[] {
    const decisions: DecisionRecord[] = [];
    const allEmpires = this.state.getAllEmpires();

    for (const empire of empires) {
      const context = this.buildDecisionContext(empire, allEmpires);

      // Generate decision using pure function with injected randomness
      const randomType = this.random.next();
      const randomDecision = this.random.next();

      try {
        const decision = generateBotDecision(context, randomType, randomDecision);

        decisions.push({
          turn: this.state.currentTurn,
          empireId: empire.id,
          empireName: empire.name,
          archetype: empire.botArchetype,
          decision,
          executed: false,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        decisions.push({
          turn: this.state.currentTurn,
          empireId: empire.id,
          empireName: empire.name,
          archetype: empire.botArchetype,
          decision: { type: "do_nothing" },
          executed: false,
          error: message,
        });
      }
    }

    return decisions;
  }

  private buildDecisionContext(
    empire: SimEmpire,
    allEmpires: SimEmpire[]
  ): BotDecisionContext {
    const sectors = this.state.getSectorsForEmpire(empire.id);

    // Convert to schema types
    const sectorData = sectors.map((s) => ({
      id: s.id,
      empireId: s.empireId,
      gameId: this.config.gameId,
      type: s.type,
      name: null,
      productionRate: String(s.productionRate),
      purchasePrice: 0,
      acquiredAtTurn: 1,
      createdAt: new Date(),
    })) as Sector[];

    // Build target list (exclude self and eliminated)
    const availableTargets: EmpireTarget[] = allEmpires
      .filter((e) => e.id !== empire.id && !e.isEliminated)
      .map((e) => ({
        id: e.id,
        name: e.name,
        networth: e.networth,
        sectorCount: e.sectorCount,
        isBot: e.type === "bot",
        isEliminated: e.isEliminated,
        militaryPower: this.state.calculateMilitaryPower(e),
        hasTreaty: false, // Simplified: no treaties in harness
      }));

    // Convert SimEmpire to Empire type for BotDecisionContext
    const empireForContext = simEmpireToContextEmpire(empire, this.config.gameId);

    return {
      empire: empireForContext,
      sectors: sectorData,
      gameId: this.config.gameId,
      currentTurn: this.state.currentTurn,
      protectionTurns: this.config.protectionTurns ?? 20,
      difficulty: this.config.difficulty ?? "normal",
      availableTargets,
      // Simplified: no emotional state in harness
      emotionalState: undefined,
      permanentGrudges: undefined,
    };
  }

  // =============================================================================
  // WEAK-FIRST INITIATIVE
  // =============================================================================

  private sortAttacksWeakFirst(attacks: DecisionRecord[]): DecisionRecord[] {
    return attacks.sort((a, b) => {
      const empireA = this.state.getEmpire(a.empireId);
      const empireB = this.state.getEmpire(b.empireId);
      return (empireA?.networth ?? 0) - (empireB?.networth ?? 0);
    });
  }

  // =============================================================================
  // DECISION EXECUTION
  // =============================================================================

  private executeDecision(record: DecisionRecord): void {
    const empire = this.state.getEmpire(record.empireId);
    if (!empire || empire.isEliminated) {
      record.executed = false;
      record.error = "Empire not found or eliminated";
      return;
    }

    try {
      switch (record.decision.type) {
        case "build_units":
          this.executeBuildUnits(empire, record.decision);
          break;

        case "buy_sector":
          this.executeBuySector(empire, record.decision);
          break;

        case "attack":
          this.executeAttack(empire, record.decision);
          break;

        case "trade":
          this.executeTrade(empire, record.decision);
          break;

        case "do_nothing":
          // No action needed
          break;

        // Simplified: skip advanced systems
        case "diplomacy":
        case "craft_component":
        case "accept_contract":
        case "purchase_black_market":
        case "covert_operation":
        case "fund_research":
        case "upgrade_units":
          // Stub: treat as do_nothing for MVP
          break;

        default:
          record.error = `Unknown decision type`;
      }

      record.executed = true;
    } catch (error) {
      record.executed = false;
      record.error = error instanceof Error ? error.message : String(error);
    }

    this.state.updateEmpire(empire);
  }

  private executeBuildUnits(
    empire: SimEmpire,
    decision: Extract<BotDecision, { type: "build_units" }>
  ): void {
    const { unitType, quantity } = decision;

    // Simplified unit costs
    const costs: Record<string, number> = {
      soldiers: 50,
      fighters: 100,
      stations: 150,
      lightCruisers: 300,
      heavyCruisers: 500,
      carriers: 1000,
      covertAgents: 3000,
    };

    const cost = (costs[unitType] ?? 100) * quantity;
    if (empire.credits < cost) return;

    empire.credits -= cost;

    // Add units
    switch (unitType) {
      case "soldiers":
        empire.soldiers += quantity;
        break;
      case "fighters":
        empire.fighters += quantity;
        break;
      case "stations":
        empire.stations += quantity;
        break;
      case "lightCruisers":
        empire.lightCruisers += quantity;
        break;
      case "heavyCruisers":
        empire.heavyCruisers += quantity;
        break;
      case "carriers":
        empire.carriers += quantity;
        break;
      case "covertAgents":
        empire.covertAgents += quantity;
        break;
    }
  }

  private executeBuySector(
    empire: SimEmpire,
    decision: Extract<BotDecision, { type: "buy_sector" }>
  ): void {
    const { sectorType } = decision;

    // Simplified sector costs
    const baseCost = 8000;
    const scalingFactor = 1 + empire.sectorCount * 0.05;
    const cost = Math.floor(baseCost * scalingFactor);

    if (empire.credits < cost) return;

    empire.credits -= cost;

    // Add sector
    const newSector = {
      id: this.random.nextId(),
      empireId: empire.id,
      type: sectorType,
      productionRate: this.getDefaultProductionRate(sectorType),
    };

    this.state.addSector(empire.id, newSector);
    empire.sectorCount++;
  }

  private getDefaultProductionRate(type: string): number {
    const rates: Record<string, number> = {
      food: 160,
      ore: 112,
      petroleum: 92,
      tourism: 8000,
      urban: 1000,
      government: 300,
      research: 100,
      education: 0,
      supply: 0,
      anti_pollution: 0,
    };
    return rates[type] ?? 100;
  }

  /**
   * Execute attack using SIMPLIFIED combat resolution.
   *
   * IMPORTANT: This differs from the real game's 3-phase combat system:
   *
   * Real Game (combat-service.ts, volley-combat-v2.ts):
   * - 3 phases: Space Battle -> Orbital Bombardment -> Ground Invasion
   * - Unit effectiveness matrix (fighters beat ground troops, etc.)
   * - Volley-based combat with diminishing forces
   * - Retreat mechanics and morale effects
   * - Army effectiveness modifiers
   *
   * Simulation (for balance testing speed):
   * - Single power comparison: attacker vs defender total military power
   * - Fixed casualty rates: winner loses 10%, loser loses 30%
   * - No unit type effectiveness bonuses
   * - No retreat mechanics
   * - Sector transfer: 20% of defender's sectors (minimum 1)
   *
   * This simplification is intentional for:
   * - Performance: 1000+ games per minute
   * - Balance validation: archetypes compared on equal footing
   * - Statistical significance: enough games to detect balance issues
   *
   * For detailed combat testing, use E2E tests with the real combat system.
   */
  private executeAttack(
    empire: SimEmpire,
    decision: Extract<BotDecision, { type: "attack" }>
  ): void {
    const { targetId, forces } = decision;

    // Can't attack during protection
    if (empire.protectionTurnsRemaining > 0) return;

    const target = this.state.getEmpire(targetId);
    if (!target || target.isEliminated) return;
    if (target.protectionTurnsRemaining > 0) return;

    // SIMPLIFIED: Single power comparison (see docstring above)
    const attackerPower = this.calculateCombatPower(empire, forces);
    const defenderPower = this.state.calculateMilitaryPower(target);

    const attackerWins = attackerPower > defenderPower;

    // SIMPLIFIED: Fixed casualty rates (10% for winner, 30% for loser)
    const attackerLossRate = attackerWins ? 0.1 : 0.3;
    const defenderLossRate = attackerWins ? 0.3 : 0.1;

    const attackerCasualties = this.applyCasualties(empire, attackerLossRate);
    const defenderCasualties = this.applyCasualties(target, defenderLossRate);

    // Transfer sectors if attacker wins
    let sectorsTransferred = 0;
    if (attackerWins && target.sectorCount > 0) {
      sectorsTransferred = Math.min(
        Math.max(1, Math.floor(target.sectorCount * 0.2)),
        target.sectorCount - 1 // Leave at least 1 sector
      );
      this.state.transferSectors(target.id, empire.id, sectorsTransferred);
      empire.sectorCount += sectorsTransferred;
      target.sectorCount -= sectorsTransferred;
    }

    // Record attack for metrics
    this.state.recordAttack({
      turn: this.state.currentTurn,
      attackerId: empire.id,
      attackerName: empire.name,
      attackerArchetype: empire.botArchetype,
      defenderId: target.id,
      defenderName: target.name,
      defenderArchetype: target.botArchetype,
      attackerWon: attackerWins,
      sectorsTransferred,
      attackerCasualties,
      defenderCasualties,
    });

    this.state.updateEmpire(target);
  }

  private calculateCombatPower(
    _empire: SimEmpire,
    forces: { soldiers: number; fighters: number; stations: number; lightCruisers: number; heavyCruisers: number; carriers: number }
  ): number {
    return (
      forces.soldiers +
      forces.fighters * 3 +
      forces.lightCruisers * 5 +
      forces.heavyCruisers * 8 +
      forces.carriers * 12
    );
  }

  private applyCasualties(empire: SimEmpire, lossRate: number): CasualtyReport {
    const casualties: CasualtyReport = {
      soldiers: Math.floor(empire.soldiers * lossRate),
      fighters: Math.floor(empire.fighters * lossRate),
      stations: Math.floor(empire.stations * lossRate * 0.5), // Stations harder to destroy
      lightCruisers: Math.floor(empire.lightCruisers * lossRate),
      heavyCruisers: Math.floor(empire.heavyCruisers * lossRate),
      carriers: Math.floor(empire.carriers * lossRate),
    };

    empire.soldiers -= casualties.soldiers;
    empire.fighters -= casualties.fighters;
    empire.stations -= casualties.stations;
    empire.lightCruisers -= casualties.lightCruisers;
    empire.heavyCruisers -= casualties.heavyCruisers;
    empire.carriers -= casualties.carriers;

    return casualties;
  }

  private executeTrade(
    empire: SimEmpire,
    decision: Extract<BotDecision, { type: "trade" }>
  ): void {
    const { resource, quantity, action } = decision;

    // Simplified market prices
    const prices: Record<string, number> = {
      food: 2,
      ore: 5,
      petroleum: 10,
    };

    const price = prices[resource] ?? 1;
    const totalCost = price * quantity;

    if (action === "buy") {
      if (empire.credits >= totalCost) {
        empire.credits -= totalCost;
        switch (resource) {
          case "food":
            empire.food += quantity;
            break;
          case "ore":
            empire.ore += quantity;
            break;
          case "petroleum":
            empire.petroleum += quantity;
            break;
        }
      }
    } else {
      // Sell
      const available =
        resource === "food"
          ? empire.food
          : resource === "ore"
            ? empire.ore
            : empire.petroleum;

      if (available >= quantity) {
        switch (resource) {
          case "food":
            empire.food -= quantity;
            break;
          case "ore":
            empire.ore -= quantity;
            break;
          case "petroleum":
            empire.petroleum -= quantity;
            break;
        }
        empire.credits += totalCost;
      }
    }
  }

  // =============================================================================
  // VICTORY CONDITIONS
  // =============================================================================

  private isGameComplete(): boolean {
    // Turn limit
    if (this.state.currentTurn >= this.config.maxTurns) {
      return true;
    }

    // Check elimination
    const activeCount = this.state.getActiveEmpireCount();
    if (activeCount <= 1) {
      return true;
    }

    // Check conquest (60% sectors)
    const totalSectors = this.state
      .getAllEmpires()
      .reduce((sum, e) => sum + e.sectorCount, 0);

    for (const empire of this.state.getActiveEmpires()) {
      if (empire.sectorCount / totalSectors >= 0.6) {
        return true;
      }
    }

    return false;
  }

  private checkEliminations(): void {
    for (const empire of this.state.getActiveEmpires()) {
      if (empire.sectorCount <= 0 || empire.population <= 0) {
        this.state.eliminateEmpire(empire.id);

        if (this.config.debug) {
          console.log(
            `  ${empire.name} (${empire.botArchetype}) eliminated at turn ${this.state.currentTurn}`
          );
        }
      }
    }
  }

  private determineVictoryCondition(): VictoryCondition {
    const activeEmpires = this.state.getActiveEmpires();

    if (activeEmpires.length === 0) {
      return "mutual_destruction";
    }

    if (activeEmpires.length === 1) {
      return "elimination";
    }

    // Check conquest
    const totalSectors = this.state
      .getAllEmpires()
      .reduce((sum, e) => sum + e.sectorCount, 0);

    for (const empire of activeEmpires) {
      if (empire.sectorCount / totalSectors >= 0.6) {
        return "conquest";
      }
    }

    // Turn limit reached
    if (this.state.currentTurn >= this.config.maxTurns) {
      return "turn_limit";
    }

    return "none";
  }

  // =============================================================================
  // BUILD RESULT
  // =============================================================================

  private buildResult(): GameResult {
    const victoryCondition = this.determineVictoryCondition();
    const rankings = this.state.getRankings();
    const winner = rankings[0];

    const finalRankings: EmpireRanking[] = rankings.map(({ position, empire, survivalTurns }) => ({
      position,
      empireId: empire.id,
      empireName: empire.name,
      archetype: empire.botArchetype,
      tier: empire.botTier,
      finalNetworth: empire.networth,
      finalSectorCount: empire.sectorCount,
      survivalTurns,
      wasEliminated: empire.isEliminated,
      eliminatedBy: null, // Could track this if needed
    }));

    const durationMs = Date.now() - this.startTime;

    if (this.config.debug) {
      console.log(`\n=== Game Complete ===`);
      console.log(`Victory: ${victoryCondition}`);
      console.log(`Winner: ${winner?.empire.name} (${winner?.empire.botArchetype})`);
      console.log(`Turns: ${this.state.currentTurn}`);
      console.log(`Duration: ${durationMs}ms`);
    }

    return {
      gameId: this.config.gameId,
      seed: this.config.seed,
      victoryCondition,
      winnerId: winner?.empire.id ?? null,
      winnerName: winner?.empire.name ?? null,
      winnerArchetype: winner?.empire.botArchetype ?? null,
      turnsPlayed: this.state.currentTurn,
      durationMs,
      finalEmpires: this.state.getAllEmpires(),
      finalRankings,
      turnSnapshots: this.state.turnSnapshots,
      attackRecords: this.state.attackRecords,
      errors: this.state.errors,
    };
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Run a quick game with default settings
 */
export async function runQuickGame(
  bots: number = 4,
  maxTurns: number = 30,
  seed?: number
): Promise<GameResult> {
  const harness = new GameHarness({
    botCount: bots,
    maxTurns,
    seed,
    debug: false,
  });
  return harness.runGame();
}

/**
 * Run a 1v1 matchup between two archetypes
 */
export async function runMatchup(
  archetype1: string,
  archetype2: string,
  maxTurns: number = 50,
  seed?: number
): Promise<GameResult> {
  // Validate archetypes before creating harness
  const validArch1 = validateArchetype(archetype1);
  const validArch2 = validateArchetype(archetype2);

  if (!validArch1) {
    throw new Error(`Invalid archetype: "${archetype1}". Valid archetypes: warlord, diplomat, merchant, schemer, turtle, blitzkrieg, tech_rush, opportunist`);
  }
  if (!validArch2) {
    throw new Error(`Invalid archetype: "${archetype2}". Valid archetypes: warlord, diplomat, merchant, schemer, turtle, blitzkrieg, tech_rush, opportunist`);
  }

  const harness = new GameHarness({
    botCount: 2,
    maxTurns,
    seed,
    archetypeDistribution: "custom",
    customArchetypes: [validArch1, validArch2],
    debug: false,
  });
  return harness.runGame();
}
