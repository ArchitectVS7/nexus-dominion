import { describe, it, expect } from "vitest";
import {
  UNIT_TYPES,
  createUnitTypeRegistry,
  calculateMilitaryPower,
  enqueueUnit,
  advanceBuildQueue,
  createUnitFromCompleted,
  calculateFleetCompositionBonus,
  canAffordUnit,
  moveFleet,
  resolveFleetArrivals,
  assignUnitToFleet,
  removeUnitFromFleet,
  calculateMaintenanceCost,
} from "./unit-registry";
import type { Resources } from "../types/empire";
import { EmpireId, SystemId, FleetId, UnitId } from "../types/ids";

describe("Military System", () => {
  // REQ-018: Six unit types across three domains
  describe("REQ-018: Unit types", () => {
    it("defines exactly 7 unit types (6 base + 1 capstone)", () => {
      expect(UNIT_TYPES.length).toBe(7);
    });

    it("includes fleet category units (space + orbital + capstone)", () => {
      const fleet = UNIT_TYPES.filter((u) => u.category === "fleet");
      expect(fleet.length).toBe(5); // fighter, cruiser, orbital-platform, bombardment-ship, dreadnought
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

  describe("Build queue execution", () => {
    it("advanceBuildQueue completes units when cycle matches completionCycle", () => {
      const registry = createUnitTypeRegistry();
      const queue = [
        { unitTypeId: "fighter", systemId: "sys-0" as any, startCycle: 1, completionCycle: 3 },
      ];
      const { completed, remaining } = advanceBuildQueue(queue, 3, registry);
      expect(completed.length).toBe(1);
      expect(completed[0].unitTypeId).toBe("fighter");
      expect(remaining.length).toBe(0);
    });

    it("does not complete units before their completionCycle", () => {
      const registry = createUnitTypeRegistry();
      const queue = [
        { unitTypeId: "cruiser", systemId: "sys-0" as any, startCycle: 1, completionCycle: 4 },
      ];
      const { completed, remaining } = advanceBuildQueue(queue, 3, registry);
      expect(completed.length).toBe(0);
      expect(remaining.length).toBe(1);
    });

    it("handles multiple queue entries with only some completing", () => {
      const registry = createUnitTypeRegistry();
      const queue = [
        { unitTypeId: "fighter", systemId: "sys-0" as any, startCycle: 1, completionCycle: 3 },
        { unitTypeId: "cruiser", systemId: "sys-0" as any, startCycle: 1, completionCycle: 5 },
        { unitTypeId: "infantry", systemId: "sys-1" as any, startCycle: 2, completionCycle: 3 },
      ];
      const { completed, remaining } = advanceBuildQueue(queue, 3, registry);
      expect(completed.length).toBe(2);
      expect(remaining.length).toBe(1);
      expect(remaining[0].unitTypeId).toBe("cruiser");
    });

    it("createUnitFromCompleted returns a Unit with full HP", () => {
      const registry = createUnitTypeRegistry();
      const entry = { unitTypeId: "fighter", systemId: "sys-0" as any, startCycle: 1, completionCycle: 2 };
      const unit = createUnitFromCompleted(entry, registry, "unit-1");
      expect(unit.typeId).toBe("fighter");
      expect(unit.currentHp).toBe(8); // fighter HP
      expect(unit.completionCycle).toBeNull();
      expect(unit.id).toBe("unit-1");
    });
  });

  describe("Fleet composition bonus", () => {
    it("grants 15% bonus for 4+ unique unit types", () => {
      const bonus = calculateFleetCompositionBonus(["fighter", "cruiser", "infantry", "heavy-armor"]);
      expect(bonus).toBe(0.15);
    });

    it("returns 0% for fewer than 4 unique types", () => {
      expect(calculateFleetCompositionBonus(["fighter", "cruiser"])).toBe(0);
      expect(calculateFleetCompositionBonus(["fighter", "cruiser", "infantry"])).toBe(0);
    });

    it("counts unique types only", () => {
      const bonus = calculateFleetCompositionBonus(["fighter", "fighter", "cruiser", "infantry", "heavy-armor"]);
      expect(bonus).toBe(0.15);
    });
  });

  describe("Affordability check", () => {
    it("canAffordUnit returns true when credits sufficient", () => {
      const registry = createUnitTypeRegistry();
      const reserves: Resources = { credits: 500, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 };
      expect(canAffordUnit("fighter", reserves, registry)).toBe(true); // cost: 100
    });

    it("canAffordUnit returns false when credits insufficient", () => {
      const registry = createUnitTypeRegistry();
      const reserves: Resources = { credits: 50, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 };
      expect(canAffordUnit("fighter", reserves, registry)).toBe(false);
    });

    it("canAffordUnit returns false for unknown unit type", () => {
      const registry = createUnitTypeRegistry();
      const reserves: Resources = { credits: 1000, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 };
      expect(canAffordUnit("nonexistent", reserves, registry)).toBe(false);
    });
  });

  describe("D20 stat blocks", () => {
    it("all unit types have D20 stat blocks", () => {
      for (const ut of UNIT_TYPES) {
        expect(ut.statBlock).toBeDefined();
        expect(ut.statBlock!.str).toBeGreaterThan(0);
        expect(ut.statBlock!.ac).toBeGreaterThan(0);
        expect(ut.statBlock!.bab).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Fleet movement", () => {
    it("moveFleet sets targetSystemId and arrivalCycle", () => {
      const fleet: any = {
        id: FleetId("f1"),
        ownerId: EmpireId("e1"),
        name: "Alpha Fleet",
        locationSystemId: SystemId("sys-1"),
        unitIds: [UnitId("u1")],
        targetSystemId: null,
        arrivalCycle: null,
      };
      const result = moveFleet(fleet, SystemId("sys-2"), 5, 2);
      expect(result.targetSystemId).toBe(SystemId("sys-2"));
      expect(result.arrivalCycle).toBe(5 + 2);
      // Original fleet not mutated
      expect(fleet.targetSystemId).toBeNull();
    });

    it("moveFleet rejects move if fleet is already in transit", () => {
      const fleet: any = {
        id: FleetId("f1"),
        ownerId: EmpireId("e1"),
        name: "Alpha Fleet",
        locationSystemId: SystemId("sys-1"),
        unitIds: [UnitId("u1")],
        targetSystemId: SystemId("sys-3"),
        arrivalCycle: 10,
      };
      const result = moveFleet(fleet, SystemId("sys-2"), 5, 2);
      // Should return fleet unchanged — already in transit
      expect(result.targetSystemId).toBe(SystemId("sys-3"));
      expect(result.arrivalCycle).toBe(10);
    });

    it("moveFleet rejects move to current system", () => {
      const fleet: any = {
        id: FleetId("f1"),
        ownerId: EmpireId("e1"),
        name: "Alpha Fleet",
        locationSystemId: SystemId("sys-1"),
        unitIds: [],
        targetSystemId: null,
        arrivalCycle: null,
      };
      const result = moveFleet(fleet, SystemId("sys-1"), 5, 2);
      expect(result.targetSystemId).toBeNull();
    });
  });

  describe("Fleet arrival resolution", () => {
    it("resolveFleetArrivals moves arrived fleets to target system", () => {
      const fleets = new Map<string, any>([
        ["f1", {
          id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Alpha",
          locationSystemId: SystemId("sys-1"), unitIds: [UnitId("u1")],
          targetSystemId: SystemId("sys-2"), arrivalCycle: 5,
        }],
      ]);
      const result = resolveFleetArrivals(fleets, 5);
      const f = result.get("f1")!;
      expect(f.locationSystemId).toBe(SystemId("sys-2"));
      expect(f.targetSystemId).toBeNull();
      expect(f.arrivalCycle).toBeNull();
    });

    it("resolveFleetArrivals does not move fleets that haven't arrived yet", () => {
      const fleets = new Map<string, any>([
        ["f1", {
          id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Alpha",
          locationSystemId: SystemId("sys-1"), unitIds: [],
          targetSystemId: SystemId("sys-2"), arrivalCycle: 10,
        }],
      ]);
      const result = resolveFleetArrivals(fleets, 5);
      const f = result.get("f1")!;
      expect(f.locationSystemId).toBe(SystemId("sys-1"));
      expect(f.targetSystemId).toBe(SystemId("sys-2"));
    });

    it("resolveFleetArrivals handles stationary fleets gracefully", () => {
      const fleets = new Map<string, any>([
        ["f1", {
          id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Alpha",
          locationSystemId: SystemId("sys-1"), unitIds: [],
          targetSystemId: null, arrivalCycle: null,
        }],
      ]);
      const result = resolveFleetArrivals(fleets, 5);
      const f = result.get("f1")!;
      expect(f.locationSystemId).toBe(SystemId("sys-1"));
      expect(f.targetSystemId).toBeNull();
    });
  });

  describe("Unit-fleet assignment", () => {
    it("assignUnitToFleet adds unit to fleet", () => {
      const fleet: any = {
        id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Alpha",
        locationSystemId: SystemId("sys-1"), unitIds: [UnitId("u1")],
        targetSystemId: null, arrivalCycle: null,
      };
      const result = assignUnitToFleet(fleet, UnitId("u2"));
      expect(result.unitIds).toContain(UnitId("u2"));
      expect(result.unitIds).toHaveLength(2);
      // Original not mutated
      expect(fleet.unitIds).toHaveLength(1);
    });

    it("assignUnitToFleet rejects duplicate unit", () => {
      const fleet: any = {
        id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Alpha",
        locationSystemId: SystemId("sys-1"), unitIds: [UnitId("u1")],
        targetSystemId: null, arrivalCycle: null,
      };
      const result = assignUnitToFleet(fleet, UnitId("u1"));
      expect(result.unitIds).toHaveLength(1);
    });

    it("removeUnitFromFleet removes unit from fleet", () => {
      const fleet: any = {
        id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Alpha",
        locationSystemId: SystemId("sys-1"), unitIds: [UnitId("u1"), UnitId("u2")],
        targetSystemId: null, arrivalCycle: null,
      };
      const result = removeUnitFromFleet(fleet, UnitId("u1"));
      expect(result.unitIds).toEqual([UnitId("u2")]);
      // Original not mutated
      expect(fleet.unitIds).toHaveLength(2);
    });

    it("removeUnitFromFleet is no-op for absent unit", () => {
      const fleet: any = {
        id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Alpha",
        locationSystemId: SystemId("sys-1"), unitIds: [UnitId("u1")],
        targetSystemId: null, arrivalCycle: null,
      };
      const result = removeUnitFromFleet(fleet, UnitId("u99"));
      expect(result.unitIds).toEqual([UnitId("u1")]);
    });
  });

  describe("Maintenance cost calculation", () => {
    it("calculateMaintenanceCost sums ore and fuel for all units", () => {
      const registry = createUnitTypeRegistry();
      const units = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>([
        ["u1", { typeId: "fighter", currentHp: 8, completionCycle: null }],
        ["u2", { typeId: "cruiser", currentHp: 25, completionCycle: null }],
      ]);
      const cost = calculateMaintenanceCost(["u1", "u2"], units, registry);
      // fighter: ore 5 + fuel 3, cruiser: ore 15 + fuel 10
      expect(cost.ore).toBe(20);
      expect(cost.fuel).toBe(13);
    });

    it("calculateMaintenanceCost excludes units still building", () => {
      const registry = createUnitTypeRegistry();
      const units = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>([
        ["u1", { typeId: "fighter", currentHp: 8, completionCycle: null }],
        ["u2", { typeId: "cruiser", currentHp: 25, completionCycle: 10 }], // still building
      ]);
      const cost = calculateMaintenanceCost(["u1", "u2"], units, registry);
      expect(cost.ore).toBe(5);
      expect(cost.fuel).toBe(3);
    });

    it("calculateMaintenanceCost returns zero for empty unit list", () => {
      const registry = createUnitTypeRegistry();
      const units = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>();
      const cost = calculateMaintenanceCost([], units, registry);
      expect(cost.ore).toBe(0);
      expect(cost.fuel).toBe(0);
    });
  });

  describe("Unit type registry", () => {
    it("createUnitTypeRegistry returns map of all 7 unit types", () => {
      const registry = createUnitTypeRegistry();
      expect(registry.size).toBe(7);
      expect(registry.has("fighter")).toBe(true);
      expect(registry.has("cruiser")).toBe(true);
      expect(registry.has("orbital-platform")).toBe(true);
      expect(registry.has("bombardment-ship")).toBe(true);
      expect(registry.has("infantry")).toBe(true);
      expect(registry.has("heavy-armor")).toBe(true);
      expect(registry.has("dreadnought")).toBe(true);
    });
  });

  describe("Specific unit costs", () => {
    it("fighter costs 100 credits, 1 cycle build time", () => {
      const ut = UNIT_TYPES.find(u => u.id === "fighter")!;
      expect(ut.buildCost).toBe(100);
      expect(ut.buildTime).toBe(1);
    });

    it("cruiser costs 300 credits, 3 cycles", () => {
      const ut = UNIT_TYPES.find(u => u.id === "cruiser")!;
      expect(ut.buildCost).toBe(300);
      expect(ut.buildTime).toBe(3);
    });

    it("infantry is cheapest at 50 credits", () => {
      const ut = UNIT_TYPES.find(u => u.id === "infantry")!;
      const minCost = Math.min(...UNIT_TYPES.map(u => u.buildCost));
      expect(ut.buildCost).toBe(minCost);
      expect(ut.buildCost).toBe(50);
    });
  });

  describe("Affordability — boundary", () => {
    it("canAffordUnit succeeds at exact build cost", () => {
      const registry = createUnitTypeRegistry();
      const reserves: Resources = { credits: 100, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 };
      expect(canAffordUnit("fighter", reserves, registry)).toBe(true);
    });

    it("canAffordUnit fails one credit below build cost", () => {
      const registry = createUnitTypeRegistry();
      const reserves: Resources = { credits: 99, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 };
      expect(canAffordUnit("fighter", reserves, registry)).toBe(false);
    });
  });

  describe("Military power — edge cases", () => {
    it("skips unknown unit IDs not in units map", () => {
      const registry = createUnitTypeRegistry();
      const units = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>();
      units.set("u1", { typeId: "fighter", currentHp: 8, completionCycle: null });
      const power = calculateMilitaryPower(["u1", "u-missing"], units, registry);
      expect(power).toBe(9); // only fighter contributes
    });

    it("returns 0 for empty units map", () => {
      const registry = createUnitTypeRegistry();
      const power = calculateMilitaryPower(["u1"], new Map(), registry);
      expect(power).toBe(0);
    });
  });

  describe("Build queue — empty queue", () => {
    it("advanceBuildQueue returns empty arrays for empty queue", () => {
      const registry = createUnitTypeRegistry();
      const { completed, remaining } = advanceBuildQueue([], 10, registry);
      expect(completed).toHaveLength(0);
      expect(remaining).toHaveLength(0);
    });
  });

  describe("createUnitFromCompleted — different types", () => {
    it("creates cruiser with 25 HP", () => {
      const registry = createUnitTypeRegistry();
      const entry = { unitTypeId: "cruiser", systemId: "sys-0" as any, startCycle: 1, completionCycle: 4 };
      const unit = createUnitFromCompleted(entry, registry, "u-cruiser");
      expect(unit.currentHp).toBe(25);
      expect(unit.typeId).toBe("cruiser");
    });

    it("creates infantry with 12 HP", () => {
      const registry = createUnitTypeRegistry();
      const entry = { unitTypeId: "infantry", systemId: "sys-0" as any, startCycle: 1, completionCycle: 2 };
      const unit = createUnitFromCompleted(entry, registry, "u-inf");
      expect(unit.currentHp).toBe(12);
    });
  });

  describe("Fleet arrivals — multi-fleet", () => {
    it("resolves mixed arrived and in-transit fleets", () => {
      const fleets = new Map<string, any>([
        ["f1", {
          id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Alpha",
          locationSystemId: SystemId("sys-1"), unitIds: [UnitId("u1")],
          targetSystemId: SystemId("sys-2"), arrivalCycle: 5,
        }],
        ["f2", {
          id: FleetId("f2"), ownerId: EmpireId("e1"), name: "Beta",
          locationSystemId: SystemId("sys-3"), unitIds: [],
          targetSystemId: SystemId("sys-4"), arrivalCycle: 10,
        }],
        ["f3", {
          id: FleetId("f3"), ownerId: EmpireId("e2"), name: "Gamma",
          locationSystemId: SystemId("sys-5"), unitIds: [],
          targetSystemId: null, arrivalCycle: null,
        }],
      ]);
      const result = resolveFleetArrivals(fleets, 5);
      // f1 arrived
      expect(result.get("f1")!.locationSystemId).toBe(SystemId("sys-2"));
      expect(result.get("f1")!.targetSystemId).toBeNull();
      // f2 still in transit
      expect(result.get("f2")!.locationSystemId).toBe(SystemId("sys-3"));
      expect(result.get("f2")!.targetSystemId).toBe(SystemId("sys-4"));
      // f3 stationary
      expect(result.get("f3")!.locationSystemId).toBe(SystemId("sys-5"));
    });

    it("resolveFleetArrivals on empty map returns empty map", () => {
      const result = resolveFleetArrivals(new Map(), 5);
      expect(result.size).toBe(0);
    });
  });

  describe("Fleet composition bonus — boundary", () => {
    it("exactly 3 unique types returns 0", () => {
      expect(calculateFleetCompositionBonus(["fighter", "cruiser", "infantry"])).toBe(0);
    });

    it("exactly 4 unique types returns 0.15", () => {
      expect(calculateFleetCompositionBonus(["fighter", "cruiser", "infantry", "heavy-armor"])).toBe(0.15);
    });

    it("5+ unique types still returns 0.15", () => {
      expect(calculateFleetCompositionBonus([
        "fighter", "cruiser", "infantry", "heavy-armor", "orbital-platform",
      ])).toBe(0.15);
    });
  });

  describe("Dreadnought (capstone unit)", () => {
    it("Dreadnought unit type exists in UNIT_TYPES", () => {
      const dreadnought = UNIT_TYPES.find(u => u.id === "dreadnought");
      expect(dreadnought).toBeDefined();
    });

    it("Dreadnought is a fleet category unit", () => {
      const dreadnought = UNIT_TYPES.find(u => u.id === "dreadnought")!;
      expect(dreadnought.category).toBe("fleet");
    });

    it("Dreadnought is the most expensive and powerful unit", () => {
      const dreadnought = UNIT_TYPES.find(u => u.id === "dreadnought")!;
      for (const ut of UNIT_TYPES) {
        if (ut.id === "dreadnought") continue;
        expect(dreadnought.buildCost).toBeGreaterThan(ut.buildCost);
        expect(dreadnought.attack).toBeGreaterThanOrEqual(ut.attack);
      }
    });

    it("Dreadnought has a D20 stat block", () => {
      const dreadnought = UNIT_TYPES.find(u => u.id === "dreadnought")!;
      expect(dreadnought.statBlock).toBeDefined();
      expect(dreadnought.statBlock!.str).toBeGreaterThan(0);
    });

    it("Dreadnought is registered in createUnitTypeRegistry", () => {
      const registry = createUnitTypeRegistry();
      expect(registry.has("dreadnought")).toBe(true);
    });

    it("Dreadnought has specific stats: 800 credits, 6 cycles, ATK 25, DEF 15, HP 50", () => {
      const d = UNIT_TYPES.find(u => u.id === "dreadnought")!;
      expect(d.buildCost).toBe(800);
      expect(d.buildTime).toBe(6);
      expect(d.attack).toBe(25);
      expect(d.defence).toBe(15);
      expect(d.hp).toBe(50);
    });

    it("Dreadnought has highest maintenance costs", () => {
      const d = UNIT_TYPES.find(u => u.id === "dreadnought")!;
      for (const ut of UNIT_TYPES) {
        if (ut.id === "dreadnought") continue;
        expect(d.oreMaintenance).toBeGreaterThanOrEqual(ut.oreMaintenance);
        expect(d.fuelMaintenance).toBeGreaterThanOrEqual(ut.fuelMaintenance);
      }
    });
  });

  describe("calculateMilitaryPower — unknown type and empty", () => {
    it("skips units with unknown typeId in registry", () => {
      const registry = createUnitTypeRegistry();
      const units = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>([
        ["u1", { typeId: "nonexistent-type", currentHp: 10, completionCycle: null }],
      ]);
      expect(calculateMilitaryPower(["u1"], units, registry)).toBe(0);
    });

    it("returns 0 for empty unitIds array", () => {
      const registry = createUnitTypeRegistry();
      expect(calculateMilitaryPower([], new Map(), registry)).toBe(0);
    });
  });

  describe("calculateMaintenanceCost — edge cases", () => {
    it("skips units with unknown typeId", () => {
      const registry = createUnitTypeRegistry();
      const units = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>([
        ["u1", { typeId: "nonexistent", currentHp: 10, completionCycle: null }],
      ]);
      const cost = calculateMaintenanceCost(["u1"], units, registry);
      expect(cost.ore).toBe(0);
      expect(cost.fuel).toBe(0);
    });

    it("skips unit IDs not present in units map", () => {
      const registry = createUnitTypeRegistry();
      const units = new Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>();
      const cost = calculateMaintenanceCost(["missing-id"], units, registry);
      expect(cost.ore).toBe(0);
      expect(cost.fuel).toBe(0);
    });
  });

  describe("enqueueUnit — startCycle", () => {
    it("records correct startCycle", () => {
      const registry = createUnitTypeRegistry();
      const entry = enqueueUnit("infantry", 7, registry);
      expect(entry).not.toBeNull();
      expect(entry!.startCycle).toBe(7);
      expect(entry!.completionCycle).toBe(8); // infantry buildTime = 1
    });
  });

  describe("advanceBuildQueue — past completion", () => {
    it("completes entries whose completionCycle is before currentCycle", () => {
      const registry = createUnitTypeRegistry();
      const queue = [
        { unitTypeId: "fighter", systemId: "sys-0" as any, startCycle: 1, completionCycle: 3 },
      ];
      const { completed } = advanceBuildQueue(queue, 10, registry);
      expect(completed).toHaveLength(1);
    });
  });

  describe("createUnitFromCompleted — dreadnought", () => {
    it("creates dreadnought with 50 HP", () => {
      const registry = createUnitTypeRegistry();
      const entry = { unitTypeId: "dreadnought", systemId: "sys-0" as any, startCycle: 1, completionCycle: 7 };
      const unit = createUnitFromCompleted(entry, registry, "u-dread");
      expect(unit.currentHp).toBe(50);
      expect(unit.typeId).toBe("dreadnought");
    });
  });

  describe("resolveFleetArrivals — past arrival cycle", () => {
    it("fleet with arrivalCycle earlier than currentCycle still arrives", () => {
      const fleets = new Map<string, any>([
        ["f1", {
          id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Late",
          locationSystemId: SystemId("sys-1"), unitIds: [],
          targetSystemId: SystemId("sys-2"), arrivalCycle: 3,
        }],
      ]);
      const result = resolveFleetArrivals(fleets, 10);
      expect(result.get("f1")!.locationSystemId).toBe(SystemId("sys-2"));
      expect(result.get("f1")!.targetSystemId).toBeNull();
    });
  });

  describe("assignUnitToFleet — empty fleet", () => {
    it("adds unit to fleet with empty unitIds", () => {
      const fleet: any = {
        id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Empty",
        locationSystemId: SystemId("sys-1"), unitIds: [],
        targetSystemId: null, arrivalCycle: null,
      };
      const result = assignUnitToFleet(fleet, UnitId("u1"));
      expect(result.unitIds).toEqual([UnitId("u1")]);
    });
  });

  describe("removeUnitFromFleet — last unit", () => {
    it("removing last unit yields empty unitIds", () => {
      const fleet: any = {
        id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Solo",
        locationSystemId: SystemId("sys-1"), unitIds: [UnitId("u1")],
        targetSystemId: null, arrivalCycle: null,
      };
      const result = removeUnitFromFleet(fleet, UnitId("u1"));
      expect(result.unitIds).toEqual([]);
    });
  });

  describe("calculateFleetCompositionBonus — empty", () => {
    it("empty array returns 0", () => {
      expect(calculateFleetCompositionBonus([])).toBe(0);
    });

    it("single type returns 0", () => {
      expect(calculateFleetCompositionBonus(["fighter"])).toBe(0);
    });
  });

  describe("moveFleet — pure function verification", () => {
    it("does not mutate original fleet unitIds", () => {
      const fleet: any = {
        id: FleetId("f1"), ownerId: EmpireId("e1"), name: "Alpha",
        locationSystemId: SystemId("sys-1"),
        unitIds: [UnitId("u1"), UnitId("u2")],
        targetSystemId: null, arrivalCycle: null,
      };
      const result = moveFleet(fleet, SystemId("sys-2"), 5, 3);
      result.unitIds.push(UnitId("u3"));
      // Original should be unaffected
      expect(fleet.unitIds).toHaveLength(2);
    });
  });
});
