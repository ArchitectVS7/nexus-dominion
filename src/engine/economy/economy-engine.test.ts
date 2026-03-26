import { describe, it, expect } from "vitest";
import {
  calculateProduction,
  calculateMilitaryMaintenance,
  computeResourceLedger,
  applyResourceCycle,
  degradeUnmaintainedUnits,
} from "./economy-engine";
import type { Empire, Resources } from "../types/empire";
import type { StarSystem } from "../types/galaxy";
import type { Unit, UnitType } from "../types/military";
import { EmpireId, SystemId, UnitId } from "../types/ids";

function makeSystem(biome: string, owner: string): StarSystem {
  return {
    id: SystemId("sys-1"),
    name: "Test",
    sectorId: "sector-0" as any,
    position: { x: 0, y: 0 },
    biome: biome as any,
    owner: EmpireId(owner),
    slots: [],
    baseProduction: {},
    adjacentSystemIds: [],
    claimedCycle: 0,
    isHomeSystem: false,
  };
}

const testUnitType: UnitType = {
  id: "fighter",
  name: "Fighter",
  category: "fleet",
  buildCost: 100,
  buildTime: 2,
  oreMaintenance: 5,
  fuelMaintenance: 3,
  attack: 5,
  defence: 3,
  hp: 10,
};

function makeUnit(id: string, typeId: string, completed: boolean): Unit {
  return {
    id: UnitId(id),
    typeId,
    currentHp: 10,
    completionCycle: completed ? null : 5,
  };
}

const emptyResources: Resources = {
  credits: 0, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0,
};

describe("Economy Engine", () => {
  // REQ-014: Five resource types tracked per empire
  describe("REQ-014: Resource types", () => {
    it("production includes credits, food, ore, fuelCells, researchPoints", () => {
      const systems = [makeSystem("core-world", "empire-0")];
      const prod = calculateProduction(systems, 1.0);
      expect(prod.credits).toBeGreaterThan(0);
      expect(prod.food).toBeGreaterThan(0);
      expect(prod.ore).toBeGreaterThan(0);
      expect(prod.fuelCells).toBeGreaterThan(0);
      expect(prod.researchPoints).toBeGreaterThan(0);
    });
  });

  // REQ-015: Resources produced/consumed each turn
  describe("REQ-015: Resource production and consumption", () => {
    it("production scales with number of systems", () => {
      const oneSys = calculateProduction([makeSystem("core-world", "e")], 1.0);
      const twoSys = calculateProduction(
        [makeSystem("core-world", "e"), makeSystem("core-world", "e")],
        1.0,
      );
      expect(twoSys.credits).toBe(oneSys.credits * 2);
    });

    it("production is modified by stability multiplier", () => {
      const base = calculateProduction([makeSystem("core-world", "e")], 1.0);
      const happy = calculateProduction([makeSystem("core-world", "e")], 1.5);
      expect(happy.credits).toBe(base.credits * 1.5);
    });

    it("different biomes produce different resource mixes", () => {
      const mineral = calculateProduction([makeSystem("mineral-world", "e")], 1.0);
      const verdant = calculateProduction([makeSystem("verdant-world", "e")], 1.0);
      expect(mineral.ore).toBeGreaterThan(verdant.ore);
      expect(verdant.food).toBeGreaterThan(mineral.food);
    });

    it("applyResourceCycle updates reserves correctly", () => {
      const reserves: Resources = { ...emptyResources, credits: 100, food: 50 };
      const net: Resources = { ...emptyResources, credits: 20, food: -10 };
      const { newReserves } = applyResourceCycle(reserves, net);
      expect(newReserves.credits).toBe(120);
      expect(newReserves.food).toBe(40);
    });

    it("deficits are reported when reserves go negative", () => {
      const reserves: Resources = { ...emptyResources, food: 5 };
      const net: Resources = { ...emptyResources, food: -10 };
      const { newReserves, deficits } = applyResourceCycle(reserves, net);
      expect(deficits).toContain("food");
      expect(newReserves.food).toBe(0); // clamped to 0
    });
  });

  // REQ-016: Military maintenance; failure degrades units
  describe("REQ-016: Military maintenance", () => {
    it("completed units consume ore and fuel maintenance", () => {
      const units = [makeUnit("u1", "fighter", true)];
      const types = new Map([["fighter", testUnitType]]);
      const maint = calculateMilitaryMaintenance(units, types);
      expect(maint.ore).toBe(5);
      expect(maint.fuelCells).toBe(3);
    });

    it("units under construction do not consume maintenance", () => {
      const units = [makeUnit("u1", "fighter", false)];
      const types = new Map([["fighter", testUnitType]]);
      const maint = calculateMilitaryMaintenance(units, types);
      expect(maint.ore).toBe(0);
      expect(maint.fuelCells).toBe(0);
    });

    it("degradeUnmaintainedUnits reduces HP", () => {
      const units = [makeUnit("u1", "fighter", true)];
      units[0].currentHp = 10;
      const types = new Map([["fighter", testUnitType]]);
      degradeUnmaintainedUnits(units, types, 3);
      expect(units[0].currentHp).toBe(7);
    });

    it("HP does not go below 0", () => {
      const units = [makeUnit("u1", "fighter", true)];
      units[0].currentHp = 2;
      const types = new Map([["fighter", testUnitType]]);
      degradeUnmaintainedUnits(units, types, 5);
      expect(units[0].currentHp).toBe(0);
    });
  });

  describe("Resource ledger computation", () => {
    it("computes full ledger with production, consumption, net, reserves", () => {
      const empire: Empire = {
        id: EmpireId("empire-0"),
        name: "Test",
        colour: "#000",
        isPlayer: true,
        systemIds: [SystemId("sys-1")],
        homeSystemId: SystemId("sys-1"),
        resources: { credits: 100, food: 50, ore: 30, fuelCells: 20, researchPoints: 10, intelligencePoints: 5 },
        stabilityScore: 50,
        stabilityLevel: "content",
        population: 1000,
        populationCapacity: 2000,
        fleetIds: [],
        researchTier: 0,
        powerScore: 100,
      };

      const systems = [makeSystem("core-world", "empire-0")];
      const units = [makeUnit("u1", "fighter", true)];
      const types = new Map([["fighter", testUnitType]]);

      const ledger = computeResourceLedger(empire, systems, units, types, 1.0);

      expect(ledger.production.credits).toBeGreaterThan(0);
      expect(ledger.consumption.ore).toBeGreaterThan(0);
      expect(ledger.net.credits).toBe(ledger.production.credits - ledger.consumption.credits);
      expect(ledger.reserves).toEqual(empire.resources);
    });
  });
});
