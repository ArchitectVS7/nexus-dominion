import { describe, it, expect } from "vitest";
import {
  clampEffectiveness,
  calculateCombatEffectivenessChange,
  applyEffectivenessRecovery,
  applyMaintenancePenalty,
  updateEffectiveness,
  calculateCombatModifier,
  calculateEffectivePower,
  calculateRecoveryTurns,
  EFFECTIVENESS_MAX,
  EFFECTIVENESS_MIN,
  EFFECTIVENESS_DEFAULT,
  EFFECTIVENESS_RECOVERY_RATE,
  EFFECTIVENESS_VICTORY_BONUS_MIN,
  EFFECTIVENESS_VICTORY_BONUS_MAX,
  EFFECTIVENESS_DEFEAT_PENALTY,
  EFFECTIVENESS_UNPAID_PENALTY,
  type EffectivenessEvent,
} from "./army-effectiveness";

describe("clampEffectiveness", () => {
  it("returns value unchanged when in range", () => {
    expect(clampEffectiveness(50)).toBe(50);
    expect(clampEffectiveness(85)).toBe(85);
  });

  it("clamps to minimum", () => {
    expect(clampEffectiveness(-10)).toBe(EFFECTIVENESS_MIN);
    expect(clampEffectiveness(-100)).toBe(0);
  });

  it("clamps to maximum", () => {
    expect(clampEffectiveness(110)).toBe(EFFECTIVENESS_MAX);
    expect(clampEffectiveness(1000)).toBe(100);
  });

  it("handles boundary values", () => {
    expect(clampEffectiveness(0)).toBe(0);
    expect(clampEffectiveness(100)).toBe(100);
  });
});

describe("calculateCombatEffectivenessChange", () => {
  it("returns positive change for victory", () => {
    const change = calculateCombatEffectivenessChange("victory");
    expect(change).toBeGreaterThanOrEqual(EFFECTIVENESS_VICTORY_BONUS_MIN);
    expect(change).toBeLessThanOrEqual(EFFECTIVENESS_VICTORY_BONUS_MAX);
  });

  it("returns min victory bonus for random 0", () => {
    expect(calculateCombatEffectivenessChange("victory", 0)).toBe(
      EFFECTIVENESS_VICTORY_BONUS_MIN
    );
  });

  it("returns max victory bonus for high random value", () => {
    // Random value just below 1.0 gives max bonus
    expect(calculateCombatEffectivenessChange("victory", 0.99)).toBe(
      EFFECTIVENESS_VICTORY_BONUS_MAX
    );
  });

  it("returns negative change for defeat", () => {
    expect(calculateCombatEffectivenessChange("defeat")).toBe(
      -EFFECTIVENESS_DEFEAT_PENALTY
    );
  });

  it("returns 0 for draw", () => {
    expect(calculateCombatEffectivenessChange("draw")).toBe(0);
  });
});

describe("applyEffectivenessRecovery", () => {
  it("increases effectiveness by recovery rate", () => {
    expect(applyEffectivenessRecovery(80)).toBe(82);
    expect(applyEffectivenessRecovery(50)).toBe(52);
  });

  it("caps at maximum", () => {
    expect(applyEffectivenessRecovery(99)).toBe(100);
    expect(applyEffectivenessRecovery(100)).toBe(100);
  });

  it("recovers from low values", () => {
    expect(applyEffectivenessRecovery(0)).toBe(2);
    expect(applyEffectivenessRecovery(10)).toBe(12);
  });
});

describe("applyMaintenancePenalty", () => {
  it("decreases effectiveness by penalty amount", () => {
    expect(applyMaintenancePenalty(80)).toBe(70);
    expect(applyMaintenancePenalty(50)).toBe(40);
  });

  it("floors at minimum", () => {
    expect(applyMaintenancePenalty(5)).toBe(0);
    expect(applyMaintenancePenalty(0)).toBe(0);
  });
});

describe("updateEffectiveness", () => {
  it("handles combat victory event", () => {
    const event: EffectivenessEvent = { type: "combat", outcome: "victory" };
    const newEff = updateEffectiveness(80, event, 0.5);
    // 80 + 7 or 8 (middle of 5-10 range)
    expect(newEff).toBeGreaterThan(80);
    expect(newEff).toBeLessThanOrEqual(90);
  });

  it("handles combat defeat event", () => {
    const event: EffectivenessEvent = { type: "combat", outcome: "defeat" };
    const newEff = updateEffectiveness(80, event);
    expect(newEff).toBe(75);
  });

  it("handles recovery event", () => {
    const event: EffectivenessEvent = { type: "recovery" };
    const newEff = updateEffectiveness(80, event);
    expect(newEff).toBe(82);
  });

  it("handles maintenance unpaid event", () => {
    const event: EffectivenessEvent = { type: "maintenance_unpaid" };
    const newEff = updateEffectiveness(80, event);
    expect(newEff).toBe(70);
  });

  it("handles custom event", () => {
    const event: EffectivenessEvent = { type: "custom", customValue: -15 };
    const newEff = updateEffectiveness(80, event);
    expect(newEff).toBe(65);
  });

  it("clamps result to valid range", () => {
    const victoryEvent: EffectivenessEvent = { type: "combat", outcome: "victory" };
    expect(updateEffectiveness(98, victoryEvent, 1)).toBe(100);

    const defeatEvent: EffectivenessEvent = { type: "combat", outcome: "defeat" };
    expect(updateEffectiveness(3, defeatEvent)).toBe(0);
  });
});

describe("calculateCombatModifier", () => {
  it("returns 1.0 for 100% effectiveness", () => {
    expect(calculateCombatModifier(100)).toBe(1.0);
  });

  it("returns 0.0 for 0% effectiveness", () => {
    expect(calculateCombatModifier(0)).toBe(0.0);
  });

  it("returns 0.85 for default effectiveness", () => {
    expect(calculateCombatModifier(EFFECTIVENESS_DEFAULT)).toBe(0.85);
  });

  it("returns proportional modifier", () => {
    expect(calculateCombatModifier(50)).toBe(0.5);
    expect(calculateCombatModifier(75)).toBe(0.75);
  });

  it("clamps out-of-range values", () => {
    expect(calculateCombatModifier(-10)).toBe(0.0);
    expect(calculateCombatModifier(150)).toBe(1.0);
  });
});

describe("calculateEffectivePower", () => {
  it("returns full power at 100% effectiveness", () => {
    expect(calculateEffectivePower(1000, 100)).toBe(1000);
  });

  it("returns 0 at 0% effectiveness", () => {
    expect(calculateEffectivePower(1000, 0)).toBe(0);
  });

  it("returns scaled power at default effectiveness", () => {
    expect(calculateEffectivePower(1000, 85)).toBe(850);
  });

  it("handles fractional power correctly", () => {
    expect(calculateEffectivePower(100, 50)).toBe(50);
    expect(calculateEffectivePower(100, 33)).toBeCloseTo(33, 1);
  });
});

describe("calculateRecoveryTurns", () => {
  it("returns 0 when already at or above target", () => {
    expect(calculateRecoveryTurns(100, 100)).toBe(0);
    expect(calculateRecoveryTurns(90, 80)).toBe(0);
  });

  it("calculates correct turns for small gap", () => {
    // 80 to 82 = 2 points / 2 per turn = 1 turn
    expect(calculateRecoveryTurns(80, 82)).toBe(1);
  });

  it("calculates correct turns for larger gap", () => {
    // 50 to 100 = 50 points / 2 per turn = 25 turns
    expect(calculateRecoveryTurns(50, 100)).toBe(25);
  });

  it("rounds up partial turns", () => {
    // 80 to 83 = 3 points / 2 per turn = 2 turns (ceil)
    expect(calculateRecoveryTurns(80, 83)).toBe(2);
  });
});

describe("constants", () => {
  it("has correct PRD values", () => {
    expect(EFFECTIVENESS_MAX).toBe(100);
    expect(EFFECTIVENESS_MIN).toBe(0);
    expect(EFFECTIVENESS_DEFAULT).toBe(85);
    expect(EFFECTIVENESS_RECOVERY_RATE).toBe(2);
    expect(EFFECTIVENESS_VICTORY_BONUS_MIN).toBe(5);
    expect(EFFECTIVENESS_VICTORY_BONUS_MAX).toBe(10);
    expect(EFFECTIVENESS_DEFEAT_PENALTY).toBe(5);
    expect(EFFECTIVENESS_UNPAID_PENALTY).toBe(10);
  });
});
