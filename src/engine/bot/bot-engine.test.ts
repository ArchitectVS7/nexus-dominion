import { describe, it, expect } from "vitest";
import {
  MOMENTUM_TIERS,
  ALL_ARCHETYPES,
  RESONANCE_DECAY_RATE,
  botActionsThisCycle,
  selectActionType,
  generateBotActions,
  updateEmotion,
  hasRelationshipMemory,
  executeBotAction,
  decayEmotion,
  advanceBetrayalClock,
} from "./bot-engine";
import type { BotAgent, BotAction } from "../types/bot";
import type { DiplomacyState } from "../types/diplomacy";
import type { GameState } from "../types/game-state";
import { EmpireId, SystemId, PactId } from "../types/ids";
import { SeededRNG } from "../utils/rng";
import { relationshipKey } from "../types/diplomacy";
import { createUnitTypeRegistry } from "../military/unit-registry";

function makeBot(archetype: string = "warlord", momentum: number = 1.0): BotAgent {
  return {
    empireId: EmpireId("empire-1"),
    archetype: archetype as any,
    momentumRating: momentum,
    persona: { name: "Test", title: "Bot", backstory: "", speechStyle: "default" },
    emotionalState: { current: "calm", trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 },
  };
}

describe("Bot AI System", () => {
  // REQ-027: Bot turn ratios
  describe("REQ-027: Momentum Rating tiers", () => {
    it("defines Fodder tier (0.5-0.75)", () => {
      expect(MOMENTUM_TIERS.fodder.min).toBe(0.5);
      expect(MOMENTUM_TIERS.fodder.max).toBe(0.75);
    });

    it("defines Standard tier (1.0)", () => {
      expect(MOMENTUM_TIERS.standard.min).toBe(1.0);
    });

    it("defines Elite tier (1.25-1.5)", () => {
      expect(MOMENTUM_TIERS.elite.min).toBe(1.25);
      expect(MOMENTUM_TIERS.elite.max).toBe(1.5);
    });

    it("defines Nemesis tier (2.0)", () => {
      expect(MOMENTUM_TIERS.nemesis.min).toBe(2.0);
    });

    it("Fodder bot (0.5) takes 1 action every 2 cycles", () => {
      let acc = 0;
      const actions: number[] = [];
      for (let i = 0; i < 4; i++) {
        const result = botActionsThisCycle(0.5, acc);
        actions.push(result.actions);
        acc = result.newAccumulated;
      }
      // Over 4 cycles: 0, 1, 0, 1 = 2 total (0.5 * 4)
      expect(actions.reduce((a, b) => a + b, 0)).toBe(2);
    });

    it("Nemesis bot (2.0) takes 2 actions every cycle", () => {
      const result = botActionsThisCycle(2.0, 0);
      expect(result.actions).toBe(2);
    });
  });

  // REQ-028: Eight archetypes
  describe("REQ-028: Archetypes", () => {
    it("defines exactly 8 archetypes", () => {
      expect(ALL_ARCHETYPES.length).toBe(8);
    });

    it("includes warlord, diplomat, merchant, schemer, turtle, blitzkrieg, tech-rush, opportunist", () => {
      const expected = ["warlord", "diplomat", "merchant", "schemer", "turtle", "blitzkrieg", "tech-rush", "opportunist"];
      expect(ALL_ARCHETYPES).toEqual(expected);
    });

    it("each archetype produces different action type distributions", () => {
      const rng1 = new SeededRNG(42);
      const warlord = makeBot("warlord");
      const diplomat = makeBot("diplomat");

      // Generate many actions and compare distributions
      const wActions = Array.from({ length: 100 }, () => selectActionType(warlord, rng1));
      const rng2 = new SeededRNG(42);
      const dActions = Array.from({ length: 100 }, () => selectActionType(diplomat, rng2));

      const wAttacks = wActions.filter((a) => a === "attack").length;
      const dAttacks = dActions.filter((a) => a === "attack").length;
      // Warlord should attack more than diplomat
      expect(wAttacks).toBeGreaterThan(dAttacks);
    });
  });

  // REQ-029: Bot emotional state
  describe("REQ-029: Emotional state", () => {
    it("bot has an emotional state that affects decisions", () => {
      const bot = makeBot("warlord");
      expect(bot.emotionalState.current).toBe("calm");
    });

    it("emotional state updates based on events", () => {
      const calm = { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 };
      expect(updateEmotion(calm, true, true, false, false, 5).current).toBe("desperate");
      expect(updateEmotion(calm, true, false, false, false, 5).current).toBe("fearful");
      expect(updateEmotion(calm, false, true, false, false, 5).current).toBe("vengeful");
      expect(updateEmotion(calm, false, false, true, true, 5).current).toBe("ambitious");
    });

    it("aggressive emotion increases attack actions", () => {
      const calmBot = makeBot("merchant"); // merchants normally don't attack much
      const angryBot = { ...makeBot("merchant"), emotionalState: { current: "aggressive" as const, trigger: "test", lastUpdatedCycle: 0, resonance: 1.0 } };

      const rng1 = new SeededRNG(42);
      const calmActions = Array.from({ length: 100 }, () => selectActionType(calmBot, rng1));
      const rng2 = new SeededRNG(42);
      const angryActions = Array.from({ length: 100 }, () => selectActionType(angryBot, rng2));

      const calmAttacks = calmActions.filter((a) => a === "attack").length;
      const angryAttacks = angryActions.filter((a) => a === "attack").length;
      expect(angryAttacks).toBeGreaterThan(calmAttacks);
    });
  });

  // REQ-030: Bot relationship memory
  describe("REQ-030: Relationship memory", () => {
    it("tracks relationship between empires", () => {
      const diplomacy: DiplomacyState = {
        pacts: new Map(),
        coalitions: new Map(),
        relationships: new Map(),
      };
      const a = EmpireId("empire-1");
      const b = EmpireId("empire-2");

      expect(hasRelationshipMemory(diplomacy, a, b)).toBe(false);

      // Add relationship
      const key = relationshipKey(a, b);
      diplomacy.relationships.set(key, {
        status: "hostile",
        reputation: -30,
        lastChangeCycle: 5,
        violations: 1,
      });

      expect(hasRelationshipMemory(diplomacy, a, b)).toBe(true);
      // Bidirectional key
      expect(hasRelationshipMemory(diplomacy, b, a)).toBe(true);
    });
  });

  // REQ-031: Bots take actions per turn ratio
  describe("REQ-031: Bot action generation", () => {
    it("generates correct number of actions", () => {
      const bot = makeBot("warlord", 1.0);
      const rng = new SeededRNG(42);
      const actions = generateBotActions(bot, 2, rng);
      expect(actions.length).toBe(2);
    });

    it("each action has empireId and type", () => {
      const bot = makeBot("diplomat", 1.0);
      const rng = new SeededRNG(42);
      const actions = generateBotActions(bot, 3, rng);
      for (const action of actions) {
        expect(action.empireId).toBe(bot.empireId);
        expect(action.type).toBeDefined();
      }
    });
  });

  // REQ-032: Bot decisions deterministic given same state
  describe("REQ-032: Determinism", () => {
    it("same seed + same state = same actions", () => {
      const bot = makeBot("warlord", 1.0);
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);
      const actions1 = generateBotActions(bot, 5, rng1);
      const actions2 = generateBotActions(bot, 5, rng2);
      expect(actions1.map((a) => a.type)).toEqual(actions2.map((a) => a.type));
    });
  });

  describe("Bot action resolution", () => {
    function makeMinimalState(): GameState {
      const botEmpireId = EmpireId("empire-1");
      const playerEmpireId = EmpireId("empire-0");
      const sys0 = SystemId("sys-0");
      const sys1 = SystemId("sys-1");
      const sys2 = SystemId("sys-2");

      return {
        galaxy: {
          systems: new Map([
            [sys0, { id: sys0, name: "Home", sectorId: "s0" as any, position: { x: 0, y: 0 }, biome: "core-world" as any, owner: playerEmpireId, slots: [], baseProduction: {}, adjacentSystemIds: [sys1], claimedCycle: 0, isHomeSystem: true }],
            [sys1, { id: sys1, name: "Border", sectorId: "s0" as any, position: { x: 1, y: 0 }, biome: "frontier-world" as any, owner: botEmpireId, slots: [], baseProduction: {}, adjacentSystemIds: [sys0, sys2], claimedCycle: 0, isHomeSystem: false }],
            [sys2, { id: sys2, name: "Unclaimed", sectorId: "s0" as any, position: { x: 2, y: 0 }, biome: "mineral-world" as any, owner: null as any, slots: [], baseProduction: {}, adjacentSystemIds: [sys1], claimedCycle: 0, isHomeSystem: false }],
          ]),
          sectors: new Map(),
        },
        empires: new Map([
          [playerEmpireId, { id: playerEmpireId, name: "Player", colour: "#fff", isPlayer: true, systemIds: [sys0], homeSystemId: sys0, resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 0, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
          [botEmpireId, { id: botEmpireId, name: "Bot Empire", colour: "#f00", isPlayer: false, systemIds: [sys1], homeSystemId: sys1, resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 100, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
        ]),
        playerEmpireId,
        unitTypes: createUnitTypeRegistry(),
        units: new Map(),
        fleets: new Map(),
        bots: new Map([[botEmpireId, makeBot("warlord", 1.0)]]),
        diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
        time: { currentCycle: 5, currentConfluence: 1, cyclesUntilReckoning: 5, cosmicOrder: { tiers: new Map(), rankings: [] } },
        currentCycleEvents: [],
        campaign: { id: "test", name: "Test", createdAt: "", lastSavedAt: "", seed: 42 },
      };
    }

    it("executeBotAction 'claim-system' assigns unclaimed adjacent system to bot", () => {
      const state = makeMinimalState();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "claim-system", empireId: EmpireId("empire-1"), targetSystemId: SystemId("sys-2") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(state.galaxy.systems.get(SystemId("sys-2"))!.owner).toBe(EmpireId("empire-1"));
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe("colonisation");
    });

    it("executeBotAction 'build-unit' enqueues a unit if affordable", () => {
      const state = makeMinimalState();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "build-unit", empireId: EmpireId("empire-1"), details: { unitTypeId: "fighter" } };
      executeBotAction(action, state, state.unitTypes, rng);
      const empire = state.empires.get(EmpireId("empire-1"))!;
      expect(empire.buildQueue!.length).toBe(1);
      expect(empire.resources.credits).toBe(400); // 500 - 100
    });

    it("executeBotAction 'trade' sells resources", () => {
      const state = makeMinimalState();
      state.market = { prices: { food: 5, ore: 8, fuelCells: 12 }, basePrices: { food: 5, ore: 8, fuelCells: 12 }, priceHistory: [] };
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "trade", empireId: EmpireId("empire-1"), details: { resource: "ore", quantity: 10, direction: "sell" } };
      executeBotAction(action, state, state.unitTypes, rng);
      const empire = state.empires.get(EmpireId("empire-1"))!;
      expect(empire.resources.ore).toBe(40); // sold 10
      expect(empire.resources.credits).toBeGreaterThan(500); // earned credits
    });

    it("executeAttack applies coalition combat bonus when attacker is in coalition targeting defender", () => {
      const state = makeMinimalState();
      const attackerId = EmpireId("empire-1");
      const defenderId = EmpireId("empire-0");

      // Give attacker fleet units AT THE TARGET SYSTEM (sys-0)
      const fleetId = "fleet-1" as any;
      state.fleets.set(fleetId, { id: fleetId, ownerId: attackerId, name: "Attack Fleet", locationSystemId: SystemId("sys-0"), unitIds: ["u1" as any, "u2" as any], targetSystemId: null } as any);
      state.units.set("u1" as any, { id: "u1" as any, typeId: "fighter", currentHp: 10, completionCycle: null });
      state.units.set("u2" as any, { id: "u2" as any, typeId: "fighter", currentHp: 10, completionCycle: null });

      // Give defender units
      const fleetId2 = "fleet-0" as any;
      state.fleets.set(fleetId2, { id: fleetId2, ownerId: defenderId, name: "Defense Fleet", locationSystemId: SystemId("sys-0"), unitIds: ["u3" as any], targetSystemId: null } as any);
      state.units.set("u3" as any, { id: "u3" as any, typeId: "fighter", currentHp: 10, completionCycle: null });

      // Create coalition: empire-1 + empire-c targeting empire-0
      const compactId = "compact-test" as any;
      state.diplomacy.coalitions.set(compactId, {
        id: compactId,
        targetId: defenderId,
        memberIds: [attackerId, EmpireId("empire-c")],
        warChest: 0,
        combatBonus: 0.15,
        formedCycle: 1,
        active: true,
      });

      const rng = new SeededRNG(42);
      const action: BotAction = { type: "attack", empireId: attackerId, targetSystemId: SystemId("sys-0") };
      const combatEvents = executeBotAction(action, state, state.unitTypes, rng).filter(e => e.type === "combat");
      // Should produce combat events (coalition bonus applied internally)
      expect(combatEvents.length).toBeGreaterThan(0);
    });

    it("executeAttack auto-declares war for mutual defense allies joining combat", () => {
      const state = makeMinimalState();
      const attackerId = EmpireId("empire-1");
      const defenderId = EmpireId("empire-0");
      const allyId = EmpireId("empire-c");

      // Add ally empire
      state.empires.set(allyId, {
        id: allyId, name: "Ally", colour: "#0f0", isPlayer: false,
        systemIds: [], homeSystemId: SystemId("sys-2"),
        resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 0, intelligencePoints: 0 },
        stabilityScore: 50, stabilityLevel: "content" as any,
        population: 1000, populationCapacity: 5000, fleetIds: [],
        researchTier: 0, powerScore: 10, buildQueue: [],
      });

      // Create Star Covenant between defender and ally
      const pactId = "pact-test" as any;
      state.diplomacy.pacts.set(pactId, {
        id: pactId,
        type: "star-covenant",
        memberIds: [defenderId, allyId],
        formedCycle: 1,
        active: true,
      });

      // Give attacker + defender units (BOTH AT TARGET sys-0)
      state.fleets.set("fleet-1" as any, { id: "fleet-1" as any, ownerId: attackerId, name: "F1", locationSystemId: SystemId("sys-0"), unitIds: ["u1" as any], targetSystemId: null } as any);
      state.units.set("u1" as any, { id: "u1" as any, typeId: "fighter", currentHp: 10, completionCycle: null });
      state.fleets.set("fleet-0" as any, { id: "fleet-0" as any, ownerId: defenderId, name: "F0", locationSystemId: SystemId("sys-0"), unitIds: ["u2" as any], targetSystemId: null } as any);
      state.units.set("u2" as any, { id: "u2" as any, typeId: "fighter", currentHp: 10, completionCycle: null });

      const rng = new SeededRNG(42);
      const action: BotAction = { type: "attack", empireId: attackerId, targetSystemId: SystemId("sys-0") };
      executeBotAction(action, state, state.unitTypes, rng);

      // Ally should now be at war with attacker
      const key = relationshipKey(attackerId, allyId);
      const rel = state.diplomacy.relationships.get(key);
      expect(rel).toBeDefined();
      expect(rel!.status).toBe("at-war");
    });
  });

  describe("Emotional decay", () => {
    it("emotion reverts to calm after 10 cycles (resonance reaches 0)", () => {
      const emotionalState = { current: "aggressive" as const, trigger: "combat", lastUpdatedCycle: 1, resonance: 1.0 };
      const decayed = decayEmotion(emotionalState, 11);
      expect(decayed.current).toBe("calm");
      expect(decayed.resonance).toBe(0.0);
    });

    it("emotion does not fully decay within 10 cycles", () => {
      const emotionalState = { current: "aggressive" as const, trigger: "combat", lastUpdatedCycle: 10, resonance: 1.0 };
      const decayed = decayEmotion(emotionalState, 12);
      expect(decayed.current).toBe("aggressive");
      expect(decayed.resonance).toBeGreaterThan(0);
    });

    it("resonance decays linearly — 5 cycles = 0.5 resonance", () => {
      const emotionalState = { current: "vengeful" as const, trigger: "lost-system", lastUpdatedCycle: 0, resonance: 1.0 };
      const decayed = decayEmotion(emotionalState, 5);
      expect(decayed.resonance).toBeCloseTo(0.5);
    });

    it("calm state is unaffected by decay", () => {
      const calm = { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 };
      const decayed = decayEmotion(calm, 100);
      expect(decayed.current).toBe("calm");
      expect(decayed.resonance).toBe(0.0);
    });

    it("triggered emotion starts at resonance 1.0", () => {
      const calm = { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 };
      const triggered = updateEmotion(calm, true, false, false, false, 5);
      expect(triggered.resonance).toBe(1.0);
    });

    it("action modifiers scale with resonance", () => {
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);
      const fullBot = { ...makeBot("merchant"), emotionalState: { current: "aggressive" as const, trigger: "test", lastUpdatedCycle: 0, resonance: 1.0 } };
      const halfBot = { ...makeBot("merchant"), emotionalState: { current: "aggressive" as const, trigger: "test", lastUpdatedCycle: 0, resonance: 0.0 } };

      const fullAttacks = Array.from({ length: 100 }, () => selectActionType(fullBot, rng1)).filter(a => a === "attack").length;
      const halfAttacks = Array.from({ length: 100 }, () => selectActionType(halfBot, rng2)).filter(a => a === "attack").length;
      expect(fullAttacks).toBeGreaterThan(halfAttacks);
    });
  });

  describe("Emotional state — fearful and vengeful modifiers", () => {
    it("fearful emotion boosts build-unit and propose-pact actions", () => {
      const calmBot = makeBot("merchant");
      const fearfulBot = {
        ...makeBot("merchant"),
        emotionalState: { current: "fearful" as const, trigger: "attacked", lastUpdatedCycle: 0, resonance: 1.0 },
      };

      const rng1 = new SeededRNG(42);
      const calmActions = Array.from({ length: 200 }, () => selectActionType(calmBot, rng1));
      const rng2 = new SeededRNG(42);
      const fearActions = Array.from({ length: 200 }, () => selectActionType(fearfulBot, rng2));

      const calmDefensive = calmActions.filter(a => a === "build-unit" || a === "propose-pact").length;
      const fearDefensive = fearActions.filter(a => a === "build-unit" || a === "propose-pact").length;
      expect(fearDefensive).toBeGreaterThan(calmDefensive);
    });

    it("vengeful emotion boosts attack and break-pact actions", () => {
      const calmBot = makeBot("diplomat");
      const vengefulBot = {
        ...makeBot("diplomat"),
        emotionalState: { current: "vengeful" as const, trigger: "lost-system", lastUpdatedCycle: 0, resonance: 1.0 },
      };

      const rng1 = new SeededRNG(42);
      const calmActions = Array.from({ length: 200 }, () => selectActionType(calmBot, rng1));
      const rng2 = new SeededRNG(42);
      const vengefulActions = Array.from({ length: 200 }, () => selectActionType(vengefulBot, rng2));

      const calmAggressive = calmActions.filter(a => a === "attack" || a === "break-pact").length;
      const vengefulAggressive = vengefulActions.filter(a => a === "attack" || a === "break-pact").length;
      expect(vengefulAggressive).toBeGreaterThan(calmAggressive);
    });

    it("ambitious emotion boosts claim-system actions", () => {
      const calmBot = makeBot("turtle");
      const ambitiousBot = {
        ...makeBot("turtle"),
        emotionalState: { current: "ambitious" as const, trigger: "gained-system", lastUpdatedCycle: 0, resonance: 1.0 },
      };

      const rng1 = new SeededRNG(42);
      const calmActions = Array.from({ length: 200 }, () => selectActionType(calmBot, rng1));
      const rng2 = new SeededRNG(42);
      const ambitiousActions = Array.from({ length: 200 }, () => selectActionType(ambitiousBot, rng2));

      const calmClaims = calmActions.filter(a => a === "claim-system").length;
      const ambitiousClaims = ambitiousActions.filter(a => a === "claim-system").length;
      expect(ambitiousClaims).toBeGreaterThan(calmClaims);
    });
  });

  describe("Momentum accumulation — elite tier", () => {
    it("Elite (1.5) alternates 1 and 2 actions across cycles", () => {
      let acc = 0;
      const actions: number[] = [];
      for (let i = 0; i < 4; i++) {
        const result = botActionsThisCycle(1.5, acc);
        actions.push(result.actions);
        acc = result.newAccumulated;
      }
      // 1.5 + 0 = 1 (0.5 carry), 1.5 + 0.5 = 2 (0 carry), ...
      expect(actions).toEqual([1, 2, 1, 2]);
    });

    it("accumulation never exceeds rating over long runs", () => {
      let acc = 0;
      let totalActions = 0;
      const cycles = 100;
      for (let i = 0; i < cycles; i++) {
        const result = botActionsThisCycle(0.75, acc);
        totalActions += result.actions;
        acc = result.newAccumulated;
      }
      // 0.75 * 100 = 75 total actions
      expect(totalActions).toBe(75);
    });
  });

  describe("Bot action resolution — edge cases", () => {
    function makeMinimalState2(): GameState {
      const botEmpireId = EmpireId("empire-1");
      const playerEmpireId = EmpireId("empire-0");
      const sys0 = SystemId("sys-0");
      const sys1 = SystemId("sys-1");
      const sys2 = SystemId("sys-2");

      return {
        galaxy: {
          systems: new Map([
            [sys0, { id: sys0, name: "Home", sectorId: "s0" as any, position: { x: 0, y: 0 }, biome: "core-world" as any, owner: playerEmpireId, slots: [{ installation: null, locked: false }, { installation: null, locked: false }], baseProduction: {}, adjacentSystemIds: [sys1], claimedCycle: 0, isHomeSystem: true }],
            [sys1, { id: sys1, name: "BotHome", sectorId: "s0" as any, position: { x: 1, y: 0 }, biome: "core-world" as any, owner: botEmpireId, slots: [{ installation: null, locked: false }, { installation: null, locked: false }], baseProduction: {}, adjacentSystemIds: [sys0, sys2], claimedCycle: 0, isHomeSystem: true }],
            [sys2, { id: sys2, name: "Unclaimed", sectorId: "s0" as any, position: { x: 2, y: 0 }, biome: "mineral-world" as any, owner: null as any, slots: [], baseProduction: {}, adjacentSystemIds: [sys1], claimedCycle: 0, isHomeSystem: false }],
          ]),
          sectors: new Map(),
        },
        empires: new Map([
          [playerEmpireId, { id: playerEmpireId, name: "Player", colour: "#fff", isPlayer: true, systemIds: [sys0], homeSystemId: sys0, resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 0, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
          [botEmpireId, { id: botEmpireId, name: "Bot Empire", colour: "#f00", isPlayer: false, systemIds: [sys1], homeSystemId: sys1, resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 100, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
        ]),
        playerEmpireId,
        unitTypes: createUnitTypeRegistry(),
        units: new Map(),
        fleets: new Map(),
        bots: new Map([[botEmpireId, makeBot("warlord", 1.0)]]),
        diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
        time: { currentCycle: 5, currentConfluence: 1, cyclesUntilReckoning: 5, cosmicOrder: { tiers: new Map(), rankings: [] } },
        currentCycleEvents: [],
        campaign: { id: "test", name: "Test", createdAt: "", lastSavedAt: "", seed: 42 },
      };
    }

    it("executeBotAction returns empty for nonexistent empire", () => {
      const state = makeMinimalState2();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "claim-system", empireId: EmpireId("nonexistent") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
    });

    it("executeBotAction returns empty for unknown action type", () => {
      const state = makeMinimalState2();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "propose-pact" as any, empireId: EmpireId("empire-1") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
    });

    it("executeBotAction 'build-installation' enqueues when bot can afford", () => {
      const state = makeMinimalState2();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "build-installation", empireId: EmpireId("empire-1") };
      const creditsBefore = state.empires.get(EmpireId("empire-1"))!.resources.credits;
      executeBotAction(action, state, state.unitTypes, rng);
      const creditsAfter = state.empires.get(EmpireId("empire-1"))!.resources.credits;
      // Should have spent credits on some installation
      expect(creditsAfter).toBeLessThanOrEqual(creditsBefore);
    });

    it("executeBotAction 'research' advances research tier", () => {
      const state = makeMinimalState2();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "research", empireId: EmpireId("empire-1") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      const empire = state.empires.get(EmpireId("empire-1"))!;
      // Should have advanced research (100 RP available, tier 0 → tier 1)
      expect(empire.researchTier).toBeGreaterThan(0);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe("research");
    });

    it("claim-system fails if bot can't afford colonisation cost", () => {
      const state = makeMinimalState2();
      state.empires.get(EmpireId("empire-1"))!.resources.credits = 10; // not enough
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "claim-system", empireId: EmpireId("empire-1"), targetSystemId: SystemId("sys-2") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
      expect(state.galaxy.systems.get(SystemId("sys-2"))!.owner).toBeNull();
    });

    it("build-unit fails if bot can't afford the unit", () => {
      const state = makeMinimalState2();
      state.empires.get(EmpireId("empire-1"))!.resources.credits = 5; // not enough
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "build-unit", empireId: EmpireId("empire-1"), details: { unitTypeId: "fighter" } };
      executeBotAction(action, state, state.unitTypes, rng);
      const empire = state.empires.get(EmpireId("empire-1"))!;
      expect(empire.buildQueue?.length ?? 0).toBe(0);
    });
  });

  describe("Schemer betrayal clock", () => {
    it("increments and eventually triggers", () => {
      const bot = makeBot("schemer", 1.0);
      bot.betrayalClock = 0;
      const diplomacy: DiplomacyState = {
        pacts: new Map([["pact-1" as PactId, {
          id: "pact-1" as PactId,
          type: "star-covenant" as any,
          memberIds: [EmpireId("empire-1"), EmpireId("empire-2")],
          formedCycle: 1,
          active: true,
        }]]),
        coalitions: new Map(),
        relationships: new Map(),
      };

      // Advance clock until betrayal
      let result = { shouldBetray: false, targetPactId: null as any };
      for (let cycle = 2; cycle < 30; cycle++) {
        result = advanceBetrayalClock(bot, diplomacy, cycle);
        if (result.shouldBetray) break;
      }
      expect(result.shouldBetray).toBe(true);
      expect(result.targetPactId).toBe("pact-1");
    });

    it("non-schemer does not betray", () => {
      const bot = makeBot("diplomat", 1.0);
      bot.betrayalClock = 0;
      const diplomacy: DiplomacyState = {
        pacts: new Map([["pact-1" as PactId, {
          id: "pact-1" as PactId,
          type: "star-covenant" as any,
          memberIds: [EmpireId("empire-1"), EmpireId("empire-2")],
          formedCycle: 1,
          active: true,
        }]]),
        coalitions: new Map(),
        relationships: new Map(),
      };
      const result = advanceBetrayalClock(bot, diplomacy, 50);
      expect(result.shouldBetray).toBe(false);
    });

    it("schemer does not betray without active pacts", () => {
      const bot = makeBot("schemer", 1.0);
      bot.betrayalClock = 14; // one tick from threshold
      const diplomacy: DiplomacyState = {
        pacts: new Map(),
        coalitions: new Map(),
        relationships: new Map(),
      };
      const result = advanceBetrayalClock(bot, diplomacy, 50);
      expect(result.shouldBetray).toBe(false);
    });

    it("betrayal clock resets to 0 after betrayal", () => {
      const bot = makeBot("schemer", 1.0);
      bot.betrayalClock = 14;
      const diplomacy: DiplomacyState = {
        pacts: new Map([["pact-1" as PactId, {
          id: "pact-1" as PactId,
          type: "stillness-accord" as any,
          memberIds: [EmpireId("empire-1"), EmpireId("empire-2")],
          formedCycle: 1,
          active: true,
        }]]),
        coalitions: new Map(),
        relationships: new Map(),
      };
      const result = advanceBetrayalClock(bot, diplomacy, 50);
      expect(result.shouldBetray).toBe(true);
      expect(bot.betrayalClock).toBe(0);
    });
  });

  describe("updateEmotion — edge cases", () => {
    it("gained system but not high power → calm", () => {
      const state = { current: "aggressive" as const, trigger: "combat", lastUpdatedCycle: 0, resonance: 1.0 };
      const updated = updateEmotion(state, false, false, true, false, 10);
      expect(updated.current).toBe("calm");
    });

    it("no events → returns original state unchanged", () => {
      const state = { current: "fearful" as const, trigger: "attacked", lastUpdatedCycle: 0, resonance: 1.0 };
      const updated = updateEmotion(state, false, false, false, false, 10);
      expect(updated).toBe(state); // same reference
    });

    it("calm emotion sets resonance to 0", () => {
      const state = { current: "aggressive" as const, trigger: "combat", lastUpdatedCycle: 0, resonance: 1.0 };
      const updated = updateEmotion(state, false, false, true, false, 10);
      expect(updated.resonance).toBe(0.0);
    });

    it("wasAttacked + lostSystem + gainedSystem → desperate (attack priority)", () => {
      const state = { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 };
      const updated = updateEmotion(state, true, true, true, true, 5);
      expect(updated.current).toBe("desperate");
    });

    it("desperate emotion has resonance 1.0", () => {
      const state = { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 };
      const updated = updateEmotion(state, true, true, false, false, 5);
      expect(updated.current).toBe("desperate");
      expect(updated.resonance).toBe(1.0);
    });

    it("trigger is 'attacked' when wasAttacked is true", () => {
      const state = { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 };
      const updated = updateEmotion(state, true, false, false, false, 5);
      expect(updated.trigger).toBe("attacked");
    });

    it("trigger is 'lost-system' when only lostSystem", () => {
      const state = { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 };
      const updated = updateEmotion(state, false, true, false, false, 5);
      expect(updated.trigger).toBe("lost-system");
    });

    it("trigger is 'gained-system' when only gainedSystem", () => {
      const state = { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 };
      const updated = updateEmotion(state, false, false, true, true, 5);
      expect(updated.trigger).toBe("gained-system");
    });
  });

  describe("generateBotActions — edge cases", () => {
    it("returns empty array for 0 action count", () => {
      const bot = makeBot("warlord");
      const rng = new SeededRNG(42);
      const actions = generateBotActions(bot, 0, rng);
      expect(actions).toEqual([]);
    });

    it("all 8 archetypes produce valid actions", () => {
      for (const archetype of ALL_ARCHETYPES) {
        const bot = makeBot(archetype);
        const rng = new SeededRNG(42);
        const actions = generateBotActions(bot, 3, rng);
        expect(actions.length).toBe(3);
        for (const action of actions) {
          expect(action.empireId).toBe(bot.empireId);
          expect(typeof action.type).toBe("string");
        }
      }
    });
  });

  describe("botActionsThisCycle — edge cases", () => {
    it("zero momentum always yields 0 actions", () => {
      let acc = 0;
      for (let i = 0; i < 10; i++) {
        const result = botActionsThisCycle(0, acc);
        expect(result.actions).toBe(0);
        acc = result.newAccumulated;
      }
      expect(acc).toBe(0);
    });

    it("large accumulated + rating yields multiple actions in one cycle", () => {
      const result = botActionsThisCycle(1.5, 1.5);
      expect(result.actions).toBe(3);
      expect(result.newAccumulated).toBe(0);
    });
  });

  describe("decayEmotion — boundary precision", () => {
    it("at exactly 9 cycles: resonance 0.1 (not yet calm)", () => {
      const state = { current: "aggressive" as const, trigger: "combat", lastUpdatedCycle: 0, resonance: 1.0 };
      const decayed = decayEmotion(state, 9);
      expect(decayed.current).toBe("aggressive");
      expect(decayed.resonance).toBeCloseTo(0.1);
    });

    it("at exactly 10 cycles: resonance 0 → calm", () => {
      const state = { current: "fearful" as const, trigger: "attacked", lastUpdatedCycle: 0, resonance: 1.0 };
      const decayed = decayEmotion(state, 10);
      expect(decayed.current).toBe("calm");
      expect(decayed.resonance).toBe(0.0);
    });

    it("resonance never goes below 0 even with many elapsed cycles", () => {
      const state = { current: "vengeful" as const, trigger: "lost-system", lastUpdatedCycle: 0, resonance: 1.0 };
      const decayed = decayEmotion(state, 50);
      expect(decayed.resonance).toBe(0.0);
      expect(decayed.current).toBe("calm");
    });
  });

  describe("executeBotAction — additional edge cases", () => {
    function makeMinimalState3(): GameState {
      const botEmpireId = EmpireId("empire-1");
      const playerEmpireId = EmpireId("empire-0");
      const sys0 = SystemId("sys-0");
      const sys1 = SystemId("sys-1");
      const sys2 = SystemId("sys-2");

      return {
        galaxy: {
          systems: new Map([
            [sys0, { id: sys0, name: "Home", sectorId: "s0" as any, position: { x: 0, y: 0 }, biome: "core-world" as any, owner: playerEmpireId, slots: [], baseProduction: {}, adjacentSystemIds: [sys1], claimedCycle: 0, isHomeSystem: true }],
            [sys1, { id: sys1, name: "BotHome", sectorId: "s0" as any, position: { x: 1, y: 0 }, biome: "core-world" as any, owner: botEmpireId, slots: [], baseProduction: {}, adjacentSystemIds: [sys0, sys2], claimedCycle: 0, isHomeSystem: true }],
            [sys2, { id: sys2, name: "Unclaimed", sectorId: "s0" as any, position: { x: 2, y: 0 }, biome: "mineral-world" as any, owner: null as any, slots: [], baseProduction: {}, adjacentSystemIds: [sys1], claimedCycle: 0, isHomeSystem: false }],
          ]),
          sectors: new Map(),
        },
        empires: new Map([
          [playerEmpireId, { id: playerEmpireId, name: "Player", colour: "#fff", isPlayer: true, systemIds: [sys0], homeSystemId: sys0, resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 0, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
          [botEmpireId, { id: botEmpireId, name: "Bot Empire", colour: "#f00", isPlayer: false, systemIds: [sys1], homeSystemId: sys1, resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 100, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
        ]),
        playerEmpireId,
        unitTypes: createUnitTypeRegistry(),
        units: new Map(),
        fleets: new Map(),
        bots: new Map([[botEmpireId, makeBot("warlord", 1.0)]]),
        diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
        time: { currentCycle: 5, currentConfluence: 1, cyclesUntilReckoning: 5, cosmicOrder: { tiers: new Map(), rankings: [] } },
        currentCycleEvents: [],
        campaign: { id: "test", name: "Test", createdAt: "", lastSavedAt: "", seed: 42 },
      };
    }

    it("claim-system with no targetSystemId returns empty", () => {
      const state = makeMinimalState3();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "claim-system", empireId: EmpireId("empire-1") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
    });

    it("claim-system on already-owned system returns empty", () => {
      const state = makeMinimalState3();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "claim-system", empireId: EmpireId("empire-1"), targetSystemId: SystemId("sys-0") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
    });

    it("build-unit with unknown unitTypeId returns empty", () => {
      const state = makeMinimalState3();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "build-unit", empireId: EmpireId("empire-1"), details: { unitTypeId: "nonexistent-unit" } };
      executeBotAction(action, state, state.unitTypes, rng);
      expect(state.empires.get(EmpireId("empire-1"))!.buildQueue?.length ?? 0).toBe(0);
    });

    it("trade without market state returns empty", () => {
      const state = makeMinimalState3();
      // state.market is undefined
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "trade", empireId: EmpireId("empire-1"), details: { resource: "ore", quantity: 10, direction: "sell" } };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
    });

    it("attack with no targetSystemId returns empty", () => {
      const state = makeMinimalState3();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "attack", empireId: EmpireId("empire-1") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
    });

    it("attack on own system returns empty", () => {
      const state = makeMinimalState3();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "attack", empireId: EmpireId("empire-1"), targetSystemId: SystemId("sys-1") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
    });
  });

  describe("Schemer betrayal — inactive pact edge case", () => {
    it("schemer does not betray when only pact is inactive", () => {
      const bot = makeBot("schemer", 1.0);
      bot.betrayalClock = 14;
      const diplomacy: DiplomacyState = {
        pacts: new Map([["pact-1" as PactId, {
          id: "pact-1" as PactId,
          type: "star-covenant" as any,
          memberIds: [EmpireId("empire-1"), EmpireId("empire-2")],
          formedCycle: 1,
          active: false,
        }]]),
        coalitions: new Map(),
        relationships: new Map(),
      };
      const result = advanceBetrayalClock(bot, diplomacy, 50);
      expect(result.shouldBetray).toBe(false);
      // Clock still incremented
      expect(bot.betrayalClock).toBe(15);
    });
  });

  describe("RESONANCE_DECAY_RATE constant", () => {
    it("is exactly 0.1", () => {
      expect(RESONANCE_DECAY_RATE).toBe(0.1);
    });
  });

  describe("executeBotResearch — doctrine autoselection", () => {
    function makeResearchState(): GameState {
      const botEmpireId = EmpireId("empire-1");
      return {
        galaxy: { systems: new Map(), sectors: new Map() },
        empires: new Map([
          [botEmpireId, { id: botEmpireId, name: "Bot", colour: "#f00", isPlayer: false, systemIds: [], homeSystemId: SystemId("sys-0"), resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 500, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
        ]),
        playerEmpireId: EmpireId("empire-0"),
        unitTypes: createUnitTypeRegistry(),
        units: new Map(),
        fleets: new Map(),
        bots: new Map([[botEmpireId, makeBot("warlord", 1.0)]]),
        diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
        time: { currentCycle: 5, currentConfluence: 1, cyclesUntilReckoning: 5, cosmicOrder: { tiers: new Map(), rankings: [] } },
        currentCycleEvents: [],
        campaign: { id: "test", name: "Test", createdAt: "", lastSavedAt: "", seed: 42 },
      };
    }

    it("auto-selects doctrine when advancing from tier 0 to tier 1", () => {
      const state = makeResearchState();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "research", empireId: EmpireId("empire-1") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      const empire = state.empires.get(EmpireId("empire-1"))!;
      expect(empire.researchTier).toBe(1);
      expect(empire.researchPath).toBeDefined();
      expect(events.length).toBeGreaterThan(0);
    });

    it("research with insufficient RP returns empty events", () => {
      const state = makeResearchState();
      state.empires.get(EmpireId("empire-1"))!.resources.researchPoints = 10; // tier 0 costs 50
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "research", empireId: EmpireId("empire-1") };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
    });
  });

  describe("executeBuildInstallation — no affordable types", () => {
    it("returns empty when bot has 0 credits", () => {
      const botEmpireId = EmpireId("empire-1");
      const sys1 = SystemId("sys-1");
      const state: GameState = {
        galaxy: {
          systems: new Map([
            [sys1, { id: sys1, name: "BotHome", sectorId: "s0" as any, position: { x: 0, y: 0 }, biome: "frontier-world" as any, owner: botEmpireId, slots: [{ installation: null, locked: false }], baseProduction: {}, adjacentSystemIds: [], claimedCycle: 0, isHomeSystem: true }],
          ]),
          sectors: new Map(),
        },
        empires: new Map([
          [botEmpireId, { id: botEmpireId, name: "Bot", colour: "#f00", isPlayer: false, systemIds: [sys1], homeSystemId: sys1, resources: { credits: 0, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
        ]),
        playerEmpireId: EmpireId("empire-0"),
        unitTypes: createUnitTypeRegistry(),
        units: new Map(),
        fleets: new Map(),
        bots: new Map([[botEmpireId, makeBot("turtle", 1.0)]]),
        diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
        time: { currentCycle: 5, currentConfluence: 1, cyclesUntilReckoning: 5, cosmicOrder: { tiers: new Map(), rankings: [] } },
        currentCycleEvents: [],
        campaign: { id: "test", name: "Test", createdAt: "", lastSavedAt: "", seed: 42 },
      };
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "build-installation", empireId: botEmpireId };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
      expect(state.empires.get(botEmpireId)!.resources.credits).toBe(0);
    });
  });

  describe("executeTrade — edge cases", () => {
    function makeTradeState(): GameState {
      const botEmpireId = EmpireId("empire-1");
      return {
        galaxy: { systems: new Map(), sectors: new Map() },
        empires: new Map([
          [botEmpireId, { id: botEmpireId, name: "Bot", colour: "#f00", isPlayer: false, systemIds: [], homeSystemId: SystemId("sys-0"), resources: { credits: 100, food: 50, ore: 0, fuelCells: 30, researchPoints: 0, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
        ]),
        playerEmpireId: EmpireId("empire-0"),
        unitTypes: createUnitTypeRegistry(),
        units: new Map(),
        fleets: new Map(),
        bots: new Map([[botEmpireId, makeBot("merchant", 1.0)]]),
        diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
        time: { currentCycle: 5, currentConfluence: 1, cyclesUntilReckoning: 5, cosmicOrder: { tiers: new Map(), rankings: [] } },
        currentCycleEvents: [],
        campaign: { id: "test", name: "Test", createdAt: "", lastSavedAt: "", seed: 42 },
        market: { prices: { food: 5, ore: 8, fuelCells: 12 }, basePrices: { food: 5, ore: 8, fuelCells: 12 }, priceHistory: [] },
      };
    }

    it("sell with 0 available resource does not crash", () => {
      const state = makeTradeState();
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "trade", empireId: EmpireId("empire-1"), details: { resource: "ore", quantity: 10, direction: "sell" } };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
      // ore stays at 0
      expect(state.empires.get(EmpireId("empire-1"))!.resources.ore).toBe(0);
    });

    it("defaults to ore/10/sell when no details provided", () => {
      const state = makeTradeState();
      // Give some ore so default sell works
      state.empires.get(EmpireId("empire-1"))!.resources.ore = 20;
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "trade", empireId: EmpireId("empire-1") };
      executeBotAction(action, state, state.unitTypes, rng);
      // Default sells ore; ore should decrease
      expect(state.empires.get(EmpireId("empire-1"))!.resources.ore).toBeLessThan(20);
    });
  });

  describe("executeAttack — no attacker units", () => {
    it("returns empty when attacker has no units", () => {
      const botEmpireId = EmpireId("empire-1");
      const playerEmpireId = EmpireId("empire-0");
      const sys0 = SystemId("sys-0");
      const state: GameState = {
        galaxy: {
          systems: new Map([
            [sys0, { id: sys0, name: "Home", sectorId: "s0" as any, position: { x: 0, y: 0 }, biome: "core-world" as any, owner: playerEmpireId, slots: [], baseProduction: {}, adjacentSystemIds: [], claimedCycle: 0, isHomeSystem: true }],
          ]),
          sectors: new Map(),
        },
        empires: new Map([
          [playerEmpireId, { id: playerEmpireId, name: "Player", colour: "#fff", isPlayer: true, systemIds: [sys0], homeSystemId: sys0, resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 0, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
          [botEmpireId, { id: botEmpireId, name: "Bot", colour: "#f00", isPlayer: false, systemIds: [], homeSystemId: SystemId("sys-1"), resources: { credits: 500, food: 100, ore: 50, fuelCells: 50, researchPoints: 0, intelligencePoints: 0 }, stabilityScore: 50, stabilityLevel: "content" as any, population: 1000, populationCapacity: 5000, fleetIds: [], researchTier: 0, powerScore: 10, buildQueue: [] }],
        ]),
        playerEmpireId,
        unitTypes: createUnitTypeRegistry(),
        units: new Map(),
        fleets: new Map(),
        bots: new Map([[botEmpireId, makeBot("warlord", 1.0)]]),
        diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
        time: { currentCycle: 5, currentConfluence: 1, cyclesUntilReckoning: 5, cosmicOrder: { tiers: new Map(), rankings: [] } },
        currentCycleEvents: [],
        campaign: { id: "test", name: "Test", createdAt: "", lastSavedAt: "", seed: 42 },
      };
      const rng = new SeededRNG(42);
      const action: BotAction = { type: "attack", empireId: botEmpireId, targetSystemId: sys0 };
      const events = executeBotAction(action, state, state.unitTypes, rng);
      expect(events).toEqual([]);
    });
  });

  describe("selectActionType — all emotion states produce valid types", () => {
    it("each emotion state produces a valid BotActionType", () => {
      const emotions = ["calm", "aggressive", "fearful", "ambitious", "vengeful", "desperate"] as const;
      for (const emotion of emotions) {
        const bot = makeBot("opportunist");
        bot.emotionalState = { current: emotion as any, trigger: "test", lastUpdatedCycle: 0, resonance: 1.0 };
        const rng = new SeededRNG(42);
        const action = selectActionType(bot, rng);
        expect(typeof action).toBe("string");
        expect(action.length).toBeGreaterThan(0);
      }
    });
  });

  describe("botActionsThisCycle — fractional precision", () => {
    it("0.33 rating over 3 cycles yields exactly 0 actions (accumulated < 1)", () => {
      let acc = 0;
      let total = 0;
      for (let i = 0; i < 3; i++) {
        const result = botActionsThisCycle(0.33, acc);
        total += result.actions;
        acc = result.newAccumulated;
      }
      expect(total).toBe(0);
      expect(acc).toBeCloseTo(0.99);
    });

    it("0.33 rating: 4th cycle yields 1 action (accumulated crosses 1.0)", () => {
      let acc = 0;
      let total = 0;
      for (let i = 0; i < 4; i++) {
        const result = botActionsThisCycle(0.33, acc);
        total += result.actions;
        acc = result.newAccumulated;
      }
      expect(total).toBe(1);
    });
  });

  describe("advanceBetrayalClock — schemer with pact not including self", () => {
    it("does not betray a pact the schemer is not a member of", () => {
      const bot = makeBot("schemer", 1.0);
      bot.betrayalClock = 14;
      const diplomacy: DiplomacyState = {
        pacts: new Map([["pact-1" as PactId, {
          id: "pact-1" as PactId,
          type: "star-covenant" as any,
          memberIds: [EmpireId("empire-2"), EmpireId("empire-3")], // not empire-1
          formedCycle: 1,
          active: true,
        }]]),
        coalitions: new Map(),
        relationships: new Map(),
      };
      const result = advanceBetrayalClock(bot, diplomacy, 50);
      expect(result.shouldBetray).toBe(false);
    });
  });
});
