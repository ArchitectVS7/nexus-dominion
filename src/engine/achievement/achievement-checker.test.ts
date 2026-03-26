import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENT_DEFINITIONS,
  checkAchievements,
  getAchievementProgress,
  type AchievementContext,
} from "./achievement-checker";
import type { Empire } from "../types/empire";
import type { Galaxy, StarSystem } from "../types/galaxy";
import { EmpireId, SystemId, SectorId } from "../types/ids";

function makeEmpire(id: string, systemCount: number, researchTier: number = 0): Empire {
  return {
    id: EmpireId(id),
    name: id,
    colour: "#000",
    isPlayer: false,
    systemIds: Array.from({ length: systemCount }, (_, i) => SystemId(`sys-${id}-${i}`)),
    homeSystemId: SystemId(`sys-${id}-0`),
    resources: { credits: 1000, food: 500, ore: 300, fuelCells: 200, researchPoints: 100, intelligencePoints: 50 },
    stabilityScore: 50,
    stabilityLevel: "content",
    population: 10000,
    populationCapacity: 20000,
    fleetIds: [],
    researchTier,
    powerScore: systemCount * 10,
  };
}

function makeGalaxy(totalSystems: number = 250): Galaxy {
  const systems = new Map<any, StarSystem>();
  const sectors = new Map();
  for (let i = 0; i < totalSystems; i++) {
    const sId = SystemId(`sys-${i}`);
    systems.set(sId, {
      id: sId,
      name: `System ${i}`,
      sectorId: SectorId(`sector-${Math.floor(i / 25)}`),
      position: { x: 0, y: 0 },
      biome: "core-world" as const,
      owner: null,
      slots: [],
      baseProduction: {},
      adjacentSystemIds: [],
      claimedCycle: null,
      isHomeSystem: false,
    });
  }
  return { systems, sectors };
}

function defaultContext(): AchievementContext {
  return {
    totalEmpires: 100,
    eliminatedCount: 0,
    maxResearchTier: 8,
    empireNetWorth: new Map(),
    coalitionsSurvived: new Map(),
    syndicateController: null,
    syndicateExposed: new Set(),
    earnedAchievements: new Map(),
  };
}

describe("Achievement System", () => {
  // REQ-040: All achievement paths tracked simultaneously
  describe("REQ-040: Simultaneous tracking", () => {
    it("defines all 9 achievement paths", () => {
      expect(ACHIEVEMENT_DEFINITIONS.length).toBe(9);
      const ids = ACHIEVEMENT_DEFINITIONS.map((a) => a.id);
      expect(ids).toContain("conquest");
      expect(ids).toContain("trade-prince");
      expect(ids).toContain("warlord");
      expect(ids).toContain("singularity");
      expect(ids).toContain("grand-architect");
      expect(ids).toContain("endurance");
      expect(ids).toContain("market-overlord");
      expect(ids).toContain("cartel-boss");
      expect(ids).toContain("shadow-throne");
    });

    it("getAchievementProgress returns status for all paths", () => {
      const empire = makeEmpire("e1", 10);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const progress = getAchievementProgress(EmpireId("e1"), empire, galaxy, ctx);
      expect(progress.length).toBe(9);
    });

    it("player does not declare a single path at start", () => {
      // All paths start as not-earned
      const empire = makeEmpire("e1", 1);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const progress = getAchievementProgress(EmpireId("e1"), empire, galaxy, ctx);
      const earned = progress.filter((p) => p.earned);
      expect(earned.length).toBe(0);
    });
  });

  // REQ-041: Achievement → title + galaxy event
  describe("REQ-041: Achievement events", () => {
    it("checkAchievements returns events for newly earned achievements", () => {
      const empires = new Map<any, Empire>();
      // Empire with 80 systems should trigger Conquest (30% of 250 = 75)
      empires.set(EmpireId("e1"), makeEmpire("e1", 80));

      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const alreadyEarned = new Map<any, Set<string>>();

      const events = checkAchievements(empires, galaxy, ctx, alreadyEarned);
      expect(events.length).toBeGreaterThan(0);
      const conquest = events.find((e) => e.achievementId === "conquest");
      expect(conquest).toBeDefined();
      expect(conquest!.achievementName).toBe("Conquest");
      expect(conquest!.empireId).toBe(EmpireId("e1"));
    });

    it("does not re-trigger already earned achievements", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 80));
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const alreadyEarned = new Map<any, Set<string>>();
      alreadyEarned.set(EmpireId("e1"), new Set(["conquest"]));

      const events = checkAchievements(empires, galaxy, ctx, alreadyEarned);
      const conquest = events.find((e) => e.achievementId === "conquest");
      expect(conquest).toBeUndefined();
    });
  });

  // REQ-042: Galaxy responds with emergent event (structural test)
  describe("REQ-042: Galaxy response", () => {
    it("achievement events include empireId and achievementId for galaxy response dispatch", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 80));
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const events = checkAchievements(empires, galaxy, ctx, new Map());
      for (const event of events) {
        expect(event.type).toBe("achievement");
        expect(event.empireId).toBeDefined();
        expect(event.achievementId).toBeDefined();
        expect(event.achievementName).toBeDefined();
      }
    });

    it("Singularity achievement triggers at research tier 8", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 5, 8));
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const events = checkAchievements(empires, galaxy, ctx, new Map());
      expect(events.find((e) => e.achievementId === "singularity")).toBeDefined();
    });

    it("Trade Prince triggers when net worth exceeds rival by 2x", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 5));
      empires.set(EmpireId("e2"), makeEmpire("e2", 5));
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.empireNetWorth.set(EmpireId("e1"), 10000);
      ctx.empireNetWorth.set(EmpireId("e2"), 3000);

      const events = checkAchievements(empires, galaxy, ctx, new Map());
      expect(events.find((e) => e.achievementId === "trade-prince")).toBeDefined();
    });
  });
});
