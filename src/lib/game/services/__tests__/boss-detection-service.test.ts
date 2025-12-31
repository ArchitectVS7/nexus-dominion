/**
 * Tests for Boss Detection Service (M7.1)
 */

import { describe, it, expect } from "vitest";
import {
  calculateAverageNetworth,
  isBossQualified,
  calculateBossStatus,
  BOSS_CONSTANTS,
} from "../boss-detection-service";

// =============================================================================
// AVERAGE NETWORTH TESTS
// =============================================================================

describe("calculateAverageNetworth", () => {
  it("should calculate correct average for active empires", () => {
    const empires = [
      { networth: 100000, isEliminated: false },
      { networth: 200000, isEliminated: false },
      { networth: 300000, isEliminated: false },
    ];

    const avg = calculateAverageNetworth(empires);
    expect(avg).toBe(200000);
  });

  it("should exclude eliminated empires from average", () => {
    const empires = [
      { networth: 100000, isEliminated: false },
      { networth: 200000, isEliminated: false },
      { networth: 1000000, isEliminated: true }, // Should be excluded
    ];

    const avg = calculateAverageNetworth(empires);
    expect(avg).toBe(150000); // (100k + 200k) / 2
  });

  it("should return 0 for empty list", () => {
    const avg = calculateAverageNetworth([]);
    expect(avg).toBe(0);
  });

  it("should return 0 if all empires eliminated", () => {
    const empires = [
      { networth: 100000, isEliminated: true },
      { networth: 200000, isEliminated: true },
    ];

    const avg = calculateAverageNetworth(empires);
    expect(avg).toBe(0);
  });
});

// =============================================================================
// BOSS QUALIFICATION TESTS
// =============================================================================

describe("isBossQualified", () => {
  it("should return false for 4 wins + 2× networth (NOT boss)", () => {
    expect(isBossQualified(4, 2.0)).toBe(false);
  });

  it("should return false for 5 wins + 1.9× networth (NOT boss)", () => {
    expect(isBossQualified(5, 1.9)).toBe(false);
  });

  it("should return true for 5 wins + 2.0× networth (IS boss)", () => {
    expect(isBossQualified(5, 2.0)).toBe(true);
  });

  it("should return true for 10 wins + 3× networth", () => {
    expect(isBossQualified(10, 3.0)).toBe(true);
  });

  it("should use correct constants", () => {
    expect(BOSS_CONSTANTS.MIN_BATTLE_WINS).toBe(5);
    expect(BOSS_CONSTANTS.MIN_NETWORTH_RATIO).toBe(2.0);
  });
});

// =============================================================================
// BOSS STATUS CALCULATION TESTS
// =============================================================================

describe("calculateBossStatus", () => {
  it("should identify a new boss correctly", () => {
    const status = calculateBossStatus(
      "empire-1",
      "Dominant Empire",
      400000, // Empire networth
      200000, // Average networth (2× ratio)
      5, // Battle wins
      null, // No previous boss status
      50 // Current turn
    );

    expect(status.isBoss).toBe(true);
    expect(status.wasAlreadyBoss).toBe(false);
    expect(status.bossEmergenceTurn).toBe(50);
    expect(status.networthRatio).toBe(2.0);
    expect(status.battleWins).toBe(5);
  });

  it("should preserve emergence turn for existing boss", () => {
    const status = calculateBossStatus(
      "empire-1",
      "Old Boss",
      500000,
      200000, // 2.5× ratio
      8,
      30, // Became boss on turn 30
      50
    );

    expect(status.isBoss).toBe(true);
    expect(status.wasAlreadyBoss).toBe(true);
    expect(status.bossEmergenceTurn).toBe(30); // Preserved
  });

  it("should clear emergence turn when losing boss status", () => {
    const status = calculateBossStatus(
      "empire-1",
      "Former Boss",
      150000, // Dropped to 1.5× average
      100000,
      5,
      30, // Was boss since turn 30
      50
    );

    expect(status.isBoss).toBe(false);
    expect(status.bossEmergenceTurn).toBe(null); // Cleared
  });

  it("should calculate networth ratio correctly", () => {
    const status = calculateBossStatus(
      "empire-1",
      "Test Empire",
      300000,
      100000, // 3× ratio
      6,
      null,
      10
    );

    expect(status.networthRatio).toBe(3.0);
  });

  it("should handle zero average networth", () => {
    const status = calculateBossStatus(
      "empire-1",
      "Test Empire",
      100000,
      0, // Zero average
      5,
      null,
      10
    );

    expect(status.networthRatio).toBe(0);
    expect(status.isBoss).toBe(false);
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe("edge cases", () => {
  it("should handle exactly threshold values (5 wins, 2× networth)", () => {
    const status = calculateBossStatus(
      "empire-1",
      "Edge Case Boss",
      200000,
      100000, // Exactly 2×
      5, // Exactly 5 wins
      null,
      25
    );

    expect(status.isBoss).toBe(true);
  });

  it("should handle just below threshold (4 wins)", () => {
    const status = calculateBossStatus(
      "empire-1",
      "Almost Boss",
      200000,
      100000,
      4, // Just under 5
      null,
      25
    );

    expect(status.isBoss).toBe(false);
  });

  it("should handle just below threshold (1.99× networth)", () => {
    const status = calculateBossStatus(
      "empire-1",
      "Almost Boss",
      199000,
      100000, // 1.99×
      6,
      null,
      25
    );

    expect(status.isBoss).toBe(false);
  });

  it("should track empire name correctly", () => {
    const status = calculateBossStatus(
      "empire-123",
      "Galactic Overlord",
      500000,
      100000,
      10,
      null,
      30
    );

    expect(status.empireId).toBe("empire-123");
    expect(status.empireName).toBe("Galactic Overlord");
  });
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

describe("regression tests", () => {
  it("should handle realistic game scenario", () => {
    // Simulate mid-game with 10 empires, one dominant
    const avgNetworth = 150000;
    const dominantNetworth = 450000; // 3× average

    const dominantStatus = calculateBossStatus(
      "dominant-empire",
      "The Hegemon",
      dominantNetworth,
      avgNetworth,
      8, // Won 8 battles
      null,
      75
    );

    expect(dominantStatus.isBoss).toBe(true);
    expect(dominantStatus.networthRatio).toBeCloseTo(3.0, 1);

    // Regular empire should not be boss
    const regularStatus = calculateBossStatus(
      "regular-empire",
      "Average Joe",
      150000, // At average
      avgNetworth,
      2, // Won 2 battles
      null,
      75
    );

    expect(regularStatus.isBoss).toBe(false);
  });
});
