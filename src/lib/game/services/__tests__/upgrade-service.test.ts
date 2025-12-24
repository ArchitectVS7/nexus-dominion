/**
 * Unit Upgrade Service Tests (M3)
 *
 * Tests for unit upgrade configuration and calculations.
 */

import { describe, it, expect } from "vitest";
import {
  MAX_UPGRADE_LEVEL,
  UPGRADE_COSTS,
  getUpgradeCost,
  getTotalUpgradeInvestment,
  getUpgradeBonuses,
  getUpgradeDescription,
  SOLDIER_UPGRADES,
  CARRIER_UPGRADES,
  GENERIC_COMBAT_UPGRADES,
  COVERT_AGENT_UPGRADES,
} from "../../upgrade-config";
import { UNIT_TYPES } from "../../unit-config";

// =============================================================================
// UPGRADE COST TESTS
// =============================================================================

describe("Upgrade Costs", () => {
  it("should have correct costs per level", () => {
    expect(UPGRADE_COSTS[0]).toBe(500); // Level 0 → 1
    expect(UPGRADE_COSTS[1]).toBe(1_000); // Level 1 → 2
  });

  it("should return correct upgrade cost via function", () => {
    expect(getUpgradeCost(0)).toBe(500);
    expect(getUpgradeCost(1)).toBe(1_000);
  });

  it("should return 0 for max level", () => {
    expect(getUpgradeCost(MAX_UPGRADE_LEVEL)).toBe(0);
  });

  it("should return 0 for beyond max level", () => {
    expect(getUpgradeCost(MAX_UPGRADE_LEVEL + 1)).toBe(0);
  });

  it("should calculate total investment correctly", () => {
    // Level 0: 0
    expect(getTotalUpgradeInvestment(0)).toBe(0);

    // Level 1: 500
    expect(getTotalUpgradeInvestment(1)).toBe(500);

    // Level 2: 500 + 1000 = 1500
    expect(getTotalUpgradeInvestment(2)).toBe(1_500);
  });
});

// =============================================================================
// UPGRADE LEVEL TESTS
// =============================================================================

describe("Upgrade Levels", () => {
  it("should have max level of 2 (3 levels: 0, 1, 2)", () => {
    expect(MAX_UPGRADE_LEVEL).toBe(2);
  });

  it("should support all 7 unit types", () => {
    expect(UNIT_TYPES).toHaveLength(7);
  });
});

// =============================================================================
// SOLDIER UPGRADE TESTS (PRD 9.2)
// =============================================================================

describe("Soldier Upgrades (PRD 9.2)", () => {
  it("should have correct level 0 bonuses", () => {
    const bonuses = SOLDIER_UPGRADES[0];
    expect(bonuses.guerilla).toBe(1.0);
    expect(bonuses.ground).toBe(1.0);
    expect(bonuses.pirate).toBe(0.5);
  });

  it("should have correct level 1 bonuses", () => {
    const bonuses = SOLDIER_UPGRADES[1];
    expect(bonuses.guerilla).toBe(1.5);
    expect(bonuses.ground).toBe(1.0);
    expect(bonuses.pirate).toBe(1.0);
  });

  it("should have correct level 2 bonuses", () => {
    const bonuses = SOLDIER_UPGRADES[2];
    expect(bonuses.guerilla).toBe(0.5);
    expect(bonuses.ground).toBe(2.0);
    expect(bonuses.pirate).toBe(2.0);
  });

  it("should get bonuses via function", () => {
    const bonuses0 = getUpgradeBonuses("soldiers", 0);
    expect(bonuses0).toEqual(SOLDIER_UPGRADES[0]);

    const bonuses1 = getUpgradeBonuses("soldiers", 1);
    expect(bonuses1).toEqual(SOLDIER_UPGRADES[1]);

    const bonuses2 = getUpgradeBonuses("soldiers", 2);
    expect(bonuses2).toEqual(SOLDIER_UPGRADES[2]);
  });
});

// =============================================================================
// CARRIER UPGRADE TESTS (PRD 9.2)
// =============================================================================

describe("Carrier Upgrades (PRD 9.2)", () => {
  it("should have correct level 0 bonuses", () => {
    const bonuses = CARRIER_UPGRADES[0];
    expect(bonuses.toughness).toBe(1.0);
    expect(bonuses.speed).toBe(1.0);
    expect(bonuses.cargo).toBe(1.0);
  });

  it("should have correct level 1 bonuses", () => {
    const bonuses = CARRIER_UPGRADES[1];
    expect(bonuses.toughness).toBe(2.0);
    expect(bonuses.speed).toBe(2.0);
    expect(bonuses.cargo).toBe(0.5);
  });

  it("should have correct level 2 bonuses", () => {
    const bonuses = CARRIER_UPGRADES[2];
    expect(bonuses.toughness).toBe(4.0);
    expect(bonuses.speed).toBe(4.0);
    expect(bonuses.cargo).toBe(0.25);
  });

  it("should get bonuses via function", () => {
    const bonuses0 = getUpgradeBonuses("carriers", 0);
    expect(bonuses0).toEqual(CARRIER_UPGRADES[0]);

    const bonuses2 = getUpgradeBonuses("carriers", 2);
    expect(bonuses2).toEqual(CARRIER_UPGRADES[2]);
  });
});

// =============================================================================
// COVERT AGENT UPGRADE TESTS
// =============================================================================

describe("Covert Agent Upgrades", () => {
  it("should have correct level 0 bonuses", () => {
    const bonuses = COVERT_AGENT_UPGRADES[0];
    expect(bonuses.stealth).toBe(1.0);
    expect(bonuses.effectiveness).toBe(1.0);
  });

  it("should have correct level 1 bonuses", () => {
    const bonuses = COVERT_AGENT_UPGRADES[1];
    expect(bonuses.stealth).toBe(1.5);
    expect(bonuses.effectiveness).toBe(1.25);
  });

  it("should have correct level 2 bonuses", () => {
    const bonuses = COVERT_AGENT_UPGRADES[2];
    expect(bonuses.stealth).toBe(2.0);
    expect(bonuses.effectiveness).toBe(1.5);
  });

  it("should get bonuses via function", () => {
    const bonuses = getUpgradeBonuses("covertAgents", 1);
    expect(bonuses).toEqual(COVERT_AGENT_UPGRADES[1]);
  });
});

// =============================================================================
// GENERIC COMBAT UPGRADE TESTS
// =============================================================================

describe("Generic Combat Upgrades", () => {
  it("should have correct level 0 bonuses", () => {
    const bonuses = GENERIC_COMBAT_UPGRADES[0];
    expect(bonuses.attack).toBe(1.0);
    expect(bonuses.defense).toBe(1.0);
  });

  it("should have correct level 1 bonuses", () => {
    const bonuses = GENERIC_COMBAT_UPGRADES[1];
    expect(bonuses.attack).toBe(1.25);
    expect(bonuses.defense).toBe(1.25);
  });

  it("should have correct level 2 bonuses", () => {
    const bonuses = GENERIC_COMBAT_UPGRADES[2];
    expect(bonuses.attack).toBe(1.5);
    expect(bonuses.defense).toBe(1.5);
  });

  it("should apply to fighters", () => {
    const bonuses = getUpgradeBonuses("fighters", 1);
    expect(bonuses).toEqual(GENERIC_COMBAT_UPGRADES[1]);
  });

  it("should apply to stations", () => {
    const bonuses = getUpgradeBonuses("stations", 2);
    expect(bonuses).toEqual(GENERIC_COMBAT_UPGRADES[2]);
  });

  it("should apply to light cruisers", () => {
    const bonuses = getUpgradeBonuses("lightCruisers", 1);
    expect(bonuses).toEqual(GENERIC_COMBAT_UPGRADES[1]);
  });

  it("should apply to heavy cruisers", () => {
    const bonuses = getUpgradeBonuses("heavyCruisers", 2);
    expect(bonuses).toEqual(GENERIC_COMBAT_UPGRADES[2]);
  });
});

// =============================================================================
// BONUS LOOKUP TESTS
// =============================================================================

describe("Bonus Lookup", () => {
  it("should clamp level below 0 to 0", () => {
    const bonuses = getUpgradeBonuses("soldiers", -1);
    expect(bonuses).toEqual(SOLDIER_UPGRADES[0]);
  });

  it("should clamp level above max to max", () => {
    const bonuses = getUpgradeBonuses("soldiers", 5);
    expect(bonuses).toEqual(SOLDIER_UPGRADES[2]);
  });

  it("should return correct bonuses for each unit type", () => {
    // Soldiers get soldier-specific bonuses
    const soldierBonuses = getUpgradeBonuses("soldiers", 0);
    expect("guerilla" in soldierBonuses).toBe(true);

    // Carriers get carrier-specific bonuses
    const carrierBonuses = getUpgradeBonuses("carriers", 0);
    expect("cargo" in carrierBonuses).toBe(true);

    // Covert Agents get their specific bonuses
    const covertBonuses = getUpgradeBonuses("covertAgents", 0);
    expect("stealth" in covertBonuses).toBe(true);

    // Others get generic combat bonuses
    const fighterBonuses = getUpgradeBonuses("fighters", 0);
    expect("attack" in fighterBonuses).toBe(true);
  });
});

// =============================================================================
// UPGRADE DESCRIPTION TESTS
// =============================================================================

describe("Upgrade Descriptions", () => {
  it("should return descriptions for all levels", () => {
    for (const unitType of UNIT_TYPES) {
      for (let level = 0; level <= MAX_UPGRADE_LEVEL; level++) {
        const description = getUpgradeDescription(unitType, level);
        expect(description).toBeDefined();
        expect(typeof description).toBe("string");
        expect(description.length).toBeGreaterThan(0);
      }
    }
  });

  it("should clamp level for descriptions", () => {
    const desc = getUpgradeDescription("soldiers", 10);
    expect(desc).toBe(getUpgradeDescription("soldiers", MAX_UPGRADE_LEVEL));
  });
});

// =============================================================================
// PRD 9.2 COMPLIANCE TESTS
// =============================================================================

describe("PRD 9.2 Compliance", () => {
  it("should have 3 upgrade levels (0, 1, 2)", () => {
    expect(MAX_UPGRADE_LEVEL).toBe(2);
    // This means levels 0, 1, 2 = 3 total levels
  });

  it("should cost 500 RP for level 1", () => {
    expect(getUpgradeCost(0)).toBe(500);
  });

  it("should cost 1000 RP for level 2", () => {
    expect(getUpgradeCost(1)).toBe(1_000);
  });

  it("should have soldier upgrade path matching PRD 9.2", () => {
    // Level 0: Guerilla 1×, Ground 1×, Pirate 0.5×
    expect(SOLDIER_UPGRADES[0]).toEqual({
      guerilla: 1.0,
      ground: 1.0,
      pirate: 0.5,
    });

    // Level 1: Guerilla 1.5×, Ground 1×, Pirate 1×
    expect(SOLDIER_UPGRADES[1]).toEqual({
      guerilla: 1.5,
      ground: 1.0,
      pirate: 1.0,
    });

    // Level 2: Guerilla 0.5×, Ground 2×, Pirate 2×
    expect(SOLDIER_UPGRADES[2]).toEqual({
      guerilla: 0.5,
      ground: 2.0,
      pirate: 2.0,
    });
  });

  it("should have carrier upgrade path matching PRD 9.2", () => {
    // Level 0: Toughness 1×, Speed 1×, Cargo 1×
    expect(CARRIER_UPGRADES[0]).toEqual({
      toughness: 1.0,
      speed: 1.0,
      cargo: 1.0,
    });

    // Level 1: Toughness 2×, Speed 2×, Cargo 0.5×
    expect(CARRIER_UPGRADES[1]).toEqual({
      toughness: 2.0,
      speed: 2.0,
      cargo: 0.5,
    });

    // Level 2: Toughness 4×, Speed 4×, Cargo 0.25×
    expect(CARRIER_UPGRADES[2]).toEqual({
      toughness: 4.0,
      speed: 4.0,
      cargo: 0.25,
    });
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

describe("Upgrade Edge Cases", () => {
  it("should handle upgrade costs for all levels", () => {
    let totalCost = 0;
    for (let level = 0; level < MAX_UPGRADE_LEVEL; level++) {
      totalCost += getUpgradeCost(level);
    }
    expect(totalCost).toBe(1_500); // 500 + 1000
  });

  it("should not allow upgrade beyond max level", () => {
    const cost = getUpgradeCost(MAX_UPGRADE_LEVEL);
    expect(cost).toBe(0);
  });

  it("should verify bonus progression makes sense", () => {
    // Generic combat bonuses should increase with level
    expect(GENERIC_COMBAT_UPGRADES[1].attack).toBeGreaterThan(
      GENERIC_COMBAT_UPGRADES[0].attack
    );
    expect(GENERIC_COMBAT_UPGRADES[2].attack).toBeGreaterThan(
      GENERIC_COMBAT_UPGRADES[1].attack
    );
  });

  it("should verify carrier cargo decreases with level (trade-off)", () => {
    // Carriers sacrifice cargo for toughness/speed
    expect(CARRIER_UPGRADES[1].cargo).toBeLessThan(CARRIER_UPGRADES[0].cargo);
    expect(CARRIER_UPGRADES[2].cargo).toBeLessThan(CARRIER_UPGRADES[1].cargo);
  });
});
