import { describe, it, expect } from "vitest";
import {
  MAX_RESEARCH_TIER,
  RESEARCH_PATHS,
  researchCost,
  advanceResearch,
  hasCapstone,
} from "./research-engine";

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
});
