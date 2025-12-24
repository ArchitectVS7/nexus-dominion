import { describe, it, expect } from "vitest";
import {
  UNIT_TYPES,
  UNIT_COSTS,
  UNIT_POPULATION,
  UNIT_ATTACK,
  UNIT_DEFENSE,
  UNIT_LABELS,
  UNIT_DESCRIPTIONS,
  calculateUnitPurchaseCost,
  calculateUnitPopulationCost,
  calculateUnitMaintenanceCost,
  calculateAffordableUnits,
  calculateTrainableUnits,
} from "./unit-config";

describe("UNIT_COSTS (PRD 6.1)", () => {
  it("has correct soldier cost", () => {
    expect(UNIT_COSTS.soldiers).toBe(50);
  });

  it("has correct fighter cost", () => {
    expect(UNIT_COSTS.fighters).toBe(200);
  });

  it("has correct station cost", () => {
    expect(UNIT_COSTS.stations).toBe(5_000);
  });

  it("has correct light cruiser cost", () => {
    expect(UNIT_COSTS.lightCruisers).toBe(500);
  });

  it("has correct heavy cruiser cost", () => {
    expect(UNIT_COSTS.heavyCruisers).toBe(1_000);
  });

  it("has correct carrier cost", () => {
    expect(UNIT_COSTS.carriers).toBe(2_500);
  });

  it("has correct covert agent cost", () => {
    expect(UNIT_COSTS.covertAgents).toBe(4_090);
  });
});

describe("UNIT_POPULATION (PRD 6.1)", () => {
  it("has correct soldier population", () => {
    expect(UNIT_POPULATION.soldiers).toBe(0.2);
  });

  it("has correct fighter population", () => {
    expect(UNIT_POPULATION.fighters).toBe(0.4);
  });

  it("has correct station population", () => {
    expect(UNIT_POPULATION.stations).toBe(0.5);
  });

  it("has correct light cruiser population", () => {
    expect(UNIT_POPULATION.lightCruisers).toBe(1.0);
  });

  it("has correct heavy cruiser population", () => {
    expect(UNIT_POPULATION.heavyCruisers).toBe(2.0);
  });

  it("has correct carrier population", () => {
    expect(UNIT_POPULATION.carriers).toBe(3.0);
  });

  it("has correct covert agent population", () => {
    expect(UNIT_POPULATION.covertAgents).toBe(1.0);
  });
});

describe("UNIT_ATTACK (PRD 6.1)", () => {
  it("has correct soldier attack", () => {
    expect(UNIT_ATTACK.soldiers).toBe(1);
  });

  it("has correct fighter attack", () => {
    expect(UNIT_ATTACK.fighters).toBe(3);
  });

  it("has correct station attack", () => {
    expect(UNIT_ATTACK.stations).toBe(50);
  });

  it("has correct light cruiser attack", () => {
    expect(UNIT_ATTACK.lightCruisers).toBe(5);
  });

  it("has correct heavy cruiser attack", () => {
    expect(UNIT_ATTACK.heavyCruisers).toBe(8);
  });

  it("has correct carrier attack", () => {
    expect(UNIT_ATTACK.carriers).toBe(12);
  });
});

describe("UNIT_DEFENSE (PRD 6.1)", () => {
  it("has correct soldier defense", () => {
    expect(UNIT_DEFENSE.soldiers).toBe(1);
  });

  it("has correct fighter defense", () => {
    expect(UNIT_DEFENSE.fighters).toBe(2);
  });

  it("has correct station defense", () => {
    expect(UNIT_DEFENSE.stations).toBe(50);
  });

  it("has correct light cruiser defense", () => {
    expect(UNIT_DEFENSE.lightCruisers).toBe(4);
  });

  it("has correct heavy cruiser defense", () => {
    expect(UNIT_DEFENSE.heavyCruisers).toBe(6);
  });

  it("has correct carrier defense", () => {
    expect(UNIT_DEFENSE.carriers).toBe(10);
  });
});

describe("UNIT_TYPES", () => {
  it("has all 7 unit types", () => {
    expect(UNIT_TYPES).toHaveLength(7);
  });

  it("includes all expected types", () => {
    expect(UNIT_TYPES).toContain("soldiers");
    expect(UNIT_TYPES).toContain("fighters");
    expect(UNIT_TYPES).toContain("stations");
    expect(UNIT_TYPES).toContain("lightCruisers");
    expect(UNIT_TYPES).toContain("heavyCruisers");
    expect(UNIT_TYPES).toContain("carriers");
    expect(UNIT_TYPES).toContain("covertAgents");
  });
});

describe("UNIT_LABELS", () => {
  it("has labels for all unit types", () => {
    for (const unitType of UNIT_TYPES) {
      expect(UNIT_LABELS[unitType]).toBeDefined();
      expect(typeof UNIT_LABELS[unitType]).toBe("string");
    }
  });
});

describe("UNIT_DESCRIPTIONS", () => {
  it("has descriptions for all unit types", () => {
    for (const unitType of UNIT_TYPES) {
      expect(UNIT_DESCRIPTIONS[unitType]).toBeDefined();
      expect(typeof UNIT_DESCRIPTIONS[unitType]).toBe("string");
    }
  });
});

describe("calculateUnitPurchaseCost", () => {
  it("calculates cost for single unit", () => {
    expect(calculateUnitPurchaseCost("soldiers", 1)).toBe(50);
    expect(calculateUnitPurchaseCost("carriers", 1)).toBe(2_500);
  });

  it("calculates cost for multiple units", () => {
    expect(calculateUnitPurchaseCost("soldiers", 100)).toBe(5_000);
    expect(calculateUnitPurchaseCost("fighters", 50)).toBe(10_000);
  });

  it("returns 0 for 0 quantity", () => {
    expect(calculateUnitPurchaseCost("soldiers", 0)).toBe(0);
  });
});

describe("calculateUnitPopulationCost", () => {
  it("calculates population for single unit", () => {
    expect(calculateUnitPopulationCost("soldiers", 1)).toBe(0.2);
    expect(calculateUnitPopulationCost("carriers", 1)).toBe(3.0);
  });

  it("calculates population for multiple units", () => {
    expect(calculateUnitPopulationCost("soldiers", 100)).toBe(20);
    expect(calculateUnitPopulationCost("fighters", 50)).toBe(20);
  });
});

describe("calculateUnitMaintenanceCost", () => {
  it("calculates maintenance for single unit", () => {
    expect(calculateUnitMaintenanceCost("soldiers", 1)).toBe(0.5);
    expect(calculateUnitMaintenanceCost("carriers", 1)).toBe(25);
  });

  it("calculates maintenance for multiple units", () => {
    expect(calculateUnitMaintenanceCost("soldiers", 100)).toBe(50);
    expect(calculateUnitMaintenanceCost("stations", 10)).toBe(500);
  });
});

describe("calculateAffordableUnits", () => {
  it("calculates affordable soldiers", () => {
    expect(calculateAffordableUnits("soldiers", 500)).toBe(10);
    expect(calculateAffordableUnits("soldiers", 499)).toBe(9);
  });

  it("calculates affordable carriers", () => {
    expect(calculateAffordableUnits("carriers", 10_000)).toBe(4);
  });

  it("returns 0 for insufficient credits", () => {
    expect(calculateAffordableUnits("carriers", 2_499)).toBe(0);
  });

  it("returns 0 for 0 or negative credits", () => {
    expect(calculateAffordableUnits("soldiers", 0)).toBe(0);
    expect(calculateAffordableUnits("soldiers", -100)).toBe(0);
  });
});

describe("calculateTrainableUnits", () => {
  it("calculates trainable soldiers", () => {
    expect(calculateTrainableUnits("soldiers", 10)).toBe(50);
  });

  it("calculates trainable carriers", () => {
    expect(calculateTrainableUnits("carriers", 15)).toBe(5);
  });

  it("returns 0 for insufficient population", () => {
    expect(calculateTrainableUnits("carriers", 2.9)).toBe(0);
  });

  it("returns 0 for 0 or negative population", () => {
    expect(calculateTrainableUnits("soldiers", 0)).toBe(0);
    expect(calculateTrainableUnits("soldiers", -100)).toBe(0);
  });
});
