import { describe, it, expect } from "vitest";
import { GalaxyGenerator } from "./galaxy-generator";
import type { GalaxyConfig } from "../types";

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
  });
});
