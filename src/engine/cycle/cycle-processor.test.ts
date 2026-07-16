import { describe, it, expect } from "vitest";
import { processCycle, type PlayerActions } from "./cycle-processor";
import type { GameState } from "../types/game-state";
import { EmpireId, SystemId, SectorId, UnitId, FleetId } from "../types/ids";
import type { Unit, Fleet } from "../types/military";
import type { CombatEvent } from "../types/events";
import { computeCosmicOrder } from "../nexus/nexus-engine";
import { createUnitTypeRegistry } from "../military/unit-registry";
import { relationshipKey } from "../types/diplomacy";
import { selectWeightedMarketEvent } from "../market/market-engine";
import { SeededRNG } from "../utils/rng";
import { makeMinimalGameState } from "./cycle-test-fixtures";
import { serializeGameState, deserializeGameState } from "../persistence/state-serializer";
import type { TutorialState } from "../types/game-state";

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
            emotionalState: { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 },
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

  describe("Player action resolution", () => {
    it("'claim-system' claims adjacent unclaimed system", () => {
      const state = makeMinimalGameState(3);
      // Add an unclaimed system adjacent to empire-0's system
      const unclaimedId = SystemId("sys-unclaimed");
      state.galaxy.systems.set(unclaimedId as any, {
        id: unclaimedId,
        name: "Unclaimed",
        sectorId: SectorId("sector-0"),
        position: { x: 50, y: 50 },
        biome: "frontier-world" as any,
        owner: null,
        slots: [],
        baseProduction: {},
        adjacentSystemIds: [SystemId("sys-0")],
        claimedCycle: null,
        isHomeSystem: false,
      } as any);
      const sys0 = state.galaxy.systems.get(SystemId("sys-0") as any)!;
      sys0.adjacentSystemIds = [unclaimedId];

      const playerActions: PlayerActions = {
        actions: [{ type: "claim-system", details: { systemId: "sys-unclaimed" } }],
      };

      const result = processCycle(state, playerActions, new Map(), new Map());
      const playerEmpire = result.state.empires.get(EmpireId("empire-0"))!;
      expect(playerEmpire.systemIds).toContain(unclaimedId);
    });

    it("'build-unit' enqueues unit and deducts credits", () => {
      const state = makeMinimalGameState(3);
      state.unitTypes = createUnitTypeRegistry();

      const playerActions: PlayerActions = {
        actions: [{ type: "build-unit", details: { unitTypeId: "fighter" } }],
      };

      const result = processCycle(state, playerActions, new Map(), new Map());
      const playerEmpire = result.state.empires.get(EmpireId("empire-0"))!;
      expect(playerEmpire.buildQueue!.length).toBe(1);
      expect(playerEmpire.resources.credits).toBeLessThan(500); // deducted build cost
    });

    it("'research' advances research tier", () => {
      const state = makeMinimalGameState(3);
      // Give player enough RP
      state.empires.get(EmpireId("empire-0") as any)!.resources.researchPoints = 500;

      const playerActions: PlayerActions = {
        actions: [{ type: "research" }],
      };

      const result = processCycle(state, playerActions, new Map(), new Map());
      const playerEmpire = result.state.empires.get(EmpireId("empire-0"))!;
      expect(playerEmpire.researchTier).toBe(1);
    });

    it("'trade' sells resources for credits", () => {
      const state = makeMinimalGameState(3);
      state.market = {
        prices: { food: 5, ore: 8, fuelCells: 12 },
        basePrices: { food: 5, ore: 8, fuelCells: 12 },
        priceHistory: [],
      };

      const playerActions: PlayerActions = {
        actions: [{ type: "trade", details: { resource: "ore", quantity: 10, direction: "sell" } }],
      };

      const result = processCycle(state, playerActions, new Map(), new Map());
      const playerEmpire = result.state.empires.get(EmpireId("empire-0"))!;
      // 100 - 10 (sold) + production (core-world gives ore) = less than original 100
      expect(playerEmpire.resources.ore).toBeLessThan(100);
      expect(playerEmpire.resources.credits).toBeGreaterThan(500);
    });

    it("'trade' with star-covenant gives better sell price", () => {
      // Without pact
      const stateNoPact = makeMinimalGameState(3);
      stateNoPact.market = {
        prices: { food: 5, ore: 8, fuelCells: 12 },
        basePrices: { food: 5, ore: 8, fuelCells: 12 },
        priceHistory: [],
      };
      const resultNoPact = processCycle(
        stateNoPact,
        { actions: [{ type: "trade", details: { resource: "ore", quantity: 10, direction: "sell" } }] },
        new Map(), new Map(),
      );

      // With star-covenant pact
      const stateWithPact = makeMinimalGameState(3);
      stateWithPact.market = {
        prices: { food: 5, ore: 8, fuelCells: 12 },
        basePrices: { food: 5, ore: 8, fuelCells: 12 },
        priceHistory: [],
      };
      // Create an active star-covenant between empire-0 and empire-1
      const pactId = "pact-1-empire-0-empire-1" as any;
      stateWithPact.diplomacy.pacts.set(pactId, {
        id: pactId,
        type: "star-covenant",
        memberIds: [EmpireId("empire-0"), EmpireId("empire-1")],
        formedCycle: 0,
        active: true,
      });
      const resultWithPact = processCycle(
        stateWithPact,
        { actions: [{ type: "trade", details: { resource: "ore", quantity: 10, direction: "sell" } }] },
        new Map(), new Map(),
      );

      const creditsNoPact = resultNoPact.state.empires.get(EmpireId("empire-0"))!.resources.credits;
      const creditsWithPact = resultWithPact.state.empires.get(EmpireId("empire-0"))!.resources.credits;
      // Star Covenant gives 15% sell bonus → more credits earned
      expect(creditsWithPact).toBeGreaterThan(creditsNoPact);
    });

    it("'trade' with star-covenant gives cheaper buy price", () => {
      // Without pact
      const stateNoPact = makeMinimalGameState(3);
      stateNoPact.market = {
        prices: { food: 5, ore: 8, fuelCells: 12 },
        basePrices: { food: 5, ore: 8, fuelCells: 12 },
        priceHistory: [],
      };
      const resultNoPact = processCycle(
        stateNoPact,
        { actions: [{ type: "trade", details: { resource: "ore", quantity: 10, direction: "buy" } }] },
        new Map(), new Map(),
      );

      // With star-covenant pact
      const stateWithPact = makeMinimalGameState(3);
      stateWithPact.market = {
        prices: { food: 5, ore: 8, fuelCells: 12 },
        basePrices: { food: 5, ore: 8, fuelCells: 12 },
        priceHistory: [],
      };
      const pactId = "pact-1-empire-0-empire-1" as any;
      stateWithPact.diplomacy.pacts.set(pactId, {
        id: pactId,
        type: "star-covenant",
        memberIds: [EmpireId("empire-0"), EmpireId("empire-1")],
        formedCycle: 0,
        active: true,
      });
      const resultWithPact = processCycle(
        stateWithPact,
        { actions: [{ type: "trade", details: { resource: "ore", quantity: 10, direction: "buy" } }] },
        new Map(), new Map(),
      );

      const creditsNoPact = resultNoPact.state.empires.get(EmpireId("empire-0"))!.resources.credits;
      const creditsWithPact = resultWithPact.state.empires.get(EmpireId("empire-0"))!.resources.credits;
      // Star Covenant gives 15% buy discount → fewer credits spent → more remaining
      expect(creditsWithPact).toBeGreaterThan(creditsNoPact);
    });
  });

  describe("Bot action resolution in cycle", () => {
    it("bots generate and resolve actions during cycle", () => {
      const state = makeMinimalGameState(3);
      // Add unclaimed system adjacent to bot
      const unclaimedId = SystemId("sys-unclaimed");
      state.galaxy.systems.set(unclaimedId as any, {
        id: unclaimedId,
        name: "Unclaimed",
        sectorId: SectorId("sector-0"),
        position: { x: 50, y: 50 },
        biome: "frontier-world" as any,
        owner: null,
        slots: [],
        baseProduction: {},
        adjacentSystemIds: [SystemId("sys-1")],
        claimedCycle: null,
        isHomeSystem: false,
      } as any);

      const botAcc = new Map<any, number>();
      const result = processCycle(state, { actions: [] }, new Map(), botAcc);
      // Bot actions were generated and processed (cycle committed)
      expect(result.committed).toBe(true);
    });
  });

  describe("Tier 1/2 pipeline", () => {
    it("build queue advances during cycle", () => {
      const state = makeMinimalGameState(3);
      state.unitTypes = createUnitTypeRegistry();
      const empire = state.empires.get(EmpireId("empire-0") as any)!;
      empire.buildQueue = [{
        unitTypeId: "fighter",
        systemId: SystemId("sys-0"),
        startCycle: 0,
        completionCycle: 1, // will complete on cycle 1
      }];

      const result = processCycle(state, { actions: [] }, new Map(), new Map());
      const playerEmpire = result.state.empires.get(EmpireId("empire-0"))!;
      // Build queue should be empty (unit completed)
      expect(playerEmpire.buildQueue!.length).toBe(0);
    });

    it("population growth applied during cycle", () => {
      const state = makeMinimalGameState(3);
      const empire = state.empires.get(EmpireId("empire-0") as any)!;
      // Give empire many verdant systems to ensure food surplus
      for (let i = 0; i < 5; i++) {
        const sysId = SystemId(`sys-verdant-${i}`);
        state.galaxy.systems.set(sysId as any, {
          id: sysId, name: `Verdant ${i}`, sectorId: SectorId("sector-0"),
          position: { x: i * 10, y: 100 }, biome: "verdant-world" as any,
          owner: EmpireId("empire-0"), slots: [], baseProduction: {},
          adjacentSystemIds: [], claimedCycle: 0, isHomeSystem: false,
        } as any);
        empire.systemIds.push(sysId);
      }
      const initialPop = empire.population;

      const result = processCycle(state, { actions: [] }, new Map(), new Map());
      const newEmpire = result.state.empires.get(EmpireId("empire-0"))!;
      // Population should have grown (verdant worlds produce lots of food)
      expect(newEmpire.population).toBeGreaterThan(initialPop);
    });

    it("market prices updated with decay during cycle", () => {
      const state = makeMinimalGameState(3);
      state.market = {
        prices: { food: 50, ore: 80, fuelCells: 120 },
        basePrices: { food: 5, ore: 8, fuelCells: 12 },
        priceHistory: [],
      };

      const result = processCycle(state, { actions: [] }, new Map(), new Map());
      // Prices should have decayed toward baseline
      expect(result.state.market!.prices.food).toBeLessThan(50);
    });
  });

  // ═══ Task A: Covert detection → diplomatic reputation hit ═══
  describe("Covert diplomatic consequences", () => {
    function makeCovertState(empireCount: number): GameState {
      const state = makeMinimalGameState(empireCount);
      state.covert = {
        empireStates: new Map(),
      };
      // Give empire-1 agents and a queued op targeting empire-0
      state.covert.empireStates.set(EmpireId("empire-1"), {
        empireId: EmpireId("empire-1"),
        agentPool: 500,
        intelLevel: 0,
        queuedOps: [{
          id: "empire-1-1-sabotage-production",
          operationType: "sabotage-production" as any,
          attackerId: EmpireId("empire-1"),
          targetId: EmpireId("empire-0"),
          queuedCycle: 0,
        }],
        totalOpsCompleted: 0,
        timesDetectedAsAttacker: 0,
      });
      // Give empire-0 a covert state too (target)
      state.covert.empireStates.set(EmpireId("empire-0"), {
        empireId: EmpireId("empire-0"),
        agentPool: 0,
        intelLevel: 0,
        queuedOps: [],
        totalOpsCompleted: 0,
        timesDetectedAsAttacker: 0,
      });
      return state;
    }

    it("covert detection event applies reputationHit to diplomacy relationship", () => {
      const state = makeCovertState(3);
      // Seed relationship at neutral 50
      const key = relationshipKey(EmpireId("empire-0"), EmpireId("empire-1"));
      state.diplomacy.relationships.set(key, {
        status: "neutral",
        reputation: 50,
        lastChangeCycle: 0,
        violations: 0,
      });

      // Run enough cycles with queued ops to guarantee at least one detection
      // (sabotage-production has 0.35 base detection risk)
      let current = state;
      let detected = false;
      for (let i = 0; i < 50; i++) {
        // Re-queue an op each cycle
        const cs = current.covert!.empireStates.get(EmpireId("empire-1"));
        if (cs && cs.queuedOps.length === 0) {
          current.covert!.empireStates.set(EmpireId("empire-1"), {
            ...cs,
            agentPool: Math.max(cs.agentPool, 500),
            queuedOps: [{
              id: `empire-1-${i}-sabotage-production`,
              operationType: "sabotage-production" as any,
              attackerId: EmpireId("empire-1"),
              targetId: EmpireId("empire-0"),
              queuedCycle: i,
            }],
          });
        }

        const result = processCycle(current, { actions: [] }, new Map(), new Map());
        current = result.state;

        const detectionEvents = result.report.events.filter(
          (e: any) => e.type === "covert" && e.kind === "op-detected"
        );
        if (detectionEvents.length > 0) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
      // Reputation should have decreased from 50
      const relKey = key;
      const relationship = current.diplomacy.relationships.get(relKey);
      expect(relationship).toBeDefined();
      expect(relationship!.reputation).toBeLessThan(50);
    });

    it("severe covert op detection triggers war declaration", () => {
      const state = makeCovertState(3);
      const key = relationshipKey(EmpireId("empire-0"), EmpireId("empire-1"));
      state.diplomacy.relationships.set(key, {
        status: "neutral",
        reputation: 50,
        lastChangeCycle: 0,
        violations: 0,
      });

      // Queue a severe op: assassinate-leader (war-triggering)
      state.covert!.empireStates.set(EmpireId("empire-1"), {
        empireId: EmpireId("empire-1"),
        agentPool: 500,
        intelLevel: 0,
        queuedOps: [{
          id: "empire-1-1-assassinate-leader",
          operationType: "assassinate-leader" as any,
          attackerId: EmpireId("empire-1"),
          targetId: EmpireId("empire-0"),
          queuedCycle: 0,
        }],
        totalOpsCompleted: 0,
        timesDetectedAsAttacker: 0,
      });

      // Run cycles until detection occurs (assassinate-leader has 0.50 base risk)
      let current = state;
      let warDeclared = false;
      for (let i = 0; i < 50; i++) {
        const cs = current.covert!.empireStates.get(EmpireId("empire-1"));
        if (cs && cs.queuedOps.length === 0) {
          current.covert!.empireStates.set(EmpireId("empire-1"), {
            ...cs,
            agentPool: Math.max(cs.agentPool, 500),
            queuedOps: [{
              id: `empire-1-${i}-assassinate-leader`,
              operationType: "assassinate-leader" as any,
              attackerId: EmpireId("empire-1"),
              targetId: EmpireId("empire-0"),
              queuedCycle: i,
            }],
          });
        }

        const result = processCycle(current, { actions: [] }, new Map(), new Map());
        current = result.state;

        const rel = current.diplomacy.relationships.get(key);
        if (rel?.status === "at-war") {
          warDeclared = true;
          break;
        }
      }

      expect(warDeclared).toBe(true);
    });
  });

  // ═══ Covert op-specific effects ═══
  describe("Covert op-specific effects", () => {
    function makeCovertEffectState(opType: string): GameState {
      const state = makeMinimalGameState(3);
      state.covert = {
        empireStates: new Map(),
      };
      state.covert.empireStates.set(EmpireId("empire-1"), {
        empireId: EmpireId("empire-1"),
        agentPool: 500,
        intelLevel: 0,
        queuedOps: [{
          id: `empire-1-1-${opType}`,
          operationType: opType as any,
          attackerId: EmpireId("empire-1"),
          targetId: EmpireId("empire-0"),
          queuedCycle: 0,
        }],
        totalOpsCompleted: 0,
        timesDetectedAsAttacker: 0,
      });
      state.covert.empireStates.set(EmpireId("empire-0"), {
        empireId: EmpireId("empire-0"),
        agentPool: 500,
        intelLevel: 0,
        queuedOps: [],
        totalOpsCompleted: 0,
        timesDetectedAsAttacker: 0,
      });
      return state;
    }

    it("successful steal-credits transfers credits from target to attacker", () => {
      // Run multiple cycles to get at least one success
      let found = false;
      for (let seed = 0; seed < 200 && !found; seed++) {
        const state = makeCovertEffectState("steal-credits");
        state.campaign.seed = seed;

        const result = processCycle(state, { actions: [] }, new Map(), new Map());
        const successEvents = result.report.events.filter(
          (e: any) => e.type === "covert" && e.succeeded === true && e.operationType === "steal-credits"
        );
        if (successEvents.length > 0) {
          const targetAfter = result.state.empires.get(EmpireId("empire-0"))!.resources.credits;
          const attackerAfter = result.state.empires.get(EmpireId("empire-1"))!.resources.credits;
          // Target lost credits (after accounting for production)
          // Attacker gained credits beyond normal production
          // Compare deltas: attacker should gain more than no-op, target should lose
          const noOpState = makeCovertEffectState("steal-credits");
          noOpState.campaign.seed = seed;
          noOpState.covert!.empireStates.get(EmpireId("empire-1"))!.queuedOps = [];
          const noOpResult = processCycle(noOpState, { actions: [] }, new Map(), new Map());
          const targetNoOp = noOpResult.state.empires.get(EmpireId("empire-0"))!.resources.credits;
          const attackerNoOp = noOpResult.state.empires.get(EmpireId("empire-1"))!.resources.credits;

          expect(targetAfter).toBeLessThan(targetNoOp);
          expect(attackerAfter).toBeGreaterThan(attackerNoOp);
          found = true;
        }
      }
      expect(found).toBe(true);
    });

    it("successful sabotage-production reduces target stability", () => {
      let found = false;
      for (let seed = 0; seed < 200 && !found; seed++) {
        const state = makeCovertEffectState("sabotage-production");
        state.campaign.seed = seed;

        const result = processCycle(state, { actions: [] }, new Map(), new Map());
        const successEvents = result.report.events.filter(
          (e: any) => e.type === "covert" && e.succeeded === true && e.operationType === "sabotage-production"
        );
        if (successEvents.length > 0) {
          const noOpState = makeCovertEffectState("sabotage-production");
          noOpState.campaign.seed = seed;
          noOpState.covert!.empireStates.get(EmpireId("empire-1"))!.queuedOps = [];
          const noOpResult = processCycle(noOpState, { actions: [] }, new Map(), new Map());

          const targetStab = result.state.empires.get(EmpireId("empire-0"))!.stabilityScore;
          const noOpStab = noOpResult.state.empires.get(EmpireId("empire-0"))!.stabilityScore;

          expect(targetStab).toBeLessThan(noOpStab);
          found = true;
        }
      }
      expect(found).toBe(true);
    });

    it("successful reconnaissance increases attacker intel level", () => {
      let found = false;
      for (let seed = 0; seed < 200 && !found; seed++) {
        const state = makeCovertEffectState("reconnaissance");
        state.campaign.seed = seed;

        const result = processCycle(state, { actions: [] }, new Map(), new Map());
        const successEvents = result.report.events.filter(
          (e: any) => e.type === "covert" && e.succeeded === true && e.operationType === "reconnaissance"
        );
        if (successEvents.length > 0) {
          const attackerCovert = result.state.covert!.empireStates.get(EmpireId("empire-1"))!;
          expect(attackerCovert.intelLevel).toBe(1);
          found = true;
        }
      }
      expect(found).toBe(true);
    });

    it("successful recruit-defectors steals agents from target", () => {
      let found = false;
      for (let seed = 0; seed < 200 && !found; seed++) {
        const state = makeCovertEffectState("recruit-defectors");
        state.campaign.seed = seed;

        const result = processCycle(state, { actions: [] }, new Map(), new Map());
        const successEvents = result.report.events.filter(
          (e: any) => e.type === "covert" && e.succeeded === true && e.operationType === "recruit-defectors"
        );
        if (successEvents.length > 0) {
          const targetCovert = result.state.covert!.empireStates.get(EmpireId("empire-0"))!;
          // Target should have fewer agents than the starting 500
          expect(targetCovert.agentPool).toBeLessThan(500);
          found = true;
        }
      }
      expect(found).toBe(true);
    });
  });

  // ═══ Task B: Syndicate rank auto-promotion + counter-intel decay ═══
  describe("Syndicate cycle integration", () => {
    function makeSyndicateState(empireCount: number): GameState {
      const state = makeMinimalGameState(empireCount);
      state.syndicate = {
        members: new Map(),
        controllerId: null,
        exposedEmpires: new Set(),
      };
      return state;
    }

    it("syndicate members are auto-promoted when influence crosses rank threshold", () => {
      const state = makeSyndicateState(3);
      // Member with 55 influence (above rank-1 threshold of 50) but still rank 0
      state.syndicate!.members.set(EmpireId("empire-1"), {
        empireId: EmpireId("empire-1"),
        rank: 0,
        influence: 55,
        shadowSignature: 0,
        exposed: false,
        discoveredCycle: 0,
      });

      const result = processCycle(state, { actions: [] }, new Map(), new Map());

      const member = result.state.syndicate!.members.get(EmpireId("empire-1"));
      expect(member).toBeDefined();
      expect(member!.rank).toBe(1); // Should be promoted to rank 1
    });

    it("syndicate rank-up emits a rank-up event", () => {
      const state = makeSyndicateState(3);
      state.syndicate!.members.set(EmpireId("empire-1"), {
        empireId: EmpireId("empire-1"),
        rank: 0,
        influence: 55,
        shadowSignature: 0,
        exposed: false,
        discoveredCycle: 0,
      });

      const result = processCycle(state, { actions: [] }, new Map(), new Map());
      const rankUpEvents = result.report.events.filter(
        (e: any) => e.type === "syndicate" && e.kind === "rank-up"
      );
      expect(rankUpEvents.length).toBeGreaterThan(0);
      expect((rankUpEvents[0] as any).newRank).toBe(1);
    });

    it("counter-intel decay reduces shadow signature each cycle", () => {
      const state = makeSyndicateState(3);
      state.syndicate!.members.set(EmpireId("empire-1"), {
        empireId: EmpireId("empire-1"),
        rank: 3,
        influence: 250,
        shadowSignature: 60,
        exposed: false,
        discoveredCycle: 0,
      });
      // Give the empire covert state with counter-intel agents
      state.covert = {
        empireStates: new Map([
          [EmpireId("empire-1"), {
            empireId: EmpireId("empire-1"),
            agentPool: 200,
            intelLevel: 2,
            queuedOps: [],
            totalOpsCompleted: 0,
            timesDetectedAsAttacker: 0,
          }],
        ]),
      };

      const result = processCycle(state, { actions: [] }, new Map(), new Map());
      const member = result.state.syndicate!.members.get(EmpireId("empire-1"));
      expect(member).toBeDefined();
      // Shadow signature should have decayed from 60
      expect(member!.shadowSignature).toBeLessThan(60);
    });
  });

  // ═══ Task C: Installation production in economy ═══
  describe("Installation production integration", () => {
    it("completed installation adds to empire production", () => {
      const state = makeMinimalGameState(3);
      // Give sys-0 a slot with a completed trade-hub (produces +20 credits)
      const sys0 = state.galaxy.systems.get(SystemId("sys-0") as any)!;
      sys0.slots = [{
        installation: {
          id: "inst-test" as any,
          type: "trade-hub",
          condition: 1.0,
          completionCycle: null, // already built
        },
        locked: false,
      }];

      const resultWithInstallation = processCycle(state, { actions: [] }, new Map(), new Map());

      // Now run without installation for comparison
      const stateNoInst = makeMinimalGameState(3);
      const resultWithout = processCycle(stateNoInst, { actions: [] }, new Map(), new Map());

      const creditsWithInstallation = resultWithInstallation.state.empires.get(EmpireId("empire-0"))!.resources.credits;
      const creditsWithout = resultWithout.state.empires.get(EmpireId("empire-0"))!.resources.credits;

      // Trade hub adds +20 credits per cycle; empire with installation should have more
      expect(creditsWithInstallation).toBeGreaterThan(creditsWithout);
    });

    it("damaged installation produces proportionally less", () => {
      const state100 = makeMinimalGameState(3);
      const sys0_100 = state100.galaxy.systems.get(SystemId("sys-0") as any)!;
      sys0_100.slots = [{
        installation: {
          id: "inst-full" as any,
          type: "mining-complex", // +15 ore
          condition: 1.0,
          completionCycle: null,
        },
        locked: false,
      }];

      const state50 = makeMinimalGameState(3);
      const sys0_50 = state50.galaxy.systems.get(SystemId("sys-0") as any)!;
      sys0_50.slots = [{
        installation: {
          id: "inst-half" as any,
          type: "mining-complex",
          condition: 0.5,
          completionCycle: null,
        },
        locked: false,
      }];

      const result100 = processCycle(state100, { actions: [] }, new Map(), new Map());
      const result50 = processCycle(state50, { actions: [] }, new Map(), new Map());

      const ore100 = result100.state.empires.get(EmpireId("empire-0"))!.resources.ore;
      const ore50 = result50.state.empires.get(EmpireId("empire-0"))!.resources.ore;

      // Full condition should produce more ore than half condition
      expect(ore100).toBeGreaterThan(ore50);
    });
  });

  // ═══ Task D: Weighted market event selection ═══
  describe("Weighted market event selection", () => {
    it("market events fire and are recorded over 30 cycles", () => {
      const state = makeMinimalGameState(3);
      state.market = {
        prices: { food: 5, ore: 8, fuelCells: 12 },
        basePrices: { food: 5, ore: 8, fuelCells: 12 },
        priceHistory: [],
      };

      let current = state as GameState;
      const allMarketEvents: any[] = [];
      for (let i = 0; i < 30; i++) {
        const result = processCycle(current, { actions: [] }, new Map(), new Map());
        current = result.state;
        allMarketEvents.push(...result.report.events.filter((e: any) => e.type === "market"));
      }

      // With 20% probability over 30 cycles, we expect ~6 events
      expect(allMarketEvents.length).toBeGreaterThan(0);
      // Events should have affectedResource populated (for resource-affecting types)
      const resourceEvents = allMarketEvents.filter((e: any) => e.affectedResource != null);
      if (resourceEvents.length > 0) {
        expect(["food", "ore", "fuelCells"]).toContain(resourceEvents[0].affectedResource);
      }
    });

    it("selectWeightedMarketEvent exists and returns a valid event type", () => {
      const rng = new SeededRNG(42);

      const prices = { food: 5, ore: 8, fuelCells: 12, credits: 1, researchPoints: 15 };
      const basePrices = { food: 5, ore: 8, fuelCells: 12, credits: 1, researchPoints: 15 };

      const eventType = selectWeightedMarketEvent(rng, prices, basePrices);
      expect(eventType).toBeDefined();
      expect([
        "bumper-harvest", "famine", "mining-boom", "ore-shortage",
        "refinery-glut", "fuel-crisis", "free-trade", "trade-war",
      ]).toContain(eventType);
    });

    it("selectWeightedMarketEvent favours shortage events when prices are low", () => {
      // Prices way below base → oversupply → shortage events should be less frequent
      // Prices way above base → scarcity → shortage events more likely
      const basePrices = { food: 5, ore: 8, fuelCells: 12, credits: 1, researchPoints: 15 };
      const highPrices = { food: 10, ore: 16, fuelCells: 24, credits: 1, researchPoints: 15 };
      const lowPrices = { food: 2, ore: 4, fuelCells: 6, credits: 1, researchPoints: 15 };

      const countEvents = (prices: any) => {
        const counts: Record<string, number> = {};
        for (let seed = 0; seed < 1000; seed++) {
          const rng = new SeededRNG(seed);
          const event = selectWeightedMarketEvent(rng, prices, basePrices);
          counts[event] = (counts[event] ?? 0) + 1;
        }
        return counts;
      };

      const highCounts = countEvents(highPrices);
      const lowCounts = countEvents(lowPrices);

      // When prices are high (scarcity), "glut/boom/bumper-harvest" events should be more likely
      // because the market corrects — surplus events push prices back down
      const surplusEventsHigh = (highCounts["bumper-harvest"] ?? 0) + (highCounts["mining-boom"] ?? 0) + (highCounts["refinery-glut"] ?? 0);
      const surplusEventsLow = (lowCounts["bumper-harvest"] ?? 0) + (lowCounts["mining-boom"] ?? 0) + (lowCounts["refinery-glut"] ?? 0);

      // High prices should yield MORE surplus correction events than low prices
      expect(surplusEventsHigh).toBeGreaterThan(surplusEventsLow);
    });
  });
});

/* ── T-101: attack player action ── */

describe("T-101: attack player action", () => {
  /**
   * Augment a minimal game state with a unit-type registry, units, and fleets.
   * Attacker units belong to player empire-0; defender units to empire-1,
   * both stationed at the target system.
   */
  function setupCombat(
    state: GameState,
    opts: {
      targetSystemId: string;
      attackerTypeIds: string[];
      defenderTypeIds: string[];
    },
  ): { attackerUnitIds: UnitId[]; defenderUnitIds: UnitId[] } {
    state.unitTypes = createUnitTypeRegistry();

    const makeUnits = (typeIds: string[], prefix: string): UnitId[] => {
      const ids: UnitId[] = [];
      typeIds.forEach((typeId, i) => {
        const utype = state.unitTypes.get(typeId)!;
        const id = UnitId(`${prefix}-${i}`);
        const unit: Unit = { id, typeId, currentHp: utype.hp, completionCycle: null };
        state.units.set(id, unit);
        ids.push(id);
      });
      return ids;
    };

    const attackerUnitIds = makeUnits(opts.attackerTypeIds, "atk");
    const defenderUnitIds = makeUnits(opts.defenderTypeIds, "def");

    const attackerFleet: Fleet = {
      id: FleetId("fleet-atk"),
      ownerId: EmpireId("empire-0"),
      name: "Attack Fleet",
      locationSystemId: opts.targetSystemId as any,
      unitIds: attackerUnitIds,
      targetSystemId: null,
      arrivalCycle: null,
    };
    state.fleets.set(attackerFleet.id, attackerFleet);

    if (defenderUnitIds.length > 0) {
      const defenderFleet: Fleet = {
        id: FleetId("fleet-def"),
        ownerId: EmpireId("empire-1"),
        name: "Defence Fleet",
        locationSystemId: opts.targetSystemId as any,
        unitIds: defenderUnitIds,
        targetSystemId: null,
        arrivalCycle: null,
      };
      state.fleets.set(defenderFleet.id, defenderFleet);
    }

    return { attackerUnitIds, defenderUnitIds };
  }

  const combatEvents = (result: ReturnType<typeof processCycle>): CombatEvent[] =>
    result.report.events.filter((e): e is CombatEvent => e.type === "combat");

  it("attacker victory transfers ownership", () => {
    const state = makeMinimalGameState();
    // Overwhelming attacker (dreadnought fleet + heavy armour ground) vs empty defender.
    const { attackerUnitIds } = setupCombat(state, {
      targetSystemId: "sys-1",
      attackerTypeIds: ["dreadnought", "heavy-armor", "heavy-armor"],
      defenderTypeIds: [],
    });

    const result = processCycle(
      state,
      { actions: [{ type: "attack", details: { targetSystemId: "sys-1", unitIds: attackerUnitIds } }] },
      new Map(),
      new Map(),
    );

    expect(result.committed).toBe(true);
    const sys1 = result.state.galaxy.systems.get(SystemId("sys-1"))!;
    expect(sys1.owner).toBe("empire-0");
    expect(result.state.empires.get(EmpireId("empire-0"))!.systemIds).toContain(SystemId("sys-1"));
    expect(result.state.empires.get(EmpireId("empire-1"))!.systemIds).not.toContain(SystemId("sys-1"));
  });

  it("attacker defeat leaves ownership unchanged", () => {
    const state = makeMinimalGameState();
    // Lone attacker infantry vs overwhelming defender infantry.
    const { attackerUnitIds } = setupCombat(state, {
      targetSystemId: "sys-1",
      attackerTypeIds: ["infantry"],
      defenderTypeIds: ["infantry", "infantry", "infantry", "infantry", "infantry"],
    });

    const result = processCycle(
      state,
      { actions: [{ type: "attack", details: { targetSystemId: "sys-1", unitIds: attackerUnitIds } }] },
      new Map(),
      new Map(),
    );

    const sys1 = result.state.galaxy.systems.get(SystemId("sys-1"))!;
    expect(sys1.owner).toBe("empire-1");
    expect(result.state.empires.get(EmpireId("empire-1"))!.systemIds).toContain(SystemId("sys-1"));
    expect(result.state.empires.get(EmpireId("empire-0"))!.systemIds).not.toContain(SystemId("sys-1"));

    // A combat event is still recorded, with the defender as victor.
    const evts = combatEvents(result);
    expect(evts.length).toBe(1);
    expect(evts[0].victor).toBe("empire-1");
    expect(evts[0].ownershipChanged).toBe(false);
  });

  it("deducts casualties from both empires' rosters", () => {
    const state = makeMinimalGameState();
    const { attackerUnitIds } = setupCombat(state, {
      targetSystemId: "sys-1",
      attackerTypeIds: ["infantry", "infantry", "infantry"],
      defenderTypeIds: ["infantry", "infantry", "infantry"],
    });

    const unitsBefore = state.units.size;
    const atkFleetBefore = state.fleets.get(FleetId("fleet-atk"))!.unitIds.length;
    const defFleetBefore = state.fleets.get(FleetId("fleet-def"))!.unitIds.length;

    const result = processCycle(
      state,
      { actions: [{ type: "attack", details: { targetSystemId: "sys-1", unitIds: attackerUnitIds } }] },
      new Map(),
      new Map(),
    );

    // Both rosters shrank (selectCasualties floors to at least 1 per side).
    expect(result.state.units.size).toBeLessThan(unitsBefore);
    expect(result.state.fleets.get(FleetId("fleet-atk"))!.unitIds.length).toBeLessThan(atkFleetBefore);
    expect(result.state.fleets.get(FleetId("fleet-def"))!.unitIds.length).toBeLessThan(defFleetBefore);

    const evts = combatEvents(result);
    expect(evts[0].attackerCasualties!.length).toBeGreaterThan(0);
    expect(evts[0].defenderCasualties!.length).toBeGreaterThan(0);
  });

  it("attacking with 0 units is a no-op", () => {
    const state = makeMinimalGameState();
    setupCombat(state, { targetSystemId: "sys-1", attackerTypeIds: ["infantry"], defenderTypeIds: ["infantry"] });

    const result = processCycle(
      state,
      { actions: [{ type: "attack", details: { targetSystemId: "sys-1", unitIds: [] } }] },
      new Map(),
      new Map(),
    );

    expect(result.state.galaxy.systems.get(SystemId("sys-1"))!.owner).toBe("empire-1");
    expect(combatEvents(result).length).toBe(0);
  });

  it("attacking own system is a no-op", () => {
    const state = makeMinimalGameState();
    const { attackerUnitIds } = setupCombat(state, {
      targetSystemId: "sys-1",
      attackerTypeIds: ["dreadnought"],
      defenderTypeIds: [],
    });

    const result = processCycle(
      state,
      { actions: [{ type: "attack", details: { targetSystemId: "sys-0", unitIds: attackerUnitIds } }] },
      new Map(),
      new Map(),
    );

    expect(result.state.galaxy.systems.get(SystemId("sys-0"))!.owner).toBe("empire-0");
    expect(combatEvents(result).length).toBe(0);
  });

  it("attacking an unclaimed system is a no-op", () => {
    const state = makeMinimalGameState(5); // sys-5..sys-9 are unowned
    const { attackerUnitIds } = setupCombat(state, {
      targetSystemId: "sys-9",
      attackerTypeIds: ["dreadnought", "heavy-armor"],
      defenderTypeIds: [],
    });

    const result = processCycle(
      state,
      { actions: [{ type: "attack", details: { targetSystemId: "sys-9", unitIds: attackerUnitIds } }] },
      new Map(),
      new Map(),
    );

    expect(result.state.galaxy.systems.get(SystemId("sys-9"))!.owner).toBe(null);
    expect(combatEvents(result).length).toBe(0);
  });

  it("attacking a nonexistent system is a no-op", () => {
    const state = makeMinimalGameState();
    const { attackerUnitIds } = setupCombat(state, {
      targetSystemId: "sys-1",
      attackerTypeIds: ["dreadnought"],
      defenderTypeIds: [],
    });

    const result = processCycle(
      state,
      { actions: [{ type: "attack", details: { targetSystemId: "sys-999", unitIds: attackerUnitIds } }] },
      new Map(),
      new Map(),
    );

    expect(combatEvents(result).length).toBe(0);
    // sys-1 untouched
    expect(result.state.galaxy.systems.get(SystemId("sys-1"))!.owner).toBe("empire-1");
  });

  it("attacking with a nonexistent force is a no-op", () => {
    const state = makeMinimalGameState();
    setupCombat(state, { targetSystemId: "sys-1", attackerTypeIds: ["infantry"], defenderTypeIds: ["infantry"] });

    const result = processCycle(
      state,
      { actions: [{ type: "attack", details: { targetSystemId: "sys-1", unitIds: ["ghost-unit"] } }] },
      new Map(),
      new Map(),
    );

    expect(result.state.galaxy.systems.get(SystemId("sys-1"))!.owner).toBe("empire-1");
    expect(combatEvents(result).length).toBe(0);
  });

  it("pushes a combat event carrying phase-by-phase results", () => {
    const state = makeMinimalGameState();
    const { attackerUnitIds } = setupCombat(state, {
      targetSystemId: "sys-1",
      attackerTypeIds: ["dreadnought", "heavy-armor", "heavy-armor"],
      defenderTypeIds: [],
    });

    const result = processCycle(
      state,
      { actions: [{ type: "attack", details: { targetSystemId: "sys-1", unitIds: attackerUnitIds } }] },
      new Map(),
      new Map(),
    );

    const evts = combatEvents(result);
    expect(evts.length).toBe(1);
    const evt = evts[0];
    expect(evt.results).toBeDefined();
    expect(evt.results!.length).toBe(evt.phasesFought!.length);
    expect(evt.results!.length).toBeGreaterThan(0);
    for (const phaseResult of evt.results!) {
      expect(phaseResult.phase).toBeDefined();
      expect(phaseResult.victor).toBeDefined();
      expect(Array.isArray(phaseResult.attackerLosses)).toBe(true);
      expect(Array.isArray(phaseResult.defenderLosses)).toBe(true);
    }
    expect(evt.ownershipChanged).toBe(true);
    expect(evt.victor).toBe("empire-0");
    // Includes the decisive ground-assault phase.
    expect(evt.phasesFought).toContain("ground-assault");
  });
});

describe("T-205: deterministic cycle randomness", () => {
  // Give the player (empire-0) a covert reserve so `launch-covert-op` resolves.
  function withPlayerCovert(state: GameState, agentPool = 1000): GameState {
    state.covert = { empireStates: new Map() };
    state.covert.empireStates.set(EmpireId("empire-0"), {
      empireId: EmpireId("empire-0"),
      agentPool,
      intelLevel: 0,
      queuedOps: [],
      totalOpsCompleted: 0,
      timesDetectedAsAttacker: 0,
    });
    return state;
  }

  // Extract the launch-covert-op outcome event emitted for the player this cycle.
  function covertOpOutcome(
    result: ReturnType<typeof processCycle>,
  ): "op-succeeded" | "op-detected" | "op-failed" | undefined {
    const evt = result.report.events.find(
      (e: any) =>
        e.type === "covert" &&
        e.attackerId === EmpireId("empire-0") &&
        (e.kind === "op-succeeded" || e.kind === "op-detected" || e.kind === "op-failed"),
    ) as any;
    return evt?.kind;
  }

  const covertAction: PlayerActions = {
    actions: [
      {
        type: "launch-covert-op",
        details: { targetId: EmpireId("empire-1"), opType: "sabotage-production" },
      },
    ],
  };

  it("covert op: two identical states produce identical outcomes", () => {
    const a = withPlayerCovert(makeMinimalGameState(1));
    const b = withPlayerCovert(makeMinimalGameState(1));

    const ra = processCycle(a, covertAction, new Map(), new Map());
    const rb = processCycle(b, covertAction, new Map(), new Map());

    const outcomeA = covertOpOutcome(ra);
    const outcomeB = covertOpOutcome(rb);

    expect(outcomeA).toBeDefined();
    expect(outcomeA).toBe(outcomeB);

    // Full covert-event arrays for the player match exactly.
    const covertA = ra.report.events.filter(
      (e: any) => e.type === "covert" && e.attackerId === EmpireId("empire-0"),
    );
    const covertB = rb.report.events.filter(
      (e: any) => e.type === "covert" && e.attackerId === EmpireId("empire-0"),
    );
    expect(covertA).toEqual(covertB);
  });

  it("wormhole: two identical states produce identical wormhole ids", () => {
    function withWormholeState(): GameState {
      const state = makeMinimalGameState(1);
      const empire = state.empires.get(EmpireId("empire-0"))!;
      empire.resources.credits = 30000;
      empire.resources.ore = 10000;
      return state;
    }
    const wormholeAction: PlayerActions = {
      actions: [{ type: "build-wormhole", details: { targetSystemId: SystemId("sys-1") } }],
    };

    const ra = processCycle(withWormholeState(), wormholeAction, new Map(), new Map());
    const rb = processCycle(withWormholeState(), wormholeAction, new Map(), new Map());

    const idA = ra.state.galaxy.wormholes?.[0]?.id;
    const idB = rb.state.galaxy.wormholes?.[0]?.id;

    expect(idA).toBeDefined();
    expect(idA).toBe(idB);
    // No unseeded base36 fragment — id is fully state-derived.
    expect(idA).toMatch(/^wh-empire-0-\d+-[0-9a-z]+$/);
  });

  it("covert op: ~100 varied seeds land within ±10 points of the 70% success rate", () => {
    let successes = 0;
    let detected = 0;
    let failed = 0;
    const N = 120;

    for (let i = 0; i < N; i++) {
      // Vary targetId so each op derives a distinct seed while staying deterministic.
      const action: PlayerActions = {
        actions: [
          {
            type: "launch-covert-op",
            details: { targetId: EmpireId(`target-${i}`), opType: "sabotage-production" },
          },
        ],
      };
      const state = withPlayerCovert(makeMinimalGameState(1));
      const result = processCycle(state, action, new Map(), new Map());
      const outcome = covertOpOutcome(result);
      expect(outcome).toBeDefined();
      if (outcome === "op-succeeded") successes++;
      else if (outcome === "op-detected") detected++;
      else failed++;
    }

    const successRate = (successes / N) * 100;
    // 70% ± 10 points.
    expect(successRate).toBeGreaterThanOrEqual(60);
    expect(successRate).toBeLessThanOrEqual(80);

    // Among failures, detected-vs-failed should be roughly balanced (loose bound).
    const failures = detected + failed;
    expect(failures).toBeGreaterThan(0);
    expect(detected / failures).toBeGreaterThan(0.25);
    expect(detected / failures).toBeLessThan(0.75);
  });

  // T-116: tutorial state through the cycle
  describe("Tutorial state (T-116)", () => {
    const activeTutorial = (objectiveIndex: number): TutorialState => ({
      active: true,
      objectiveIndex,
      completed: [],
      signals: [],
      baselineUnitCount: 0,
      skipped: false,
    });

    it("a pre-change serialized state (no tutorial key) deserializes and processes one cycle cleanly", () => {
      const original = makeMinimalGameState(3);
      // Serialize/deserialize simulates loading an old save with no `tutorial` key.
      const json = serializeGameState(original);
      expect(json).not.toContain("tutorial");
      const revived = deserializeGameState(json);
      expect(revived.tutorial).toBeUndefined();

      const result = processCycle(revived, { actions: [] }, new Map(), new Map());
      expect(result.committed).toBe(true);
      expect(result.state.tutorial).toBeUndefined();
    });

    it("market action mark completes the market objective through processCycle", () => {
      const state = makeMinimalGameState(3);
      state.market = {
        prices: { food: 5, ore: 8, fuelCells: 12 },
        basePrices: { food: 5, ore: 8, fuelCells: 12 },
        priceHistory: [],
      };
      state.tutorial = activeTutorial(3); // "market" objective

      const result = processCycle(
        state,
        { actions: [{ type: "trade", details: { resource: "ore", quantity: 10, direction: "sell" } }] },
        new Map(), new Map(),
      );

      expect(result.committed).toBe(true);
      expect(result.state.tutorial).toBeDefined();
      expect(result.state.tutorial!.signals).toContain("market");
      expect(result.state.tutorial!.objectiveIndex).toBe(4);
    });

    it("move-fleet action mark completes the combat-prep objective through processCycle", () => {
      const state = makeMinimalGameState(3);
      const fleetId = FleetId("player-fleet");
      state.fleets.set(fleetId, {
        id: fleetId,
        ownerId: EmpireId("empire-0"),
        name: "Home Fleet",
        locationSystemId: SystemId("sys-0"),
        unitIds: [],
        targetSystemId: null,
        arrivalCycle: null,
      });
      state.empires.get(EmpireId("empire-0"))!.fleetIds = [fleetId];
      state.tutorial = activeTutorial(4); // "combat-prep" objective

      const result = processCycle(
        state,
        { actions: [{ type: "move-fleet", details: { fleetId, targetSystemId: SystemId("sys-1") } }] },
        new Map(), new Map(),
      );

      expect(result.committed).toBe(true);
      expect(result.state.tutorial!.signals).toContain("move-fleet");
      expect(result.state.tutorial!.objectiveIndex).toBe(5);
    });

    it("preserves tutorial across the deep clone even with no matching action", () => {
      const state = makeMinimalGameState(3);
      state.tutorial = activeTutorial(0);
      const result = processCycle(state, { actions: [] }, new Map(), new Map());
      expect(result.state.tutorial).toBeDefined();
      expect(result.state.tutorial!.active).toBe(true);
      // Original state's tutorial object is not mutated by the clone-based processing.
      expect(state.tutorial.objectiveIndex).toBe(0);
    });
  });
});
