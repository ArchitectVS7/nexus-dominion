import { describe, it, expect } from "vitest";
import { processCycle, type PlayerActions } from "../cycle/cycle-processor";
import type { GameState } from "../types/game-state";
import type { Empire } from "../types/empire";
import type { StarSystem, Sector } from "../types/galaxy";
import type { BotAgent } from "../types/bot";
import { EmpireId, SystemId, SectorId } from "../types/ids";
import { computeCosmicOrder } from "../nexus/nexus-engine";
import { createUnitTypeRegistry } from "../military/unit-registry";

/**
 * Build a full game state with configurable empire count and systems.
 */
function makeGameState(empireCount: number = 10, systemsPerEmpire: number = 1): GameState {
  const systems = new Map<any, StarSystem>();
  const sectors = new Map<any, Sector>();
  const totalSystems = empireCount * systemsPerEmpire + 50; // extra unclaimed

  // Create sectors
  for (let s = 0; s < 10; s++) {
    const sectorId = SectorId(`sector-${s}`);
    sectors.set(sectorId, {
      id: sectorId,
      name: `Sector ${s}`,
      systemIds: [],
      centre: { x: s * 100, y: 0 },
    });
  }

  // Create systems
  for (let i = 0; i < totalSystems; i++) {
    const sysId = SystemId(`sys-${i}`);
    const sectorId = SectorId(`sector-${i % 10}`);
    const owner = i < empireCount ? EmpireId(`empire-${i}`) : null;
    const adj: SystemId[] = [];
    if (i > 0) adj.push(SystemId(`sys-${i - 1}`));
    if (i < totalSystems - 1) adj.push(SystemId(`sys-${i + 1}`));

    systems.set(sysId, {
      id: sysId,
      name: `System ${i}`,
      sectorId,
      position: { x: (i % 25) * 10, y: Math.floor(i / 25) * 10 },
      biome: i % 3 === 0 ? "verdant-world" as any : i % 3 === 1 ? "mineral-world" as any : "core-world" as any,
      owner,
      slots: [],
      baseProduction: {},
      adjacentSystemIds: adj,
      claimedCycle: owner ? 0 : null,
      isHomeSystem: i < empireCount,
    } as any);

    const sector = sectors.get(sectorId)!;
    (sector.systemIds as any[]).push(sysId);
  }

  // Build empires
  const empires = new Map<any, Empire>();
  for (let i = 0; i < empireCount; i++) {
    const id = EmpireId(`empire-${i}`);
    empires.set(id, {
      id,
      name: `Empire ${i}`,
      colour: `#${i.toString(16).padStart(3, "0")}`,
      isPlayer: i === 0,
      systemIds: [SystemId(`sys-${i}`)],
      homeSystemId: SystemId(`sys-${i}`),
      resources: { credits: 500, food: 200, ore: 100, fuelCells: 50, researchPoints: 200, intelligencePoints: 10 },
      stabilityScore: 50,
      stabilityLevel: "content" as const,
      population: 1000,
      populationCapacity: 5000,
      fleetIds: [],
      researchTier: 0,
      powerScore: (empireCount - i) * 10,
      buildQueue: [],
      globalReputation: 50,
    });
  }

  // Build bots
  const archetypes: any[] = ["warlord", "diplomat", "merchant", "schemer", "turtle", "blitzkrieg", "tech-rush", "opportunist"];
  const bots = new Map<any, BotAgent>();
  for (let i = 1; i < empireCount; i++) {
    const id = EmpireId(`empire-${i}`);
    bots.set(id, {
      empireId: id,
      archetype: archetypes[i % 8],
      momentumRating: i <= 2 ? 2.0 : i <= 5 ? 1.0 : 0.5,
      persona: { name: `Bot ${i}`, title: "Commander", backstory: "", speechStyle: "default" },
      emotionalState: { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 },
      intelligenceTier: (((i % 4) + 1) as 1 | 2 | 3 | 4),
    });
  }

  const cosmicOrder = computeCosmicOrder(empires as any);

  return {
    galaxy: { systems, sectors },
    empires,
    playerEmpireId: EmpireId("empire-0"),
    unitTypes: createUnitTypeRegistry(),
    units: new Map(),
    fleets: new Map(),
    bots,
    diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
    time: {
      currentCycle: 0,
      currentConfluence: 1,
      cyclesUntilReckoning: 10,
      cosmicOrder,
    },
    currentCycleEvents: [],
    campaign: { id: "integration-test", name: "Integration Test", createdAt: "2026-01-01", lastSavedAt: "2026-01-01", seed: 42 },
    market: {
      prices: { food: 5, ore: 8, fuelCells: 12 },
      basePrices: { food: 5, ore: 8, fuelCells: 12 },
      priceHistory: [],
    },
    earnedAchievements: new Map(),
  };
}

describe("Integration Tests", () => {
  it("10-cycle simulation: empires grow and resources change", () => {
    let state = makeGameState(10);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    for (let cycle = 0; cycle < 10; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      expect(result.committed).toBe(true);
      state = result.state;

      // Track power history
      for (const [id, empire] of state.empires) {
        if (!powerHistory.has(id)) powerHistory.set(id, []);
        powerHistory.get(id)!.push(empire.powerScore);
      }
    }

    // After 10 cycles, state should have advanced
    expect(state.time.currentCycle).toBe(10);

    // Player resources should have changed from initial
    const player = state.empires.get(EmpireId("empire-0"))!;
    expect(player.resources.credits).not.toBe(500);
  });

  it("player claims system during multi-cycle gameplay", () => {
    let state = makeGameState(5);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    // First unclaimed system adjacent to player's sys-0 is sys-1... wait, sys-1 is empire-1's.
    // The first unclaimed system is at index=empireCount (5)
    const unclaimedId = SystemId("sys-5");

    // Make sys-5 adjacent to sys-0
    const sys0 = state.galaxy.systems.get(SystemId("sys-0") as any)!;
    sys0.adjacentSystemIds.push(unclaimedId);

    const actions: PlayerActions = {
      actions: [{ type: "claim-system", details: { systemId: "sys-5" } }],
    };

    const result = processCycle(state, actions, powerHistory, botAccumulated);
    expect(result.committed).toBe(true);
    const player = result.state.empires.get(EmpireId("empire-0"))!;
    expect(player.systemIds).toContain(unclaimedId);
    expect(player.systemIds.length).toBe(2);
  });

  it("Nexus Reckoning at cycle 10 reshuffles Cosmic Order", () => {
    let state = makeGameState(10);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();
    let reckoningOccurred = false;

    for (let cycle = 0; cycle < 10; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      state = result.state;

      for (const [id, empire] of state.empires) {
        if (!powerHistory.has(id)) powerHistory.set(id, []);
        powerHistory.get(id)!.push(empire.powerScore);
      }

      if (result.report.reckoningOccurred) {
        reckoningOccurred = true;
      }
    }

    expect(reckoningOccurred).toBe(true);
    expect(state.time.cosmicOrder.tiers.size).toBe(10);
  });

  it("market prices fluctuate over 20 cycles", () => {
    let state = makeGameState(5);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    // Inflate initial prices to see decay
    state.market!.prices = { food: 50, ore: 80, fuelCells: 120 };

    const initialFoodPrice = state.market!.prices.food;

    for (let cycle = 0; cycle < 20; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      state = result.state;
    }

    // Prices should have decayed toward baseline
    expect(state.market!.prices.food).toBeLessThan(initialFoodPrice);
    // Market should have price history
    expect(state.market!.priceHistory.length).toBe(20);
  });

  it("100-empire 50-cycle stress test completes under 30 seconds", () => {
    let state = makeGameState(100);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    const start = performance.now();

    for (let cycle = 0; cycle < 50; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      expect(result.committed).toBe(true);
      state = result.state;

      for (const [id, empire] of state.empires) {
        if (!powerHistory.has(id)) powerHistory.set(id, []);
        powerHistory.get(id)!.push(empire.powerScore);
      }
    }

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(30000);
    expect(state.time.currentCycle).toBe(50);
  });

  it("deterministic: same seed + same actions = identical state after 5 cycles", () => {
    function runSimulation() {
      let state = makeGameState(5);
      const powerHistory = new Map<EmpireId, number[]>();
      const botAccumulated = new Map<EmpireId, number>();

      for (let cycle = 0; cycle < 5; cycle++) {
        const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
        state = result.state;
      }
      return state;
    }

    const state1 = runSimulation();
    const state2 = runSimulation();

    // Same seed + same actions should produce identical results
    const player1 = state1.empires.get(EmpireId("empire-0"))!;
    const player2 = state2.empires.get(EmpireId("empire-0"))!;
    expect(player1.resources.credits).toBe(player2.resources.credits);
    expect(player1.resources.food).toBe(player2.resources.food);
    expect(player1.powerScore).toBe(player2.powerScore);
    expect(state1.time.currentCycle).toBe(state2.time.currentCycle);
  });

  it("build unit → wait for completion → unit appears", () => {
    let state = makeGameState(3);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    // Cycle 1: player builds a fighter (buildTime = 1)
    const buildAction: PlayerActions = {
      actions: [{ type: "build-unit", details: { unitTypeId: "fighter" } }],
    };
    let result = processCycle(state, buildAction, powerHistory, botAccumulated);
    state = result.state;
    expect(state.empires.get(EmpireId("empire-0"))!.buildQueue!.length).toBe(1);

    // Cycle 2: fighter should complete
    result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
    state = result.state;
    expect(state.empires.get(EmpireId("empire-0"))!.buildQueue!.length).toBe(0);

    // A build-complete event should have been generated
    const buildEvents = result.report.events.filter(e => e.type === "build-complete");
    expect(buildEvents.length).toBeGreaterThan(0);
  });

  it("market events fire over 20-cycle simulation", () => {
    let state = makeGameState(5);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();
    const allEvents: any[] = [];

    for (let cycle = 0; cycle < 20; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      state = result.state;
      allEvents.push(...result.report.events);
    }

    const marketEvents = allEvents.filter(e => e.type === "market");
    expect(marketEvents.length).toBeGreaterThan(0);
  });

  it("100-cycle campaign regression: no crashes, economy stays bounded", () => {
    let state = makeGameState(10);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    for (let cycle = 0; cycle < 100; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      expect(result.committed).toBe(true);
      state = result.state;

      for (const [id, empire] of state.empires) {
        if (!powerHistory.has(id)) powerHistory.set(id, []);
        powerHistory.get(id)!.push(empire.powerScore);
      }
    }

    expect(state.time.currentCycle).toBe(100);

    // Economy should be bounded — no empire should have negative credits
    for (const [, empire] of state.empires) {
      expect(empire.resources.credits).toBeGreaterThanOrEqual(0);
      expect(empire.resources.food).toBeGreaterThanOrEqual(0);
    }

    // Multiple reckonings should have occurred (every 10 cycles)
    expect(state.time.cosmicOrder.tiers.size).toBe(10);

    // Market prices should still be positive
    if (state.market) {
      expect(state.market.prices.food).toBeGreaterThan(0);
      expect(state.market.prices.ore).toBeGreaterThan(0);
      expect(state.market.prices.fuelCells).toBeGreaterThan(0);
    }
  });

  it("achievement triggers when empire accumulates enough systems", () => {
    let state = makeGameState(5);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    // Give player enough systems to trigger Market Overlord (12+)
    const player = state.empires.get(EmpireId("empire-0"))!;
    for (let i = 5; i < 20; i++) {
      const sysId = SystemId(`sys-${i}`);
      const sys = state.galaxy.systems.get(sysId);
      if (sys && !sys.owner) {
        sys.owner = EmpireId("empire-0");
        player.systemIds.push(sysId);
      }
    }

    // Run a cycle so achievements are checked
    const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
    state = result.state;

    // Should have earned Market Overlord (12+ systems)
    const achievementEvents = result.report.events.filter(e => e.type === "achievement");
    const marketOverlord = achievementEvents.find((e: any) => e.achievementId === "market-overlord");
    expect(marketOverlord).toBeDefined();

    // Should be tracked in earnedAchievements
    expect(state.earnedAchievements?.get(EmpireId("empire-0"))?.has("market-overlord")).toBe(true);
  });

  it("convergence alert fires when empire nears achievement threshold", () => {
    let state = makeGameState(5);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    // Give player 10 of 12 systems needed for Market Overlord — 10/12 = 83% > 80% threshold
    const player = state.empires.get(EmpireId("empire-0"))!;
    for (let i = 5; i < 14; i++) {
      const sysId = SystemId(`sys-${i}`);
      const sys = state.galaxy.systems.get(sysId);
      if (sys && !sys.owner) {
        sys.owner = EmpireId("empire-0");
        player.systemIds.push(sysId);
      }
    }

    const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
    const alerts = result.report.events.filter(e => e.type === "convergence-alert");
    expect(alerts.length).toBeGreaterThan(0);
  });

  it("research progresses over multi-cycle simulation", () => {
    let state = makeGameState(5);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    // Give player lots of research points
    state.empires.get(EmpireId("empire-0"))!.resources.researchPoints = 5000;

    // Run research action + cycles
    for (let cycle = 0; cycle < 20; cycle++) {
      const actions: PlayerActions = {
        actions: [{ type: "research" }],
      };
      const result = processCycle(state, actions, powerHistory, botAccumulated);
      state = result.state;
    }

    // Player should have advanced research tier from 0
    const player = state.empires.get(EmpireId("empire-0"))!;
    expect(player.researchTier).toBeGreaterThan(0);
  });

  it("bot empires evolve independently over 50 cycles", () => {
    let state = makeGameState(10);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    const initialCredits = new Map<EmpireId, number>();
    for (const [id, empire] of state.empires) {
      initialCredits.set(id, empire.resources.credits);
    }

    for (let cycle = 0; cycle < 50; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      state = result.state;

      for (const [id, empire] of state.empires) {
        if (!powerHistory.has(id)) powerHistory.set(id, []);
        powerHistory.get(id)!.push(empire.powerScore);
      }
    }

    // Bot empires should have diverged from initial state
    let anyChanged = false;
    for (const [id, empire] of state.empires) {
      if (id === EmpireId("empire-0")) continue;
      if (empire.resources.credits !== initialCredits.get(id)) anyChanged = true;
    }
    expect(anyChanged).toBe(true);
  });

  it("Cosmic Order tiers redistribute across reckonings", () => {
    let state = makeGameState(10);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    let reckoningCount = 0;

    for (let cycle = 0; cycle < 30; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      state = result.state;

      for (const [id, empire] of state.empires) {
        if (!powerHistory.has(id)) powerHistory.set(id, []);
        powerHistory.get(id)!.push(empire.powerScore);
      }

      if (result.report.reckoningOccurred) reckoningCount++;
    }

    // Should have had ~3 reckonings (every 10 cycles)
    expect(reckoningCount).toBeGreaterThanOrEqual(2);

    // All empires should have cosmic tiers
    const tiers = state.time.cosmicOrder.tiers;
    expect(tiers.size).toBe(10);

    // Should have at least one sovereign and one stricken
    const tierValues = [...tiers.values()];
    expect(tierValues).toContain("sovereign");
    expect(tierValues).toContain("stricken");
  });

  it("emotional decay: bot emotions evolve and decay over cycles", () => {
    let state = makeGameState(5);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    for (let cycle = 0; cycle < 30; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      state = result.state;
    }

    // All bots should still have valid emotional states after 30 cycles
    for (const [, bot] of state.bots) {
      expect(bot.emotionalState).toBeDefined();
      expect(bot.emotionalState.resonance).toBeGreaterThanOrEqual(0);
      expect(bot.emotionalState.resonance).toBeLessThanOrEqual(1.0);
    }
  });

  it("syndicate state processes through cycle processor", () => {
    let state = makeGameState(5);

    // Add syndicate state with members
    state.syndicate = {
      members: new Map([
        [EmpireId("empire-1"), {
          empireId: EmpireId("empire-1"),
          rank: 2 as any,
          influence: 110, // should auto-promote to rank 2 (already is 2; 110 → stays 2, since rank 3 needs 200)
          shadowSignature: 40,
          exposed: false,
          discoveredCycle: 1,
        }],
        [EmpireId("empire-2"), {
          empireId: EmpireId("empire-2"),
          rank: 1 as any,
          influence: 220, // above rank-3 threshold (200) → should promote to rank 3
          shadowSignature: 10,
          exposed: false,
          discoveredCycle: 1,
        }],
      ]),
      controllerId: EmpireId("empire-1"),
      exposedEmpires: new Set<EmpireId>(),
    };

    const result = processCycle(state, { actions: [] }, new Map(), new Map());
    expect(result.committed).toBe(true);

    // Syndicate should have been processed
    const syndicate = result.state.syndicate!;
    expect(syndicate.members.size).toBe(2);

    // Empire-2 should have been promoted from rank 1 to rank 3
    const m2 = syndicate.members.get(EmpireId("empire-2"))!;
    expect(m2.rank).toBe(3);

    // Controller should have been recomputed (empire-2 rank 3 > empire-1 rank 2)
    expect(syndicate.controllerId).toBe(EmpireId("empire-2"));

    // Syndicate events should appear in cycle report
    const syndicateEvents = result.report.events.filter(e => e.type === "syndicate");
    expect(syndicateEvents.length).toBeGreaterThan(0);
  });

  it("covert operations resolve and affect empire resources through cycle", () => {
    let state = makeGameState(5);

    // Add covert state with a queued steal-credits op
    state.covert = {
      empireStates: new Map([
        [EmpireId("empire-1"), {
          empireId: EmpireId("empire-1"),
          agentPool: 500,
          intelLevel: 3,
          queuedOps: [{
            id: "empire-1-1-steal-credits",
            operationType: "steal-credits" as any,
            attackerId: EmpireId("empire-1"),
            targetId: EmpireId("empire-2"),
            queuedCycle: 1,
          }],
          totalOpsCompleted: 0,
          timesDetectedAsAttacker: 0,
        }],
        [EmpireId("empire-2"), {
          empireId: EmpireId("empire-2"),
          agentPool: 100,
          intelLevel: 0,
          queuedOps: [],
          totalOpsCompleted: 0,
          timesDetectedAsAttacker: 0,
        }],
      ]),
    };

    const result = processCycle(state, { actions: [] }, new Map(), new Map());
    expect(result.committed).toBe(true);

    // Covert events should appear in report
    const covertEvents = result.report.events.filter(e => e.type === "covert");
    expect(covertEvents.length).toBeGreaterThan(0);

    // Covert state should be updated
    expect(result.state.covert).toBeDefined();
  });

  it("stability cascades when food is consistently deficit", () => {
    let state = makeGameState(3);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    // Remove all food from player and set high population to ensure food deficit
    const player = state.empires.get(EmpireId("empire-0"))!;
    player.resources.food = 0;
    player.population = 4500; // high population → high food consumption

    const initialStability = player.stabilityScore;

    for (let cycle = 0; cycle < 15; cycle++) {
      const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      state = result.state;
    }

    // After 15 cycles of food deficit, stability should have dropped
    const finalPlayer = state.empires.get(EmpireId("empire-0"))!;
    expect(finalPlayer.stabilityScore).toBeLessThan(initialStability);
  });

  it("power score recalculates based on systems + credits + research", () => {
    let state = makeGameState(5);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    const player = state.empires.get(EmpireId("empire-0"))!;
    const initialPower = player.powerScore;

    // Give player extra systems to boost power
    for (let i = 5; i < 15; i++) {
      const sysId = SystemId(`sys-${i}`);
      const sys = state.galaxy.systems.get(sysId);
      if (sys && !sys.owner) {
        sys.owner = EmpireId("empire-0");
        player.systemIds.push(sysId);
      }
    }

    const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
    const updatedPlayer = result.state.empires.get(EmpireId("empire-0"))!;

    // Power score formula: systemIds.length * 10 + credits * 0.1 + researchTier * 20
    // More systems → higher power
    expect(updatedPlayer.powerScore).toBeGreaterThan(initialPower);
  });

  it("installation build queue completes and places installation in system slot", () => {
    let state = makeGameState(3);
    const powerHistory = new Map<EmpireId, number[]>();
    const botAccumulated = new Map<EmpireId, number>();

    // Set up system with an available slot
    const sys0 = state.galaxy.systems.get(SystemId("sys-0") as any)!;
    sys0.slots = [
      { locked: false, installation: null },
    ];

    // Add an installation to player's build queue (completes in 1 cycle)
    const player = state.empires.get(EmpireId("empire-0"))!;
    player.installationQueue = [{
      installationType: "mining-complex" as any,
      systemId: SystemId("sys-0"),
      startCycle: 0,
      completionCycle: 1, // completes this cycle
    }];

    const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
    expect(result.committed).toBe(true);

    // Installation queue should be empty
    const updatedPlayer = result.state.empires.get(EmpireId("empire-0"))!;
    expect(updatedPlayer.installationQueue!.length).toBe(0);

    // System should have an installation in its slot
    const updatedSys = result.state.galaxy.systems.get(SystemId("sys-0") as any)!;
    const filledSlot = updatedSys.slots.find(s => s.installation !== null);
    expect(filledSlot).toBeDefined();

    // Build-complete event should have fired
    const buildEvents = result.report.events.filter(e => e.type === "build-complete");
    expect(buildEvents.length).toBeGreaterThan(0);
  });

  it("multiple player actions in a single cycle", () => {
    let state = makeGameState(5);
    state.market = {
      prices: { food: 5, ore: 8, fuelCells: 12 },
      basePrices: { food: 5, ore: 8, fuelCells: 12 },
      priceHistory: [],
    };

    const actions: PlayerActions = {
      actions: [
        { type: "build-unit", details: { unitTypeId: "fighter" } },
        { type: "trade", details: { resource: "ore", quantity: 5, direction: "sell" } },
      ],
    };

    const result = processCycle(state, actions, new Map(), new Map());
    expect(result.committed).toBe(true);

    const player = result.state.empires.get(EmpireId("empire-0"))!;
    // Built a fighter (cost 100) and sold ore
    expect(player.buildQueue!.length).toBe(1);
    expect(player.resources.ore).toBeLessThan(100);
  });
});
