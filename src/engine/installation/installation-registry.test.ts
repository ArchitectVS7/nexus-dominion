import { describe, it, expect } from "vitest";
import {
  canBuildInstallation,
  advanceInstallationQueue,
  createInstallationFromCompleted,
  addToInstallationQueue,
  INSTALLATION_COSTS,
  BIOME_ALLOWED_INSTALLATIONS,
  type InstallationQueueEntry,
} from "./installation-registry";
import type { StarSystem } from "../types/galaxy";
import type { Empire } from "../types/empire";
import { EmpireId, SystemId, InstallationId } from "../types/ids";

function makeSystem(slots: { installation: any; locked: boolean }[]): StarSystem {
  return {
    id: SystemId("sys-1"),
    name: "Test",
    sectorId: "sector-0" as any,
    position: { x: 0, y: 0 },
    biome: "core-world" as any,
    owner: EmpireId("empire-0"),
    slots,
    baseProduction: {},
    adjacentSystemIds: [],
    claimedCycle: 0,
    isHomeSystem: false,
  };
}

function makeEmpire(credits: number = 1000): Empire {
  return {
    id: EmpireId("empire-0"),
    name: "Test",
    colour: "#000",
    isPlayer: true,
    systemIds: [SystemId("sys-1")],
    homeSystemId: SystemId("sys-1"),
    resources: { credits, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 },
    stabilityScore: 50,
    stabilityLevel: "content",
    population: 1000,
    populationCapacity: 2000,
    fleetIds: [],
    researchTier: 0,
    powerScore: 100,
    buildQueue: [],
    installationQueue: [],
  };
}

const baseEntry: InstallationQueueEntry = {
  installationType: "trade-hub",
  systemId: SystemId("sys-1"),
  startCycle: 1,
  completionCycle: 4,
};

describe("Installation Registry", () => {
  describe("INSTALLATION_COSTS", () => {
    it("defines costs for all 8 installation types", () => {
      expect(Object.keys(INSTALLATION_COSTS)).toHaveLength(8);
    });

    it("each installation type has a credit cost and build time", () => {
      for (const [, cost] of Object.entries(INSTALLATION_COSTS)) {
        expect(cost.credits).toBeGreaterThan(0);
        expect(cost.buildTime).toBeGreaterThan(0);
      }
    });
  });

  describe("canBuildInstallation", () => {
    it("returns true when system has empty unlocked slot", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      expect(canBuildInstallation(system, "trade-hub")).toBe(true);
    });

    it("returns false when all slots are filled", () => {
      const system = makeSystem([
        { installation: { id: InstallationId("i1"), type: "trade-hub", condition: 1.0, completionCycle: null }, locked: false },
      ]);
      expect(canBuildInstallation(system, "mining-complex")).toBe(false);
    });

    it("returns false when all available slots are locked", () => {
      const system = makeSystem([{ installation: null, locked: true }]);
      expect(canBuildInstallation(system, "trade-hub")).toBe(false);
    });

    it("returns false when system has no slots at all", () => {
      const system = makeSystem([]);
      expect(canBuildInstallation(system, "trade-hub")).toBe(false);
    });

    it("returns false when same installation type already present", () => {
      const system = makeSystem([
        { installation: { id: InstallationId("i1"), type: "trade-hub", condition: 1.0, completionCycle: null }, locked: false },
        { installation: null, locked: false },
      ]);
      expect(canBuildInstallation(system, "trade-hub")).toBe(false);
    });

    it("returns true when different type present but empty slot exists", () => {
      const system = makeSystem([
        { installation: { id: InstallationId("i1"), type: "mining-complex", condition: 1.0, completionCycle: null }, locked: false },
        { installation: null, locked: false },
      ]);
      expect(canBuildInstallation(system, "trade-hub")).toBe(true);
    });
  });

  describe("advanceInstallationQueue", () => {
    it("moves completed entries out of queue at correct cycle", () => {
      const queue = [{ ...baseEntry, completionCycle: 5 }];
      const { completed, remaining } = advanceInstallationQueue(queue, 5);
      expect(completed).toHaveLength(1);
      expect(remaining).toHaveLength(0);
    });

    it("leaves incomplete entries in queue", () => {
      const queue = [{ ...baseEntry, completionCycle: 10 }];
      const { completed, remaining } = advanceInstallationQueue(queue, 5);
      expect(completed).toHaveLength(0);
      expect(remaining).toHaveLength(1);
    });

    it("returns empty arrays for empty queue", () => {
      const { completed, remaining } = advanceInstallationQueue([], 5);
      expect(completed).toHaveLength(0);
      expect(remaining).toHaveLength(0);
    });

    it("handles mixed completed and incomplete entries", () => {
      const queue = [
        { ...baseEntry, completionCycle: 3 },
        { ...baseEntry, completionCycle: 10, installationType: "mining-complex" as const },
      ];
      const { completed, remaining } = advanceInstallationQueue(queue, 5);
      expect(completed).toHaveLength(1);
      expect(remaining).toHaveLength(1);
    });
  });

  describe("createInstallationFromCompleted", () => {
    it("creates Installation with condition 1.0", () => {
      const inst = createInstallationFromCompleted(baseEntry, InstallationId("inst-1"));
      expect(inst.condition).toBe(1.0);
    });

    it("creates Installation with completionCycle null", () => {
      const inst = createInstallationFromCompleted(baseEntry, InstallationId("inst-1"));
      expect(inst.completionCycle).toBeNull();
    });

    it("assigns the correct installation type", () => {
      const inst = createInstallationFromCompleted(baseEntry, InstallationId("inst-1"));
      expect(inst.type).toBe("trade-hub");
    });

    it("assigns the provided installation ID", () => {
      const id = InstallationId("inst-xyz");
      const inst = createInstallationFromCompleted(baseEntry, id);
      expect(inst.id).toBe(id);
    });
  });

  describe("addToInstallationQueue", () => {
    it("deducts credits from empire on success", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      const empire = makeEmpire(1000);
      const cost = INSTALLATION_COSTS["trade-hub"].credits;
      addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      expect(empire.resources.credits).toBe(1000 - cost);
    });

    it("pushes entry with correct completionCycle", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      const empire = makeEmpire(1000);
      const buildTime = INSTALLATION_COSTS["trade-hub"].buildTime;
      addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      expect(empire.installationQueue![0].completionCycle).toBe(1 + buildTime);
    });

    it("returns false when insufficient credits", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      const empire = makeEmpire(10); // too few credits
      const result = addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      expect(result).toBe(false);
      expect(empire.installationQueue).toHaveLength(0);
    });

    it("returns false when no valid slot available", () => {
      const system = makeSystem([]); // no slots
      const empire = makeEmpire(1000);
      const result = addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      expect(result).toBe(false);
    });

    it("returns true on success", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      const empire = makeEmpire(1000);
      const result = addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      expect(result).toBe(true);
    });
  });

  describe("BIOME_ALLOWED_INSTALLATIONS", () => {
    it("defines allowed installations for all 9 biome types", () => {
      const biomes = [
        "core-world", "mineral-world", "verdant-world", "void-station",
        "barren-world", "contested-ruin", "frontier-world", "nexus-adjacent",
        "resource-rich-anomaly",
      ];
      for (const biome of biomes) {
        expect(BIOME_ALLOWED_INSTALLATIONS[biome]).toBeDefined();
        expect(BIOME_ALLOWED_INSTALLATIONS[biome].length).toBeGreaterThan(0);
      }
    });

    it("frontier-world allows all 8 installation types (generalist)", () => {
      expect(BIOME_ALLOWED_INSTALLATIONS["frontier-world"]).toHaveLength(8);
    });

    it("void-station does NOT allow agricultural-station", () => {
      expect(BIOME_ALLOWED_INSTALLATIONS["void-station"]).not.toContain("agricultural-station");
    });

    it("mineral-world allows mining-complex", () => {
      expect(BIOME_ALLOWED_INSTALLATIONS["mineral-world"]).toContain("mining-complex");
    });

    it("core-world allows trade-hub", () => {
      expect(BIOME_ALLOWED_INSTALLATIONS["core-world"]).toContain("trade-hub");
    });
  });

  describe("INSTALLATION_COSTS — specific values", () => {
    it("trade-hub costs 200 credits, 3 cycles", () => {
      expect(INSTALLATION_COSTS["trade-hub"]).toEqual({ credits: 200, buildTime: 3 });
    });

    it("research-station costs 250 credits, 4 cycles", () => {
      expect(INSTALLATION_COSTS["research-station"]).toEqual({ credits: 250, buildTime: 4 });
    });

    it("intelligence-nexus is the most expensive at 300 credits", () => {
      const maxCost = Math.max(...Object.values(INSTALLATION_COSTS).map(c => c.credits));
      expect(INSTALLATION_COSTS["intelligence-nexus"].credits).toBe(maxCost);
    });

    it("agricultural-station and fuel-extraction are cheapest at 150 credits", () => {
      expect(INSTALLATION_COSTS["agricultural-station"].credits).toBe(150);
      expect(INSTALLATION_COSTS["fuel-extraction"].credits).toBe(150);
    });
  });

  describe("addToInstallationQueue — edge cases", () => {
    it("initializes installationQueue when undefined", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      const empire = makeEmpire(1000);
      delete (empire as any).installationQueue;
      const result = addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      expect(result).toBe(true);
      expect(empire.installationQueue).toBeDefined();
      expect(empire.installationQueue!.length).toBe(1);
    });

    it("succeeds with exact credits (boundary)", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      const empire = makeEmpire(200); // exact cost of trade-hub
      const result = addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      expect(result).toBe(true);
      expect(empire.resources.credits).toBe(0);
    });

    it("fails with one credit below cost", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      const empire = makeEmpire(199); // 1 below trade-hub cost
      const result = addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      expect(result).toBe(false);
      expect(empire.resources.credits).toBe(199); // unchanged
    });

    it("queues multiple installations on same system (different types)", () => {
      const system = makeSystem([
        { installation: null, locked: false },
        { installation: null, locked: false },
      ]);
      const empire = makeEmpire(2000);
      addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      addToInstallationQueue(empire, "research-station", system, SystemId("sys-1"), 1);
      expect(empire.installationQueue!.length).toBe(2);
    });
  });

  describe("advanceInstallationQueue — multiple completions", () => {
    it("completes all entries at or before current cycle", () => {
      const queue: InstallationQueueEntry[] = [
        { ...baseEntry, completionCycle: 3 },
        { ...baseEntry, installationType: "mining-complex", completionCycle: 5 },
        { ...baseEntry, installationType: "research-station", completionCycle: 5 },
        { ...baseEntry, installationType: "fuel-extraction", completionCycle: 10 },
      ];
      const { completed, remaining } = advanceInstallationQueue(queue, 5);
      expect(completed).toHaveLength(3);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].installationType).toBe("fuel-extraction");
    });
  });

  describe("Biome restrictions — comprehensive", () => {
    it("verdant-world allows agricultural-station but not mining-complex", () => {
      expect(BIOME_ALLOWED_INSTALLATIONS["verdant-world"]).toContain("agricultural-station");
      expect(BIOME_ALLOWED_INSTALLATIONS["verdant-world"]).not.toContain("mining-complex");
    });

    it("barren-world allows mining-complex but not agricultural-station", () => {
      expect(BIOME_ALLOWED_INSTALLATIONS["barren-world"]).toContain("mining-complex");
      expect(BIOME_ALLOWED_INSTALLATIONS["barren-world"]).not.toContain("agricultural-station");
    });

    it("contested-ruin allows intelligence-nexus but not trade-hub", () => {
      expect(BIOME_ALLOWED_INSTALLATIONS["contested-ruin"]).toContain("intelligence-nexus");
      expect(BIOME_ALLOWED_INSTALLATIONS["contested-ruin"]).not.toContain("trade-hub");
    });

    it("nexus-adjacent allows research-station but not mining-complex", () => {
      expect(BIOME_ALLOWED_INSTALLATIONS["nexus-adjacent"]).toContain("research-station");
      expect(BIOME_ALLOWED_INSTALLATIONS["nexus-adjacent"]).not.toContain("mining-complex");
    });

    it("resource-rich-anomaly allows fuel-extraction but not population-centre", () => {
      expect(BIOME_ALLOWED_INSTALLATIONS["resource-rich-anomaly"]).toContain("fuel-extraction");
      expect(BIOME_ALLOWED_INSTALLATIONS["resource-rich-anomaly"]).not.toContain("population-centre");
    });
  });

  describe("Combined restriction scenarios", () => {
    it("biome restriction + duplicate type both reject", () => {
      // System with existing trade-hub on a biome that allows trade-hub
      const system = makeSystem([
        { installation: { id: InstallationId("i1"), type: "trade-hub", condition: 1.0, completionCycle: null }, locked: false },
        { installation: null, locked: false },
      ]);
      // Duplicate type rejection
      expect(canBuildInstallation(system, "trade-hub")).toBe(false);
    });

    it("biome rejection takes precedence even with empty slots", () => {
      const system = makeSystem([
        { installation: null, locked: false },
        { installation: null, locked: false },
      ]);
      system.biome = "barren-world" as any;
      // barren-world does not allow agricultural-station
      expect(canBuildInstallation(system, "agricultural-station")).toBe(false);
    });

    it("locked slot + biome allowed still fails if no unlocked empty slots", () => {
      const system = makeSystem([{ installation: null, locked: true }]);
      system.biome = "core-world" as any;
      expect(canBuildInstallation(system, "trade-hub")).toBe(false);
    });
  });

  describe("canBuildInstallation biome restriction", () => {
    it("rejects installation type not allowed for biome", () => {
      // void-station should not allow agricultural-station
      const system = makeSystem([{ installation: null, locked: false }]);
      system.biome = "void-station" as any;
      expect(canBuildInstallation(system, "agricultural-station")).toBe(false);
    });

    it("allows installation type that is permitted for biome", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      system.biome = "void-station" as any;
      expect(canBuildInstallation(system, "research-station")).toBe(true);
    });

    it("frontier-world accepts any installation type", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      system.biome = "frontier-world" as any;
      expect(canBuildInstallation(system, "trade-hub")).toBe(true);
      expect(canBuildInstallation(system, "agricultural-station")).toBe(true);
      expect(canBuildInstallation(system, "intelligence-nexus")).toBe(true);
    });

    it("mineral-world rejects population-centre", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      system.biome = "mineral-world" as any;
      expect(canBuildInstallation(system, "population-centre")).toBe(false);
    });

    it("addToInstallationQueue fails for biome-restricted type", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      system.biome = "void-station" as any;
      const empire = makeEmpire(1000);
      const result = addToInstallationQueue(empire, "agricultural-station", system, SystemId("sys-1"), 1);
      expect(result).toBe(false);
      expect(empire.resources.credits).toBe(1000); // no credits deducted
    });
  });

  describe("canBuildInstallation — mixed slot states", () => {
    it("finds the one empty unlocked slot among filled and locked slots", () => {
      const system = makeSystem([
        { installation: { id: InstallationId("i1"), type: "trade-hub", condition: 1.0, completionCycle: null }, locked: false },
        { installation: null, locked: true },
        { installation: { id: InstallationId("i2"), type: "mining-complex", condition: 1.0, completionCycle: null }, locked: false },
        { installation: null, locked: false }, // the only valid slot
      ]);
      expect(canBuildInstallation(system, "research-station")).toBe(true);
    });

    it("returns false when all empty slots are locked and filled slots exist", () => {
      const system = makeSystem([
        { installation: { id: InstallationId("i1"), type: "trade-hub", condition: 1.0, completionCycle: null }, locked: false },
        { installation: null, locked: true },
        { installation: null, locked: true },
      ]);
      expect(canBuildInstallation(system, "mining-complex")).toBe(false);
    });

    it("allows build when biome is not in BIOME_ALLOWED_INSTALLATIONS", () => {
      // Unknown biome — `allowed` is undefined, so biome check passes
      const system = makeSystem([{ installation: null, locked: false }]);
      system.biome = "unknown-biome" as any;
      expect(canBuildInstallation(system, "trade-hub")).toBe(true);
    });
  });

  describe("addToInstallationQueue — cumulative and startCycle", () => {
    it("records startCycle correctly", () => {
      const system = makeSystem([{ installation: null, locked: false }]);
      const empire = makeEmpire(1000);
      addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 7);
      expect(empire.installationQueue![0].startCycle).toBe(7);
    });

    it("deducts credits cumulatively for sequential builds", () => {
      const system = makeSystem([
        { installation: null, locked: false },
        { installation: null, locked: false },
        { installation: null, locked: false },
      ]);
      system.biome = "frontier-world" as any; // allows all types
      const empire = makeEmpire(1000);
      addToInstallationQueue(empire, "agricultural-station", system, SystemId("sys-1"), 1); // 150
      addToInstallationQueue(empire, "fuel-extraction", system, SystemId("sys-1"), 1);      // 150
      expect(empire.resources.credits).toBe(700);
      expect(empire.installationQueue!.length).toBe(2);
    });

    it("does not deduct credits when slot validation fails", () => {
      const system = makeSystem([]); // no slots
      const empire = makeEmpire(1000);
      addToInstallationQueue(empire, "trade-hub", system, SystemId("sys-1"), 1);
      expect(empire.resources.credits).toBe(1000);
    });
  });

  describe("advanceInstallationQueue — boundary cases", () => {
    it("entries with completionCycle earlier than current cycle are completed", () => {
      const queue: InstallationQueueEntry[] = [
        { ...baseEntry, completionCycle: 2 },
      ];
      const { completed } = advanceInstallationQueue(queue, 10);
      expect(completed).toHaveLength(1);
    });

    it("all entries complete at the same cycle", () => {
      const queue: InstallationQueueEntry[] = [
        { ...baseEntry, installationType: "trade-hub", completionCycle: 5 },
        { ...baseEntry, installationType: "mining-complex", completionCycle: 5 },
        { ...baseEntry, installationType: "fuel-extraction", completionCycle: 5 },
      ];
      const { completed, remaining } = advanceInstallationQueue(queue, 5);
      expect(completed).toHaveLength(3);
      expect(remaining).toHaveLength(0);
    });

    it("preserves order of remaining entries", () => {
      const queue: InstallationQueueEntry[] = [
        { ...baseEntry, installationType: "trade-hub", completionCycle: 10 },
        { ...baseEntry, installationType: "mining-complex", completionCycle: 8 },
        { ...baseEntry, installationType: "fuel-extraction", completionCycle: 12 },
      ];
      const { remaining } = advanceInstallationQueue(queue, 5);
      expect(remaining.map(e => e.installationType)).toEqual([
        "trade-hub", "mining-complex", "fuel-extraction",
      ]);
    });
  });

  describe("createInstallationFromCompleted — various types", () => {
    it("creates mining-complex with correct type", () => {
      const entry: InstallationQueueEntry = {
        ...baseEntry,
        installationType: "mining-complex",
      };
      const inst = createInstallationFromCompleted(entry, InstallationId("inst-m1"));
      expect(inst.type).toBe("mining-complex");
      expect(inst.id).toBe("inst-m1");
      expect(inst.condition).toBe(1.0);
    });

    it("creates intelligence-nexus with correct type", () => {
      const entry: InstallationQueueEntry = {
        ...baseEntry,
        installationType: "intelligence-nexus",
      };
      const inst = createInstallationFromCompleted(entry, InstallationId("inst-in"));
      expect(inst.type).toBe("intelligence-nexus");
    });
  });

  describe("BIOME_ALLOWED_INSTALLATIONS — research-station availability", () => {
    it("research-station is allowed on all 9 biomes", () => {
      const biomes = Object.keys(BIOME_ALLOWED_INSTALLATIONS);
      for (const biome of biomes) {
        expect(
          BIOME_ALLOWED_INSTALLATIONS[biome].includes("research-station"),
          `expected research-station allowed on ${biome}`,
        ).toBe(true);
      }
    });

    it("no biome has duplicate installation types", () => {
      for (const [biome, types] of Object.entries(BIOME_ALLOWED_INSTALLATIONS)) {
        const unique = new Set(types);
        expect(unique.size, `duplicate in ${biome}`).toBe(types.length);
      }
    });
  });
});
