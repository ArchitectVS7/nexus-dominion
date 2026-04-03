import { describe, it, expect } from "vitest";
import {
  computeCosmicOrder,
  getResolutionOrder,
  rollingAveragePowerScores,
  advanceCycle,
  calculateWeightOfDominion,
  checkConvergenceAlerts,
} from "./nexus-engine";
import type { Empire } from "../types/empire";
import type { TimeState } from "../types/time";
import { EmpireId } from "../types/ids";
import { CYCLES_PER_CONFLUENCE } from "../types/time";

function makeEmpire(id: string, powerScore: number): Empire {
  return {
    id: EmpireId(id),
    name: id,
    colour: "#000",
    isPlayer: false,
    systemIds: [],
    homeSystemId: "sys-0" as any,
    resources: { credits: 0, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 },
    stabilityScore: 50,
    stabilityLevel: "content",
    population: 1000,
    populationCapacity: 2000,
    fleetIds: [],
    researchTier: 0,
    powerScore,
  };
}

function makeEmpires(count: number): Map<string, Empire> {
  const m = new Map<string, Empire>();
  for (let i = 0; i < count; i++) {
    const id = `empire-${i}`;
    m.set(id, makeEmpire(id, (count - i) * 10)); // descending power
  }
  return m as any;
}

describe("Nexus Engine", () => {
  // REQ-004: Cosmic Order governs resolution order
  describe("REQ-004: Cosmic Order tier assignment", () => {
    it("assigns top 20% to Sovereign tier", () => {
      const empires = makeEmpires(100);
      const order = computeCosmicOrder(empires as any);
      const sovereign = [...order.tiers.entries()].filter(([, t]) => t === "sovereign");
      expect(sovereign.length).toBe(20);
    });

    it("assigns bottom 20% to Stricken tier", () => {
      const empires = makeEmpires(100);
      const order = computeCosmicOrder(empires as any);
      const stricken = [...order.tiers.entries()].filter(([, t]) => t === "stricken");
      expect(stricken.length).toBe(20);
    });

    it("assigns middle 60% to Ascendant tier", () => {
      const empires = makeEmpires(100);
      const order = computeCosmicOrder(empires as any);
      const ascendant = [...order.tiers.entries()].filter(([, t]) => t === "ascendant");
      expect(ascendant.length).toBe(60);
    });

    it("highest power empire is Sovereign", () => {
      const empires = makeEmpires(10);
      const order = computeCosmicOrder(empires as any);
      expect(order.tiers.get(EmpireId("empire-0"))).toBe("sovereign");
    });

    it("lowest power empire is Stricken", () => {
      const empires = makeEmpires(10);
      const order = computeCosmicOrder(empires as any);
      expect(order.tiers.get(EmpireId("empire-9"))).toBe("stricken");
    });
  });

  describe("REQ-004: Resolution order", () => {
    it("Stricken resolves before Ascendant before Sovereign", () => {
      const empires = makeEmpires(10);
      const order = computeCosmicOrder(empires as any);
      const identity = <T>(arr: T[]) => arr; // no shuffle for determinism
      const resolution = getResolutionOrder(order, identity);

      // First 2 should be Stricken, last 2 Sovereign
      expect(order.tiers.get(resolution[0])).toBe("stricken");
      expect(order.tiers.get(resolution[1])).toBe("stricken");
      expect(order.tiers.get(resolution[resolution.length - 1])).toBe("sovereign");
      expect(order.tiers.get(resolution[resolution.length - 2])).toBe("sovereign");
    });

    it("includes all empires in resolution order", () => {
      const empires = makeEmpires(100);
      const order = computeCosmicOrder(empires as any);
      const resolution = getResolutionOrder(order, (a) => a);
      expect(resolution.length).toBe(100);
    });
  });

  // REQ-005: Nexus Reckoning every 10 cycles, rolling 5-cycle average
  describe("REQ-005: Nexus Reckoning", () => {
    it("fires at the end of every 10th cycle", () => {
      const empires = makeEmpires(10);
      const powerHistory = new Map<string, number[]>();
      for (const [id, emp] of empires) {
        powerHistory.set(id, [emp.powerScore]);
      }

      let time: TimeState = {
        currentCycle: 0,
        currentConfluence: 1,
        cyclesUntilReckoning: CYCLES_PER_CONFLUENCE,
        cosmicOrder: computeCosmicOrder(empires as any),
      };

      const reckoningCycles: number[] = [];
      for (let i = 0; i < 30; i++) {
        const result = advanceCycle(time, empires as any, powerHistory as any);
        time = result.time;
        if (result.reckoningEvent) {
          reckoningCycles.push(result.reckoningEvent.cycle);
        }
      }

      expect(reckoningCycles).toEqual([10, 20, 30]);
    });

    it("uses rolling 5-cycle average, not instantaneous score", () => {
      const powerHistory = new Map<string, number[]>();

      // Empire-0 had high power for 4 cycles but low on the 5th
      powerHistory.set("empire-0", [100, 100, 100, 100, 10]);
      // Empire-4 had low power for 4 cycles but high on the 5th
      powerHistory.set("empire-4", [10, 10, 10, 10, 100]);
      // Fill others
      powerHistory.set("empire-1", [50, 50, 50, 50, 50]);
      powerHistory.set("empire-2", [40, 40, 40, 40, 40]);
      powerHistory.set("empire-3", [30, 30, 30, 30, 30]);

      const avgScores = rollingAveragePowerScores(powerHistory as any, 5);

      // Empire-0 avg = (100+100+100+100+10)/5 = 82
      expect(avgScores.get("empire-0" as any)).toBeCloseTo(82);
      // Empire-4 avg = (10+10+10+10+100)/5 = 28
      expect(avgScores.get("empire-4" as any)).toBeCloseTo(28);
    });
  });

  // REQ-006: Nexus Reckoning is a surfaced game event
  describe("REQ-006: Reckoning as game event", () => {
    it("produces a ReckoningEvent with cosmic order", () => {
      const empires = makeEmpires(10);
      const powerHistory = new Map<string, number[]>();
      for (const [id, emp] of empires) {
        powerHistory.set(id, [emp.powerScore]);
      }

      let time: TimeState = {
        currentCycle: 9,
        currentConfluence: 1,
        cyclesUntilReckoning: 1,
        cosmicOrder: computeCosmicOrder(empires as any),
      };

      const result = advanceCycle(time, empires as any, powerHistory as any);
      expect(result.reckoningEvent).not.toBeNull();
      expect(result.reckoningEvent!.type).toBe("reckoning");
      expect(result.reckoningEvent!.cosmicOrder.tiers.size).toBe(10);
      expect(result.reckoningEvent!.confluence).toBe(1);
    });

    it("does not produce event on non-reckoning cycles", () => {
      const empires = makeEmpires(10);
      const powerHistory = new Map<string, number[]>();
      for (const [id, emp] of empires) {
        powerHistory.set(id, [emp.powerScore]);
      }

      let time: TimeState = {
        currentCycle: 5,
        currentConfluence: 1,
        cyclesUntilReckoning: 5,
        cosmicOrder: computeCosmicOrder(empires as any),
      };

      const result = advanceCycle(time, empires as any, powerHistory as any);
      expect(result.reckoningEvent).toBeNull();
    });
  });

  describe("Weight of Dominion", () => {
    it("Sovereign pays 1.15x maintenance multiplier", () => {
      expect(calculateWeightOfDominion("sovereign")).toBe(1.15);
    });

    it("Stricken gets 0.85x maintenance discount", () => {
      expect(calculateWeightOfDominion("stricken")).toBe(0.85);
    });

    it("Ascendant has no modifier", () => {
      expect(calculateWeightOfDominion("ascendant")).toBe(1.0);
    });
  });

  describe("Convergence Alerts", () => {
    it("fires when empire reaches 80% of conquest threshold (75 systems → 60)", () => {
      const empires = makeEmpires(5);
      const bigEmpire = empires.get("empire-0" as any)!;
      bigEmpire.systemIds = Array.from({ length: 62 }, (_, i) => `sys-${i}` as any);

      const alerts = checkConvergenceAlerts(empires as any, 250);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe("convergence-alert");
      expect(alerts[0].empireId).toBe(EmpireId("empire-0"));
    });

    it("does not fire below 80% threshold", () => {
      const empires = makeEmpires(5);
      const empireSmall = empires.get("empire-0" as any)!;
      empireSmall.systemIds = Array.from({ length: 20 }, (_, i) => `sys-${i}` as any);

      const alerts = checkConvergenceAlerts(empires as any, 250);
      expect(alerts.length).toBe(0);
    });

    it("fires for research singularity at tier 7 (80% of 8)", () => {
      const empires = makeEmpires(5);
      const techEmpire = empires.get("empire-0" as any)!;
      techEmpire.researchTier = 7;

      const alerts = checkConvergenceAlerts(empires as any, 250);
      const researchAlert = alerts.find(a => a.achievementId === "singularity");
      expect(researchAlert).toBeDefined();
    });
  });
});
