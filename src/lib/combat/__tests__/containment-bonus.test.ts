/**
 * Tests for Containment Bonus System (M7.3)
 */

import { describe, it, expect } from "vitest";
import {
  calculateContainmentBonus,
  applyContainmentAttackBonus,
  applyContainmentForceCostReduction,
  isAdjacentToBoss,
  getContainmentEligibleEmpires,
  CONTAINMENT_CONSTANTS,
} from "../containment-bonus";

// =============================================================================
// TEST DATA
// =============================================================================

/**
 * Create a simple adjacency map for testing.
 * Layout:
 *   [A] -- [B] -- [C]
 *    |      |
 *   [D] -- [E]
 */
function createTestAdjacencyMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  map.set("region-a", ["region-b", "region-d"]);
  map.set("region-b", ["region-a", "region-c", "region-e"]);
  map.set("region-c", ["region-b"]);
  map.set("region-d", ["region-a", "region-e"]);
  map.set("region-e", ["region-b", "region-d"]);
  return map;
}

// =============================================================================
// CONTAINMENT BONUS CALCULATION TESTS
// =============================================================================

describe("calculateContainmentBonus", () => {
  it("should return no bonus if defender is not a boss", () => {
    const bonus = calculateContainmentBonus({
      attackerRegionId: "region-a",
      defenderRegionId: "region-b",
      defenderIsBoss: false,
      adjacencyMap: createTestAdjacencyMap(),
    });

    expect(bonus.isActive).toBe(false);
    expect(bonus.attackBonus).toBe(0);
    expect(bonus.reason).toContain("not a dominant empire");
  });

  it("should return no bonus if attacker is not in adjacent sector", () => {
    // Region C is not adjacent to Region D
    const bonus = calculateContainmentBonus({
      attackerRegionId: "region-c",
      defenderRegionId: "region-d",
      defenderIsBoss: true,
      adjacencyMap: createTestAdjacencyMap(),
    });

    expect(bonus.isActive).toBe(false);
    expect(bonus.attackBonus).toBe(0);
    expect(bonus.reason).toContain("not in an adjacent sector");
  });

  it("should return bonus when attacking boss from adjacent sector", () => {
    // Region A is adjacent to Region B
    const bonus = calculateContainmentBonus({
      attackerRegionId: "region-a",
      defenderRegionId: "region-b",
      defenderIsBoss: true,
      adjacencyMap: createTestAdjacencyMap(),
    });

    expect(bonus.isActive).toBe(true);
    expect(bonus.attackBonus).toBe(CONTAINMENT_CONSTANTS.ATTACK_BONUS);
    expect(bonus.forceCostReduction).toBe(CONTAINMENT_CONSTANTS.FORCE_COST_REDUCTION);
    expect(bonus.reason).toContain("containment bonus");
  });

  it("should return no bonus for same-sector attacks", () => {
    const bonus = calculateContainmentBonus({
      attackerRegionId: "region-a",
      defenderRegionId: "region-a",
      defenderIsBoss: true,
      adjacencyMap: createTestAdjacencyMap(),
    });

    expect(bonus.isActive).toBe(false);
    expect(bonus.reason).toContain("Same sector");
  });

  it("should handle reverse adjacency lookup", () => {
    // Create a one-way adjacency map
    const oneWayMap = new Map<string, string[]>();
    oneWayMap.set("region-a", []); // A doesn't list B
    oneWayMap.set("region-b", ["region-a"]); // But B lists A

    const bonus = calculateContainmentBonus({
      attackerRegionId: "region-a",
      defenderRegionId: "region-b",
      defenderIsBoss: true,
      adjacencyMap: oneWayMap,
    });

    expect(bonus.isActive).toBe(true);
  });
});

// =============================================================================
// BONUS APPLICATION TESTS
// =============================================================================

describe("applyContainmentAttackBonus", () => {
  it("should apply +15% bonus when active", () => {
    const activeBonus = {
      attackBonus: 0.15,
      forceCostReduction: 0.1,
      isActive: true,
      reason: "Test",
    };

    const result = applyContainmentAttackBonus(1000, activeBonus);
    expect(result).toBe(1150); // 1000 * 1.15
  });

  it("should not modify power when inactive", () => {
    const inactiveBonus = {
      attackBonus: 0.15,
      forceCostReduction: 0.1,
      isActive: false,
      reason: "Test",
    };

    const result = applyContainmentAttackBonus(1000, inactiveBonus);
    expect(result).toBe(1000);
  });
});

describe("applyContainmentForceCostReduction", () => {
  it("should reduce force multiplier from 1.2 to 1.1", () => {
    const activeBonus = {
      attackBonus: 0.15,
      forceCostReduction: 0.1,
      isActive: true,
      reason: "Test",
    };

    const result = applyContainmentForceCostReduction(1.2, activeBonus);
    expect(result).toBeCloseTo(1.1, 2);
  });

  it("should not go below 1.0", () => {
    const largeReduction = {
      attackBonus: 0.15,
      forceCostReduction: 0.5, // Would push 1.2 to 0.7
      isActive: true,
      reason: "Test",
    };

    const result = applyContainmentForceCostReduction(1.2, largeReduction);
    expect(result).toBe(1.0);
  });

  it("should not modify when inactive", () => {
    const inactiveBonus = {
      attackBonus: 0.15,
      forceCostReduction: 0.1,
      isActive: false,
      reason: "Test",
    };

    const result = applyContainmentForceCostReduction(1.2, inactiveBonus);
    expect(result).toBe(1.2);
  });
});

// =============================================================================
// HELPER FUNCTION TESTS
// =============================================================================

describe("isAdjacentToBoss", () => {
  const adjacencyMap = createTestAdjacencyMap();

  it("should return true for adjacent sectors", () => {
    expect(isAdjacentToBoss("region-a", "region-b", adjacencyMap)).toBe(true);
    expect(isAdjacentToBoss("region-e", "region-d", adjacencyMap)).toBe(true);
  });

  it("should return false for non-adjacent sectors", () => {
    expect(isAdjacentToBoss("region-c", "region-d", adjacencyMap)).toBe(false);
    expect(isAdjacentToBoss("region-a", "region-c", adjacencyMap)).toBe(false);
  });

  it("should return false for same sector", () => {
    expect(isAdjacentToBoss("region-a", "region-a", adjacencyMap)).toBe(false);
  });
});

describe("getContainmentEligibleEmpires", () => {
  const adjacencyMap = createTestAdjacencyMap();

  it("should find all empires adjacent to boss", () => {
    // Boss in region B (adjacent to A, C, E)
    const empireRegions = new Map<string, string>();
    empireRegions.set("empire-1", "region-a");
    empireRegions.set("empire-2", "region-c");
    empireRegions.set("empire-3", "region-d"); // Not adjacent to B
    empireRegions.set("empire-4", "region-e");

    const eligible = getContainmentEligibleEmpires(
      "region-b",
      empireRegions,
      adjacencyMap
    );

    expect(eligible).toContain("empire-1"); // A is adjacent to B
    expect(eligible).toContain("empire-2"); // C is adjacent to B
    expect(eligible).toContain("empire-4"); // E is adjacent to B
    expect(eligible).not.toContain("empire-3"); // D is not adjacent to B
  });

  it("should exclude empires in same sector as boss", () => {
    const empireRegions = new Map<string, string>();
    empireRegions.set("empire-1", "region-b"); // Same sector as boss
    empireRegions.set("empire-2", "region-a"); // Adjacent

    const eligible = getContainmentEligibleEmpires(
      "region-b",
      empireRegions,
      adjacencyMap
    );

    expect(eligible).not.toContain("empire-1");
    expect(eligible).toContain("empire-2");
  });
});

// =============================================================================
// CONSTANTS TESTS
// =============================================================================

describe("CONTAINMENT_CONSTANTS", () => {
  it("should have correct attack bonus (15%)", () => {
    expect(CONTAINMENT_CONSTANTS.ATTACK_BONUS).toBe(0.15);
  });

  it("should have correct force cost reduction (0.1)", () => {
    expect(CONTAINMENT_CONSTANTS.FORCE_COST_REDUCTION).toBe(0.1);
  });

  it("should have correct force multipliers", () => {
    expect(CONTAINMENT_CONSTANTS.STANDARD_FORCE_MULTIPLIER).toBe(1.2);
    expect(CONTAINMENT_CONSTANTS.CONTAINMENT_FORCE_MULTIPLIER).toBe(1.1);
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe("edge cases", () => {
  it("should handle empty adjacency map", () => {
    const emptyMap = new Map<string, string[]>();

    const bonus = calculateContainmentBonus({
      attackerRegionId: "region-a",
      defenderRegionId: "region-b",
      defenderIsBoss: true,
      adjacencyMap: emptyMap,
    });

    expect(bonus.isActive).toBe(false);
  });

  it("should handle missing region in adjacency map", () => {
    const partialMap = new Map<string, string[]>();
    partialMap.set("region-a", ["region-b"]);
    // region-b not in map

    const bonus = calculateContainmentBonus({
      attackerRegionId: "region-a",
      defenderRegionId: "region-b",
      defenderIsBoss: true,
      adjacencyMap: partialMap,
    });

    // Should still work via reverse lookup
    expect(bonus.isActive).toBe(true);
  });
});
