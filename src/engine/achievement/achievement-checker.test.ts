import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENT_DEFINITIONS,
  checkAchievements,
  checkConvergenceAlerts,
  getAchievementProgress,
  getAchievementProgressDetailed,
  CONVERGENCE_ALERT_THRESHOLD,
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
    it("defines all 10 achievement paths", () => {
      expect(ACHIEVEMENT_DEFINITIONS.length).toBe(10);
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
      expect(ids).toContain("stealth-sovereign");
    });

    it("getAchievementProgress returns status for all paths", () => {
      const empire = makeEmpire("e1", 10);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const progress = getAchievementProgress(EmpireId("e1"), empire, galaxy, ctx);
      expect(progress.length).toBe(10);
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

  describe("Refined thresholds", () => {
    it("Warlord requires exactly 40 systems", () => {
      const empire39 = makeEmpire("e", 39);
      const empire40 = makeEmpire("e2", 40);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "warlord")!;
      expect(def.check(EmpireId("e"), empire39, galaxy, ctx)).toBe(false);
      expect(def.check(EmpireId("e2"), empire40, galaxy, ctx)).toBe(true);
    });

    it("Endurance requires surviving 5 coalition attempts", () => {
      const empire = makeEmpire("e1", 10);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "endurance")!;
      ctx.coalitionsSurvived.set(EmpireId("e1"), 4);
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
      ctx.coalitionsSurvived.set(EmpireId("e1"), 5);
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(true);
    });

    it("Cartel Boss requires 90%+ of fuelCells production", () => {
      const empire = makeEmpire("e1", 10);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.fuelCellsProductionShare = new Map([[EmpireId("e1"), 0.91]]);

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "cartel-boss")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(true);
    });

    it("Cartel Boss fails below 90%", () => {
      const empire = makeEmpire("e1", 10);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.fuelCellsProductionShare = new Map([[EmpireId("e1"), 0.85]]);

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "cartel-boss")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
    });

    it("Grand Architect checks coalition leadership", () => {
      const empire = makeEmpire("e1", 10);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.coalitionLeaderships = new Map([[EmpireId("e1"), [EmpireId("target")]]]);

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "grand-architect")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(true);
    });

    it("Grand Architect fails without coalition leadership", () => {
      const empire = makeEmpire("e1", 10);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "grand-architect")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
    });
  });

  describe("Shadow Throne", () => {
    it("requires syndicateController, no exposure, and another achievement", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.syndicateController = EmpireId("e1");
      ctx.earnedAchievements.set(EmpireId("e1"), new Set(["conquest"]));

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "shadow-throne")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(true);
    });

    it("fails when empire is exposed", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.syndicateController = EmpireId("e1");
      ctx.syndicateExposed.add(EmpireId("e1"));
      ctx.earnedAchievements.set(EmpireId("e1"), new Set(["conquest"]));

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "shadow-throne")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
    });
  });

  describe("Stealth Sovereign", () => {
    it("requires 15+ ops completed and zero detections", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.covertOpsStats = new Map([[EmpireId("e1"), { totalOpsCompleted: 15, timesDetectedAsAttacker: 0 }]]);

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "stealth-sovereign")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(true);
    });

    it("fails with fewer than 15 ops", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.covertOpsStats = new Map([[EmpireId("e1"), { totalOpsCompleted: 14, timesDetectedAsAttacker: 0 }]]);

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "stealth-sovereign")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
    });

    it("fails if ever detected", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.covertOpsStats = new Map([[EmpireId("e1"), { totalOpsCompleted: 20, timesDetectedAsAttacker: 1 }]]);

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "stealth-sovereign")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
    });

    it("fails when no covertOpsStats provided", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "stealth-sovereign")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
    });

    it("progress scales 0 to 1.0 based on ops completed (no detections)", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.covertOpsStats = new Map([[EmpireId("e1"), { totalOpsCompleted: 7, timesDetectedAsAttacker: 0 }]]);

      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const stealth = progress.find(p => p.id === "stealth-sovereign")!;
      expect(stealth.progress).toBeCloseTo(7 / 15);
    });

    it("progress is 0 if ever detected", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.covertOpsStats = new Map([[EmpireId("e1"), { totalOpsCompleted: 20, timesDetectedAsAttacker: 1 }]]);

      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const stealth = progress.find(p => p.id === "stealth-sovereign")!;
      expect(stealth.progress).toBe(0);
    });
  });

  describe("Progress percentages", () => {
    it("returns progress percentage per achievement", () => {
      const empire = makeEmpire("e1", 40); // 40/75 for conquest ≈ 53%
      empire.researchTier = 4; // 4/8 for singularity = 50%
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.empireNetWorth.set(EmpireId("e1"), 500);

      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      expect(progress.length).toBe(10);

      const conquest = progress.find(p => p.id === "conquest")!;
      expect(conquest.progress).toBeGreaterThan(0);
      expect(conquest.progress).toBeLessThan(1);

      const singularity = progress.find(p => p.id === "singularity")!;
      expect(singularity.progress).toBeCloseTo(0.5, 1);
    });
  });

  describe("Market Overlord threshold", () => {
    it("triggers at exactly 12 systems", () => {
      const empire = makeEmpire("e1", 12);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "market-overlord")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(true);
    });

    it("fails below 12 systems", () => {
      const empire = makeEmpire("e1", 11);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "market-overlord")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
    });
  });

  describe("Shadow Throne — additional cases", () => {
    it("fails without any prior achievement", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.syndicateController = EmpireId("e1");
      // No earned achievements
      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "shadow-throne")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
    });

    it("fails when not the syndicate controller", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.syndicateController = EmpireId("other");
      ctx.earnedAchievements.set(EmpireId("e1"), new Set(["conquest"]));
      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "shadow-throne")!;
      expect(def.check(EmpireId("e1"), empire, galaxy, ctx)).toBe(false);
    });

    it("progress is sum of 3 components (0.33 + 0.33 + 0.34)", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.syndicateController = EmpireId("e1");
      // Not exposed, has achievement → all 3 pass
      ctx.earnedAchievements.set(EmpireId("e1"), new Set(["conquest"]));
      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const shadow = progress.find(p => p.id === "shadow-throne")!;
      expect(shadow.progress).toBe(1.0);
      expect(shadow.earned).toBe(true);
    });
  });

  describe("Multiple achievements at once", () => {
    it("checkAchievements returns multiple events for one empire", () => {
      const empires = new Map<any, Empire>();
      // 80 systems (conquest + warlord + market-overlord) + tier 8 (singularity)
      const empire = makeEmpire("e1", 80, 8);
      empires.set(EmpireId("e1"), empire);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const events = checkAchievements(empires, galaxy, ctx, new Map());
      const achievementIds = events.map(e => e.achievementId);
      expect(achievementIds).toContain("conquest");
      expect(achievementIds).toContain("warlord");
      expect(achievementIds).toContain("singularity");
      expect(achievementIds).toContain("market-overlord");
      expect(events.length).toBeGreaterThanOrEqual(4);
    });

    it("checkAchievements processes multiple empires", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 80)); // conquest
      empires.set(EmpireId("e2"), makeEmpire("e2", 5, 8)); // singularity
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const events = checkAchievements(empires, galaxy, ctx, new Map());
      const e1Events = events.filter(e => e.empireId === EmpireId("e1"));
      const e2Events = events.filter(e => e.empireId === EmpireId("e2"));
      expect(e1Events.some(e => e.achievementId === "conquest")).toBe(true);
      expect(e2Events.some(e => e.achievementId === "singularity")).toBe(true);
    });

    it("checkAchievements returns empty for no empires", () => {
      const empires = new Map<any, Empire>();
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const events = checkAchievements(empires, galaxy, ctx, new Map());
      expect(events).toEqual([]);
    });
  });

  describe("Trade Prince progress detail", () => {
    it("progress is ratio of net worth to 2x rival", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.empireNetWorth.set(EmpireId("e1"), 4000);
      ctx.empireNetWorth.set(EmpireId("e2"), 3000);
      // Need 6000 to trigger; 4000/6000 ≈ 0.667
      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const tp = progress.find(p => p.id === "trade-prince")!;
      expect(tp.progress).toBeCloseTo(4000 / 6000, 2);
      expect(tp.earned).toBe(false);
    });

    it("progress is 1.0 when net worth > 0 and no rivals", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.empireNetWorth.set(EmpireId("e1"), 1000);
      // No other empire net worth entries
      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const tp = progress.find(p => p.id === "trade-prince")!;
      expect(tp.progress).toBe(1.0);
      expect(tp.earned).toBe(true);
    });
  });

  describe("Endurance progress detail", () => {
    it("progress scales linearly to 5 coalitions survived", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.coalitionsSurvived.set(EmpireId("e1"), 3);
      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const end = progress.find(p => p.id === "endurance")!;
      expect(end.progress).toBeCloseTo(0.6, 2);
    });
  });

  describe("getAchievementProgress — earned tracking", () => {
    it("already earned achievements show as earned", () => {
      const empire = makeEmpire("e1", 1);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.earnedAchievements.set(EmpireId("e1"), new Set(["conquest"]));
      const progress = getAchievementProgress(EmpireId("e1"), empire, galaxy, ctx);
      const conquest = progress.find(p => p.id === "conquest")!;
      expect(conquest.earned).toBe(true);
    });
  });

  describe("getAchievementProgressDetailed — earned progress", () => {
    it("already earned achievement has progress 1.0 regardless of current state", () => {
      const empire = makeEmpire("e1", 1); // only 1 system, wouldn't qualify
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.earnedAchievements.set(EmpireId("e1"), new Set(["conquest"]));
      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const conquest = progress.find(p => p.id === "conquest")!;
      expect(conquest.progress).toBe(1.0);
      expect(conquest.earned).toBe(true);
    });
  });

  describe("Conquest boundary", () => {
    it("conquest triggers at exactly 30% of galaxy", () => {
      const galaxy = makeGalaxy(100); // 100 systems, 30% = 30
      const empire30 = makeEmpire("e1", 30);
      const empire29 = makeEmpire("e2", 29);
      const ctx = defaultContext();
      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === "conquest")!;
      expect(def.check(EmpireId("e1"), empire30, galaxy, ctx)).toBe(true);
      expect(def.check(EmpireId("e2"), empire29, galaxy, ctx)).toBe(false);
    });
  });

  describe("Progress detail — remaining achievements", () => {
    it("Cartel Boss progress scales to 0.9 share threshold", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.fuelCellsProductionShare = new Map([[EmpireId("e1"), 0.45]]);
      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const cartel = progress.find(p => p.id === "cartel-boss")!;
      expect(cartel.progress).toBeCloseTo(0.45 / 0.9, 2); // 0.5
    });

    it("Warlord progress scales to 40 systems", () => {
      const empire = makeEmpire("e1", 20);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const warlord = progress.find(p => p.id === "warlord")!;
      expect(warlord.progress).toBeCloseTo(0.5, 2);
    });

    it("Market Overlord progress scales to 12 systems", () => {
      const empire = makeEmpire("e1", 6);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const mo = progress.find(p => p.id === "market-overlord")!;
      expect(mo.progress).toBeCloseTo(0.5, 2);
    });
  });

  describe("Trade Prince — exact boundary", () => {
    it("triggers at exactly 2x rival net worth", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 5));
      empires.set(EmpireId("e2"), makeEmpire("e2", 5));
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.empireNetWorth.set(EmpireId("e1"), 6001);
      ctx.empireNetWorth.set(EmpireId("e2"), 3000);
      // 6001 > 3000 * 2 = 6000 → triggers
      const events = checkAchievements(empires, galaxy, ctx, new Map());
      expect(events.some(e => e.achievementId === "trade-prince" && e.empireId === EmpireId("e1"))).toBe(true);
    });

    it("does not trigger at exactly 2x (not strictly greater)", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 5));
      empires.set(EmpireId("e2"), makeEmpire("e2", 5));
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.empireNetWorth.set(EmpireId("e1"), 6000);
      ctx.empireNetWorth.set(EmpireId("e2"), 3000);
      // 6000 > 6000 is false
      const events = checkAchievements(empires, galaxy, ctx, new Map());
      expect(events.some(e => e.achievementId === "trade-prince" && e.empireId === EmpireId("e1"))).toBe(false);
    });
  });

  describe("Shadow Throne — partial progress", () => {
    it("controller only = 0.33 progress", () => {
      const empire = makeEmpire("e1", 5);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      ctx.syndicateController = EmpireId("e1");
      ctx.syndicateExposed.add(EmpireId("e1")); // exposed blocks +0.33
      // No achievements blocks +0.34
      const progress = getAchievementProgressDetailed(EmpireId("e1"), empire, galaxy, ctx);
      const shadow = progress.find(p => p.id === "shadow-throne")!;
      expect(shadow.progress).toBeCloseTo(0.33, 2);
    });
  });

  describe("Convergence Alerts", () => {
    it("threshold is 0.8 (80%)", () => {
      expect(CONVERGENCE_ALERT_THRESHOLD).toBe(0.8);
    });

    it("emits alert when empire reaches 80%+ of achievement threshold", () => {
      // 250 systems * 0.3 = 75 needed for conquest. 80% of 75 = 60 systems.
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 62)); // 62/75 ≈ 82.7%
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const alreadyEarned = new Map<any, Set<string>>();
      const priorAlerts = new Set<string>();

      const alerts = checkConvergenceAlerts(empires, galaxy, ctx, alreadyEarned, priorAlerts, 10);
      const conquestAlert = alerts.find(a => a.achievementId === "conquest");
      expect(conquestAlert).toBeDefined();
      expect(conquestAlert!.empireId).toBe(EmpireId("e1"));
      expect(conquestAlert!.progress).toBeGreaterThanOrEqual(0.8);
    });

    it("does not emit alert below 80% progress", () => {
      // 40/75 ≈ 53% — well below threshold
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 40));
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const alerts = checkConvergenceAlerts(empires, galaxy, ctx, new Map(), new Set(), 10);
      const conquestAlert = alerts.find(a => a.achievementId === "conquest");
      expect(conquestAlert).toBeUndefined();
    });

    it("does not emit alert for already earned achievements", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 80)); // 100% — already earned
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const alreadyEarned = new Map<any, Set<string>>();
      alreadyEarned.set(EmpireId("e1"), new Set(["conquest"]));

      const alerts = checkConvergenceAlerts(empires, galaxy, ctx, alreadyEarned, new Set(), 10);
      const conquestAlert = alerts.find(a => a.achievementId === "conquest" && a.empireId === EmpireId("e1"));
      expect(conquestAlert).toBeUndefined();
    });

    it("does not emit duplicate alert for same empire+achievement", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 62));
      const galaxy = makeGalaxy();
      const ctx = defaultContext();
      const priorAlerts = new Set(["e1::conquest"]); // already alerted

      const alerts = checkConvergenceAlerts(empires, galaxy, ctx, new Map(), priorAlerts, 10);
      const conquestAlert = alerts.find(a => a.achievementId === "conquest");
      expect(conquestAlert).toBeUndefined();
    });

    it("emits alert for research singularity at 80%+ (tier 7 = 87.5%)", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 5, 7)); // 7/8 = 87.5%
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const alerts = checkConvergenceAlerts(empires, galaxy, ctx, new Map(), new Set(), 10);
      const singAlert = alerts.find(a => a.achievementId === "singularity");
      expect(singAlert).toBeDefined();
      expect(singAlert!.progress).toBeCloseTo(0.875, 2);
    });

    it("emits alerts for multiple empires and multiple achievements", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 62)); // conquest ~83%
      const e2 = makeEmpire("e2", 5, 7); // singularity 87.5%
      empires.set(EmpireId("e2"), e2);
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const alerts = checkConvergenceAlerts(empires, galaxy, ctx, new Map(), new Set(), 10);
      expect(alerts.length).toBeGreaterThanOrEqual(2);
      expect(alerts.some(a => a.empireId === EmpireId("e1") && a.achievementId === "conquest")).toBe(true);
      expect(alerts.some(a => a.empireId === EmpireId("e2") && a.achievementId === "singularity")).toBe(true);
    });

    it("all alerts include correct cycle number", () => {
      const empires = new Map<any, Empire>();
      empires.set(EmpireId("e1"), makeEmpire("e1", 62));
      const galaxy = makeGalaxy();
      const ctx = defaultContext();

      const alerts = checkConvergenceAlerts(empires, galaxy, ctx, new Map(), new Set(), 42);
      for (const alert of alerts) {
        expect(alert.cycle).toBe(42);
      }
    });
  });
});
