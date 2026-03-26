import { describe, it, expect } from "vitest";
import {
  UNIT_TYPES,
  createUnitTypeRegistry,
  calculateMilitaryPower,
  enqueueUnit,
} from "./unit-registry";

describe("Military System", () => {
  // REQ-018: Six unit types across three domains
  describe("REQ-018: Unit types", () => {
    it("defines exactly 6 unit types", () => {
      expect(UNIT_TYPES.length).toBe(6);
    });

    it("includes fleet category units (space + orbital)", () => {
      const fleet = UNIT_TYPES.filter((u) => u.category === "fleet");
      expect(fleet.length).toBe(4); // fighter, cruiser, orbital-platform, bombardment-ship
    });

    it("includes ground category units", () => {
      const ground = UNIT_TYPES.filter((u) => u.category === "ground");
      expect(ground.length).toBe(2); // infantry, heavy-armor
    });

    it("each unit type has attack, defence, and hp stats", () => {
      for (const ut of UNIT_TYPES) {
        expect(ut.attack).toBeGreaterThan(0);
        expect(ut.defence).toBeGreaterThan(0);
        expect(ut.hp).toBeGreaterThan(0);
      }
    });

    it("each unit type has build cost and build time", () => {
      for (const ut of UNIT_TYPES) {
        expect(ut.buildCost).toBeGreaterThan(0);
        expect(ut.buildTime).toBeGreaterThan(0);
      }
    });
  });

  // REQ-019: Build queue with turn cost + resource cost
  describe("REQ-019: Build queue", () => {
    it("enqueueUnit returns correct completion cycle", () => {
      const registry = createUnitTypeRegistry();
      const entry = enqueueUnit("cruiser", 5, registry);
      expect(entry).not.toBeNull();
      expect(entry!.completionCycle).toBe(5 + 3); // cruiser buildTime = 3
    });

    it("enqueueUnit returns null for unknown unit type", () => {
      const registry = createUnitTypeRegistry();
      const entry = enqueueUnit("nonexistent", 1, registry);
      expect(entry).toBeNull();
    });

    it("each unit type has maintenance costs", () => {
      for (const ut of UNIT_TYPES) {
        expect(ut.oreMaintenance).toBeGreaterThanOrEqual(0);
        expect(ut.fuelMaintenance).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // REQ-020: Military power calculated from unit composition
  describe("REQ-020: Military power calculation", () => {
    it("calculates power from attack + defence weighted by HP", () => {
      const registry = createUnitTypeRegistry();
      const units = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>();
      units.set("u1", { typeId: "fighter", currentHp: 8, completionCycle: null }); // full hp
      units.set("u2", { typeId: "cruiser", currentHp: 25, completionCycle: null }); // full hp

      const power = calculateMilitaryPower(["u1", "u2"], units, registry);

      // fighter: (6+3)*1.0 = 9, cruiser: (10+8)*1.0 = 18
      expect(power).toBe(27);
    });

    it("damaged units contribute proportionally less power", () => {
      const registry = createUnitTypeRegistry();
      const full = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>();
      full.set("u1", { typeId: "fighter", currentHp: 8, completionCycle: null });

      const half = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>();
      half.set("u1", { typeId: "fighter", currentHp: 4, completionCycle: null });

      const fullPower = calculateMilitaryPower(["u1"], full, registry);
      const halfPower = calculateMilitaryPower(["u1"], half, registry);

      expect(halfPower).toBe(fullPower / 2);
    });

    it("units still building do not contribute power", () => {
      const registry = createUnitTypeRegistry();
      const units = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>();
      units.set("u1", { typeId: "fighter", currentHp: 8, completionCycle: 10 }); // still building

      const power = calculateMilitaryPower(["u1"], units, registry);
      expect(power).toBe(0);
    });
  });
});
