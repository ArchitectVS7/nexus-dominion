import { describe, it, expect } from "vitest";
import {
  calculateProduction,
  calculateMilitaryMaintenance,
  computeResourceLedger,
  applyResourceCycle,
  degradeUnmaintainedUnits,
  calculatePopulationGrowth,
  calculateOvercrowdingPenalty,
  recalculateStability,
  updateStabilityScore,
  calculateInstallationProduction,
  BIOME_INSTALLATION_BONUS,
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

  describe("Population growth", () => {
    it("population grows 2% when food surplus exists", () => {
      const growth = calculatePopulationGrowth(1000, 5000, 50);
      expect(growth).toBe(20); // 2% of 1000
    });

    it("population declines 5% when food deficit", () => {
      const growth = calculatePopulationGrowth(1000, 5000, -10);
      expect(growth).toBe(-50); // -5% of 1000
    });

    it("no growth when food surplus is zero", () => {
      const growth = calculatePopulationGrowth(1000, 5000, 0);
      expect(growth).toBe(0);
    });

    it("population cannot grow beyond capacity", () => {
      const growth = calculatePopulationGrowth(4990, 5000, 50);
      // 2% of 4990 = 99.8 → would exceed capacity of 5000
      expect(growth).toBeLessThanOrEqual(5000 - 4990);
    });
  });

  describe("Overcrowding and stability", () => {
    it("overcrowding penalty when pop > 90% capacity", () => {
      const penalty = calculateOvercrowdingPenalty(1900, 2000);
      expect(penalty).toBeGreaterThan(0);
    });

    it("no overcrowding penalty when pop <= 90% capacity", () => {
      const penalty = calculateOvercrowdingPenalty(1800, 2000);
      expect(penalty).toBe(0);
    });

    it("recalculateStability maps score to correct level", () => {
      expect(recalculateStability(95)).toBe("ecstatic");
      expect(recalculateStability(70)).toBe("happy");
      expect(recalculateStability(50)).toBe("content");
      expect(recalculateStability(35)).toBe("unhappy");
      expect(recalculateStability(15)).toBe("angry");
      expect(recalculateStability(5)).toBe("rioting");
    });

    it("updateStabilityScore adjusts for food deficit", () => {
      const newScore = updateStabilityScore(50, { foodDeficit: true });
      expect(newScore).toBeLessThan(50);
    });

    it("updateStabilityScore adjusts for overcrowding", () => {
      const newScore = updateStabilityScore(50, { overcrowded: true });
      expect(newScore).toBeLessThan(50);
    });

    it("updateStabilityScore adjusts for war", () => {
      const newScore = updateStabilityScore(50, { atWar: true });
      expect(newScore).toBeLessThan(50);
    });

    it("updateStabilityScore increases for food surplus", () => {
      const newScore = updateStabilityScore(50, { foodSurplus: true });
      expect(newScore).toBeGreaterThan(50);
    });

    it("stability score is clamped to 0-100", () => {
      expect(updateStabilityScore(5, { foodDeficit: true, overcrowded: true, atWar: true })).toBeGreaterThanOrEqual(0);
      expect(updateStabilityScore(95, { foodSurplus: true })).toBeLessThanOrEqual(100);
    });
  });

  describe("Installation production", () => {
    it("trade-hub installation boosts credits", () => {
      const system = makeSystem("core-world", "empire-0");
      system.slots = [{ installation: { id: "inst-1" as any, type: "trade-hub", condition: 1.0, completionCycle: null }, locked: false }];
      const bonus = calculateInstallationProduction(system);
      expect(bonus.credits).toBeGreaterThan(0);
    });

    it("agricultural-station boosts food", () => {
      const system = makeSystem("core-world", "empire-0");
      system.slots = [{ installation: { id: "inst-1" as any, type: "agricultural-station", condition: 1.0, completionCycle: null }, locked: false }];
      const bonus = calculateInstallationProduction(system);
      expect(bonus.food).toBeGreaterThan(0);
    });

    it("research-lab boosts research points", () => {
      const system = makeSystem("core-world", "empire-0");
      system.slots = [{ installation: { id: "inst-1" as any, type: "research-station", condition: 1.0, completionCycle: null }, locked: false }];
      const bonus = calculateInstallationProduction(system);
      expect(bonus.researchPoints).toBeGreaterThan(0);
    });

    it("empty slots produce nothing", () => {
      const system = makeSystem("core-world", "empire-0");
      system.slots = [];
      const bonus = calculateInstallationProduction(system);
      expect(bonus.credits ?? 0).toBe(0);
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

  // ═══ Biome Installation Bonuses ═══
  describe("Biome installation bonuses", () => {
    it("BIOME_INSTALLATION_BONUS is exported and has entries for key biomes", () => {
      expect(BIOME_INSTALLATION_BONUS).toBeDefined();
      expect(BIOME_INSTALLATION_BONUS["mineral-world"]).toBeDefined();
      expect(BIOME_INSTALLATION_BONUS["verdant-world"]).toBeDefined();
      expect(BIOME_INSTALLATION_BONUS["core-world"]).toBeDefined();
    });

    it("mining-complex on mineral-world gets 1.5x production bonus", () => {
      const system = makeSystem("mineral-world", "empire-0");
      system.slots = [{
        installation: { id: "inst-1" as any, type: "mining-complex", condition: 1.0, completionCycle: null },
        locked: false,
      }];

      const prod = calculateInstallationProduction(system);
      // mining-complex base output is 15 ore; with 1.5x biome bonus = 22 (floor)
      expect(prod.ore).toBe(22);
    });

    it("mining-complex on core-world gets no biome bonus (1.0x)", () => {
      const system = makeSystem("core-world", "empire-0");
      system.slots = [{
        installation: { id: "inst-1" as any, type: "mining-complex", condition: 1.0, completionCycle: null },
        locked: false,
      }];

      const prod = calculateInstallationProduction(system);
      // mining-complex base output is 15 ore; no bonus = 15
      expect(prod.ore).toBe(15);
    });

    it("agricultural-station on verdant-world gets 1.5x bonus", () => {
      const system = makeSystem("verdant-world", "empire-0");
      system.slots = [{
        installation: { id: "inst-1" as any, type: "agricultural-station", condition: 1.0, completionCycle: null },
        locked: false,
      }];

      const prod = calculateInstallationProduction(system);
      // agricultural-station base output is 15 food; with 1.5x = 22
      expect(prod.food).toBe(22);
    });

    it("research-station on void-station gets 1.5x bonus", () => {
      const system = makeSystem("void-station", "empire-0");
      system.slots = [{
        installation: { id: "inst-1" as any, type: "research-station", condition: 1.0, completionCycle: null },
        locked: false,
      }];

      const prod = calculateInstallationProduction(system);
      // research-station base output is 12 RP; with 1.5x = 18
      expect(prod.researchPoints).toBe(18);
    });

    it("trade-hub on core-world gets 1.5x bonus", () => {
      const system = makeSystem("core-world", "empire-0");
      system.slots = [{
        installation: { id: "inst-1" as any, type: "trade-hub", condition: 1.0, completionCycle: null },
        locked: false,
      }];

      const prod = calculateInstallationProduction(system);
      // trade-hub base output is 20 credits; with 1.5x = 30
      expect(prod.credits).toBe(30);
    });

    it("biome bonus stacks with condition multiplier", () => {
      const system = makeSystem("mineral-world", "empire-0");
      system.slots = [{
        installation: { id: "inst-1" as any, type: "mining-complex", condition: 0.5, completionCycle: null },
        locked: false,
      }];

      const prod = calculateInstallationProduction(system);
      // mining-complex: 15 ore * 0.5 condition * 1.5 biome = 11 (floor)
      expect(prod.ore).toBe(11);
    });

    it("frontier-world has no biome bonuses (generalist)", () => {
      const system = makeSystem("frontier-world", "empire-0");
      system.slots = [{
        installation: { id: "inst-1" as any, type: "trade-hub", condition: 1.0, completionCycle: null },
        locked: false,
      }];

      const prod = calculateInstallationProduction(system);
      // No bonus — base 20 credits
      expect(prod.credits).toBe(20);
    });
  });

  describe("calculateProduction — edge cases", () => {
    it("empty systems array produces zero resources", () => {
      const prod = calculateProduction([], 1.0);
      expect(prod.credits).toBe(0);
      expect(prod.food).toBe(0);
      expect(prod.ore).toBe(0);
    });

    it("unknown biome produces zero resources", () => {
      const sys = makeSystem("unknown-biome", "e");
      const prod = calculateProduction([sys], 1.0);
      expect(prod.credits).toBe(0);
      expect(prod.food).toBe(0);
    });

    it("zero stability multiplier produces zero", () => {
      const sys = makeSystem("core-world", "e");
      const prod = calculateProduction([sys], 0);
      expect(prod.credits).toBe(0);
      expect(prod.food).toBe(0);
    });
  });

  describe("calculateMilitaryMaintenance — edge cases", () => {
    it("empty units array produces zero", () => {
      const maint = calculateMilitaryMaintenance([], new Map());
      expect(maint.ore).toBe(0);
      expect(maint.fuelCells).toBe(0);
    });

    it("unknown unit type is skipped", () => {
      const units = [makeUnit("u1", "nonexistent", true)];
      const maint = calculateMilitaryMaintenance(units, new Map());
      expect(maint.ore).toBe(0);
    });

    it("multiple completed units sum maintenance", () => {
      const units = [makeUnit("u1", "fighter", true), makeUnit("u2", "fighter", true)];
      const types = new Map([["fighter", testUnitType]]);
      const maint = calculateMilitaryMaintenance(units, types);
      expect(maint.ore).toBe(10);
      expect(maint.fuelCells).toBe(6);
    });
  });

  describe("computeResourceLedger — food consumption", () => {
    it("food consumption is 1 per 100 population (ceiling)", () => {
      const empire: Empire = {
        id: EmpireId("empire-0"), name: "Test", colour: "#000", isPlayer: true,
        systemIds: [], homeSystemId: SystemId("sys-1"),
        resources: { ...emptyResources, credits: 100 },
        stabilityScore: 50, stabilityLevel: "content",
        population: 250, populationCapacity: 2000, fleetIds: [],
        researchTier: 0, powerScore: 100,
      };
      const ledger = computeResourceLedger(empire, [], [], new Map(), 1.0);
      // ceil(250/100) = 3
      expect(ledger.consumption.food).toBe(3);
    });
  });

  describe("applyResourceCycle — multiple deficits", () => {
    it("reports all resources that go negative", () => {
      const reserves: Resources = { credits: 5, food: 3, ore: 0, fuelCells: 10, researchPoints: 0, intelligencePoints: 0 };
      const net: Resources = { credits: -10, food: -10, ore: -5, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 };
      const { newReserves, deficits } = applyResourceCycle(reserves, net);
      expect(deficits).toContain("credits");
      expect(deficits).toContain("food");
      expect(deficits).toContain("ore");
      expect(deficits).not.toContain("fuelCells");
      expect(newReserves.credits).toBe(0);
      expect(newReserves.food).toBe(0);
      expect(newReserves.ore).toBe(0);
      expect(newReserves.fuelCells).toBe(10);
    });
  });

  describe("calculatePopulationGrowth — boundary", () => {
    it("growth is 0 when already at capacity", () => {
      const growth = calculatePopulationGrowth(5000, 5000, 50);
      expect(growth).toBe(0);
    });
  });

  describe("calculateOvercrowdingPenalty — boundaries", () => {
    it("exactly 90% → 0 penalty", () => {
      expect(calculateOvercrowdingPenalty(900, 1000)).toBe(0);
    });

    it("at 100% → penalty of 19 (floor of 0.1 * 200)", () => {
      expect(calculateOvercrowdingPenalty(1000, 1000)).toBe(19);
    });

    it("above 100% still capped at 20", () => {
      expect(calculateOvercrowdingPenalty(1200, 1000)).toBe(20);
    });
  });

  describe("recalculateStability — exact boundaries", () => {
    it("score 90 → ecstatic", () => expect(recalculateStability(90)).toBe("ecstatic"));
    it("score 89 → happy", () => expect(recalculateStability(89)).toBe("happy"));
    it("score 65 → happy", () => expect(recalculateStability(65)).toBe("happy"));
    it("score 64 → content", () => expect(recalculateStability(64)).toBe("content"));
    it("score 40 → content", () => expect(recalculateStability(40)).toBe("content"));
    it("score 39 → unhappy", () => expect(recalculateStability(39)).toBe("unhappy"));
    it("score 25 → unhappy", () => expect(recalculateStability(25)).toBe("unhappy"));
    it("score 24 → angry", () => expect(recalculateStability(24)).toBe("angry"));
    it("score 10 → angry", () => expect(recalculateStability(10)).toBe("angry"));
    it("score 9 → rioting", () => expect(recalculateStability(9)).toBe("rioting"));
    it("score 0 → rioting", () => expect(recalculateStability(0)).toBe("rioting"));
  });

  describe("updateStabilityScore — combined factors", () => {
    it("all negative factors stack: deficit + overcrowded + atWar = -20", () => {
      const score = updateStabilityScore(50, { foodDeficit: true, overcrowded: true, atWar: true });
      expect(score).toBe(30);
    });

    it("surplus + war net to -2", () => {
      const score = updateStabilityScore(50, { foodSurplus: true, atWar: true });
      expect(score).toBe(48);
    });
  });

  describe("calculateInstallationProduction — edge cases", () => {
    it("incomplete installation (non-null completionCycle) produces nothing", () => {
      const system = makeSystem("core-world", "empire-0");
      system.slots = [{
        installation: { id: "inst-1" as any, type: "trade-hub", condition: 1.0, completionCycle: 5 },
        locked: false,
      }];
      const prod = calculateInstallationProduction(system);
      expect(prod.credits ?? 0).toBe(0);
    });

    it("multiple installations on same system sum production", () => {
      const system = makeSystem("core-world", "empire-0");
      system.slots = [
        { installation: { id: "inst-1" as any, type: "trade-hub", condition: 1.0, completionCycle: null }, locked: false },
        { installation: { id: "inst-2" as any, type: "research-station", condition: 1.0, completionCycle: null }, locked: false },
      ];
      const prod = calculateInstallationProduction(system);
      // trade-hub on core-world: 20 * 1.5 = 30 credits
      // research-station on core-world: 12 * 1.0 = 12 RP
      expect(prod.credits).toBe(30);
      expect(prod.researchPoints).toBe(12);
    });

    it("cultural-institute produces no resources", () => {
      const system = makeSystem("contested-ruin", "empire-0");
      system.slots = [{
        installation: { id: "inst-1" as any, type: "cultural-institute", condition: 1.0, completionCycle: null },
        locked: false,
      }];
      const prod = calculateInstallationProduction(system);
      expect(Object.values(prod).every(v => v === 0 || v === undefined)).toBe(true);
    });
  });

  describe("degradeUnmaintainedUnits — edge cases", () => {
    it("units under construction are not degraded", () => {
      const units = [makeUnit("u1", "fighter", false)];
      const types = new Map([["fighter", testUnitType]]);
      const degraded = degradeUnmaintainedUnits(units, types, 3);
      expect(degraded).toHaveLength(0);
      expect(units[0].currentHp).toBe(10); // unchanged
    });

    it("returns list of degraded units", () => {
      const units = [makeUnit("u1", "fighter", true), makeUnit("u2", "fighter", true)];
      const types = new Map([["fighter", testUnitType]]);
      const degraded = degradeUnmaintainedUnits(units, types, 1);
      expect(degraded).toHaveLength(2);
      expect(degraded[0].currentHp).toBe(9);
      expect(degraded[1].currentHp).toBe(9);
    });
  });

  describe("BIOME_INSTALLATION_BONUS — coverage", () => {
    it("defines bonus entries for all 9 biomes", () => {
      const biomes = [
        "core-world", "mineral-world", "verdant-world", "void-station",
        "barren-world", "contested-ruin", "frontier-world", "nexus-adjacent",
        "resource-rich-anomaly",
      ];
      for (const biome of biomes) {
        expect(BIOME_INSTALLATION_BONUS[biome]).toBeDefined();
      }
    });
  });
});
