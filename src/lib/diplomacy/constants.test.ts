import { describe, it, expect } from "vitest";
import {
  TREATY_DEFINITIONS,
  STARTING_REPUTATION,
  MIN_REPUTATION,
  MAX_REPUTATION,
  REPUTATION_CHANGES,
  REPUTATION_THRESHOLDS,
  BASE_ACCEPTANCE_RATES,
  MIN_TREATY_DURATION,
  getReputationLevel,
  calculateAcceptanceChance,
  type TreatyType,
} from "./constants";

// =============================================================================
// TREATY DEFINITIONS
// =============================================================================

describe("TREATY_DEFINITIONS constants", () => {
  it("defines NAP treaty correctly", () => {
    expect(TREATY_DEFINITIONS.nap.id).toBe("nap");
    expect(TREATY_DEFINITIONS.nap.name).toBe("Non-Aggression Pact");
    expect(TREATY_DEFINITIONS.nap.canUpgrade).toBe(true);
    expect(TREATY_DEFINITIONS.nap.benefits.length).toBeGreaterThan(0);
  });

  it("defines Alliance treaty correctly", () => {
    expect(TREATY_DEFINITIONS.alliance.id).toBe("alliance");
    expect(TREATY_DEFINITIONS.alliance.name).toBe("Alliance");
    expect(TREATY_DEFINITIONS.alliance.canUpgrade).toBe(false);
    expect(TREATY_DEFINITIONS.alliance.benefits.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// REPUTATION CONSTANTS
// =============================================================================

describe("REPUTATION constants", () => {
  it("has correct starting reputation (50 = neutral)", () => {
    expect(STARTING_REPUTATION).toBe(50);
  });

  it("has correct reputation bounds (0-100)", () => {
    expect(MIN_REPUTATION).toBe(0);
    expect(MAX_REPUTATION).toBe(100);
  });

  it("has correct reputation thresholds", () => {
    expect(REPUTATION_THRESHOLDS.trustworthy).toBe(70);
    expect(REPUTATION_THRESHOLDS.neutral).toBe(50);
    expect(REPUTATION_THRESHOLDS.suspicious).toBe(30);
    expect(REPUTATION_THRESHOLDS.treacherous).toBe(15);
  });
});

describe("REPUTATION_CHANGES constants", () => {
  it("has severe penalty for breaking NAP (-30)", () => {
    expect(REPUTATION_CHANGES.napBroken).toBe(-30);
  });

  it("has worse penalty for breaking Alliance (-50)", () => {
    expect(REPUTATION_CHANGES.allianceBroken).toBe(-50);
    expect(REPUTATION_CHANGES.allianceBroken).toBeLessThan(REPUTATION_CHANGES.napBroken);
  });

  it("has positive reward for forming treaties", () => {
    expect(REPUTATION_CHANGES.napFormed).toBe(5);
    expect(REPUTATION_CHANGES.allianceFormed).toBe(10);
  });

  it("has reward for honoring treaties", () => {
    expect(REPUTATION_CHANGES.treatyHonored).toBe(3);
  });

  it("has no penalty for peaceful NAP ending", () => {
    expect(REPUTATION_CHANGES.napEndedPeacefully).toBe(0);
  });

  it("has small penalty for peaceful Alliance ending", () => {
    expect(REPUTATION_CHANGES.allianceEndedPeacefully).toBe(-5);
  });
});

describe("TREATY_DURATION constants", () => {
  it("has minimum treaty duration of 10 turns", () => {
    expect(MIN_TREATY_DURATION).toBe(10);
  });
});

// =============================================================================
// getReputationLevel
// =============================================================================

describe("getReputationLevel", () => {
  it("returns 'Trustworthy' for 70+", () => {
    expect(getReputationLevel(70)).toBe("Trustworthy");
    expect(getReputationLevel(85)).toBe("Trustworthy");
    expect(getReputationLevel(100)).toBe("Trustworthy");
  });

  it("returns 'Neutral' for 50-69", () => {
    expect(getReputationLevel(50)).toBe("Neutral");
    expect(getReputationLevel(60)).toBe("Neutral");
    expect(getReputationLevel(69)).toBe("Neutral");
  });

  it("returns 'Suspicious' for 30-49", () => {
    expect(getReputationLevel(30)).toBe("Suspicious");
    expect(getReputationLevel(40)).toBe("Suspicious");
    expect(getReputationLevel(49)).toBe("Suspicious");
  });

  it("returns 'Treacherous' for 0-29", () => {
    expect(getReputationLevel(0)).toBe("Treacherous");
    expect(getReputationLevel(15)).toBe("Treacherous");
    expect(getReputationLevel(29)).toBe("Treacherous");
  });

  it("handles boundary values correctly", () => {
    expect(getReputationLevel(REPUTATION_THRESHOLDS.trustworthy)).toBe("Trustworthy");
    expect(getReputationLevel(REPUTATION_THRESHOLDS.neutral)).toBe("Neutral");
    expect(getReputationLevel(REPUTATION_THRESHOLDS.suspicious)).toBe("Suspicious");
    expect(getReputationLevel(REPUTATION_THRESHOLDS.treacherous - 1)).toBe("Treacherous");
  });
});

// =============================================================================
// BASE_ACCEPTANCE_RATES
// =============================================================================

describe("BASE_ACCEPTANCE_RATES constants", () => {
  it("has correct base acceptance for NAP (60%)", () => {
    expect(BASE_ACCEPTANCE_RATES.nap).toBe(0.6);
  });

  it("has correct base acceptance for Alliance (40%)", () => {
    expect(BASE_ACCEPTANCE_RATES.alliance).toBe(0.4);
  });

  it("NAP has higher acceptance rate than Alliance", () => {
    expect(BASE_ACCEPTANCE_RATES.nap).toBeGreaterThan(BASE_ACCEPTANCE_RATES.alliance);
  });
});

// =============================================================================
// calculateAcceptanceChance
// =============================================================================

describe("calculateAcceptanceChance", () => {
  it("returns base rate for neutral reputation (50)", () => {
    const napChance = calculateAcceptanceChance("nap", 50);
    const allianceChance = calculateAcceptanceChance("alliance", 50);

    expect(napChance).toBeCloseTo(0.6, 2);
    expect(allianceChance).toBeCloseTo(0.4, 2);
  });

  it("increases chance for high reputation", () => {
    const neutralChance = calculateAcceptanceChance("nap", 50);
    const highRepChance = calculateAcceptanceChance("nap", 100);

    expect(highRepChance).toBeGreaterThan(neutralChance);
  });

  it("decreases chance for low reputation", () => {
    const neutralChance = calculateAcceptanceChance("nap", 50);
    const lowRepChance = calculateAcceptanceChance("nap", 0);

    expect(lowRepChance).toBeLessThan(neutralChance);
  });

  it("clamps to minimum of 0.1", () => {
    // Very low reputation should still have 10% minimum chance
    const chance = calculateAcceptanceChance("alliance", 0);
    expect(chance).toBeGreaterThanOrEqual(0.1);
  });

  it("clamps to maximum of 0.9", () => {
    // Very high reputation should still cap at 90%
    const chance = calculateAcceptanceChance("nap", 100);
    expect(chance).toBeLessThanOrEqual(0.9);
  });

  it("considers relationship score modifier", () => {
    const lowRelChance = calculateAcceptanceChance("nap", 50, 0);
    const highRelChance = calculateAcceptanceChance("nap", 50, 100);

    expect(highRelChance).toBeGreaterThan(lowRelChance);
  });

  it("handles default relationship score", () => {
    // Default relationship is 50 (neutral)
    const withDefault = calculateAcceptanceChance("nap", 50);
    const withExplicit = calculateAcceptanceChance("nap", 50, 50);

    expect(withDefault).toEqual(withExplicit);
  });

  it("calculates NAP and Alliance chances correctly", () => {
    const treatyTypes: TreatyType[] = ["nap", "alliance"];

    for (const treatyType of treatyTypes) {
      const chance = calculateAcceptanceChance(treatyType, 50, 50);
      expect(chance).toBeGreaterThanOrEqual(0.1);
      expect(chance).toBeLessThanOrEqual(0.9);
    }
  });

  it("reputation modifier ranges from -30% to +30%", () => {
    // At rep 0: modifier = (0 - 50) / 100 * 0.6 = -0.30
    // At rep 100: modifier = (100 - 50) / 100 * 0.6 = +0.30
    const minRepChance = calculateAcceptanceChance("nap", 0, 50);
    const maxRepChance = calculateAcceptanceChance("nap", 100, 50);

    // Base is 0.6, so min should be ~0.3, max should be ~0.9
    expect(minRepChance).toBeCloseTo(0.3, 1);
    expect(maxRepChance).toBeCloseTo(0.9, 1);
  });
});
