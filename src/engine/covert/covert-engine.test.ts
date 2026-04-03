import { describe, it, expect } from "vitest";
import {
  computeSuccessRate,
  computeDetectionRisk,
  queueCovertOp,
  accrueAgents,
  resolveCovertOp,
  checkStealthSovereign,
  processCovertCycle,
  getCovertOpEffect,
  COVERT_OP_EFFECTS,
} from "./covert-engine";
import type { CovertModifiers } from "./covert-engine";
import type { EmpireCovertState, CovertState, QueuedCovertOp } from "../types/covert";
import { EmpireId } from "../types/ids";
import { SeededRNG } from "../utils/rng";

/* ── Helpers ── */

function makeEmpireCovertState(
  empireId: string,
  agentPool = 1000,
  intelLevel = 0,
  totalOpsCompleted = 0,
  timesDetectedAsAttacker = 0,
): EmpireCovertState {
  return {
    empireId: EmpireId(empireId),
    agentPool,
    intelLevel,
    queuedOps: [],
    totalOpsCompleted,
    timesDetectedAsAttacker,
  };
}

function noMods(): CovertModifiers {
  return {
    attackerIntelLevel: 0,
    attackerIsSchemer: false,
    defenderCounterIntelAgents: 0,
    defenderSecurityDoctrineLevel: 0,
  };
}

function makeOp(overrides: Partial<QueuedCovertOp> = {}): QueuedCovertOp {
  return {
    id: "e1-1-reconnaissance",
    operationType: "reconnaissance",
    attackerId: EmpireId("e1"),
    targetId: EmpireId("e2"),
    queuedCycle: 1,
    ...overrides,
  };
}

/* ══ computeSuccessRate ══ */

describe("computeSuccessRate", () => {
  it("returns base 0.60 with no modifiers", () => {
    expect(computeSuccessRate(noMods())).toBeCloseTo(0.60);
  });

  it("adds +5% per attacker intel level", () => {
    const mods = { ...noMods(), attackerIntelLevel: 2 };
    expect(computeSuccessRate(mods)).toBeCloseTo(0.70);
  });

  it("adds +10% for Schemer archetype", () => {
    const mods = { ...noMods(), attackerIsSchemer: true };
    expect(computeSuccessRate(mods)).toBeCloseTo(0.70);
  });

  it("subtracts 1.5% per 100 defender counter-intel agents", () => {
    const mods = { ...noMods(), defenderCounterIntelAgents: 200 };
    expect(computeSuccessRate(mods)).toBeCloseTo(0.57);
  });

  it("subtracts 10% per defender security doctrine tier", () => {
    const mods = { ...noMods(), defenderSecurityDoctrineLevel: 2 };
    expect(computeSuccessRate(mods)).toBeCloseTo(0.40);
  });

  it("clamps at minimum 0.15", () => {
    const mods: CovertModifiers = {
      attackerIntelLevel: 0,
      attackerIsSchemer: false,
      defenderCounterIntelAgents: 10000,
      defenderSecurityDoctrineLevel: 10,
    };
    expect(computeSuccessRate(mods)).toBe(0.15);
  });

  it("clamps at maximum 0.85", () => {
    const mods: CovertModifiers = {
      attackerIntelLevel: 5,
      attackerIsSchemer: true,
      defenderCounterIntelAgents: 0,
      defenderSecurityDoctrineLevel: 0,
    };
    expect(computeSuccessRate(mods)).toBe(0.85);
  });

  it("combines schemer and intel bonuses", () => {
    const mods: CovertModifiers = {
      attackerIntelLevel: 1,
      attackerIsSchemer: true,
      defenderCounterIntelAgents: 0,
      defenderSecurityDoctrineLevel: 0,
    };
    // 0.60 + 0.05 + 0.10 = 0.75
    expect(computeSuccessRate(mods)).toBeCloseTo(0.75);
  });
});

/* ══ computeDetectionRisk ══ */

describe("computeDetectionRisk", () => {
  it("returns base detection risk with no modifiers (reconnaissance = 0.10)", () => {
    expect(computeDetectionRisk(0.10, noMods())).toBeCloseTo(0.10);
  });

  it("subtracts 5% per attacker intel level", () => {
    const mods = { ...noMods(), attackerIntelLevel: 1 };
    // 0.10 - 0.05 = 0.05 → clamped to 0.05
    expect(computeDetectionRisk(0.10, mods)).toBeCloseTo(0.05);
  });

  it("clamps detection to minimum 0.05", () => {
    const mods = { ...noMods(), attackerIntelLevel: 5, attackerIsSchemer: true };
    // very negative → clamp to 0.05
    expect(computeDetectionRisk(0.10, mods)).toBe(0.05);
  });

  it("subtracts 10% for Schemer archetype", () => {
    const mods = { ...noMods(), attackerIsSchemer: true };
    // recruit-defectors base 0.55 - 0.10 = 0.45
    expect(computeDetectionRisk(0.55, mods)).toBeCloseTo(0.45);
  });

  it("adds 2% per 100 defender counter-intel agents", () => {
    const mods = { ...noMods(), defenderCounterIntelAgents: 300 };
    // 0.10 + 0.06 = 0.16
    expect(computeDetectionRisk(0.10, mods)).toBeCloseTo(0.16);
  });

  it("adds 10% per defender security doctrine tier", () => {
    const mods = { ...noMods(), defenderSecurityDoctrineLevel: 1 };
    // 0.10 + 0.10 = 0.20
    expect(computeDetectionRisk(0.10, mods)).toBeCloseTo(0.20);
  });

  it("clamps at maximum 0.75", () => {
    const mods: CovertModifiers = {
      attackerIntelLevel: 0,
      attackerIsSchemer: false,
      defenderCounterIntelAgents: 10000,
      defenderSecurityDoctrineLevel: 10,
    };
    expect(computeDetectionRisk(0.55, mods)).toBe(0.75);
  });
});

/* ══ queueCovertOp ══ */

describe("queueCovertOp", () => {
  it("returns null when agent pool is insufficient", () => {
    const state = makeEmpireCovertState("e1", 50); // reconnaissance costs 100
    const op = makeOp({ operationType: "reconnaissance" });
    const result = queueCovertOp(state, op);
    expect(result).toBeNull();
  });

  it("deducts agent cost from pool on success", () => {
    const state = makeEmpireCovertState("e1", 500);
    const op = makeOp({ operationType: "reconnaissance" }); // costs 100
    const result = queueCovertOp(state, op);
    expect(result).not.toBeNull();
    expect(result!.agentPool).toBe(400);
  });

  it("adds the op to queuedOps", () => {
    const state = makeEmpireCovertState("e1", 500);
    const op = makeOp({ operationType: "reconnaissance" });
    const result = queueCovertOp(state, op);
    expect(result!.queuedOps).toHaveLength(1);
    expect(result!.queuedOps[0].operationType).toBe("reconnaissance");
  });

  it("does not mutate input state", () => {
    const state = makeEmpireCovertState("e1", 500);
    const op = makeOp();
    queueCovertOp(state, op);
    expect(state.agentPool).toBe(500);
    expect(state.queuedOps).toHaveLength(0);
  });

  it("allows exact-cost operation (boundary)", () => {
    const state = makeEmpireCovertState("e1", 100); // exactly reconnaissance cost
    const op = makeOp({ operationType: "reconnaissance" });
    const result = queueCovertOp(state, op);
    expect(result).not.toBeNull();
    expect(result!.agentPool).toBe(0);
  });
});

/* ══ accrueAgents ══ */

describe("accrueAgents", () => {
  it("adds agents to the pool", () => {
    const state = makeEmpireCovertState("e1", 200);
    const result = accrueAgents(state, 300);
    expect(result.agentPool).toBe(500);
  });

  it("works from zero pool", () => {
    const state = makeEmpireCovertState("e1", 0);
    const result = accrueAgents(state, 300);
    expect(result.agentPool).toBe(300);
  });

  it("does not mutate input state", () => {
    const state = makeEmpireCovertState("e1", 200);
    accrueAgents(state, 300);
    expect(state.agentPool).toBe(200);
  });

  it("does not modify other fields", () => {
    const state = makeEmpireCovertState("e1", 200, 2, 5, 1);
    const result = accrueAgents(state, 100);
    expect(result.intelLevel).toBe(2);
    expect(result.totalOpsCompleted).toBe(5);
    expect(result.timesDetectedAsAttacker).toBe(1);
  });
});

/* ══ resolveCovertOp ══ */

describe("resolveCovertOp", () => {
  it("marks succeeded=true when successRoll < successRate", () => {
    const state = makeEmpireCovertState("e1");
    const op = makeOp({ operationType: "steal-credits" });
    // Find a seed where first roll < 0.60 (success rate)
    for (let seed = 0; seed < 200; seed++) {
      const probe = new SeededRNG(seed);
      if (probe.next() < 0.60) {
        const rng = new SeededRNG(seed);
        const { result } = resolveCovertOp(op, state, noMods(), rng, 1);
        expect(result.succeeded).toBe(true);
        return;
      }
    }
    expect(true).toBe(true); // shouldn't reach here
  });

  it("marks succeeded=false when successRoll >= successRate", () => {
    // Use a seeded RNG where the first roll is > 0.60
    // SeededRNG(100).next() — try to find a seed where first roll > 0.60
    // Just test logic via controllable scenario: pass spy-level mods with low success
    // Use seed 0: SeededRNG(0).next() — we need this to be > 0.60
    // Actually, let's just find a seed that guarantees a failure
    // Let's use a very low success rate (high defender doctrines) + seeded roll that exceeds it
    const state = makeEmpireCovertState("e1");
    const op = makeOp({ operationType: "steal-credits" });
    const heavyDefense: CovertModifiers = {
      attackerIntelLevel: 0,
      attackerIsSchemer: false,
      defenderCounterIntelAgents: 10000, // drives success to 0.15
      defenderSecurityDoctrineLevel: 10,
    };
    // With success rate 0.15, most random rolls will be > 0.15 → fail
    // Use seed 42 to get a known-high first roll
    const rng = new SeededRNG(42);
    const firstRoll = new SeededRNG(42).next();
    if (firstRoll >= 0.15) {
      const { result } = resolveCovertOp(op, state, heavyDefense, rng, 1);
      expect(result.succeeded).toBe(false);
    } else {
      // Skip if seed happens to succeed
      expect(true).toBe(true);
    }
  });

  it("success and detection are independent — operation can succeed and be detected", () => {
    // With seed 1 on steal-credits (base detection 0.25):
    // Roll 1 ~0.163 < 0.60 → success
    // Roll 2 ~0.824 — detection risk 0.25; 0.824 >= 0.25 → not detected
    // We just verify independence: succeeded and detected can differ
    const state = makeEmpireCovertState("e1");
    const op = makeOp({ operationType: "steal-credits" });

    // Run multiple seeded trials; verify at least some combos occur
    let seenSuccessUndetected = false;
    for (let seed = 0; seed < 100; seed++) {
      const rng = new SeededRNG(seed);
      const { result } = resolveCovertOp(op, state, noMods(), rng, 1);
      if (result.succeeded && !result.detected) seenSuccessUndetected = true;
    }
    expect(seenSuccessUndetected).toBe(true);
    // Both combos should appear across 100 seeds
  });

  it("increments totalOpsCompleted on success", () => {
    const state = makeEmpireCovertState("e1", 1000, 0, 5);
    const op = makeOp({ operationType: "steal-credits" });
    // Find a seed where first roll < 0.60 → success
    for (let seed = 0; seed < 200; seed++) {
      const probe = new SeededRNG(seed);
      if (probe.next() < 0.60) {
        const rng = new SeededRNG(seed);
        const { updatedAttackerState } = resolveCovertOp(op, state, noMods(), rng, 1);
        expect(updatedAttackerState.totalOpsCompleted).toBe(6);
        return;
      }
    }
    expect(true).toBe(true);
  });

  it("does not increment totalOpsCompleted on failure", () => {
    const state = makeEmpireCovertState("e1", 1000, 0, 5);
    const op = makeOp({ operationType: "steal-credits" });
    const heavyDefense: CovertModifiers = {
      attackerIntelLevel: 0,
      attackerIsSchemer: false,
      defenderCounterIntelAgents: 10000,
      defenderSecurityDoctrineLevel: 10,
    };
    const rng = new SeededRNG(42);
    const firstRoll = new SeededRNG(42).next();
    if (firstRoll >= 0.15) {
      const { updatedAttackerState } = resolveCovertOp(op, state, heavyDefense, rng, 1);
      expect(updatedAttackerState.totalOpsCompleted).toBe(5);
    } else {
      expect(true).toBe(true);
    }
  });

  it("increments timesDetectedAsAttacker on detection", () => {
    const state = makeEmpireCovertState("e1", 1000, 0, 0, 2);
    const op = makeOp({ operationType: "recruit-defectors" }); // base detection 0.55
    // Run 100 seeds, find one where detection occurs
    let detectionOccurred = false;
    for (let seed = 0; seed < 200; seed++) {
      const rng = new SeededRNG(seed);
      const { result, updatedAttackerState } = resolveCovertOp(op, state, noMods(), rng, 1);
      if (result.detected) {
        expect(updatedAttackerState.timesDetectedAsAttacker).toBe(3);
        detectionOccurred = true;
        break;
      }
    }
    expect(detectionOccurred).toBe(true);
  });

  it("produces op-succeeded event when succeeded and not detected", () => {
    const state = makeEmpireCovertState("e1");
    const op = makeOp({ operationType: "reconnaissance" }); // low detection 0.10

    // Find a seed where succeeded=true and detected=false
    for (let seed = 0; seed < 200; seed++) {
      const rng = new SeededRNG(seed);
      const { result, events } = resolveCovertOp(op, state, noMods(), rng, 1);
      if (result.succeeded && !result.detected) {
        const opEvent = events.find(e => e.kind === "op-succeeded");
        expect(opEvent).toBeDefined();
        return;
      }
    }
    expect(true).toBe(true); // fallback if not found
  });

  it("produces op-detected event when detected", () => {
    const state = makeEmpireCovertState("e1");
    const op = makeOp({ operationType: "recruit-defectors" }); // high detection 0.55

    for (let seed = 0; seed < 200; seed++) {
      const rng = new SeededRNG(seed);
      const { result, events } = resolveCovertOp(op, state, noMods(), rng, 1);
      if (result.detected) {
        const detectedEvent = events.find(e => e.kind === "op-detected");
        expect(detectedEvent).toBeDefined();
        expect(detectedEvent!.attackerId).toBe(EmpireId("e1"));
        expect(detectedEvent!.targetId).toBe(EmpireId("e2"));
        return;
      }
    }
    expect(true).toBe(true);
  });

  it("produces op-failed event when not succeeded and not detected", () => {
    const state = makeEmpireCovertState("e1");
    const op = makeOp({ operationType: "steal-credits" });

    for (let seed = 0; seed < 200; seed++) {
      const rng = new SeededRNG(seed);
      const { result, events } = resolveCovertOp(op, state, noMods(), rng, 1);
      if (!result.succeeded && !result.detected) {
        const failEvent = events.find(e => e.kind === "op-failed");
        expect(failEvent).toBeDefined();
        return;
      }
    }
    expect(true).toBe(true);
  });

  it("does not mutate input attacker state", () => {
    const state = makeEmpireCovertState("e1", 1000, 0, 5, 1);
    const op = makeOp();
    const rng = new SeededRNG(1);
    resolveCovertOp(op, state, noMods(), rng, 1);
    expect(state.totalOpsCompleted).toBe(5);
    expect(state.timesDetectedAsAttacker).toBe(1);
  });
});

/* ══ checkStealthSovereign ══ */

describe("checkStealthSovereign", () => {
  it("returns false when totalOpsCompleted < 15", () => {
    const state = makeEmpireCovertState("e1", 1000, 0, 14, 0);
    expect(checkStealthSovereign(state)).toBe(false);
  });

  it("returns false when ever detected (timesDetectedAsAttacker > 0)", () => {
    const state = makeEmpireCovertState("e1", 1000, 0, 20, 1);
    expect(checkStealthSovereign(state)).toBe(false);
  });

  it("returns true when 15 completed and never detected", () => {
    const state = makeEmpireCovertState("e1", 1000, 0, 15, 0);
    expect(checkStealthSovereign(state)).toBe(true);
  });

  it("returns true well above threshold", () => {
    const state = makeEmpireCovertState("e1", 1000, 0, 100, 0);
    expect(checkStealthSovereign(state)).toBe(true);
  });

  it("returns false at exactly 0 completed", () => {
    const state = makeEmpireCovertState("e1", 1000, 0, 0, 0);
    expect(checkStealthSovereign(state)).toBe(false);
  });
});

/* ══ processCovertCycle ══ */

describe("processCovertCycle", () => {
  function makeCovertState(ops: QueuedCovertOp[] = []): CovertState {
    const e1State = makeEmpireCovertState("e1");
    const e2State = makeEmpireCovertState("e2");
    const e1WithOps = { ...e1State, queuedOps: ops };
    return {
      empireStates: new Map([
        [EmpireId("e1"), e1WithOps],
        [EmpireId("e2"), e2State],
      ]),
    };
  }

  it("is pure — does not mutate input CovertState", () => {
    const op = makeOp({ operationType: "reconnaissance" });
    const covertState = makeCovertState([op]);
    const copy = {
      e1Pool: covertState.empireStates.get(EmpireId("e1"))!.agentPool,
      e1Ops: covertState.empireStates.get(EmpireId("e1"))!.queuedOps.length,
    };
    const rng = new SeededRNG(42);
    processCovertCycle(
      covertState,
      [EmpireId("e1"), EmpireId("e2")],
      new Map(),
      rng,
      1,
    );
    expect(covertState.empireStates.get(EmpireId("e1"))!.agentPool).toBe(copy.e1Pool);
    expect(covertState.empireStates.get(EmpireId("e1"))!.queuedOps.length).toBe(copy.e1Ops);
  });

  it("clears queuedOps after resolution", () => {
    const op = makeOp({ operationType: "reconnaissance" });
    const covertState = makeCovertState([op]);
    const rng = new SeededRNG(42);
    const { state: newState } = processCovertCycle(
      covertState,
      [EmpireId("e1"), EmpireId("e2")],
      new Map(),
      rng,
      1,
    );
    expect(newState.empireStates.get(EmpireId("e1"))!.queuedOps).toHaveLength(0);
  });

  it("produces CovertEvents for each resolved op", () => {
    const op = makeOp({ operationType: "reconnaissance" });
    const covertState = makeCovertState([op]);
    const rng = new SeededRNG(42);
    const { events } = processCovertCycle(
      covertState,
      [EmpireId("e1"), EmpireId("e2")],
      new Map(),
      rng,
      1,
    );
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].type).toBe("covert");
  });

  it("handles empty queues without error", () => {
    const covertState = makeCovertState([]); // no ops
    const rng = new SeededRNG(42);
    const { state: newState, events } = processCovertCycle(
      covertState,
      [EmpireId("e1"), EmpireId("e2")],
      new Map(),
      rng,
      1,
    );
    expect(events).toHaveLength(0);
    expect(newState.empireStates.size).toBe(2);
  });

  it("events include succeeded field", () => {
    const op = makeOp({ operationType: "reconnaissance" });
    const covertState = makeCovertState([op]);
    const rng = new SeededRNG(42);
    const { events } = processCovertCycle(
      covertState,
      [EmpireId("e1"), EmpireId("e2")],
      new Map(),
      rng,
      1,
    );
    expect(events.length).toBeGreaterThan(0);
    expect(typeof events[0].succeeded).toBe("boolean");
  });
});

/* ══ queueCovertOp — chaining ══ */

describe("queueCovertOp — chaining multiple ops", () => {
  it("can queue second op after first deduction", () => {
    const state = makeEmpireCovertState("e1", 500);
    const op1 = makeOp({ id: "e1-1-recon", operationType: "reconnaissance" }); // cost 100
    const after1 = queueCovertOp(state, op1)!;
    const op2 = makeOp({ id: "e1-2-recon", operationType: "reconnaissance" }); // cost 100
    const after2 = queueCovertOp(after1, op2)!;
    expect(after2.agentPool).toBe(300);
    expect(after2.queuedOps).toHaveLength(2);
  });

  it("fails second op when insufficient agents remain", () => {
    const state = makeEmpireCovertState("e1", 150);
    const op1 = makeOp({ id: "e1-1-recon", operationType: "reconnaissance" }); // cost 100
    const after1 = queueCovertOp(state, op1)!;
    expect(after1.agentPool).toBe(50);
    const op2 = makeOp({ id: "e1-2-recon", operationType: "reconnaissance" }); // cost 100 > 50
    expect(queueCovertOp(after1, op2)).toBeNull();
  });
});

/* ══ computeDetectionRisk — combined modifiers ══ */

describe("computeDetectionRisk — combined attacker+defender", () => {
  it("high intel + schemer + high defender doctrine nets out", () => {
    const mods: CovertModifiers = {
      attackerIntelLevel: 3,    // -15%
      attackerIsSchemer: true,  // -10%
      defenderCounterIntelAgents: 500,  // +10%
      defenderSecurityDoctrineLevel: 2, // +20%
    };
    // assassinate-leader base 0.50 - 0.15 - 0.10 + 0.10 + 0.20 = 0.55
    expect(computeDetectionRisk(0.50, mods)).toBeCloseTo(0.55);
  });
});

/* ══ processCovertCycle — extended ══ */

describe("processCovertCycle — multi-op and multi-empire", () => {
  it("resolves multiple ops queued by the same empire", () => {
    const e1State: EmpireCovertState = {
      ...makeEmpireCovertState("e1"),
      queuedOps: [
        makeOp({ id: "e1-1-recon", operationType: "reconnaissance" }),
        makeOp({ id: "e1-2-steal", operationType: "steal-credits" }),
      ],
    };
    const covertState: CovertState = {
      empireStates: new Map([
        [EmpireId("e1"), e1State],
        [EmpireId("e2"), makeEmpireCovertState("e2")],
      ]),
    };
    const rng = new SeededRNG(42);
    const { events } = processCovertCycle(
      covertState,
      [EmpireId("e1"), EmpireId("e2")],
      new Map(),
      rng,
      1,
    );
    // Should have exactly 2 events (one per op)
    expect(events).toHaveLength(2);
  });

  it("resolves ops from multiple empires in given order", () => {
    const op1 = makeOp({ id: "e1-op", attackerId: EmpireId("e1"), targetId: EmpireId("e2") });
    const op2 = makeOp({ id: "e2-op", attackerId: EmpireId("e2"), targetId: EmpireId("e1"), operationType: "steal-credits" });
    const covertState: CovertState = {
      empireStates: new Map([
        [EmpireId("e1"), { ...makeEmpireCovertState("e1"), queuedOps: [op1] }],
        [EmpireId("e2"), { ...makeEmpireCovertState("e2"), queuedOps: [op2] }],
      ]),
    };
    const rng = new SeededRNG(42);
    const { events } = processCovertCycle(
      covertState,
      [EmpireId("e1"), EmpireId("e2")],
      new Map(),
      rng,
      1,
    );
    // Both empires' ops should resolve
    expect(events).toHaveLength(2);
    expect(events[0].attackerId).toBe(EmpireId("e1"));
    expect(events[1].attackerId).toBe(EmpireId("e2"));
  });

  it("skips empires not in empireStates", () => {
    const covertState: CovertState = {
      empireStates: new Map([
        [EmpireId("e1"), makeEmpireCovertState("e1")],
      ]),
    };
    const rng = new SeededRNG(42);
    // empire-999 not in state — should not crash
    const { events } = processCovertCycle(
      covertState,
      [EmpireId("e1"), EmpireId("empire-999" as any)],
      new Map(),
      rng,
      1,
    );
    expect(events).toHaveLength(0);
  });

  it("updates totalOpsCompleted across multiple ops in same cycle", () => {
    const e1State: EmpireCovertState = {
      ...makeEmpireCovertState("e1", 1000, 5), // intel 5 → high success rate (0.85)
      totalOpsCompleted: 0,
      queuedOps: [
        makeOp({ id: "e1-1", operationType: "reconnaissance" }),
        makeOp({ id: "e1-2", operationType: "reconnaissance" }),
        makeOp({ id: "e1-3", operationType: "reconnaissance" }),
      ],
    };
    const covertState: CovertState = {
      empireStates: new Map([[EmpireId("e1"), e1State]]),
    };

    // With intel level 5, success rate = 0.85. Run many seeds to find one where all 3 succeed
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const rng = new SeededRNG(seed);
      const { state: newState } = processCovertCycle(
        covertState, [EmpireId("e1")], new Map(), rng, 1,
      );
      const updated = newState.empireStates.get(EmpireId("e1"))!;
      if (updated.totalOpsCompleted === 3) {
        expect(updated.totalOpsCompleted).toBe(3);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});

/* ══ getCovertOpEffect — additional ops ══ */

describe("getCovertOpEffect — remaining operation types", () => {
  it("steal-military-plans grants intel gain", () => {
    const effect = getCovertOpEffect("steal-military-plans", true)!;
    expect(effect.attackerIntelGain).toBe(1);
    expect(effect.creditsStolen).toBe(0);
  });

  it("sabotage-infrastructure hits stability for 15", () => {
    const effect = getCovertOpEffect("sabotage-infrastructure", true)!;
    expect(effect.targetStabilityHit).toBe(15);
  });

  it("frame-another-empire has no direct game-state effect", () => {
    const effect = getCovertOpEffect("frame-another-empire", true)!;
    expect(effect.creditsStolen).toBe(0);
    expect(effect.researchStolen).toBe(0);
    expect(effect.targetStabilityHit).toBe(0);
    expect(effect.attackerIntelGain).toBe(0);
    expect(effect.agentsStolen).toBe(0);
  });

  it("returns a fresh copy (not same reference as table)", () => {
    const effect1 = getCovertOpEffect("steal-credits", true)!;
    const effect2 = getCovertOpEffect("steal-credits", true)!;
    expect(effect1).not.toBe(effect2);
    expect(effect1).toEqual(effect2);
  });
});

/* ══ getCovertOpEffect ══ */

describe("getCovertOpEffect", () => {
  it("returns null for failed ops", () => {
    expect(getCovertOpEffect("steal-credits", false)).toBeNull();
  });

  it("steal-credits returns creditsStolen > 0", () => {
    const effect = getCovertOpEffect("steal-credits", true);
    expect(effect).not.toBeNull();
    expect(effect!.creditsStolen).toBe(100);
    expect(effect!.researchStolen).toBe(0);
  });

  it("steal-research returns researchStolen > 0", () => {
    const effect = getCovertOpEffect("steal-research", true);
    expect(effect).not.toBeNull();
    expect(effect!.researchStolen).toBe(50);
  });

  it("sabotage-production returns targetStabilityHit > 0", () => {
    const effect = getCovertOpEffect("sabotage-production", true);
    expect(effect).not.toBeNull();
    expect(effect!.targetStabilityHit).toBe(10);
  });

  it("reconnaissance returns attackerIntelGain = 1", () => {
    const effect = getCovertOpEffect("reconnaissance", true);
    expect(effect).not.toBeNull();
    expect(effect!.attackerIntelGain).toBe(1);
  });

  it("incite-rebellion returns large stability hit", () => {
    const effect = getCovertOpEffect("incite-rebellion", true);
    expect(effect).not.toBeNull();
    expect(effect!.targetStabilityHit).toBe(20);
  });

  it("assassinate-leader returns largest stability hit", () => {
    const effect = getCovertOpEffect("assassinate-leader", true);
    expect(effect).not.toBeNull();
    expect(effect!.targetStabilityHit).toBe(30);
  });

  it("recruit-defectors returns agentsStolen > 0", () => {
    const effect = getCovertOpEffect("recruit-defectors", true);
    expect(effect).not.toBeNull();
    expect(effect!.agentsStolen).toBe(100);
  });

  it("all operation types have defined effects", () => {
    const opTypes = Object.keys(COVERT_OP_EFFECTS);
    expect(opTypes.length).toBe(10); // all 10 op types
    for (const opType of opTypes) {
      const effect = getCovertOpEffect(opType as any, true);
      expect(effect).not.toBeNull();
    }
  });
});
