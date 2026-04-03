import { describe, it, expect } from "vitest";
import {
  calculateForceStrength,
  resolveCombat,
  calculateBlockadeEffect,
  resolveFullCombat,
  checkMorale,
  calculateInfrastructureDamage,
  applyInfrastructureDamage,
  type CombatForce,
  type CombatOptions,
} from "./combat-resolver";
import type { StarSystem } from "../types/galaxy";
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

  describe("Multi-phase combat (resolveFullCombat)", () => {
    it("runs fleet → orbital → ground phases sequentially", () => {
      const rng = new SeededRNG(42);
      const attacker: CombatForce = {
        empireId: EmpireId("att"),
        isDefender: false,
        units: [
          ...Array.from({ length: 5 }, (_, i) => ({ id: UnitId(`att-f${i}`), typeId: "cruiser", currentHp: 25 })),
          ...Array.from({ length: 3 }, (_, i) => ({ id: UnitId(`att-b${i}`), typeId: "bombardment-ship", currentHp: 20 })),
          ...Array.from({ length: 5 }, (_, i) => ({ id: UnitId(`att-g${i}`), typeId: "infantry", currentHp: 12 })),
        ],
      };
      const defender: CombatForce = {
        empireId: EmpireId("def"),
        isDefender: true,
        units: [
          { id: UnitId("def-f0"), typeId: "fighter", currentHp: 8 },
          { id: UnitId("def-g0"), typeId: "infantry", currentHp: 12 },
        ],
      };

      const results = resolveFullCombat(attacker, defender, SystemId("sys-1"), unitTypes, rng);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].phase).toBe("fleet-engagement");
    });

    it("fleet phase loss by attacker prevents further phases", () => {
      const attacker: CombatForce = {
        empireId: EmpireId("att"),
        isDefender: false,
        units: [{ id: UnitId("att-f0"), typeId: "fighter", currentHp: 8 }],
      };
      const defender: CombatForce = {
        empireId: EmpireId("def"),
        isDefender: true,
        units: Array.from({ length: 10 }, (_, i) => ({ id: UnitId(`def-f${i}`), typeId: "cruiser", currentHp: 25 })),
      };

      // Try multiple seeds to find one where defender wins fleet phase
      for (let seed = 0; seed < 50; seed++) {
        const testRng = new SeededRNG(seed);
        const results = resolveFullCombat(attacker, defender, SystemId("sys-1"), unitTypes, testRng);
        if (results[0].victor === EmpireId("def")) {
          // Defender won fleet — no further phases should occur
          expect(results.length).toBe(1);
          return;
        }
      }
    });

    it("attacker fleet victory allows orbital bombardment and ground assault", () => {
      // Overwhelming attacker to ensure fleet win
      const attacker: CombatForce = {
        empireId: EmpireId("att"),
        isDefender: false,
        units: [
          ...Array.from({ length: 10 }, (_, i) => ({ id: UnitId(`att-f${i}`), typeId: "cruiser", currentHp: 25 })),
          ...Array.from({ length: 3 }, (_, i) => ({ id: UnitId(`att-b${i}`), typeId: "bombardment-ship", currentHp: 20 })),
          ...Array.from({ length: 5 }, (_, i) => ({ id: UnitId(`att-g${i}`), typeId: "infantry", currentHp: 12 })),
        ],
      };
      const defender: CombatForce = {
        empireId: EmpireId("def"),
        isDefender: true,
        units: [
          { id: UnitId("def-f0"), typeId: "fighter", currentHp: 8 },
          { id: UnitId("def-g0"), typeId: "infantry", currentHp: 12 },
        ],
      };

      for (let seed = 0; seed < 50; seed++) {
        const testRng = new SeededRNG(seed);
        const results = resolveFullCombat(attacker, defender, SystemId("sys-1"), unitTypes, testRng);
        if (results[0].victor === EmpireId("att")) {
          expect(results.length).toBeGreaterThanOrEqual(2);
          return;
        }
      }
    });
  });

  describe("Morale system", () => {
    it("morale break at 50%+ casualties", () => {
      const force: CombatForce = {
        empireId: EmpireId("e"),
        isDefender: false,
        units: Array.from({ length: 10 }, (_, i) => ({ id: UnitId(`u${i}`), typeId: "fighter", currentHp: 8 })),
      };
      // 5 of 10 units lost = 50%
      const casualties = force.units.slice(0, 5).map(u => u.id);
      const result = checkMorale(force, casualties, "fleet-engagement");
      expect(result.moraleBreak).toBe(true);
    });

    it("no morale break below 50% casualties", () => {
      const force: CombatForce = {
        empireId: EmpireId("e"),
        isDefender: false,
        units: Array.from({ length: 10 }, (_, i) => ({ id: UnitId(`u${i}`), typeId: "fighter", currentHp: 8 })),
      };
      // 4 of 10 units lost = 40%
      const casualties = force.units.slice(0, 4).map(u => u.id);
      const result = checkMorale(force, casualties, "fleet-engagement");
      expect(result.moraleBreak).toBe(false);
    });

    it("ground morale break at 75%+ casualties", () => {
      const force: CombatForce = {
        empireId: EmpireId("e"),
        isDefender: false,
        units: Array.from({ length: 4 }, (_, i) => ({ id: UnitId(`u${i}`), typeId: "infantry", currentHp: 12 })),
      };
      // 3 of 4 = 75%
      const casualties = force.units.slice(0, 3).map(u => u.id);
      const result = checkMorale(force, casualties, "ground-assault");
      expect(result.moraleBreak).toBe(true);
    });
  });

  describe("Infrastructure damage", () => {
    it("orbital bombardment produces infrastructure damage", () => {
      const rng = new SeededRNG(42);
      const damage = calculateInfrastructureDamage(100, rng);
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThanOrEqual(100);
    });

    it("stronger force causes more damage", () => {
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);
      const weak = calculateInfrastructureDamage(10, rng1);
      const strong = calculateInfrastructureDamage(200, rng2);
      expect(strong).toBeGreaterThanOrEqual(weak);
    });
  });

  describe("applyInfrastructureDamage()", () => {
    function makeSystem(installationConditions: number[]): StarSystem {
      return {
        id: SystemId("sys-1"),
        name: "Test",
        sectorId: "sec-1" as any,
        position: { x: 0, y: 0 },
        biome: "core-world",
        owner: EmpireId("emp-1"),
        slots: installationConditions.map((condition, i) => ({
          installation: {
            id: `inst-${i}` as any,
            type: "mining-complex",
            condition,
            completionCycle: null,
          },
          locked: false,
        })),
        baseProduction: {},
        adjacentSystemIds: [],
        claimedCycle: 0,
        isHomeSystem: false,
      };
    }

    it("reduces installation condition when hit", () => {
      const system = makeSystem([1.0]);
      const rng = new SeededRNG(1); // seed 1 always rolls low → hits
      applyInfrastructureDamage(system, 100, rng);
      expect(system.slots[0].installation!.condition).toBeLessThan(1.0);
    });

    it("does not reduce condition below 0", () => {
      const system = makeSystem([0.1]);
      const rng = new SeededRNG(1);
      applyInfrastructureDamage(system, 100, rng);
      expect(system.slots[0].installation!.condition).toBeGreaterThanOrEqual(0);
    });

    it("skips empty slots", () => {
      const system = makeSystem([]);
      system.slots.push({ installation: null, locked: false });
      const rng = new SeededRNG(1);
      expect(() => applyInfrastructureDamage(system, 100, rng)).not.toThrow();
    });

    it("skips already-destroyed installations (condition 0)", () => {
      const system = makeSystem([0]);
      const rng = new SeededRNG(1);
      applyInfrastructureDamage(system, 100, rng);
      expect(system.slots[0].installation!.condition).toBe(0);
    });

    it("0% damage hits nothing", () => {
      const system = makeSystem([1.0, 1.0]);
      const rng = new SeededRNG(42);
      applyInfrastructureDamage(system, 0, rng);
      expect(system.slots[0].installation!.condition).toBe(1.0);
      expect(system.slots[1].installation!.condition).toBe(1.0);
    });

    it("hit reduces condition by 0.5", () => {
      const system = makeSystem([1.0]);
      const rng = new SeededRNG(1); // seed 1 rolls < 1.0 hitChance → guaranteed hit
      applyInfrastructureDamage(system, 100, rng);
      expect(system.slots[0].installation!.condition).toBe(0.5);
    });
  });

  describe("calculateForceStrength — edge cases", () => {
    it("damaged units contribute proportionally less strength", () => {
      const fullHp = makeFleetForce("att", false, 1);
      const halfHp = makeFleetForce("att", false, 1);
      halfHp.units[0].currentHp = Math.floor(halfHp.units[0].currentHp / 2);

      const fullStr = calculateForceStrength(fullHp, unitTypes, "fleet-engagement");
      const halfStr = calculateForceStrength(halfHp, unitTypes, "fleet-engagement");
      expect(halfStr).toBeLessThan(fullStr);
    });

    it("empty force has 0 strength", () => {
      const force: CombatForce = { empireId: EmpireId("att"), isDefender: false, units: [] };
      expect(calculateForceStrength(force, unitTypes, "fleet-engagement")).toBe(0);
    });

    it("unknown unit types are skipped", () => {
      const force: CombatForce = {
        empireId: EmpireId("att"),
        isDefender: false,
        units: [{ id: UnitId("u0"), typeId: "nonexistent-type", currentHp: 10 }],
      };
      expect(calculateForceStrength(force, unitTypes, "fleet-engagement")).toBe(0);
    });

    it("fleet units do not contribute to ground assault strength", () => {
      const force = makeFleetForce("att", false, 3); // cruisers = fleet category
      expect(calculateForceStrength(force, unitTypes, "ground-assault")).toBe(0);
    });

    it("ground units do not contribute to fleet engagement strength", () => {
      const force = makeGroundForce("att", false, 3); // infantry = ground category
      expect(calculateForceStrength(force, unitTypes, "fleet-engagement")).toBe(0);
    });
  });

  describe("Morale — boundary cases", () => {
    it("no morale break at exactly 49% fleet casualties", () => {
      const force: CombatForce = {
        empireId: EmpireId("e"),
        isDefender: false,
        units: Array.from({ length: 100 }, (_, i) => ({ id: UnitId(`u${i}`), typeId: "fighter", currentHp: 8 })),
      };
      const casualties = force.units.slice(0, 49).map(u => u.id);
      expect(checkMorale(force, casualties, "fleet-engagement").moraleBreak).toBe(false);
    });

    it("no morale break at 74% ground casualties", () => {
      const force: CombatForce = {
        empireId: EmpireId("e"),
        isDefender: false,
        units: Array.from({ length: 100 }, (_, i) => ({ id: UnitId(`u${i}`), typeId: "infantry", currentHp: 12 })),
      };
      const casualties = force.units.slice(0, 74).map(u => u.id);
      expect(checkMorale(force, casualties, "ground-assault").moraleBreak).toBe(false);
    });

    it("morale break at exactly 75% ground casualties", () => {
      const force: CombatForce = {
        empireId: EmpireId("e"),
        isDefender: false,
        units: Array.from({ length: 100 }, (_, i) => ({ id: UnitId(`u${i}`), typeId: "infantry", currentHp: 12 })),
      };
      const casualties = force.units.slice(0, 75).map(u => u.id);
      expect(checkMorale(force, casualties, "ground-assault").moraleBreak).toBe(true);
    });

    it("empty force returns no morale break", () => {
      const force: CombatForce = { empireId: EmpireId("e"), isDefender: false, units: [] };
      expect(checkMorale(force, [], "fleet-engagement").moraleBreak).toBe(false);
    });
  });

  describe("Blockade — edge cases", () => {
    it("zero blockading strength produces zero reductions", () => {
      const effect = calculateBlockadeEffect(0, 100, 5);
      expect(effect.creditReduction).toBe(0);
      expect(effect.foodReduction).toBe(0);
      expect(effect.oreReduction).toBe(0);
    });

    it("zero defender strength produces maximum ratio", () => {
      const effect = calculateBlockadeEffect(100, 0, 1);
      expect(effect.creditReduction).toBeGreaterThan(0);
    });

    it("blockade effect tracks turnsActive", () => {
      const effect = calculateBlockadeEffect(100, 50, 7);
      expect(effect.turnsActive).toBe(7);
    });
  });

  describe("Infrastructure damage — min/max", () => {
    it("minimum damage is at least 1", () => {
      const rng = new SeededRNG(42);
      const damage = calculateInfrastructureDamage(1, rng);
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it("damage is capped at 100", () => {
      const rng = new SeededRNG(42);
      const damage = calculateInfrastructureDamage(999, rng);
      expect(damage).toBeLessThanOrEqual(100);
    });
  });

  describe("Combat determinism", () => {
    it("same seed produces same combat result", () => {
      const r1 = resolveCombat(
        makeFleetForce("att", false, 5), makeFleetForce("def", true, 5),
        SystemId("sys-1"), "fleet-engagement", unitTypes, new SeededRNG(42),
      );
      const r2 = resolveCombat(
        makeFleetForce("att", false, 5), makeFleetForce("def", true, 5),
        SystemId("sys-1"), "fleet-engagement", unitTypes, new SeededRNG(42),
      );
      expect(r1.victor).toBe(r2.victor);
      expect(r1.attackerLosses.length).toBe(r2.attackerLosses.length);
      expect(r1.defenderLosses.length).toBe(r2.defenderLosses.length);
    });
  });

  describe("resolveFullCombat — ground-only", () => {
    it("skips fleet phase when no fleet units on either side", () => {
      const attacker = makeGroundForce("att", false, 5);
      const defender = makeGroundForce("def", true, 2);
      const rng = new SeededRNG(42);
      const results = resolveFullCombat(attacker, defender, SystemId("sys-1"), unitTypes, rng);
      expect(results.length).toBe(1);
      expect(results[0].phase).toBe("ground-assault");
    });
  });

  describe("Combat options (doctrine/coalition bonuses)", () => {
    it("doctrine STR bonus increases attacker strength", () => {
      const force = makeFleetForce("att", false, 3);
      const baseStrength = calculateForceStrength(force, unitTypes, "fleet-engagement");

      const opts: CombatOptions = { attackerDoctrineStrBonus: 2 };
      const boostedStrength = calculateForceStrength(force, unitTypes, "fleet-engagement", opts);
      expect(boostedStrength).toBeGreaterThan(baseStrength);
    });

    it("coalition bonus increases force strength", () => {
      const force = makeFleetForce("att", false, 3);
      const baseStrength = calculateForceStrength(force, unitTypes, "fleet-engagement");

      const opts: CombatOptions = { coalitionBonus: 0.15 };
      const boostedStrength = calculateForceStrength(force, unitTypes, "fleet-engagement", opts);
      expect(boostedStrength).toBeCloseTo(baseStrength * 1.15, 1);
    });

    it("fleet composition bonus increases force strength", () => {
      const force: CombatForce = {
        empireId: EmpireId("att"),
        isDefender: false,
        units: [
          { id: UnitId("u0"), typeId: "fighter", currentHp: 8 },
          { id: UnitId("u1"), typeId: "cruiser", currentHp: 25 },
          { id: UnitId("u2"), typeId: "orbital-platform", currentHp: 30 },
          { id: UnitId("u3"), typeId: "bombardment-ship", currentHp: 20 },
        ],
      };
      const baseStrength = calculateForceStrength(force, unitTypes, "fleet-engagement");

      const opts: CombatOptions = { fleetCompositionBonus: 0.15 };
      const boostedStrength = calculateForceStrength(force, unitTypes, "fleet-engagement", opts);
      expect(boostedStrength).toBeCloseTo(baseStrength * 1.15, 1);
    });

    it("doctrine STR bonus is NOT applied to defenders", () => {
      const defForce = makeFleetForce("def", true, 3);
      const baseStr = calculateForceStrength(defForce, unitTypes, "fleet-engagement");
      const withDocOpts: CombatOptions = { attackerDoctrineStrBonus: 5 };
      const boostedStr = calculateForceStrength(defForce, unitTypes, "fleet-engagement", withDocOpts);
      // Defender strength should be unchanged regardless of doctrine bonus
      expect(boostedStr).toBe(baseStr);
    });

    it("coalition + doctrine bonuses stack multiplicatively", () => {
      const force = makeFleetForce("att", false, 3);
      const docOpts: CombatOptions = { attackerDoctrineStrBonus: 2 };
      const docStr = calculateForceStrength(force, unitTypes, "fleet-engagement", docOpts);
      const combinedOpts: CombatOptions = { attackerDoctrineStrBonus: 2, coalitionBonus: 0.15 };
      const combinedStr = calculateForceStrength(force, unitTypes, "fleet-engagement", combinedOpts);
      // Coalition bonus applied multiplicatively on top of doctrine-boosted strength
      expect(combinedStr).toBeCloseTo(docStr * 1.15, 1);
      expect(combinedStr).toBeGreaterThan(docStr);
    });
  });

  describe("resolveFullCombat — fleet-only (no ground)", () => {
    it("skips ground phase when attacker has no ground units", () => {
      const attacker: CombatForce = {
        empireId: EmpireId("att"),
        isDefender: false,
        units: Array.from({ length: 5 }, (_, i) => ({ id: UnitId(`att-f${i}`), typeId: "cruiser", currentHp: 25 })),
      };
      const defender: CombatForce = {
        empireId: EmpireId("def"),
        isDefender: true,
        units: [{ id: UnitId("def-f0"), typeId: "fighter", currentHp: 8 }],
      };

      for (let seed = 0; seed < 50; seed++) {
        const rng = new SeededRNG(seed);
        const results = resolveFullCombat(attacker, defender, SystemId("sys-1"), unitTypes, rng);
        if (results[0].victor === EmpireId("att")) {
          // Won fleet, but no ground units → no ground phase, no system capture
          const phases = results.map(r => r.phase);
          expect(phases).not.toContain("ground-assault");
          return;
        }
      }
    });
  });

  describe("calculateForceStrength — orbital-bombardment phase", () => {
    it("all unit types contribute to orbital-bombardment", () => {
      const force: CombatForce = {
        empireId: EmpireId("att"),
        isDefender: false,
        units: [
          { id: UnitId("u0"), typeId: "cruiser", currentHp: 25 },
          { id: UnitId("u1"), typeId: "infantry", currentHp: 12 },
        ],
      };
      // orbital-bombardment is not filtered by category (not fleet/ground)
      const strength = calculateForceStrength(force, unitTypes, "orbital-bombardment");
      expect(strength).toBeGreaterThan(0);
    });
  });

  describe("resolveCombat — infrastructure damage phases", () => {
    it("fleet-engagement produces zero infrastructure damage", () => {
      const rng = new SeededRNG(42);
      const result = resolveCombat(
        makeFleetForce("att", false, 5),
        makeFleetForce("def", true, 1),
        SystemId("sys-1"),
        "fleet-engagement",
        unitTypes,
        rng,
      );
      expect(result.infrastructureDamage).toBe(0);
    });

    it("ground-assault produces zero infrastructure damage", () => {
      const rng = new SeededRNG(42);
      const result = resolveCombat(
        makeGroundForce("att", false, 5),
        makeGroundForce("def", true, 1),
        SystemId("sys-1"),
        "ground-assault",
        unitTypes,
        rng,
      );
      expect(result.infrastructureDamage).toBe(0);
    });
  });

  describe("calculateBlockadeEffect — severity cap", () => {
    it("severity caps at 1.0 even with overwhelming force and many turns", () => {
      const effect = calculateBlockadeEffect(10000, 1, 100);
      expect(effect.creditReduction).toBeLessThanOrEqual(50);
      expect(effect.foodReduction).toBeLessThanOrEqual(30);
      expect(effect.oreReduction).toBeLessThanOrEqual(20);
    });

    it("equal strength balanced blockade", () => {
      const effect = calculateBlockadeEffect(100, 100, 1);
      // ratio = 100/200 = 0.5, severity = min(1.0, 0.5 * 1.1) = 0.55
      expect(effect.creditReduction).toBe(Math.floor(0.55 * 50));
    });
  });

  describe("calculateInfrastructureDamage — edge cases", () => {
    it("zero bombardment strength still produces minimum 1 damage", () => {
      const rng = new SeededRNG(42);
      const damage = calculateInfrastructureDamage(0, rng);
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it("damage is deterministic for same seed", () => {
      const d1 = calculateInfrastructureDamage(50, new SeededRNG(99));
      const d2 = calculateInfrastructureDamage(50, new SeededRNG(99));
      expect(d1).toBe(d2);
    });
  });

  describe("checkMorale — retreated flag mirrors moraleBreak", () => {
    it("retreated is true when moraleBreak is true", () => {
      const force: CombatForce = {
        empireId: EmpireId("e"),
        isDefender: false,
        units: Array.from({ length: 10 }, (_, i) => ({ id: UnitId(`u${i}`), typeId: "fighter", currentHp: 8 })),
      };
      const casualties = force.units.slice(0, 5).map(u => u.id); // 50% = morale break
      const result = checkMorale(force, casualties, "fleet-engagement");
      expect(result.moraleBreak).toBe(true);
      expect(result.retreated).toBe(true);
    });

    it("retreated is false when moraleBreak is false", () => {
      const force: CombatForce = {
        empireId: EmpireId("e"),
        isDefender: false,
        units: Array.from({ length: 10 }, (_, i) => ({ id: UnitId(`u${i}`), typeId: "fighter", currentHp: 8 })),
      };
      const result = checkMorale(force, [], "fleet-engagement");
      expect(result.moraleBreak).toBe(false);
      expect(result.retreated).toBe(false);
    });

    it("zero casualties = no morale break", () => {
      const force: CombatForce = {
        empireId: EmpireId("e"),
        isDefender: false,
        units: Array.from({ length: 5 }, (_, i) => ({ id: UnitId(`u${i}`), typeId: "cruiser", currentHp: 25 })),
      };
      const result = checkMorale(force, [], "fleet-engagement");
      expect(result.moraleBreak).toBe(false);
    });
  });

  describe("applyInfrastructureDamage — negative percent", () => {
    it("negative damagePercent does nothing", () => {
      const system: StarSystem = {
        id: SystemId("sys-1"), name: "Test", sectorId: "s" as any,
        position: { x: 0, y: 0 }, biome: "core-world", owner: EmpireId("e"),
        slots: [{
          installation: { id: "i1" as any, type: "mining-complex", condition: 1.0, completionCycle: null },
          locked: false,
        }],
        baseProduction: {}, adjacentSystemIds: [], claimedCycle: 0, isHomeSystem: false,
      };
      const rng = new SeededRNG(42);
      applyInfrastructureDamage(system, -10, rng);
      expect(system.slots[0].installation!.condition).toBe(1.0);
    });
  });
});
