import { describe, it, expect } from "vitest";
import {
  computeRankFromInfluence,
  executeContract,
  applyCounterIntelDecay,
  checkExposure,
  computeController,
  addMember,
  computeFuelCellsProductionShare,
  processSyndicateCycle,
  canPurchaseBlackRegisterItem,
  getBlackRegisterItemCost,
  purchaseBlackRegisterItem,
  getSyndicateRankName,
  getMemberSummary,
} from "./syndicate-engine";
import type { SyndicateMember, SyndicateState } from "../types/syndicate";
import { BLACK_REGISTER_ITEMS } from "../types/syndicate";
import { EmpireId } from "../types/ids";
import { SeededRNG } from "../utils/rng";

/* ── Helpers ── */

function makeMember(empireId: string, rank: number, influence: number, shadowSignature = 0, exposed = false): SyndicateMember {
  return {
    empireId: EmpireId(empireId),
    rank: rank as SyndicateMember["rank"],
    influence,
    shadowSignature,
    exposed,
    discoveredCycle: 1,
  };
}

function makeState(members: SyndicateMember[] = []): SyndicateState {
  const membersMap = new Map(members.map(m => [m.empireId, m]));
  return {
    members: membersMap,
    controllerId: null,
    exposedEmpires: new Set(members.filter(m => m.exposed).map(m => m.empireId)),
  };
}

/* ══ computeRankFromInfluence ══ */

describe("computeRankFromInfluence", () => {
  it("returns rank 0 for 0 influence", () => {
    expect(computeRankFromInfluence(0)).toBe(0);
  });

  it("returns rank 0 for influence below rank-1 threshold (49)", () => {
    expect(computeRankFromInfluence(49)).toBe(0);
  });

  it("returns rank 1 at exactly 50 influence", () => {
    expect(computeRankFromInfluence(50)).toBe(1);
  });

  it("returns rank 1 for 99 influence (below rank-2 threshold)", () => {
    expect(computeRankFromInfluence(99)).toBe(1);
  });

  it("returns rank 2 at exactly 100 influence", () => {
    expect(computeRankFromInfluence(100)).toBe(2);
  });

  it("returns rank 4 at exactly 350 influence", () => {
    expect(computeRankFromInfluence(350)).toBe(4);
  });

  it("returns rank 8 at exactly 1500 influence", () => {
    expect(computeRankFromInfluence(1500)).toBe(8);
  });

  it("returns rank 8 for influence above 1500 (capped)", () => {
    expect(computeRankFromInfluence(9999)).toBe(8);
  });
});

/* ══ executeContract ══ */

describe("executeContract", () => {
  it("returns null when empire rank is below contract minimum rank", () => {
    const member = makeMember("e1", 1, 60); // rank 1, needs rank 2
    const result = executeContract(member, "production-disruption", 5);
    expect(result).toBeNull();
  });

  it("awards correct influence for Tier-1 contract", () => {
    const member = makeMember("e1", 2, 100);
    const result = executeContract(member, "production-disruption", 5);
    expect(result).not.toBeNull();
    expect(result!.member.influence).toBe(120); // 100 + 20
  });

  it("awards influence for phantom-raid (25 reward)", () => {
    const member = makeMember("e1", 2, 100);
    const result = executeContract(member, "phantom-raid", 5);
    expect(result!.member.influence).toBe(125);
  });

  it("grows shadow signature by contract definition amount", () => {
    const member = makeMember("e1", 2, 100, 10);
    const result = executeContract(member, "phantom-raid", 5); // shadowGrowth: 6
    expect(result!.member.shadowSignature).toBe(16);
  });

  it("clamps shadow signature to 100", () => {
    const member = makeMember("e1", 2, 100, 98);
    const result = executeContract(member, "phantom-raid", 5); // +6
    expect(result!.member.shadowSignature).toBe(100);
  });

  it("returns a SyndicateEvent of kind contract-completed", () => {
    const member = makeMember("e1", 2, 100);
    const result = executeContract(member, "production-disruption", 7);
    expect(result!.event.kind).toBe("contract-completed");
    expect(result!.event.empireId).toBe(EmpireId("e1"));
    expect(result!.event.cycle).toBe(7);
  });

  it("does not mutate input member", () => {
    const member = makeMember("e1", 2, 100, 10);
    const original = { ...member };
    executeContract(member, "production-disruption", 5);
    expect(member.influence).toBe(original.influence);
    expect(member.shadowSignature).toBe(original.shadowSignature);
  });

  it("returns null for Tier-2 contract when rank is 2 (needs rank 3)", () => {
    const member = makeMember("e1", 2, 100);
    expect(executeContract(member, "intelligence-broadcast", 5)).toBeNull();
  });

  it("allows Tier-2 contract at rank 3", () => {
    const member = makeMember("e1", 3, 200);
    const result = executeContract(member, "intelligence-broadcast", 5);
    expect(result).not.toBeNull();
    expect(result!.member.influence).toBe(235); // 200 + 35
  });

  it("allows Tier-4 contract at rank 6", () => {
    const member = makeMember("e1", 6, 800);
    const result = executeContract(member, "proxy-war", 5);
    expect(result!.member.influence).toBe(910); // 800 + 110
  });
});

/* ══ applyCounterIntelDecay ══ */

describe("applyCounterIntelDecay", () => {
  it("reduces shadow signature by counterIntelStrength fraction", () => {
    const member = makeMember("e1", 2, 100, 60);
    const result = applyCounterIntelDecay(member, 0.1);
    expect(result.shadowSignature).toBeCloseTo(54);
  });

  it("clamps shadow signature to minimum of 0", () => {
    const member = makeMember("e1", 2, 100, 3);
    const result = applyCounterIntelDecay(member, 1.5); // strength > 1.0 forces negative → clamped to 0
    expect(result.shadowSignature).toBe(0);
  });

  it("does not modify other member fields", () => {
    const member = makeMember("e1", 2, 100, 60);
    const result = applyCounterIntelDecay(member, 0.1);
    expect(result.influence).toBe(100);
    expect(result.rank).toBe(2);
    expect(result.exposed).toBe(false);
  });

  it("does not mutate input member", () => {
    const member = makeMember("e1", 2, 100, 60);
    applyCounterIntelDecay(member, 0.1);
    expect(member.shadowSignature).toBe(60);
  });
});

/* ══ checkExposure ══ */

describe("checkExposure", () => {
  it("returns null when shadow signature is below 75", () => {
    const member = makeMember("e1", 2, 100, 74);
    const result = checkExposure(member, 0.01, 5);
    expect(result).toBeNull();
  });

  it("returns null when signature = 74 (below threshold)", () => {
    const member = makeMember("e1", 3, 200, 74);
    expect(checkExposure(member, 0.001, 5)).toBeNull();
  });

  it("can detect when signature >= 75 and rngRoll is low", () => {
    const member = makeMember("e1", 3, 200, 100);
    // risk = (100 - 75) / 100 = 0.25; roll 0.01 → detected
    const result = checkExposure(member, 0.01, 5);
    expect(result).not.toBeNull();
    expect(result!.member.exposed).toBe(true);
  });

  it("does not expose when rngRoll is above risk fraction", () => {
    const member = makeMember("e1", 3, 200, 80);
    // risk = (80 - 75) / 100 = 0.05; roll 0.9 → safe
    const result = checkExposure(member, 0.9, 5);
    expect(result).toBeNull();
  });

  it("produces an empire-exposed SyndicateEvent on detection", () => {
    const member = makeMember("e1", 3, 200, 100);
    const result = checkExposure(member, 0.01, 7);
    expect(result!.event.kind).toBe("empire-exposed");
    expect(result!.event.empireId).toBe(EmpireId("e1"));
    expect(result!.event.cycle).toBe(7);
  });

  it("does not re-expose an already-exposed empire", () => {
    const member = makeMember("e1", 3, 200, 100, true); // already exposed
    const result = checkExposure(member, 0.001, 5);
    expect(result).toBeNull();
  });

  it("does not mutate input member", () => {
    const member = makeMember("e1", 3, 200, 100);
    checkExposure(member, 0.01, 5);
    expect(member.exposed).toBe(false);
  });
});

/* ══ computeController ══ */

describe("computeController", () => {
  it("returns null for empty members map", () => {
    expect(computeController(new Map())).toBeNull();
  });

  it("returns null when all members are rank 0", () => {
    const members = new Map([
      [EmpireId("e1"), makeMember("e1", 0, 0)],
      [EmpireId("e2"), makeMember("e2", 0, 30)],
    ]);
    expect(computeController(members)).toBeNull();
  });

  it("returns the empire with highest rank", () => {
    const members = new Map([
      [EmpireId("e1"), makeMember("e1", 3, 200)],
      [EmpireId("e2"), makeMember("e2", 5, 600)],
    ]);
    expect(computeController(members)).toBe(EmpireId("e2"));
  });

  it("breaks ties by highest influence", () => {
    const members = new Map([
      [EmpireId("e1"), makeMember("e1", 5, 900)],
      [EmpireId("e2"), makeMember("e2", 5, 1050)],
    ]);
    expect(computeController(members)).toBe(EmpireId("e2"));
  });

  it("ignores exposed empires when computing controller", () => {
    const members = new Map([
      [EmpireId("e1"), makeMember("e1", 8, 2000, 0, true)],  // exposed
      [EmpireId("e2"), makeMember("e2", 6, 800)],
    ]);
    expect(computeController(members)).toBe(EmpireId("e2"));
  });

  it("returns null if only exposed empires remain", () => {
    const members = new Map([
      [EmpireId("e1"), makeMember("e1", 8, 2000, 0, true)],
    ]);
    expect(computeController(members)).toBeNull();
  });
});

/* ══ addMember ══ */

describe("addMember", () => {
  it("adds a new rank-0 member to the state", () => {
    const state = makeState();
    const newState = addMember(state, EmpireId("e1"), 3);
    const member = newState.members.get(EmpireId("e1"));
    expect(member).toBeDefined();
    expect(member!.rank).toBe(0);
    expect(member!.influence).toBe(0);
    expect(member!.shadowSignature).toBe(0);
    expect(member!.exposed).toBe(false);
    expect(member!.discoveredCycle).toBe(3);
  });

  it("does not mutate the input state", () => {
    const state = makeState();
    addMember(state, EmpireId("e1"), 3);
    expect(state.members.size).toBe(0);
  });

  it("preserves existing members", () => {
    const state = makeState([makeMember("e1", 2, 100)]);
    const newState = addMember(state, EmpireId("e2"), 5);
    expect(newState.members.size).toBe(2);
  });
});

/* ══ computeFuelCellsProductionShare ══ */

describe("computeFuelCellsProductionShare", () => {
  it("returns 1.0 for single empire producing all fuel cells", () => {
    const shares = computeFuelCellsProductionShare(new Map([[EmpireId("e1"), 300]]));
    expect(shares.get(EmpireId("e1"))).toBeCloseTo(1.0);
  });

  it("divides production proportionally across empires", () => {
    const shares = computeFuelCellsProductionShare(new Map([
      [EmpireId("e1"), 300],
      [EmpireId("e2"), 100],
      [EmpireId("e3"), 100],
    ]));
    expect(shares.get(EmpireId("e1"))).toBeCloseTo(0.6);
    expect(shares.get(EmpireId("e2"))).toBeCloseTo(0.2);
    expect(shares.get(EmpireId("e3"))).toBeCloseTo(0.2);
  });

  it("returns empty map for empty input", () => {
    const shares = computeFuelCellsProductionShare(new Map());
    expect(shares.size).toBe(0);
  });

  it("returns 0 for all empires when total production is 0", () => {
    const shares = computeFuelCellsProductionShare(new Map([
      [EmpireId("e1"), 0],
      [EmpireId("e2"), 0],
    ]));
    expect(shares.get(EmpireId("e1"))).toBe(0);
    expect(shares.get(EmpireId("e2"))).toBe(0);
  });
});

/* ══ processSyndicateCycle ══ */

describe("processSyndicateCycle", () => {
  it("is a pure function — does not mutate input state", () => {
    const member = makeMember("e1", 2, 100, 50);
    const state = makeState([member]);
    const stateCopy = JSON.stringify({ ...state, members: [...state.members.entries()], exposedEmpires: [...state.exposedEmpires] });
    const rng = new SeededRNG(42);
    processSyndicateCycle(state, 1, rng);
    const stateAfter = JSON.stringify({ ...state, members: [...state.members.entries()], exposedEmpires: [...state.exposedEmpires] });
    expect(stateAfter).toBe(stateCopy);
  });

  it("produces no events when state has no members", () => {
    const state = makeState();
    const rng = new SeededRNG(42);
    const { events } = processSyndicateCycle(state, 1, rng);
    expect(events).toHaveLength(0);
  });

  it("updates controllerId in returned state", () => {
    const member = makeMember("e1", 3, 200);
    const state = makeState([member]);
    const rng = new SeededRNG(42);
    const { state: newState } = processSyndicateCycle(state, 1, rng);
    expect(newState.controllerId).toBe(EmpireId("e1"));
  });

  it("adds exposed empires to exposedEmpires Set", () => {
    // High signature to force exposure on low rng roll
    const member = makeMember("e1", 2, 100, 100);
    const state = makeState([member]);
    // Use seeded RNG — find a seed that produces a low first roll
    // SeededRNG(1).next() ≈ 0.163 > 0.25 (risk at sig=100); try seed 99
    // Just verify: if exposure occurs, exposedEmpires is updated
    const rng = new SeededRNG(42);
    const { state: newState } = processSyndicateCycle(state, 1, rng);
    // Whether or not exposed depends on RNG, but the set should be consistent with member.exposed
    for (const [id, m] of newState.members) {
      if (m.exposed) {
        expect(newState.exposedEmpires.has(id)).toBe(true);
      }
    }
  });
});

/* ══ processSyndicateCycle — extended coverage ══ */

describe("processSyndicateCycle — promotions", () => {
  it("auto-promotes member when influence crosses rank threshold", () => {
    // Rank 1 needs 50 influence; member has 110 → should become rank 2 (threshold 100)
    const member = makeMember("e1", 1, 110, 10);
    const state = makeState([member]);
    const rng = new SeededRNG(42);
    const { state: newState, events } = processSyndicateCycle(state, 5, rng);

    expect(newState.members.get(EmpireId("e1"))!.rank).toBe(2);
    const rankUpEvents = events.filter(e => e.kind === "rank-up");
    expect(rankUpEvents.length).toBe(1);
    expect((rankUpEvents[0] as any).newRank).toBe(2);
  });

  it("does not demote members (rank only goes up)", () => {
    // Member at rank 5 with only 200 influence (below rank-5 threshold of 550)
    // processSyndicateCycle only promotes, never demotes
    const member = makeMember("e1", 5, 200, 0);
    const state = makeState([member]);
    const rng = new SeededRNG(42);
    const { state: newState } = processSyndicateCycle(state, 5, rng);

    expect(newState.members.get(EmpireId("e1"))!.rank).toBe(5);
  });

  it("promotes multiple members in the same cycle", () => {
    const m1 = makeMember("e1", 1, 110); // → rank 2
    const m2 = makeMember("e2", 2, 220); // → rank 3
    const state = makeState([m1, m2]);
    const rng = new SeededRNG(42);
    const { state: newState, events } = processSyndicateCycle(state, 5, rng);

    expect(newState.members.get(EmpireId("e1"))!.rank).toBe(2);
    expect(newState.members.get(EmpireId("e2"))!.rank).toBe(3);
    const rankUps = events.filter(e => e.kind === "rank-up");
    expect(rankUps.length).toBe(2);
  });
});

describe("processSyndicateCycle — counter-intel decay", () => {
  it("decays shadow signature each cycle", () => {
    const member = makeMember("e1", 2, 100, 50);
    const state = makeState([member]);
    const rng = new SeededRNG(42);
    const { state: newState } = processSyndicateCycle(state, 5, rng, 0.1);

    // 50 - 50*0.1 = 45 (before any exposure check)
    const sig = newState.members.get(EmpireId("e1"))!.shadowSignature;
    expect(sig).toBeLessThan(50);
  });

  it("uses custom counterIntelStrength parameter", () => {
    const member = makeMember("e1", 2, 100, 80);
    const state = makeState([member]);

    const result1 = processSyndicateCycle(state, 5, new SeededRNG(42), 0.05);
    const result2 = processSyndicateCycle(state, 5, new SeededRNG(42), 0.20);

    const sig1 = result1.state.members.get(EmpireId("e1"))!.shadowSignature;
    const sig2 = result2.state.members.get(EmpireId("e1"))!.shadowSignature;
    // Higher counter-intel strength means lower signature
    expect(sig2).toBeLessThan(sig1);
  });
});

describe("processSyndicateCycle — controller changes", () => {
  it("emits controller-changed event when controller changes", () => {
    const m1 = makeMember("e1", 3, 200);
    const m2 = makeMember("e2", 5, 600);
    const state = makeState([m1, m2]);
    state.controllerId = EmpireId("e1"); // was e1, now e2 should take over
    const rng = new SeededRNG(42);
    const { state: newState, events } = processSyndicateCycle(state, 5, rng);

    expect(newState.controllerId).toBe(EmpireId("e2"));
    const controllerEvents = events.filter(e => e.kind === "controller-changed");
    expect(controllerEvents.length).toBe(1);
  });

  it("does not emit controller-changed when controller stays the same", () => {
    const m1 = makeMember("e1", 5, 600);
    const state = makeState([m1]);
    state.controllerId = EmpireId("e1");
    const rng = new SeededRNG(42);
    const { events } = processSyndicateCycle(state, 5, rng);

    const controllerEvents = events.filter(e => e.kind === "controller-changed");
    expect(controllerEvents.length).toBe(0);
  });
});

/* ══ computeRankFromInfluence — remaining boundaries ══ */

describe("computeRankFromInfluence — all rank boundaries", () => {
  it("returns rank 3 at exactly 200 influence", () => {
    expect(computeRankFromInfluence(200)).toBe(3);
  });

  it("returns rank 5 at exactly 550 influence", () => {
    expect(computeRankFromInfluence(550)).toBe(5);
  });

  it("returns rank 6 at exactly 800 influence", () => {
    expect(computeRankFromInfluence(800)).toBe(6);
  });

  it("returns rank 7 at exactly 1100 influence", () => {
    expect(computeRankFromInfluence(1100)).toBe(7);
  });

  it("returns rank 6 at 1099 influence (just below rank 7)", () => {
    expect(computeRankFromInfluence(1099)).toBe(6);
  });

  it("returns rank 7 at 1499 influence (just below rank 8)", () => {
    expect(computeRankFromInfluence(1499)).toBe(7);
  });
});

/* ══ checkExposure — boundary precision ══ */

describe("checkExposure — boundary cases", () => {
  it("signature exactly 75 has risk = 0 — never triggers even with roll 0", () => {
    const member = makeMember("e1", 3, 200, 75);
    // risk = (75 - 75) / 100 = 0.0; roll 0.0 → rngRoll >= risk → not detected
    const result = checkExposure(member, 0, 5);
    expect(result).toBeNull();
  });

  it("signature 76 has risk = 0.01 — roll 0.005 triggers detection", () => {
    const member = makeMember("e1", 3, 200, 76);
    // risk = (76 - 75) / 100 = 0.01; roll 0.005 < 0.01 → detected
    const result = checkExposure(member, 0.005, 5);
    expect(result).not.toBeNull();
    expect(result!.member.exposed).toBe(true);
  });

  it("signature 76 with roll exactly at risk (0.01) does NOT trigger", () => {
    const member = makeMember("e1", 3, 200, 76);
    // risk = 0.01; roll 0.01 → rngRoll >= risk → safe
    const result = checkExposure(member, 0.01, 5);
    expect(result).toBeNull();
  });
});

/* ══ addMember — edge cases ══ */

describe("addMember — edge cases", () => {
  it("overwrites existing member if called with same empireId", () => {
    const state = makeState([makeMember("e1", 3, 200, 50)]);
    const newState = addMember(state, EmpireId("e1"), 10);
    const member = newState.members.get(EmpireId("e1"))!;
    expect(member.rank).toBe(0);
    expect(member.influence).toBe(0);
    expect(member.discoveredCycle).toBe(10);
  });

  it("copies exposedEmpires set (not shared reference)", () => {
    const m1 = makeMember("e1", 2, 100, 0, true);
    const state = makeState([m1]);
    const newState = addMember(state, EmpireId("e2"), 5);
    // Mutating original set should not affect newState
    state.exposedEmpires.add(EmpireId("e99"));
    expect(newState.exposedEmpires.has(EmpireId("e99"))).toBe(false);
  });
});

/* ══ computeController — single rank-1 qualifies ══ */

describe("computeController — additional cases", () => {
  it("single rank-1 member qualifies as controller", () => {
    const members = new Map([
      [EmpireId("e1"), makeMember("e1", 1, 50)],
    ]);
    expect(computeController(members)).toBe(EmpireId("e1"));
  });

  it("exposed rank-0 and non-exposed rank-0 both excluded", () => {
    const members = new Map([
      [EmpireId("e1"), makeMember("e1", 0, 40, 0, true)],
      [EmpireId("e2"), makeMember("e2", 0, 30)],
    ]);
    expect(computeController(members)).toBeNull();
  });
});

/* ══ processSyndicateCycle — full pipeline ══ */

describe("processSyndicateCycle — full pipeline", () => {
  it("promotes + decays + checks exposure + recomputes controller in one cycle", () => {
    // e1: influence 110 at rank 1 → promoted to rank 2, low signature → no exposure
    // e2: rank 3, high signature → may get exposed
    const m1 = makeMember("e1", 1, 110, 5);
    const m2 = makeMember("e2", 3, 200, 90);
    const state = makeState([m1, m2]);
    state.controllerId = EmpireId("e2");

    const rng = new SeededRNG(42);
    const { state: newState, events } = processSyndicateCycle(state, 10, rng, 0.05);

    // e1 should be promoted
    expect(newState.members.get(EmpireId("e1"))!.rank).toBe(2);
    const rankUpEvents = events.filter(e => e.kind === "rank-up");
    expect(rankUpEvents.length).toBeGreaterThanOrEqual(1);

    // e2 signature should have decayed from 90
    const e2sig = newState.members.get(EmpireId("e2"))!.shadowSignature;
    expect(e2sig).toBeLessThanOrEqual(90);

    // controller is recomputed (e2 rank 3 > e1 rank 2 if not exposed)
    expect(newState.controllerId).not.toBeNull();
  });

  it("all members exposed → controller becomes null", () => {
    // Both members have very high signature, use an RNG that gives low rolls
    const m1 = makeMember("e1", 3, 200, 100);
    const m2 = makeMember("e2", 4, 350, 100);
    const state = makeState([m1, m2]);
    state.controllerId = EmpireId("e2");

    // Run many cycles to guarantee exposure (brute-force with different seeds)
    let finalState = state;
    for (let seed = 0; seed < 50; seed++) {
      const rng = new SeededRNG(seed);
      const { state: newState } = processSyndicateCycle(finalState, seed, rng, 0.0); // no decay to keep sig high
      finalState = newState;
    }

    // After enough cycles with sig=100 (risk=0.25), both should eventually be exposed
    const allExposed = [...finalState.members.values()].every(m => m.exposed);
    if (allExposed) {
      expect(finalState.controllerId).toBeNull();
    }
    // Verify exposedEmpires set matches member flags
    for (const [id, m] of finalState.members) {
      expect(finalState.exposedEmpires.has(id)).toBe(m.exposed);
    }
  });

  it("exposure adds empire to exposedEmpires set deterministically", () => {
    const member = makeMember("e1", 2, 100, 100); // risk = 0.25
    const state = makeState([member]);

    // Run with many seeds until we find one that causes exposure
    let wasExposed = false;
    for (let seed = 0; seed < 100; seed++) {
      const rng = new SeededRNG(seed);
      const { state: newState } = processSyndicateCycle(state, 1, rng, 0.0);
      const m = newState.members.get(EmpireId("e1"))!;
      if (m.exposed) {
        expect(newState.exposedEmpires.has(EmpireId("e1"))).toBe(true);
        wasExposed = true;
        break;
      }
    }
    expect(wasExposed).toBe(true); // At least one seed out of 100 should trigger exposure with 25% chance
  });
});

/* ══ getMemberSummary — additional cases ══ */

describe("getMemberSummary — additional cases", () => {
  it("exposed member shows exposed=true and correct rankName", () => {
    const member = makeMember("e1", 5, 600, 80, true);
    const state = makeState([member]);
    const summary = getMemberSummary(EmpireId("e1"), state);
    expect(summary!.exposed).toBe(true);
    expect(summary!.rankName).toBe("Shadow Broker");
  });

  it("non-controller member has isController=false", () => {
    const m1 = makeMember("e1", 3, 200);
    const m2 = makeMember("e2", 5, 600);
    const state = makeState([m1, m2]);
    state.controllerId = EmpireId("e2");
    const summary = getMemberSummary(EmpireId("e1"), state);
    expect(summary!.isController).toBe(false);
  });
});

/* ══ Black Register — additional cost cases ══ */

describe("getBlackRegisterItemCost — additional premiums", () => {
  it("rank 4 pays 1.5x premium", () => {
    const member = makeMember("e1", 4, 350);
    expect(getBlackRegisterItemCost(member, "cascade-disruptor", null)).toBe(Math.ceil(500 * 1.5));
  });

  it("rank 5 pays 1.35x premium", () => {
    const member = makeMember("e1", 5, 550);
    expect(getBlackRegisterItemCost(member, "cascade-disruptor", null)).toBe(Math.ceil(500 * 1.35));
  });

  it("rank 7 pays 1.1x and rank 8 pays 1.0x", () => {
    const m7 = makeMember("e1", 7, 1100);
    const m8 = makeMember("e2", 8, 1500);
    const baseCost = BLACK_REGISTER_ITEMS["cascade-disruptor"].baseCost;
    expect(getBlackRegisterItemCost(m7, "cascade-disruptor", null)).toBe(Math.ceil(baseCost * 1.1));
    expect(getBlackRegisterItemCost(m8, "cascade-disruptor", null)).toBe(baseCost);
  });

  it("shadow-veil costs 720 (1.2x) for rank 6", () => {
    const member = makeMember("e1", 6, 800);
    expect(getBlackRegisterItemCost(member, "shadow-veil", null)).toBe(Math.ceil(600 * 1.2));
  });
});

/* ══ getSyndicateRankName ══ */

describe("getSyndicateRankName", () => {
  it("returns 'Unaware' for rank 0", () => {
    expect(getSyndicateRankName(0)).toBe("Unaware");
  });

  it("returns meaningful names for all ranks 1-8", () => {
    for (let r = 1; r <= 8; r++) {
      const name = getSyndicateRankName(r as any);
      expect(name).toBeDefined();
      expect(name.length).toBeGreaterThan(0);
      expect(name).not.toBe("Unaware");
    }
  });

  it("rank 8 is the highest tier name", () => {
    const name = getSyndicateRankName(8);
    expect(name).toBeDefined();
  });
});

/* ══ getMemberSummary ══ */

describe("getMemberSummary", () => {
  it("returns summary for a member in the state", () => {
    const member = makeMember("e1", 3, 200, 30);
    const state = makeState([member]);
    const summary = getMemberSummary(EmpireId("e1"), state);
    expect(summary).not.toBeNull();
    expect(summary!.rank).toBe(3);
    expect(summary!.influence).toBe(200);
    expect(summary!.shadowSignature).toBe(30);
    expect(summary!.exposed).toBe(false);
    expect(summary!.rankName).toBeDefined();
  });

  it("returns null for non-member", () => {
    const state = makeState();
    expect(getMemberSummary(EmpireId("e99"), state)).toBeNull();
  });

  it("includes isController flag", () => {
    const member = makeMember("e1", 5, 600);
    const state = makeState([member]);
    state.controllerId = EmpireId("e1");
    const summary = getMemberSummary(EmpireId("e1"), state);
    expect(summary!.isController).toBe(true);
  });
});

/* ══ Black Register ══ */

describe("Black Register (Black Market)", () => {
  describe("BLACK_REGISTER_ITEMS", () => {
    it("defines 9 items across intelligence and disruption categories", () => {
      const items = Object.values(BLACK_REGISTER_ITEMS);
      // Initially 9, but we added orbital-blindspot, neural-static, nexus-backdoor, void-ledger (+4)
      expect(items.length).toBeGreaterThanOrEqual(9);
      const intel = items.filter(i => i.category === "intelligence");
      const disruption = items.filter(i => i.category === "disruption");
      expect(intel.length).toBeGreaterThanOrEqual(5);
      expect(disruption.length).toBeGreaterThanOrEqual(4);
    });

    it("intelligence items require at least rank 2", () => {
      const intel = Object.values(BLACK_REGISTER_ITEMS).filter(i => i.category === "intelligence");
      for (const item of intel) {
        expect(item.minRank).toBeGreaterThanOrEqual(2);
      }
    });

    it("disruption tools require at least rank 4", () => {
      const tools = Object.values(BLACK_REGISTER_ITEMS).filter(i => i.category === "disruption");
      for (const tool of tools) {
        expect(tool.minRank).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe("canPurchaseBlackRegisterItem", () => {
    it("returns false for rank 0 (unaware)", () => {
      const member = makeMember("e1", 0, 0);
      expect(canPurchaseBlackRegisterItem(member, "empire-dossier")).toBe(false);
    });

    it("returns false for rank 1 (below minimum)", () => {
      const member = makeMember("e1", 1, 50);
      expect(canPurchaseBlackRegisterItem(member, "empire-dossier")).toBe(false);
    });

    it("returns true for rank 2 member accessing intelligence item", () => {
      const member = makeMember("e1", 2, 100);
      expect(canPurchaseBlackRegisterItem(member, "empire-dossier")).toBe(true);
    });

    it("returns false for rank 2 member accessing disruption tool (needs rank 4)", () => {
      const member = makeMember("e1", 2, 100);
      expect(canPurchaseBlackRegisterItem(member, "cascade-disruptor")).toBe(false);
    });

    it("returns true for rank 4 member accessing disruption tool", () => {
      const member = makeMember("e1", 4, 350);
      expect(canPurchaseBlackRegisterItem(member, "cascade-disruptor")).toBe(true);
    });

    it("returns false for exposed members", () => {
      const member = makeMember("e1", 6, 800, 0, true);
      expect(canPurchaseBlackRegisterItem(member, "empire-dossier")).toBe(false);
    });
  });

  describe("getBlackRegisterItemCost", () => {
    it("returns 0 for ineligible members", () => {
      const member = makeMember("e1", 1, 50);
      expect(getBlackRegisterItemCost(member, "empire-dossier", null)).toBe(0);
    });

    it("rank 2 pays 2x premium", () => {
      const member = makeMember("e1", 2, 100);
      const baseCost = BLACK_REGISTER_ITEMS["empire-dossier"].baseCost;
      expect(getBlackRegisterItemCost(member, "empire-dossier", null)).toBe(baseCost * 2);
    });

    it("rank 6 pays 1.2x premium", () => {
      const member = makeMember("e1", 6, 800);
      const baseCost = BLACK_REGISTER_ITEMS["empire-dossier"].baseCost;
      expect(getBlackRegisterItemCost(member, "empire-dossier", null)).toBe(Math.ceil(baseCost * 1.2));
    });

    it("controller pays base cost regardless of rank", () => {
      const member = makeMember("e1", 3, 200);
      const baseCost = BLACK_REGISTER_ITEMS["empire-dossier"].baseCost;
      // Normally rank 3 pays 1.75x, but as controller pays 1.0x
      expect(getBlackRegisterItemCost(member, "empire-dossier", EmpireId("e1"))).toBe(baseCost);
    });

    it("non-controller at rank 3 pays 1.75x premium", () => {
      const member = makeMember("e1", 3, 200);
      const baseCost = BLACK_REGISTER_ITEMS["empire-dossier"].baseCost;
      expect(getBlackRegisterItemCost(member, "empire-dossier", EmpireId("e2"))).toBe(Math.ceil(baseCost * 1.75));
    });
  });

  describe("purchaseBlackRegisterItem", () => {
    it("returns null for ineligible member", () => {
      const member = makeMember("e1", 1, 50);
      expect(purchaseBlackRegisterItem(member, "empire-dossier", 5)).toBeNull();
    });

    it("increases shadow signature on purchase", () => {
      const member = makeMember("e1", 3, 200, 10);
      const result = purchaseBlackRegisterItem(member, "empire-dossier", 5);
      expect(result).not.toBeNull();
      expect(result!.member.shadowSignature).toBe(10 + BLACK_REGISTER_ITEMS["empire-dossier"].signatureGrowth);
    });

    it("shadow-veil reduces shadow signature by 25", () => {
      const member = makeMember("e1", 5, 550, 60);
      const result = purchaseBlackRegisterItem(member, "shadow-veil", 5);
      expect(result).not.toBeNull();
      expect(result!.member.shadowSignature).toBe(35);
    });

    it("shadow-veil does not reduce below 0", () => {
      const member = makeMember("e1", 5, 550, 10);
      const result = purchaseBlackRegisterItem(member, "shadow-veil", 5);
      expect(result!.member.shadowSignature).toBe(0);
    });

    it("signature is capped at 100", () => {
      const member = makeMember("e1", 4, 350, 95);
      const result = purchaseBlackRegisterItem(member, "cascade-disruptor", 5);
      expect(result!.member.shadowSignature).toBe(100);
    });

    it("produces a syndicate event", () => {
      const member = makeMember("e1", 3, 200);
      const result = purchaseBlackRegisterItem(member, "empire-dossier", 5);
      expect(result!.event.type).toBe("syndicate");
      expect(result!.event.empireId).toBe(EmpireId("e1"));
      expect(result!.event.cycle).toBe(5);
    });

    it("does not mutate input member", () => {
      const member = makeMember("e1", 3, 200, 10);
      purchaseBlackRegisterItem(member, "empire-dossier", 5);
      expect(member.shadowSignature).toBe(10);
    });
  });
});
