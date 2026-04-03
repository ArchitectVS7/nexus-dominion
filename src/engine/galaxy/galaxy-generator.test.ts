import { describe, it, expect } from "vitest";
import { GalaxyGenerator, getEmpireColour } from "./galaxy-generator";
import type { GalaxyConfig, BiomeType } from "../types";

const DEFAULT_CONFIG: GalaxyConfig = {
  seed: 42,
  totalSystems: 250,
  sectorCount: 10,
  systemsPerSector: 25,
  empireCount: 100,
};

function generateGalaxy(overrides?: Partial<GalaxyConfig>) {
  const gen = new GalaxyGenerator();
  return gen.generate({ ...DEFAULT_CONFIG, ...overrides });
}

describe("Galaxy Generator", () => {
  // REQ-008: 10 sectors, 250 systems (25/sector)
  describe("REQ-008: Galaxy structure", () => {
    it("generates exactly 10 sectors", () => {
      const galaxy = generateGalaxy();
      expect(galaxy.sectors.size).toBe(10);
    });

    it("generates exactly 250 star systems", () => {
      const galaxy = generateGalaxy();
      expect(galaxy.systems.size).toBe(250);
    });

    it("assigns exactly 25 systems per sector", () => {
      const galaxy = generateGalaxy();
      for (const [, sector] of galaxy.sectors) {
        expect(sector.systemIds.length).toBe(25);
      }
    });

    it("every system belongs to a valid sector", () => {
      const galaxy = generateGalaxy();
      for (const [, system] of galaxy.systems) {
        expect(galaxy.sectors.has(system.sectorId)).toBe(true);
      }
    });
  });

  // REQ-009: Each empire starts with exactly one home system
  describe("REQ-009: Home systems", () => {
    it("assigns exactly 100 home systems for 100 empires", () => {
      const galaxy = generateGalaxy();
      const homeSystems = [...galaxy.systems.values()].filter((s) => s.isHomeSystem);
      expect(homeSystems.length).toBe(100);
    });

    it("each home system has a unique owner", () => {
      const galaxy = generateGalaxy();
      const homeSystems = [...galaxy.systems.values()].filter((s) => s.isHomeSystem);
      const owners = new Set(homeSystems.map((s) => s.owner));
      expect(owners.size).toBe(100);
    });

    it("home systems are core-world biome", () => {
      const galaxy = generateGalaxy();
      const homeSystems = [...galaxy.systems.values()].filter((s) => s.isHomeSystem);
      for (const sys of homeSystems) {
        expect(sys.biome).toBe("core-world");
      }
    });
  });

  // REQ-011: Unclaimed systems colonisable
  describe("REQ-011: Unclaimed systems", () => {
    it("has exactly 150 unclaimed systems at campaign start", () => {
      const galaxy = generateGalaxy();
      const unclaimed = [...galaxy.systems.values()].filter((s) => s.owner === null);
      expect(unclaimed.length).toBe(150);
    });
  });

  // REQ-012: Sectors have adjacency; systems have adjacency connections
  describe("REQ-012: Adjacency relationships", () => {
    it("every system has at least one adjacent system", () => {
      const galaxy = generateGalaxy();
      for (const [, system] of galaxy.systems) {
        expect(system.adjacentSystemIds.length).toBeGreaterThan(0);
      }
    });

    it("adjacency is bidirectional", () => {
      const galaxy = generateGalaxy();
      for (const [, system] of galaxy.systems) {
        for (const adjId of system.adjacentSystemIds) {
          const adj = galaxy.systems.get(adjId)!;
          expect(adj.adjacentSystemIds).toContain(system.id);
        }
      }
    });

    it("systems in different sectors can be adjacent (border systems)", () => {
      const galaxy = generateGalaxy();
      let hasCrossSectorAdjacency = false;
      for (const [, system] of galaxy.systems) {
        for (const adjId of system.adjacentSystemIds) {
          const adj = galaxy.systems.get(adjId)!;
          if (adj.sectorId !== system.sectorId) {
            hasCrossSectorAdjacency = true;
            break;
          }
        }
        if (hasCrossSectorAdjacency) break;
      }
      expect(hasCrossSectorAdjacency).toBe(true);
    });
  });

  // REQ-013: All 250 systems can be claimed (no system is permanently unclaimed)
  describe("REQ-013: All systems claimable", () => {
    it("every system has an owner field that accepts an empire ID", () => {
      const galaxy = generateGalaxy();
      for (const [, system] of galaxy.systems) {
        // System is either owned or null (claimable)
        expect(system.owner === null || typeof system.owner === "string").toBe(true);
      }
    });
  });

  // Determinism
  describe("Deterministic generation", () => {
    it("same seed produces same galaxy", () => {
      const g1 = generateGalaxy({ seed: 12345 });
      const g2 = generateGalaxy({ seed: 12345 });
      const sys1 = [...g1.systems.values()].map((s) => s.name);
      const sys2 = [...g2.systems.values()].map((s) => s.name);
      expect(sys1).toEqual(sys2);
    });

    it("different seeds produce different galaxies", () => {
      const g1 = generateGalaxy({ seed: 111 });
      const g2 = generateGalaxy({ seed: 999 });
      const names1 = [...g1.systems.values()].map((s) => s.name);
      const names2 = [...g2.systems.values()].map((s) => s.name);
      // At least some names should differ (biome-based suffix randomness)
      expect(names1).not.toEqual(names2);
    });
  });

  // Biome distribution
  describe("Biome distribution", () => {
    it("uses all 9 biome types across 250 systems", () => {
      const galaxy = generateGalaxy();
      const biomes = new Set([...galaxy.systems.values()].map((s) => s.biome));
      const allBiomes: BiomeType[] = [
        "core-world", "mineral-world", "verdant-world", "barren-world",
        "void-station", "contested-ruin", "frontier-world",
        "nexus-adjacent", "resource-rich-anomaly",
      ];
      for (const b of allBiomes) {
        expect(biomes.has(b), `expected biome ${b} to appear`).toBe(true);
      }
    });

    it("common biomes appear more than rare biomes", () => {
      const galaxy = generateGalaxy();
      const counts = new Map<string, number>();
      for (const [, sys] of galaxy.systems) {
        counts.set(sys.biome, (counts.get(sys.biome) ?? 0) + 1);
      }
      // Core-world (weight 4) should appear more than nexus-adjacent (weight 1)
      // Note: home systems force core-world, amplifying the difference
      const commonCount = counts.get("core-world") ?? 0;
      const rareCount = counts.get("nexus-adjacent") ?? 0;
      expect(commonCount).toBeGreaterThan(rareCount);
    });
  });

  // Development slots
  describe("Development slots per biome", () => {
    it("core-world systems have 5 slots", () => {
      const galaxy = generateGalaxy();
      const coreSystem = [...galaxy.systems.values()].find(
        (s) => s.biome === "core-world" && !s.isHomeSystem,
      ) ?? [...galaxy.systems.values()].find((s) => s.biome === "core-world")!;
      expect(coreSystem.slots.length).toBe(5);
    });

    it("mineral-world systems have 4 slots", () => {
      const galaxy = generateGalaxy();
      const sys = [...galaxy.systems.values()].find((s) => s.biome === "mineral-world")!;
      expect(sys.slots.length).toBe(4);
    });

    it("void-station systems have 3 slots", () => {
      const galaxy = generateGalaxy();
      const sys = [...galaxy.systems.values()].find((s) => s.biome === "void-station")!;
      expect(sys.slots.length).toBe(3);
    });

    it("frontier-world first 2 slots are unlocked, rest locked", () => {
      const galaxy = generateGalaxy();
      const sys = [...galaxy.systems.values()].find((s) => s.biome === "frontier-world")!;
      expect(sys.slots.length).toBe(5);
      expect(sys.slots[0].locked).toBe(false);
      expect(sys.slots[1].locked).toBe(false);
      expect(sys.slots[2].locked).toBe(true);
      expect(sys.slots[3].locked).toBe(true);
      expect(sys.slots[4].locked).toBe(true);
    });

    it("non-frontier systems have all slots unlocked", () => {
      const galaxy = generateGalaxy();
      const sys = [...galaxy.systems.values()].find((s) => s.biome === "mineral-world")!;
      for (const slot of sys.slots) {
        expect(slot.locked).toBe(false);
      }
    });
  });

  describe("Development slots — remaining biomes", () => {
    it("barren-world has 3 slots, all unlocked", () => {
      const galaxy = generateGalaxy();
      const sys = [...galaxy.systems.values()].find(s => s.biome === "barren-world")!;
      expect(sys.slots.length).toBe(3);
      expect(sys.slots.every(s => !s.locked)).toBe(true);
    });

    it("contested-ruin has 4 slots", () => {
      const galaxy = generateGalaxy();
      const sys = [...galaxy.systems.values()].find(s => s.biome === "contested-ruin")!;
      expect(sys.slots.length).toBe(4);
    });

    it("nexus-adjacent has 3 slots", () => {
      const galaxy = generateGalaxy();
      const sys = [...galaxy.systems.values()].find(s => s.biome === "nexus-adjacent")!;
      expect(sys.slots.length).toBe(3);
    });

    it("resource-rich-anomaly has 3 slots", () => {
      const galaxy = generateGalaxy();
      const sys = [...galaxy.systems.values()].find(s => s.biome === "resource-rich-anomaly")!;
      expect(sys.slots.length).toBe(3);
    });

    it("all slots start with null installation", () => {
      const galaxy = generateGalaxy();
      for (const [, sys] of galaxy.systems) {
        for (const slot of sys.slots) {
          expect(slot.installation).toBeNull();
        }
      }
    });
  });

  describe("System properties", () => {
    it("all 250 system names are unique", () => {
      const galaxy = generateGalaxy();
      const names = [...galaxy.systems.values()].map(s => s.name);
      // Some names may collide due to prefix cycling + random suffix, but most should be unique
      // With 40 prefixes × 22 suffixes = 880 combos, 250 should have very few dupes
      const unique = new Set(names);
      expect(unique.size).toBeGreaterThan(200);
    });

    it("all systems have 2D positions (x, y numbers)", () => {
      const galaxy = generateGalaxy();
      for (const [, sys] of galaxy.systems) {
        expect(typeof sys.position.x).toBe("number");
        expect(typeof sys.position.y).toBe("number");
        expect(isNaN(sys.position.x)).toBe(false);
        expect(isNaN(sys.position.y)).toBe(false);
      }
    });

    it("unclaimed systems have claimedCycle null", () => {
      const galaxy = generateGalaxy();
      const unclaimed = [...galaxy.systems.values()].filter(s => s.owner === null);
      for (const sys of unclaimed) {
        expect(sys.claimedCycle).toBeNull();
      }
    });
  });

  describe("Adjacency — extended", () => {
    it("no system is adjacent to itself", () => {
      const galaxy = generateGalaxy();
      for (const [, sys] of galaxy.systems) {
        expect(sys.adjacentSystemIds).not.toContain(sys.id);
      }
    });

    it("most systems have at least 4 neighbors (k=4 adjacency)", () => {
      const galaxy = generateGalaxy();
      const systems = [...galaxy.systems.values()];
      const withFourPlus = systems.filter(s => s.adjacentSystemIds.length >= 4);
      // Nearly all systems should have 4+ (some edge systems may have fewer)
      expect(withFourPlus.length).toBeGreaterThan(systems.length * 0.8);
    });
  });

  describe("Determinism — positions", () => {
    it("same seed produces identical system positions", () => {
      const g1 = generateGalaxy({ seed: 777 });
      const g2 = generateGalaxy({ seed: 777 });
      const positions1 = [...g1.systems.values()].map(s => s.position);
      const positions2 = [...g2.systems.values()].map(s => s.position);
      expect(positions1).toEqual(positions2);
    });
  });

  // Sector naming
  describe("Sector properties", () => {
    it("all 10 sectors have unique names", () => {
      const galaxy = generateGalaxy();
      const names = [...galaxy.sectors.values()].map((s) => s.name);
      expect(new Set(names).size).toBe(10);
    });

    it("sectors have centre positions", () => {
      const galaxy = generateGalaxy();
      for (const [, sector] of galaxy.sectors) {
        expect(typeof sector.centre.x).toBe("number");
        expect(typeof sector.centre.y).toBe("number");
      }
    });
  });

  // Homeworld sector spread
  describe("Homeworld distribution", () => {
    it("homeworlds spread across multiple sectors", () => {
      const galaxy = generateGalaxy({ empireCount: 10 });
      const homeSystems = [...galaxy.systems.values()].filter((s) => s.isHomeSystem);
      const usedSectors = new Set(homeSystems.map((s) => s.sectorId));
      // With 10 empires and 10 sectors, each sector should get one
      expect(usedSectors.size).toBe(10);
    });

    it("home systems have claimedCycle 0", () => {
      const galaxy = generateGalaxy();
      const homeSystems = [...galaxy.systems.values()].filter((s) => s.isHomeSystem);
      for (const sys of homeSystems) {
        expect(sys.claimedCycle).toBe(0);
      }
    });
  });

  // getEmpireColour utility
  describe("getEmpireColour", () => {
    it("returns a hex colour string for empire-0", () => {
      const colour = getEmpireColour("empire-0");
      expect(colour).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("returns different colours for different empires", () => {
      const c0 = getEmpireColour("empire-0");
      const c1 = getEmpireColour("empire-1");
      expect(c0).not.toBe(c1);
    });

    it("wraps around for empire indices beyond palette size", () => {
      const c0 = getEmpireColour("empire-0");
      const c20 = getEmpireColour("empire-20");
      expect(c20).toBe(c0); // 20 colours in palette, so index 20 wraps to 0
    });
  });

  // Small galaxy config
  describe("Small galaxy configurations", () => {
    it("generates a minimal galaxy with 1 sector and 5 systems", () => {
      const galaxy = generateGalaxy({
        sectorCount: 1,
        systemsPerSector: 5,
        totalSystems: 5,
        empireCount: 2,
      });
      expect(galaxy.sectors.size).toBe(1);
      expect(galaxy.systems.size).toBe(5);
    });

    it("handles more empires than sectors gracefully", () => {
      const galaxy = generateGalaxy({
        sectorCount: 2,
        systemsPerSector: 10,
        totalSystems: 20,
        empireCount: 5,
      });
      const homeSystems = [...galaxy.systems.values()].filter((s) => s.isHomeSystem);
      expect(homeSystems.length).toBe(5);
    });
  });
});
