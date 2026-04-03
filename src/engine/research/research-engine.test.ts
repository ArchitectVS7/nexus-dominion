import { describe, it, expect } from "vitest";
import {
  MAX_RESEARCH_TIER,
  RESEARCH_PATHS,
  researchCost,
  advanceResearch,
  hasCapstone,
  selectDoctrine,
  selectSpecialization,
  getDoctrineBonus,
  getSpecializationBonus,
  getCounterBonus,
  canSelectSpecialization,
  DOCTRINE_TIER,
  SPECIALIZATION_TIER,
  checkResearchDraftTrigger,
  autoselectDoctrine,
  autoselectSpecialization,
  getCapstoneEffect,
  CAPSTONE_EFFECTS,
} from "./research-engine";
import { SeededRNG } from "../utils/rng";
import type { Empire } from "../types/empire";
import type { EmpireId, SystemId } from "../types/ids";

function makeEmpire(overrides?: Partial<Empire>): Empire {
  return {
    id: "empire-0" as EmpireId,
    name: "Test Empire",
    colour: "#fff",
    isPlayer: true,
    systemIds: ["sys-0" as SystemId],
    homeSystemId: "sys-0" as SystemId,
    resources: { credits: 1000, food: 100, ore: 100, fuelCells: 100, researchPoints: 500, intelligencePoints: 0 },
    stabilityScore: 50,
    stabilityLevel: "content",
    population: 1000,
    populationCapacity: 5000,
    fleetIds: [],
    researchTier: 0,
    powerScore: 0,
    researchPath: null,
    specialization: null,
    buildQueue: [],
    globalReputation: 50,
    ...overrides,
  };
}

describe("Research System", () => {
  // REQ-037: Research through 8 levels
  describe("REQ-037: Eight research levels", () => {
    it("maximum research tier is 8", () => {
      expect(MAX_RESEARCH_TIER).toBe(8);
    });

    it("can advance from tier 0 to tier 1 with sufficient points", () => {
      const result = advanceResearch(0, 1000);
      expect(result).not.toBeNull();
      expect(result!.newTier).toBe(1);
    });

    it("cannot advance past tier 8", () => {
      const result = advanceResearch(8, 10000);
      expect(result).toBeNull();
    });

    it("cannot advance without sufficient research points", () => {
      const cost = researchCost(0);
      const result = advanceResearch(0, cost - 1);
      expect(result).toBeNull();
    });

    it("research cost increases with tier", () => {
      const cost0 = researchCost(0);
      const cost5 = researchCost(5);
      expect(cost5).toBeGreaterThan(cost0);
    });

    it("can advance through all 8 levels sequentially", () => {
      let tier = 0;
      let points = 10000;
      while (tier < 8) {
        const result = advanceResearch(tier, points);
        if (!result) break;
        points -= result.pointsConsumed;
        tier = result.newTier;
      }
      expect(tier).toBe(8);
    });

    it("capstone is reached at tier 8", () => {
      expect(hasCapstone(8)).toBe(true);
      expect(hasCapstone(7)).toBe(false);
    });

    it("defines three strategic research paths", () => {
      expect(RESEARCH_PATHS.length).toBe(3);
      expect(RESEARCH_PATHS.map((p) => p.id)).toContain("war-machine");
      expect(RESEARCH_PATHS.map((p) => p.id)).toContain("fortress");
      expect(RESEARCH_PATHS.map((p) => p.id)).toContain("commerce");
    });
  });

  describe("Doctrine selection", () => {
    it("each research path has two specializations", () => {
      for (const path of RESEARCH_PATHS) {
        expect(path.specializations).toBeDefined();
        expect(path.specializations!.length).toBe(2);
      }
    });

    it("selectDoctrine assigns a research path to an empire", () => {
      const empire = makeEmpire();
      const result = selectDoctrine(empire, "war-machine");
      expect(result).toBe(true);
      expect(empire.researchPath).toBe("war-machine");
    });

    it("cannot change doctrine once selected", () => {
      const empire = makeEmpire({ researchPath: "war-machine" });
      const result = selectDoctrine(empire, "fortress");
      expect(result).toBe(false);
      expect(empire.researchPath).toBe("war-machine");
    });

    it("rejects invalid doctrine path", () => {
      const empire = makeEmpire();
      const result = selectDoctrine(empire, "invalid-path");
      expect(result).toBe(false);
      expect(empire.researchPath).toBeNull();
    });

    it("doctrine selection requires minimum tier", () => {
      expect(DOCTRINE_TIER).toBe(1);
    });

    it("specialization unlocks at tier 3", () => {
      expect(canSelectSpecialization(3)).toBe(true);
      expect(canSelectSpecialization(2)).toBe(false);
      expect(SPECIALIZATION_TIER).toBe(3);
    });

    it("selectSpecialization assigns specialization within doctrine", () => {
      const empire = makeEmpire({ researchPath: "war-machine", researchTier: 3 });
      const result = selectSpecialization(empire, "shock-troops");
      expect(result).toBe(true);
      expect(empire.specialization).toBe("shock-troops");
    });

    it("cannot select specialization without doctrine", () => {
      const empire = makeEmpire({ researchTier: 3 });
      const result = selectSpecialization(empire, "shock-troops");
      expect(result).toBe(false);
    });

    it("cannot select specialization from another doctrine", () => {
      const empire = makeEmpire({ researchPath: "fortress", researchTier: 3 });
      const result = selectSpecialization(empire, "shock-troops");
      expect(result).toBe(false);
    });
  });

  describe("Doctrine bonuses", () => {
    it("Iron doctrine grants +2 combat STR bonus", () => {
      const bonus = getDoctrineBonus("war-machine");
      expect(bonus.combatStrBonus).toBe(2);
    });

    it("Architect doctrine grants +4 defensive AC bonus", () => {
      const bonus = getDoctrineBonus("fortress");
      expect(bonus.defenceAcBonus).toBe(4);
    });

    it("Commerce doctrine grants +20% sell price bonus", () => {
      const bonus = getDoctrineBonus("commerce");
      expect(bonus.sellPriceBonus).toBe(0.20);
    });

    it("Iron doctrine has -10% income penalty", () => {
      const bonus = getDoctrineBonus("war-machine");
      expect(bonus.incomeModifier).toBe(-0.10);
    });

    it("Architect doctrine has -5% attack penalty", () => {
      const bonus = getDoctrineBonus("fortress");
      expect(bonus.attackModifier).toBe(-0.05);
    });
  });

  describe("Specialization bonuses", () => {
    it("Shock Troops grants surprise round", () => {
      const bonus = getSpecializationBonus("shock-troops");
      expect(bonus.surpriseRound).toBe(true);
    });

    it("Siege Engines grants +50% damage vs stationary", () => {
      const bonus = getSpecializationBonus("siege-engines");
      expect(bonus.stationaryDamageBonus).toBe(0.50);
    });

    it("Shield Arrays negates surprise round and grants +2 AC", () => {
      const bonus = getSpecializationBonus("shield-arrays");
      expect(bonus.negateSurprise).toBe(true);
      expect(bonus.acBonus).toBe(2);
    });

    it("Minefield Networks causes pre-combat damage", () => {
      const bonus = getSpecializationBonus("minefield-networks");
      expect(bonus.preCombatDamagePercent).toBe(0.10);
    });

    it("Trade Monopoly improves buy and sell prices", () => {
      const bonus = getSpecializationBonus("trade-monopoly");
      expect(bonus.buyPriceBonus).toBe(-0.20);
      expect(bonus.sellPriceBonus).toBe(0.30);
    });

    it("Mercenary Contracts allows hiring mercenaries", () => {
      const bonus = getSpecializationBonus("mercenary-contracts");
      expect(bonus.mercenaryStrBonus).toBe(2);
      expect(bonus.mercenaryCost).toBe(10000);
    });
  });

  describe("Counter-play", () => {
    it("Shock Troops beats Minefield Networks", () => {
      expect(getCounterBonus("shock-troops", "minefield-networks")).toBeGreaterThan(1);
    });

    it("Minefield Networks beats Siege Engines", () => {
      expect(getCounterBonus("minefield-networks", "siege-engines")).toBeGreaterThan(1);
    });

    it("Siege Engines beats Shield Arrays", () => {
      expect(getCounterBonus("siege-engines", "shield-arrays")).toBeGreaterThan(1);
    });

    it("Shield Arrays beats Shock Troops", () => {
      expect(getCounterBonus("shield-arrays", "shock-troops")).toBeGreaterThan(1);
    });

    it("same specialization returns neutral", () => {
      expect(getCounterBonus("shock-troops", "shock-troops")).toBe(1.0);
    });

    it("non-military specs return neutral against military", () => {
      expect(getCounterBonus("trade-monopoly", "shock-troops")).toBe(1.0);
    });
  });

  describe("Research draft events", () => {
    describe("checkResearchDraftTrigger", () => {
      it("returns 'doctrine' when crossing tier 1", () => {
        const empire = makeEmpire({ researchTier: 1 });
        expect(checkResearchDraftTrigger(empire, 0, 1)).toBe("doctrine");
      });

      it("returns 'specialization' when crossing tier 3", () => {
        const empire = makeEmpire({ researchTier: 3, researchPath: "war-machine" });
        expect(checkResearchDraftTrigger(empire, 2, 3)).toBe("specialization");
      });

      it("returns null for all other tier advances", () => {
        const empire = makeEmpire({ researchTier: 2 });
        expect(checkResearchDraftTrigger(empire, 1, 2)).toBeNull();
        expect(checkResearchDraftTrigger(empire, 3, 4)).toBeNull();
      });

      it("returns null when crossing tier 1 but empire already has doctrine", () => {
        const empire = makeEmpire({ researchTier: 1, researchPath: "war-machine" });
        expect(checkResearchDraftTrigger(empire, 0, 1)).toBeNull();
      });

      it("returns null when crossing tier 3 but empire already has specialization", () => {
        const empire = makeEmpire({ researchTier: 3, researchPath: "war-machine", specialization: "shock-troops" });
        expect(checkResearchDraftTrigger(empire, 2, 3)).toBeNull();
      });

      it("returns null when crossing tier 3 but no doctrine selected", () => {
        const empire = makeEmpire({ researchTier: 3 });
        expect(checkResearchDraftTrigger(empire, 2, 3)).toBeNull();
      });
    });

    describe("autoselectDoctrine", () => {
      it("returns a valid doctrine path ID", () => {
        const rng = new SeededRNG(42);
        const pathId = autoselectDoctrine("warlord", rng);
        const validIds = RESEARCH_PATHS.map(p => p.id);
        expect(validIds).toContain(pathId);
      });

      it("deterministic for same RNG seed", () => {
        const rng1 = new SeededRNG(99);
        const rng2 = new SeededRNG(99);
        expect(autoselectDoctrine("merchant", rng1)).toBe(autoselectDoctrine("merchant", rng2));
      });

      it("warlord archetype prefers war-machine", () => {
        // Run many times and verify war-machine appears most
        const counts: Record<string, number> = {};
        for (let i = 0; i < 100; i++) {
          const rng = new SeededRNG(i);
          const result = autoselectDoctrine("warlord", rng);
          counts[result] = (counts[result] ?? 0) + 1;
        }
        expect(counts["war-machine"] ?? 0).toBeGreaterThan(counts["commerce"] ?? 0);
      });

      it("merchant archetype prefers commerce", () => {
        const counts: Record<string, number> = {};
        for (let i = 0; i < 100; i++) {
          const rng = new SeededRNG(i * 7 + 3);
          const result = autoselectDoctrine("merchant", rng);
          counts[result] = (counts[result] ?? 0) + 1;
        }
        expect(counts["commerce"] ?? 0).toBeGreaterThan(counts["war-machine"] ?? 0);
      });
    });

    describe("autoselectSpecialization", () => {
      it("returns a valid specialization ID for the given path", () => {
        const rng = new SeededRNG(42);
        const specId = autoselectSpecialization("warlord", "war-machine", rng);
        expect(specId).not.toBeNull();
        const path = RESEARCH_PATHS.find(p => p.id === "war-machine");
        expect(path!.specializations).toContain(specId);
      });

      it("returns null if path has no specializations", () => {
        // Manually test with a path ID that doesn't exist (fallback)
        const rng = new SeededRNG(42);
        const specId = autoselectSpecialization("warlord", "unknown-path", rng);
        expect(specId).toBeNull();
      });

      it("deterministic for same RNG seed", () => {
        const rng1 = new SeededRNG(7);
        const rng2 = new SeededRNG(7);
        expect(autoselectSpecialization("turtle", "fortress", rng1))
          .toBe(autoselectSpecialization("turtle", "fortress", rng2));
      });
    });
  });

  describe("Capstone unlock events", () => {
    it("every research path has a capstone defined", () => {
      for (const path of RESEARCH_PATHS) {
        expect(path.capstone).toBeDefined();
        expect(typeof path.capstone).toBe("string");
        expect(path.capstone.length).toBeGreaterThan(0);
      }
    });

    it("CAPSTONE_EFFECTS defines an effect for every research path", () => {
      for (const path of RESEARCH_PATHS) {
        const effect = CAPSTONE_EFFECTS[path.id];
        expect(effect).toBeDefined();
        expect(effect.capstoneName).toBe(path.capstone);
      }
    });

    it("war-machine capstone unlocks Dreadnought unit type", () => {
      const effect = getCapstoneEffect("war-machine");
      expect(effect).not.toBeNull();
      expect(effect!.capstoneName).toBe("Total Mobilisation");
      expect(effect!.unlockedUnitType).toBe("dreadnought");
    });

    it("fortress capstone grants defence bonus", () => {
      const effect = getCapstoneEffect("fortress");
      expect(effect).not.toBeNull();
      expect(effect!.capstoneName).toBe("Impregnable Bastion");
      expect(effect!.defenceMultiplier).toBeGreaterThan(1);
    });

    it("commerce capstone grants income bonus", () => {
      const effect = getCapstoneEffect("commerce");
      expect(effect).not.toBeNull();
      expect(effect!.capstoneName).toBe("Trade Hegemony");
      expect(effect!.incomeMultiplier).toBeGreaterThan(1);
    });

    it("getCapstoneEffect returns null for invalid path", () => {
      const effect = getCapstoneEffect("nonexistent");
      expect(effect).toBeNull();
    });

    it("checkResearchDraftTrigger returns 'capstone' when crossing tier 8 with doctrine", () => {
      const empire = makeEmpire({ researchTier: 8, researchPath: "war-machine" });
      expect(checkResearchDraftTrigger(empire, 7, 8)).toBe("capstone");
    });

    it("checkResearchDraftTrigger returns null when crossing tier 8 without doctrine", () => {
      const empire = makeEmpire({ researchTier: 8 });
      expect(checkResearchDraftTrigger(empire, 7, 8)).toBeNull();
    });
  });

  describe("researchCost — specific values", () => {
    it("tier 0 costs 50 RP", () => expect(researchCost(0)).toBe(50));
    it("tier 1 costs 100 RP", () => expect(researchCost(1)).toBe(100));
    it("tier 7 costs 400 RP", () => expect(researchCost(7)).toBe(400));
  });

  describe("advanceResearch — exact boundary", () => {
    it("succeeds with exact cost", () => {
      const cost = researchCost(0);
      const result = advanceResearch(0, cost);
      expect(result).not.toBeNull();
      expect(result!.newTier).toBe(1);
      expect(result!.pointsConsumed).toBe(cost);
    });

    it("pointsConsumed equals researchCost of current tier", () => {
      const result = advanceResearch(3, 10000);
      expect(result!.pointsConsumed).toBe(researchCost(3));
    });
  });

  describe("Bonus lookups — unknown IDs", () => {
    it("getDoctrineBonus returns empty for unknown path", () => {
      const bonus = getDoctrineBonus("nonexistent");
      expect(Object.keys(bonus)).toHaveLength(0);
    });

    it("getSpecializationBonus returns empty for unknown spec", () => {
      const bonus = getSpecializationBonus("nonexistent");
      expect(Object.keys(bonus)).toHaveLength(0);
    });
  });

  describe("getCounterBonus — exact multiplier", () => {
    it("counter bonus is exactly 1.25", () => {
      expect(getCounterBonus("shock-troops", "minefield-networks")).toBe(1.25);
    });

    it("non-counter matchup returns exactly 1.0", () => {
      expect(getCounterBonus("shock-troops", "shield-arrays")).toBe(1.0);
    });
  });

  describe("selectSpecialization — already selected", () => {
    it("cannot change specialization once selected", () => {
      const empire = makeEmpire({ researchPath: "war-machine", specialization: "shock-troops" });
      const result = selectSpecialization(empire, "siege-engines");
      expect(result).toBe(false);
      expect(empire.specialization).toBe("shock-troops");
    });
  });

  describe("hasCapstone — intermediate tiers", () => {
    it("tier 0 is not capstone", () => expect(hasCapstone(0)).toBe(false));
    it("tier 4 is not capstone", () => expect(hasCapstone(4)).toBe(false));
    it("tier 9 is capstone", () => expect(hasCapstone(9)).toBe(true));
  });

  describe("autoselectDoctrine — all archetypes valid", () => {
    it("all 8 archetypes produce valid doctrine IDs", () => {
      const archetypes = ["warlord", "diplomat", "merchant", "schemer", "turtle", "blitzkrieg", "tech-rush", "opportunist"] as const;
      const validIds = RESEARCH_PATHS.map(p => p.id);
      for (const arch of archetypes) {
        const rng = new SeededRNG(42);
        const pathId = autoselectDoctrine(arch, rng);
        expect(validIds).toContain(pathId);
      }
    });
  });

  describe("checkResearchDraftTrigger — no advance", () => {
    it("returns null when previousTier equals newTier", () => {
      const empire = makeEmpire({ researchTier: 1 });
      expect(checkResearchDraftTrigger(empire, 1, 1)).toBeNull();
    });
  });

  describe("RESEARCH_PATHS — uniqueness", () => {
    it("all path IDs are unique", () => {
      const ids = RESEARCH_PATHS.map(p => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all specialization IDs across all paths are unique", () => {
      const specIds = RESEARCH_PATHS.flatMap(p => p.specializations ?? []);
      expect(new Set(specIds).size).toBe(specIds.length);
    });
  });
});
