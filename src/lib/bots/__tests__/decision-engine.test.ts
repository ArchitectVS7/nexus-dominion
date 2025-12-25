import { describe, it, expect } from "vitest";
import {
  BASE_WEIGHTS,
  getAdjustedWeights,
  selectDecisionType,
  generateBotDecision,
  getWeightSum,
  validateWeights,
} from "../decision-engine";
import type { BotDecisionContext, Empire } from "../types";

// Mock empire for testing
const mockEmpire = {
  id: "test-empire",
  name: "Test Empire",
  type: "bot" as const,
  credits: 100000,
  food: 1000,
  ore: 500,
  petroleum: 200,
  researchPoints: 0,
  soldiers: 100,
  fighters: 50,
  stations: 0,
  lightCruisers: 10,
  heavyCruisers: 5,
  carriers: 2,
  covertAgents: 0,
  population: 10000,
  populationCap: 50000,
  civilStatus: "content",
  networth: 1000,
  planetCount: 9,
  isEliminated: false,
} as Empire;

const mockContext: BotDecisionContext = {
  empire: mockEmpire,
  planets: [],
  gameId: "test-game",
  currentTurn: 25, // After protection period
  protectionTurns: 20,
  difficulty: "normal",
  availableTargets: [
    { id: "target-1", name: "Target 1", networth: 500, planetCount: 5, isBot: true, isEliminated: false, militaryPower: 50 },
    { id: "target-2", name: "Target 2", networth: 800, planetCount: 7, isBot: true, isEliminated: false, militaryPower: 80 },
  ],
};

describe("Decision Engine", () => {
  describe("BASE_WEIGHTS", () => {
    it("should have all decision types", () => {
      expect(BASE_WEIGHTS.build_units).toBeDefined();
      expect(BASE_WEIGHTS.buy_planet).toBeDefined();
      expect(BASE_WEIGHTS.attack).toBeDefined();
      expect(BASE_WEIGHTS.diplomacy).toBeDefined();
      expect(BASE_WEIGHTS.trade).toBeDefined();
      expect(BASE_WEIGHTS.do_nothing).toBeDefined();
    });

    it("should sum to 1.0", () => {
      const sum = getWeightSum(BASE_WEIGHTS);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    it("should have correct weights from PRD", () => {
      expect(BASE_WEIGHTS.build_units).toBe(0.35);
      expect(BASE_WEIGHTS.buy_planet).toBe(0.20);
      expect(BASE_WEIGHTS.attack).toBe(0.15);
      expect(BASE_WEIGHTS.diplomacy).toBe(0.10);
      expect(BASE_WEIGHTS.trade).toBe(0.10);
      expect(BASE_WEIGHTS.do_nothing).toBe(0.10);
    });
  });

  describe("getAdjustedWeights", () => {
    it("should return base weights after protection period", () => {
      const weights = getAdjustedWeights(mockContext);
      expect(weights.attack).toBe(0.15);
    });

    it("should set attack weight to 0 during protection period", () => {
      const protectedContext = { ...mockContext, currentTurn: 10 };
      const weights = getAdjustedWeights(protectedContext);
      expect(weights.attack).toBe(0);
    });

    it("should redistribute attack weight during protection", () => {
      const protectedContext = { ...mockContext, currentTurn: 10 };
      const weights = getAdjustedWeights(protectedContext);

      // Weights should still sum to ~1.0
      const sum = getWeightSum(weights);
      expect(sum).toBeCloseTo(1.0, 5);

      // Other weights should be higher
      expect(weights.build_units).toBeGreaterThan(BASE_WEIGHTS.build_units);
    });

    it("should handle edge case of turn = protectionTurns", () => {
      const edgeContext = { ...mockContext, currentTurn: 20, protectionTurns: 20 };
      const weights = getAdjustedWeights(edgeContext);
      expect(weights.attack).toBe(0); // Still protected at exactly turn 20
    });

    it("should allow attacks at turn = protectionTurns + 1", () => {
      const afterContext = { ...mockContext, currentTurn: 21, protectionTurns: 20 };
      const weights = getAdjustedWeights(afterContext);
      expect(weights.attack).toBe(0.15); // Can attack at turn 21
    });
  });

  describe("selectDecisionType", () => {
    it("should return build_units for low random value", () => {
      // 0-0.35 should be build_units
      expect(selectDecisionType(BASE_WEIGHTS, 0)).toBe("build_units");
      expect(selectDecisionType(BASE_WEIGHTS, 0.34)).toBe("build_units");
    });

    it("should return buy_planet for mid-low random value", () => {
      // 0.35-0.55 should be buy_planet
      expect(selectDecisionType(BASE_WEIGHTS, 0.35)).toBe("buy_planet");
      expect(selectDecisionType(BASE_WEIGHTS, 0.54)).toBe("buy_planet");
    });

    it("should return attack for mid random value", () => {
      // 0.55-0.70 should be attack
      expect(selectDecisionType(BASE_WEIGHTS, 0.55)).toBe("attack");
      expect(selectDecisionType(BASE_WEIGHTS, 0.69)).toBe("attack");
    });

    it("should return diplomacy for mid-high random value", () => {
      // 0.70-0.80 should be diplomacy (use 0.71 to avoid floating point boundary)
      expect(selectDecisionType(BASE_WEIGHTS, 0.71)).toBe("diplomacy");
      expect(selectDecisionType(BASE_WEIGHTS, 0.79)).toBe("diplomacy");
    });

    it("should return trade for high random value", () => {
      // 0.80-0.90 should be trade
      expect(selectDecisionType(BASE_WEIGHTS, 0.80)).toBe("trade");
      expect(selectDecisionType(BASE_WEIGHTS, 0.89)).toBe("trade");
    });

    it("should return do_nothing for very high random value", () => {
      // 0.90-1.0 should be do_nothing
      expect(selectDecisionType(BASE_WEIGHTS, 0.90)).toBe("do_nothing");
      expect(selectDecisionType(BASE_WEIGHTS, 0.99)).toBe("do_nothing");
    });
  });

  describe("generateBotDecision", () => {
    it("should return do_nothing for diplomacy decision (stub)", () => {
      const decision = generateBotDecision(mockContext, 0.75); // diplomacy range
      expect(decision.type).toBe("do_nothing");
    });

    it("should return do_nothing for trade decision (stub)", () => {
      const decision = generateBotDecision(mockContext, 0.85); // trade range
      expect(decision.type).toBe("do_nothing");
    });

    it("should return build_units decision with valid data", () => {
      const decision = generateBotDecision(mockContext, 0.1); // build_units range
      if (decision.type === "build_units") {
        expect(decision.unitType).toBeDefined();
        expect(decision.quantity).toBeGreaterThan(0);
      }
    });

    it("should return buy_planet decision with valid data", () => {
      const decision = generateBotDecision(mockContext, 0.45); // buy_planet range
      if (decision.type === "buy_planet") {
        expect(decision.planetType).toBeDefined();
      }
    });

    it("should return attack decision with valid data after protection", () => {
      const decision = generateBotDecision(mockContext, 0.6); // attack range
      if (decision.type === "attack") {
        expect(decision.targetId).toBeDefined();
        expect(decision.forces).toBeDefined();
        expect(decision.forces.soldiers).toBeGreaterThanOrEqual(0);
      }
    });

    it("should not generate attack during protection period", () => {
      const protectedContext = { ...mockContext, currentTurn: 10 };
      const decision = generateBotDecision(protectedContext, 0.5);
      // Should be redistributed to another action
      expect(decision.type).not.toBe("attack");
    });

    it("should return do_nothing for explicit do_nothing", () => {
      const decision = generateBotDecision(mockContext, 0.95);
      expect(decision.type).toBe("do_nothing");
    });
  });

  describe("validateWeights", () => {
    it("should return true for valid weights", () => {
      expect(validateWeights(BASE_WEIGHTS)).toBe(true);
    });

    it("should return false for weights that don't sum to 1", () => {
      const invalidWeights = {
        ...BASE_WEIGHTS,
        build_units: 0.5, // Changed from 0.35
      };
      expect(validateWeights(invalidWeights)).toBe(false);
    });
  });

  describe("getWeightSum", () => {
    it("should correctly sum all weights", () => {
      expect(getWeightSum(BASE_WEIGHTS)).toBe(1.0);
    });
  });
});
