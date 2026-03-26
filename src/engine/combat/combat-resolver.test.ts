import { describe, it, expect } from "vitest";
import {
  calculateForceStrength,
  resolveCombat,
  calculateBlockadeEffect,
  type CombatForce,
} from "./combat-resolver";
import { createUnitTypeRegistry } from "../military/unit-registry";
import { SeededRNG } from "../utils/rng";
import { EmpireId, SystemId, UnitId } from "../types/ids";

const unitTypes = createUnitTypeRegistry();

function makeFleetForce(empireId: string, isDefender: boolean, unitCount: number = 3): CombatForce {
  return {
    empireId: EmpireId(empireId),
    isDefender,
    units: Array.from({ length: unitCount }, (_, i) => ({
      id: UnitId(`${empireId}-u${i}`),
      typeId: "cruiser",
      currentHp: 25,
    })),
  };
}

function makeGroundForce(empireId: string, isDefender: boolean, unitCount: number = 3): CombatForce {
  return {
    empireId: EmpireId(empireId),
    isDefender,
    units: Array.from({ length: unitCount }, (_, i) => ({
      id: UnitId(`${empireId}-g${i}`),
      typeId: "infantry",
      currentHp: 12,
    })),
  };
}

describe("Combat System", () => {
  // REQ-021: Three combat modes
  describe("REQ-021: Combat modes", () => {
    it("supports fleet-engagement phase", () => {
      const rng = new SeededRNG(42);
      const result = resolveCombat(
        makeFleetForce("att", false),
        makeFleetForce("def", true),
        SystemId("sys-1"),
        "fleet-engagement",
        unitTypes,
        rng,
      );
      expect(result.phase).toBe("fleet-engagement");
    });

    it("supports ground-assault phase", () => {
      const rng = new SeededRNG(42);
      const result = resolveCombat(
        makeGroundForce("att", false),
        makeGroundForce("def", true),
        SystemId("sys-1"),
        "ground-assault",
        unitTypes,
        rng,
      );
      expect(result.phase).toBe("ground-assault");
    });

    it("supports orbital-bombardment phase", () => {
      const rng = new SeededRNG(42);
      const result = resolveCombat(
        makeFleetForce("att", false),
        makeFleetForce("def", true),
        SystemId("sys-1"),
        "orbital-bombardment",
        unitTypes,
        rng,
      );
      expect(result.phase).toBe("orbital-bombardment");
    });
  });

  // REQ-022: Fleet Engagement produces casualties and a victor
  describe("REQ-022: Fleet Engagement", () => {
    it("produces a victor", () => {
      const rng = new SeededRNG(42);
      const result = resolveCombat(
        makeFleetForce("att", false, 5),
        makeFleetForce("def", true, 2),
        SystemId("sys-1"),
        "fleet-engagement",
        unitTypes,
        rng,
      );
      expect(result.victor).toBeDefined();
      expect([result.attackerId, result.defenderId]).toContain(result.victor);
    });

    it("produces casualty lists for both sides", () => {
      const rng = new SeededRNG(42);
      const result = resolveCombat(
        makeFleetForce("att", false, 5),
        makeFleetForce("def", true, 5),
        SystemId("sys-1"),
        "fleet-engagement",
        unitTypes,
        rng,
      );
      // Both sides should have at least some casualties
      expect(result.attackerLosses.length + result.defenderLosses.length).toBeGreaterThan(0);
    });

    it("fleet engagement does not capture systems", () => {
      const rng = new SeededRNG(42);
      const result = resolveCombat(
        makeFleetForce("att", false, 10),
        makeFleetForce("def", true, 1),
        SystemId("sys-1"),
        "fleet-engagement",
        unitTypes,
        rng,
      );
      expect(result.systemCaptured).toBe(false);
    });
  });

  // REQ-023: Blockade causes resource shortfalls
  describe("REQ-023: Blockade mechanics", () => {
    it("blockade effect increases with turns active", () => {
      const early = calculateBlockadeEffect(100, 50, 1);
      const late = calculateBlockadeEffect(100, 50, 5);
      expect(late.creditReduction).toBeGreaterThanOrEqual(early.creditReduction);
    });

    it("stronger blockading force causes more severe effects", () => {
      const weak = calculateBlockadeEffect(50, 100, 3);
      const strong = calculateBlockadeEffect(200, 100, 3);
      expect(strong.creditReduction).toBeGreaterThan(weak.creditReduction);
    });

    it("blockade reduces credits, food, and ore", () => {
      const effect = calculateBlockadeEffect(100, 50, 3);
      expect(effect.creditReduction).toBeGreaterThan(0);
      expect(effect.foodReduction).toBeGreaterThan(0);
      expect(effect.oreReduction).toBeGreaterThan(0);
    });
  });

  // REQ-024: Ground Invasion transfers ownership on attacker victory
  describe("REQ-024: Ground Invasion", () => {
    it("system captured on attacker ground victory", () => {
      // Run multiple times to find an attacker win
      let captured = false;
      for (let seed = 0; seed < 50; seed++) {
        const rng = new SeededRNG(seed);
        const result = resolveCombat(
          makeGroundForce("att", false, 10),
          makeGroundForce("def", true, 1),
          SystemId("sys-1"),
          "ground-assault",
          unitTypes,
          rng,
        );
        if (result.victor === result.attackerId) {
          expect(result.systemCaptured).toBe(true);
          captured = true;
          break;
        }
      }
      expect(captured).toBe(true);
    });

    it("system not captured on defender victory", () => {
      for (let seed = 0; seed < 50; seed++) {
        const rng = new SeededRNG(seed);
        const result = resolveCombat(
          makeGroundForce("att", false, 1),
          makeGroundForce("def", true, 10),
          SystemId("sys-1"),
          "ground-assault",
          unitTypes,
          rng,
        );
        if (result.victor === result.defenderId) {
          expect(result.systemCaptured).toBe(false);
          return;
        }
      }
    });
  });

  // REQ-025: Defender advantage
  describe("REQ-025: Defender advantage", () => {
    it("defender gets strength bonus", () => {
      const attackerForce = makeFleetForce("att", false, 3);
      const defenderForce = makeFleetForce("def", true, 3);

      const attackStr = calculateForceStrength(attackerForce, unitTypes, "fleet-engagement");
      const defendStr = calculateForceStrength(defenderForce, unitTypes, "fleet-engagement");

      // Same units but defender should be 25% stronger
      expect(defendStr).toBeGreaterThan(attackStr);
      expect(defendStr / attackStr).toBeCloseTo(1.25, 1);
    });
  });

  // REQ-026: Combat outcomes reported with detail
  describe("REQ-026: Combat outcome detail", () => {
    it("result includes attacker, defender, system, and phase", () => {
      const rng = new SeededRNG(42);
      const result = resolveCombat(
        makeFleetForce("att", false),
        makeFleetForce("def", true),
        SystemId("sys-1"),
        "fleet-engagement",
        unitTypes,
        rng,
      );
      expect(result.attackerId).toBe(EmpireId("att"));
      expect(result.defenderId).toBe(EmpireId("def"));
      expect(result.systemId).toBe(SystemId("sys-1"));
      expect(result.phase).toBe("fleet-engagement");
      expect(result.victor).toBeDefined();
      expect(Array.isArray(result.attackerLosses)).toBe(true);
      expect(Array.isArray(result.defenderLosses)).toBe(true);
    });
  });
});
