import { describe, it, expect } from "vitest";
import { processCycle, type PlayerActions } from "./cycle-processor";
import type { GameState } from "../types/game-state";
import type { Empire } from "../types/empire";
import type { StarSystem, Sector } from "../types/galaxy";
import type { TimeState } from "../types/time";
import type { BotAgent } from "../types/bot";
import { EmpireId, SystemId, SectorId } from "../types/ids";
import { computeCosmicOrder } from "../nexus/nexus-engine";

function makeMinimalGameState(empireCount: number = 5): GameState {
  // Build galaxy
  const systems = new Map<any, StarSystem>();
  const sectors = new Map<any, Sector>();

  for (let s = 0; s < 2; s++) {
    const sectorId = SectorId(`sector-${s}`);
    const sysIds: any[] = [];
    for (let i = 0; i < 5; i++) {
      const idx = s * 5 + i;
      const sysId = SystemId(`sys-${idx}`);
      sysIds.push(sysId);
      systems.set(sysId, {
        id: sysId,
        name: `System ${idx}`,
        sectorId,
        position: { x: s * 100, y: i * 20 },
        biome: "core-world" as const,
        owner: idx < empireCount ? EmpireId(`empire-${idx}`) : null,
        slots: [],
        baseProduction: {},
        adjacentSystemIds: [],
        claimedCycle: idx < empireCount ? 0 : null,
        isHomeSystem: idx < empireCount,
      });
    }
    sectors.set(sectorId, { id: sectorId, name: `Sector ${s}`, systemIds: sysIds, centre: { x: s * 100, y: 50 } });
  }

  // Build empires
  const empires = new Map<any, Empire>();
  for (let i = 0; i < empireCount; i++) {
    const id = EmpireId(`empire-${i}`);
    empires.set(id, {
      id,
      name: `Empire ${i}`,
      colour: "#000",
      isPlayer: i === 0,
      systemIds: [SystemId(`sys-${i}`)],
      homeSystemId: SystemId(`sys-${i}`),
      resources: { credits: 500, food: 200, ore: 100, fuelCells: 50, researchPoints: 20, intelligencePoints: 10 },
      stabilityScore: 50,
      stabilityLevel: "content" as const,
      population: 1000,
      populationCapacity: 2000,
      fleetIds: [],
      researchTier: 0,
      powerScore: (empireCount - i) * 10,
    });
  }

  // Build bots (all non-player)
  const bots = new Map<any, BotAgent>();
  for (let i = 1; i < empireCount; i++) {
    const id = EmpireId(`empire-${i}`);
    bots.set(id, {
      empireId: id,
      archetype: "warlord" as const,
      momentumRating: 1.0,
      persona: { name: `Bot ${i}`, title: "Commander", backstory: "", speechStyle: "default" },
      emotionalState: { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0 },
    });
  }

  const cosmicOrder = computeCosmicOrder(empires as any);

  const time: TimeState = {
    currentCycle: 0,
    currentConfluence: 1,
    cyclesUntilReckoning: 10,
    cosmicOrder,
  };

  return {
    galaxy: { systems, sectors },
    empires,
    playerEmpireId: EmpireId("empire-0"),
    unitTypes: new Map(),
    units: new Map(),
    fleets: new Map(),
    bots,
    diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
    time,
    currentCycleEvents: [],
    campaign: { id: "test", name: "Test", createdAt: "2026-01-01", lastSavedAt: "2026-01-01", seed: 42 },
  };
}

describe("Cycle Processor", () => {
  // REQ-001: Player submits Cycle, engine resolves, returns updated state
  describe("REQ-001: Cycle submission and resolution", () => {
    it("processes a cycle and returns updated game state", () => {
      const state = makeMinimalGameState();
      const playerActions: PlayerActions = { actions: [] };
      const powerHistory = new Map<any, number[]>();
      const botAcc = new Map<any, number>();

      const result = processCycle(state, playerActions, powerHistory, botAcc);
      expect(result.committed).toBe(true);
      expect(result.state.time.currentCycle).toBe(1);
    });

    it("returns a cycle report with events", () => {
      const state = makeMinimalGameState();
      const result = processCycle(state, { actions: [] }, new Map(), new Map());
      expect(result.report.cycle).toBe(1);
      expect(Array.isArray(result.report.events)).toBe(true);
    });

    it("player resources change after a cycle", () => {
      const state = makeMinimalGameState();
      const initialCredits = state.empires.get(EmpireId("empire-0"))!.resources.credits;
      const result = processCycle(state, { actions: [] }, new Map(), new Map());
      const newCredits = result.state.empires.get(EmpireId("empire-0"))!.resources.credits;
      // Production should add credits (core-world produces credits)
      expect(newCredits).not.toBe(initialCredits);
    });
  });

  // REQ-002: Bot actions resolved per Momentum Rating
  describe("REQ-002: Bot action resolution", () => {
    it("bots with momentum 1.0 accumulate actions", () => {
      const state = makeMinimalGameState();
      const botAcc = new Map<any, number>();

      processCycle(state, { actions: [] }, new Map(), botAcc);

      // Standard (1.0) bots should have executed their cycle
      // The accumulated map is updated
      expect(botAcc.size).toBeGreaterThan(0);
    });

    it("bot with momentum 0.5 does not act every cycle", () => {
      const state = makeMinimalGameState(3);
      // Set bot to fodder momentum
      const bot = state.bots.get(EmpireId("empire-1"))!;
      bot.momentumRating = 0.5;

      const botAcc = new Map<any, number>();
      processCycle(state, { actions: [] }, new Map(), botAcc);
      // After first cycle with 0.5, accumulated should be 0.5 (no full action yet)
      expect(botAcc.get(EmpireId("empire-1"))).toBeCloseTo(0.5);
    });
  });

  // REQ-003: Cycle processing is atomic
  describe("REQ-003: Atomicity", () => {
    it("original state is not mutated on successful cycle", () => {
      const state = makeMinimalGameState();
      const originalCycle = state.time.currentCycle;
      processCycle(state, { actions: [] }, new Map(), new Map());
      // Original state should be unchanged
      expect(state.time.currentCycle).toBe(originalCycle);
    });

    it("original state resources are not mutated", () => {
      const state = makeMinimalGameState();
      const originalCredits = state.empires.get(EmpireId("empire-0"))!.resources.credits;
      processCycle(state, { actions: [] }, new Map(), new Map());
      expect(state.empires.get(EmpireId("empire-0"))!.resources.credits).toBe(originalCredits);
    });
  });

  // REQ-007: Cycle processing < 5 seconds for 100 empires
  describe("REQ-007: Performance", () => {
    it("processes 100 empires within 5 seconds", () => {
      const state = makeMinimalGameState(100);

      // Add enough systems for 100 empires
      for (let i = 10; i < 100; i++) {
        const sysId = SystemId(`sys-extra-${i}`);
        state.galaxy.systems.set(sysId as any, {
          id: sysId,
          name: `Extra ${i}`,
          sectorId: SectorId("sector-0"),
          position: { x: i * 10, y: 0 },
          biome: "core-world" as const,
          owner: EmpireId(`empire-${i}`),
          slots: [],
          baseProduction: {},
          adjacentSystemIds: [],
          claimedCycle: 0,
          isHomeSystem: true,
        } as any);

        if (!state.empires.has(EmpireId(`empire-${i}`) as any)) {
          state.empires.set(EmpireId(`empire-${i}`) as any, {
            id: EmpireId(`empire-${i}`),
            name: `Empire ${i}`,
            colour: "#000",
            isPlayer: false,
            systemIds: [sysId],
            homeSystemId: sysId,
            resources: { credits: 500, food: 200, ore: 100, fuelCells: 50, researchPoints: 20, intelligencePoints: 10 },
            stabilityScore: 50,
            stabilityLevel: "content" as const,
            population: 1000,
            populationCapacity: 2000,
            fleetIds: [],
            researchTier: 0,
            powerScore: 100 - i,
          });
        }

        if (!state.bots.has(EmpireId(`empire-${i}`) as any)) {
          state.bots.set(EmpireId(`empire-${i}`) as any, {
            empireId: EmpireId(`empire-${i}`),
            archetype: "warlord" as const,
            momentumRating: 1.0,
            persona: { name: `Bot ${i}`, title: "Commander", backstory: "", speechStyle: "default" },
            emotionalState: { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0 },
          });
        }
      }

      // Recompute cosmic order with all empires
      state.time.cosmicOrder = computeCosmicOrder(state.empires as any);

      const start = performance.now();
      const result = processCycle(state, { actions: [] }, new Map(), new Map());
      const elapsed = performance.now() - start;

      expect(result.committed).toBe(true);
      expect(elapsed).toBeLessThan(5000); // Must complete within 5 seconds
    });
  });
});
