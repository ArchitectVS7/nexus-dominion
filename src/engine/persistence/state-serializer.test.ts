import { describe, it, expect } from "vitest";
import { serializeGameState, deserializeGameState } from "./state-serializer";
import { EmpireId, SystemId, SectorId, FleetId, UnitId, PactId, CoalitionId } from "../types/ids";
import type { GameState } from "../types/game-state";

/* ── Test Fixture ── */

function createMinimalGameState(): GameState {
  const empireId = EmpireId("e-player");
  const botId = EmpireId("e-bot");
  const sys1 = SystemId("sys-1");
  const sec1 = SectorId("sec-1");

  const empire = {
    id: empireId,
    name: "Player Empire",
    colour: "#ff0000",
    isPlayer: true,
    homeSystemId: sys1,
    systemIds: [sys1],
    resources: { credits: 1000, food: 500, ore: 300, fuelCells: 200, researchPoints: 50, intelligencePoints: 10 },
    population: 100,
    populationCapacity: 200,
    stabilityScore: 75,
    stabilityLevel: "content" as const,
    researchTier: 3,
    powerScore: 150,
    fleetIds: [FleetId("f1")],
    researchPath: null,
    buildQueue: [],
    installationQueue: [],
  };

  const botEmpire = {
    ...empire,
    id: botId,
    name: "Bot Empire",
    isPlayer: false,
    fleetIds: [],
  };

  const system = {
    id: sys1,
    name: "Alpha Centauri",
    sectorId: sec1,
    position: { x: 0, y: 0 },
    biome: "core-world" as const,
    owner: empireId,
    slots: [],
    baseProduction: { credits: 10 },
    adjacentSystemIds: [],
    claimedCycle: 1,
    isHomeSystem: true,
  };

  const sector = {
    id: sec1,
    name: "Alpha Sector",
    systemIds: [sys1],
    centre: { x: 0, y: 0 },
  };

  return {
    galaxy: {
      systems: new Map([[sys1, system as any]]),
      sectors: new Map([[sec1, sector as any]]),
    },
    empires: new Map([[empireId, empire as any], [botId, botEmpire as any]]),
    playerEmpireId: empireId,
    unitTypes: new Map([["fighter", {
      id: "fighter", name: "Fighter", category: "fleet" as const,
      buildCost: 100, buildTime: 1, oreMaintenance: 5, fuelMaintenance: 3,
      attack: 6, defence: 3, hp: 8,
    }]]),
    units: new Map([[UnitId("u1"), {
      id: UnitId("u1"), typeId: "fighter", currentHp: 8, completionCycle: null,
    }]]),
    fleets: new Map([["f1", {
      id: FleetId("f1"), ownerId: empireId, name: "Alpha Fleet",
      locationSystemId: sys1, unitIds: [UnitId("u1")],
      targetSystemId: null, arrivalCycle: null,
    }]]),
    bots: new Map([[botId, {
      empireId: botId,
      archetype: "warlord" as const,
      momentumRating: 1.5,
      persona: { name: "Warlord", title: "General", backstory: "War", speechStyle: "aggressive" },
      emotionalState: { current: "calm" as const, trigger: "start", lastUpdatedCycle: 0, resonance: 0.5 },
    }]]),
    diplomacy: {
      pacts: new Map([[PactId("p1"), {
        id: PactId("p1"),
        type: "star-covenant" as const,
        memberIds: [empireId, botId] as [any, any],
        formedCycle: 1,
        active: true,
      }]]),
      coalitions: new Map([[CoalitionId("c1"), {
        id: CoalitionId("c1"),
        targetId: botId,
        memberIds: [empireId],
        warChest: 500,
        combatBonus: 0.15,
        formedCycle: 2,
        active: true,
      }]]),
      relationships: new Map([["e-bot::e-player", {
        status: "allied" as const,
        reputation: 50,
        lastChangeCycle: 1,
        violations: 0,
      }]]),
    },
    time: {
      currentCycle: 5,
      currentConfluence: 1,
      cyclesUntilReckoning: 5,
      cosmicOrder: {
        tiers: new Map([[empireId, "sovereign" as const], [botId, "ascendant" as const]]),
        rankings: [empireId, botId],
      },
    },
    currentCycleEvents: [],
    campaign: {
      id: "campaign-1",
      name: "Test Campaign",
      createdAt: "2026-03-29T00:00:00Z",
      lastSavedAt: "2026-03-29T00:00:00Z",
      seed: 42,
    },
    market: {
      prices: { food: 10, ore: 15, fuelCells: 25 },
      basePrices: { food: 10, ore: 15, fuelCells: 25 },
      priceHistory: [{ food: 10, ore: 15, fuelCells: 25 }],
      cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
    },
    powerHistory: new Map([[empireId, [100, 120, 150]], [botId, [80, 90, 95]]]),
    earnedAchievements: new Map([[empireId, new Set(["conquest", "trade-prince"])]]),
    botAccumulated: new Map([[botId, 0.75]]),
    convergenceAlertsSent: new Set(["e-player::singularity"]),
    syndicate: {
      members: new Map([[empireId, {
        empireId,
        rank: 3 as const,
        influence: 250,
        shadowSignature: 15,
        exposed: false,
        discoveredCycle: 2,
      }]]),
      controllerId: empireId,
      exposedEmpires: new Set([botId]),
    },
    covert: {
      empireStates: new Map([[empireId, {
        empireId,
        agentPool: 500,
        intelLevel: 2,
        queuedOps: [],
        totalOpsCompleted: 5,
        timesDetectedAsAttacker: 1,
      }]]),
    },
  };
}

/* ── Tests ── */

describe("State Serializer", () => {
  describe("serializeGameState", () => {
    it("returns a valid JSON string", () => {
      const state = createMinimalGameState();
      const json = serializeGameState(state);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("serialized output contains no [object Map] or [object Set]", () => {
      const state = createMinimalGameState();
      const json = serializeGameState(state);
      expect(json).not.toContain("[object Map]");
      expect(json).not.toContain("[object Set]");
    });
  });

  describe("deserializeGameState", () => {
    it("round-trips to an identical GameState", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      // Top-level Maps
      expect(restored.empires).toBeInstanceOf(Map);
      expect(restored.empires.size).toBe(original.empires.size);
      expect(restored.unitTypes).toBeInstanceOf(Map);
      expect(restored.units).toBeInstanceOf(Map);
      expect(restored.fleets).toBeInstanceOf(Map);
      expect(restored.bots).toBeInstanceOf(Map);
    });

    it("restores galaxy Maps", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      expect(restored.galaxy.systems).toBeInstanceOf(Map);
      expect(restored.galaxy.sectors).toBeInstanceOf(Map);
      expect(restored.galaxy.systems.size).toBe(1);
      expect(restored.galaxy.sectors.size).toBe(1);
    });

    it("restores diplomacy Maps", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      expect(restored.diplomacy.pacts).toBeInstanceOf(Map);
      expect(restored.diplomacy.coalitions).toBeInstanceOf(Map);
      expect(restored.diplomacy.relationships).toBeInstanceOf(Map);
      expect(restored.diplomacy.pacts.size).toBe(1);
    });

    it("restores time.cosmicOrder.tiers Map", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      expect(restored.time.cosmicOrder.tiers).toBeInstanceOf(Map);
      expect(restored.time.cosmicOrder.tiers.get(EmpireId("e-player"))).toBe("sovereign");
      expect(restored.time.cosmicOrder.rankings).toEqual([EmpireId("e-player"), EmpireId("e-bot")]);
    });

    it("restores earnedAchievements Map<EmpireId, Set<string>>", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      expect(restored.earnedAchievements).toBeInstanceOf(Map);
      const playerAchievements = restored.earnedAchievements!.get(EmpireId("e-player"));
      expect(playerAchievements).toBeInstanceOf(Set);
      expect(playerAchievements!.has("conquest")).toBe(true);
      expect(playerAchievements!.has("trade-prince")).toBe(true);
    });

    it("restores convergenceAlertsSent Set", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      expect(restored.convergenceAlertsSent).toBeInstanceOf(Set);
      expect(restored.convergenceAlertsSent!.has("e-player::singularity")).toBe(true);
    });

    it("restores syndicate Maps and Sets", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      expect(restored.syndicate!.members).toBeInstanceOf(Map);
      expect(restored.syndicate!.exposedEmpires).toBeInstanceOf(Set);
      expect(restored.syndicate!.members.size).toBe(1);
      expect(restored.syndicate!.exposedEmpires.has(EmpireId("e-bot"))).toBe(true);
    });

    it("restores covert Maps", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      expect(restored.covert!.empireStates).toBeInstanceOf(Map);
      expect(restored.covert!.empireStates.size).toBe(1);
    });

    it("restores powerHistory and botAccumulated Maps", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      expect(restored.powerHistory).toBeInstanceOf(Map);
      expect(restored.powerHistory!.get(EmpireId("e-player"))).toEqual([100, 120, 150]);
      expect(restored.botAccumulated).toBeInstanceOf(Map);
      expect(restored.botAccumulated!.get(EmpireId("e-bot"))).toBe(0.75);
    });

    it("preserves all empire data through round-trip", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      const playerEmpire = restored.empires.get(EmpireId("e-player"))!;
      expect(playerEmpire.name).toBe("Player Empire");
      expect(playerEmpire.resources.credits).toBe(1000);
      expect(playerEmpire.researchTier).toBe(3);
      expect(playerEmpire.systemIds).toEqual([SystemId("sys-1")]);
    });

    it("preserves fleet data through round-trip", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      const fleet = restored.fleets.get("f1")!;
      expect(fleet.name).toBe("Alpha Fleet");
      expect(fleet.unitIds).toEqual([UnitId("u1")]);
      expect(fleet.targetSystemId).toBeNull();
    });

    it("preserves bot emotional state through round-trip", () => {
      const original = createMinimalGameState();
      const json = serializeGameState(original);
      const restored = deserializeGameState(json);

      const bot = restored.bots.get(EmpireId("e-bot"))!;
      expect(bot.emotionalState.resonance).toBe(0.5);
      expect(bot.archetype).toBe("warlord");
    });

    it("handles absent optional fields (syndicate, covert, market)", () => {
      const state = createMinimalGameState();
      delete (state as any).syndicate;
      delete (state as any).covert;
      delete (state as any).market;
      delete (state as any).convergenceAlertsSent;

      const json = serializeGameState(state);
      const restored = deserializeGameState(json);

      expect(restored.syndicate).toBeUndefined();
      expect(restored.covert).toBeUndefined();
      expect(restored.market).toBeUndefined();
      expect(restored.convergenceAlertsSent).toBeUndefined();
    });

    it("round-trips empty Maps correctly", () => {
      const state = createMinimalGameState();
      state.units = new Map();
      state.fleets = new Map();
      const json = serializeGameState(state);
      const restored = deserializeGameState(json);
      expect(restored.units).toBeInstanceOf(Map);
      expect(restored.units.size).toBe(0);
      expect(restored.fleets).toBeInstanceOf(Map);
      expect(restored.fleets.size).toBe(0);
    });

    it("round-trips empty Sets correctly", () => {
      const state = createMinimalGameState();
      state.convergenceAlertsSent = new Set();
      state.earnedAchievements = new Map([[EmpireId("e-player"), new Set()]]);
      const json = serializeGameState(state);
      const restored = deserializeGameState(json);
      expect(restored.convergenceAlertsSent).toBeInstanceOf(Set);
      expect(restored.convergenceAlertsSent!.size).toBe(0);
      const achievements = restored.earnedAchievements!.get(EmpireId("e-player"));
      expect(achievements).toBeInstanceOf(Set);
      expect(achievements!.size).toBe(0);
    });

    it("preserves market data through round-trip", () => {
      const state = createMinimalGameState();
      const json = serializeGameState(state);
      const restored = deserializeGameState(json);
      expect(restored.market!.prices).toEqual({ food: 10, ore: 15, fuelCells: 25 });
      expect(restored.market!.priceHistory).toHaveLength(1);
      expect(restored.market!.cycleVolume).toEqual({ food: 0, ore: 0, fuelCells: 0 });
    });

    it("preserves campaign metadata through round-trip", () => {
      const state = createMinimalGameState();
      const json = serializeGameState(state);
      const restored = deserializeGameState(json);
      expect(restored.campaign.id).toBe("campaign-1");
      expect(restored.campaign.name).toBe("Test Campaign");
      expect(restored.campaign.seed).toBe(42);
      expect(restored.campaign.createdAt).toBe("2026-03-29T00:00:00Z");
    });

    it("does not confuse plain objects with __t key that aren't Map/Set tags", () => {
      const state = createMinimalGameState();
      // Add a currentCycleEvent that happens to have __t but wrong shape
      (state as any).currentCycleEvents = [{ __t: "something-else", data: 42 }];
      const json = serializeGameState(state);
      const restored = deserializeGameState(json);
      // Should remain a plain object, not converted to Map or Set
      expect(restored.currentCycleEvents[0]).toEqual({ __t: "something-else", data: 42 });
    });

    it("preserves covert empire state values through round-trip", () => {
      const state = createMinimalGameState();
      const json = serializeGameState(state);
      const restored = deserializeGameState(json);
      const covertState = restored.covert!.empireStates.get(EmpireId("e-player"))!;
      expect(covertState.agentPool).toBe(500);
      expect(covertState.intelLevel).toBe(2);
      expect(covertState.totalOpsCompleted).toBe(5);
      expect(covertState.timesDetectedAsAttacker).toBe(1);
    });

    it("preserves syndicate member values through round-trip", () => {
      const state = createMinimalGameState();
      const json = serializeGameState(state);
      const restored = deserializeGameState(json);
      const member = restored.syndicate!.members.get(EmpireId("e-player"))!;
      expect(member.rank).toBe(3);
      expect(member.influence).toBe(250);
      expect(member.shadowSignature).toBe(15);
      expect(member.exposed).toBe(false);
      expect(restored.syndicate!.controllerId).toBe(EmpireId("e-player"));
    });
  });
});
