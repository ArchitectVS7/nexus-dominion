import { describe, it, expect } from "vitest";
import {
  MOMENTUM_TIERS,
  ALL_ARCHETYPES,
  botActionsThisCycle,
  selectActionType,
  generateBotActions,
  updateEmotion,
  hasRelationshipMemory,
} from "./bot-engine";
import type { BotAgent } from "../types/bot";
import type { DiplomacyState } from "../types/diplomacy";
import { EmpireId } from "../types/ids";
import { SeededRNG } from "../utils/rng";
import { relationshipKey } from "../types/diplomacy";

function makeBot(archetype: string = "warlord", momentum: number = 1.0): BotAgent {
  return {
    empireId: EmpireId("empire-1"),
    archetype: archetype as any,
    momentumRating: momentum,
    persona: { name: "Test", title: "Bot", backstory: "", speechStyle: "default" },
    emotionalState: { current: "calm", trigger: "none", lastUpdatedCycle: 0 },
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
      expect(updateEmotion("calm", true, true, false, false)).toBe("desperate");
      expect(updateEmotion("calm", true, false, false, false)).toBe("fearful");
      expect(updateEmotion("calm", false, true, false, false)).toBe("vengeful");
      expect(updateEmotion("calm", false, false, true, true)).toBe("ambitious");
    });

    it("aggressive emotion increases attack actions", () => {
      const calmBot = makeBot("merchant"); // merchants normally don't attack much
      const angryBot = { ...makeBot("merchant"), emotionalState: { current: "aggressive" as const, trigger: "test", lastUpdatedCycle: 0 } };

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
});
