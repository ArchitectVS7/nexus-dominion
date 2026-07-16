/* Campaign-factory pinning tests — the REAL createNewCampaign -> processCycle
   path. The pre-existing suite always hand-built its GameState (with a
   populated cosmicOrder), so a factory campaign that never resolved anything
   for its first 10 cycles stayed green for months (UGT trial findings ND-1/
   ND-2/ND-2b/ND-3). These tests drive the exact state a new player gets. */

import { describe, it, expect } from "vitest";
import { createNewCampaign } from "./campaign-factory";
import { processCycle } from "../cycle/cycle-processor";
import type { GameState } from "../types/game-state";
import type { EmpireId } from "../types/ids";

const SMALL = {
  seed: 42,
  totalSystems: 30,
  sectorCount: 6,
  systemsPerSector: 5,
  empireCount: 10,
};

function freshAccumulators() {
  return {
    powerHistory: new Map<EmpireId, number[]>(),
    botAccumulated: new Map<EmpireId, number>(),
  };
}

function firstAdjacentUnclaimed(state: GameState): string | null {
  const player = state.empires.get(state.playerEmpireId)!;
  for (const sid of player.systemIds) {
    const sys = state.galaxy.systems.get(sid);
    for (const adj of sys?.adjacentSystemIds ?? []) {
      if (state.galaxy.systems.get(adj)?.owner === null) return adj;
    }
  }
  return null;
}

describe("createNewCampaign — the game is ALIVE from cycle 1 (ND-3)", () => {
  it("seeds the Cosmic Order at creation (tiers/rankings cover every empire)", () => {
    const state = createNewCampaign(SMALL);
    expect(state.time.cosmicOrder.tiers.size).toBe(SMALL.empireCount);
    expect(state.time.cosmicOrder.rankings.length).toBe(SMALL.empireCount);
  });

  it("cycle 1 produces income on an empty commit", () => {
    const state = createNewCampaign(SMALL);
    const { powerHistory, botAccumulated } = freshAccumulators();
    const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
    expect(result.committed).toBe(true);
    const player = result.state.empires.get(result.state.playerEmpireId)!;
    const moved =
      player.resources.credits !== 500 ||
      player.resources.food !== 200 ||
      player.resources.ore !== 150;
    expect(moved).toBe(true);
  });

  it("cycle 1 resolves a player claim-system order (event + ownership)", () => {
    const state = createNewCampaign(SMALL);
    const target = firstAdjacentUnclaimed(state);
    expect(target).not.toBeNull();
    const { powerHistory, botAccumulated } = freshAccumulators();
    const result = processCycle(
      state,
      { actions: [{ type: "claim-system", details: { systemId: target! } }] },
      powerHistory,
      botAccumulated,
    );
    expect(result.committed).toBe(true);
    const player = result.state.empires.get(result.state.playerEmpireId)!;
    expect(player.systemIds).toContain(target);
    const events = result.report.events.filter(
      (e) => e.type === "colonisation" && e.empireId === player.id,
    );
    expect(events.length).toBe(1);
  });
});

describe("build queue -> fleet attachment (ND-2 / ND-2b)", () => {
  function runBuild(orders: { type: string; details?: Record<string, unknown> }[]) {
    let state = createNewCampaign(SMALL);
    const { powerHistory, botAccumulated } = freshAccumulators();
    let result = processCycle(state, { actions: orders }, powerHistory, botAccumulated);
    expect(result.committed).toBe(true);
    state = result.state;
    // Advance until the queue drains (fighter buildTime is small; cap at 10).
    for (let i = 0; i < 10; i++) {
      const player = state.empires.get(state.playerEmpireId)!;
      if ((player.buildQueue ?? []).length === 0) break;
      result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      expect(result.committed).toBe(true);
      state = result.state;
    }
    return state;
  }

  it("a completed unit exists AND belongs to a player fleet (never orphaned)", () => {
    const state = runBuild([
      { type: "build-unit", details: { unitTypeId: "fighter" } },
    ]);
    const player = state.empires.get(state.playerEmpireId)!;
    expect((player.buildQueue ?? []).length).toBe(0);
    const playerFleetUnits = [...state.fleets.values()]
      .filter((f) => f.ownerId === player.id)
      .flatMap((f) => f.unitIds);
    expect(playerFleetUnits.length).toBe(1);
    expect(state.units.has(playerFleetUnits[0])).toBe(true);
    // No unit anywhere may be fleetless.
    const attached = new Set(
      [...state.fleets.values()].flatMap((f) => f.unitIds),
    );
    for (const uid of state.units.keys()) {
      expect(attached.has(uid)).toBe(true);
    }
  });

  it("two same-type units completing on the same cycle BOTH survive", () => {
    const state = runBuild([
      { type: "build-unit", details: { unitTypeId: "fighter" } },
      { type: "build-unit", details: { unitTypeId: "fighter" } },
    ]);
    const player = state.empires.get(state.playerEmpireId)!;
    const playerFleetUnits = [...state.fleets.values()]
      .filter((f) => f.ownerId === player.id)
      .flatMap((f) => f.unitIds);
    expect(playerFleetUnits.length).toBe(2);
  });
});

describe("syndicate + covert exist from creation (ND-P2)", () => {
  it("the Syndicate exists as a background institution with no members; every "
     + "empire has a covert state", () => {
    const state = createNewCampaign(SMALL);
    expect(state.syndicate).toBeDefined();
    expect(state.syndicate!.members.size).toBe(0);
    expect(state.syndicate!.controllerId).toBeNull();
    expect(state.covert).toBeDefined();
    expect(state.covert!.empireStates.size).toBe(SMALL.empireCount);
    for (const cs of state.covert!.empireStates.values()) {
      expect(cs.agentPool).toBe(0);
      expect(cs.queuedOps).toEqual([]);
    }
  });

  it("fund-syndicate WORKS at cycle 1 (member created, influence granted, "
     + "credits paid)", () => {
    const state = createNewCampaign(SMALL);
    const { powerHistory, botAccumulated } = freshAccumulators();
    const result = processCycle(
      state,
      { actions: [{ type: "fund-syndicate", details: { amount: 100 } }] },
      powerHistory,
      botAccumulated,
    );
    expect(result.committed).toBe(true);
    const player = result.state.empires.get(result.state.playerEmpireId)!;
    const member = result.state.syndicate!.members.get(player.id);
    expect(member).toBeDefined();
    expect(member!.influence).toBe(20);
    // 100 credits paid (income also lands this cycle; assert via the member
    // record + the syndicate event rather than recomputing the delta).
    const events = result.report.events.filter((e) => e.type === "syndicate");
    expect(events.length).toBe(1);
  });
});

describe("state cloning preserves the WHOLE state (ND-5)", () => {
  it("wormholes and black-register purchases survive the next cycle", () => {
    const state = createNewCampaign(SMALL);
    const home = state.empires.get(state.playerEmpireId)!.homeSystemId!;
    state.galaxy.wormholes = [
      { id: "wh-test", systemA: home, systemB: home, owner: state.playerEmpireId },
    ] as never;
    state.ownedBlackRegisterItems = new Map([
      [state.playerEmpireId, new Set(["empire-dossier"])],
    ]);
    const { powerHistory, botAccumulated } = freshAccumulators();
    const result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
    expect(result.committed).toBe(true);
    expect(result.state.galaxy.wormholes?.length).toBe(1);
    expect(
      result.state.ownedBlackRegisterItems?.get(state.playerEmpireId)?.has(
        "empire-dossier",
      ),
    ).toBe(true);
  });

  it("an installation completing in cycle N does not mutate the cycle N-1 "
     + "snapshot (slot objects are not shared)", () => {
    let state = createNewCampaign(SMALL);
    const home = state.empires.get(state.playerEmpireId)!.homeSystemId!;
    const { powerHistory, botAccumulated } = freshAccumulators();
    let result = processCycle(
      state,
      { actions: [{ type: "build-installation",
                    details: { installationType: "trade-hub", systemId: home } }] },
      powerHistory,
      botAccumulated,
    );
    state = result.state;
    const snapshot = state; // the pre-completion snapshot
    for (let i = 0; i < 5; i++) {
      result = processCycle(state, { actions: [] }, powerHistory, botAccumulated);
      state = result.state;
      const done = state.galaxy.systems.get(home)!.slots
        .some((s) => s.installation?.type === "trade-hub");
      if (done) break;
    }
    expect(
      state.galaxy.systems.get(home)!.slots
        .some((s) => s.installation?.type === "trade-hub"),
    ).toBe(true);
    // the snapshot taken BEFORE completion must still be untouched
    expect(
      snapshot.galaxy.systems.get(home)!.slots
        .every((s) => s.installation === null),
    ).toBe(true);
  });
});

describe("research gates are enforced (ND-6)", () => {
  it("doctrine below tier 1 and specialization below tier 3 are refused", () => {
    const state = createNewCampaign(SMALL);
    const { powerHistory, botAccumulated } = freshAccumulators();
    const result = processCycle(
      state,
      { actions: [
        { type: "select-doctrine", details: { pathId: "war-machine" } },
        { type: "select-specialization", details: { specId: "shock-troops" } },
      ] },
      powerHistory,
      botAccumulated,
    );
    expect(result.committed).toBe(true);
    const player = result.state.empires.get(result.state.playerEmpireId)!;
    expect(player.researchPath).toBeNull();
    expect(player.specialization).toBeNull();
  });

  it("specialization at tier >= 3 with a doctrine succeeds", () => {
    const state = createNewCampaign(SMALL);
    const player = state.empires.get(state.playerEmpireId)!;
    player.researchTier = 3;
    const { powerHistory, botAccumulated } = freshAccumulators();
    const result = processCycle(
      state,
      { actions: [
        { type: "select-doctrine", details: { pathId: "war-machine" } },
        { type: "select-specialization", details: { specId: "shock-troops" } },
      ] },
      powerHistory,
      botAccumulated,
    );
    const after = result.state.empires.get(result.state.playerEmpireId)!;
    expect(after.researchPath).toBe("war-machine");
    expect(after.specialization).toBe("shock-troops");
  });
});

describe("move-fleet refusal contract (ND-1)", () => {
  it("a malformed move-fleet order is SKIPPED, not a whole-cycle abort", () => {
    const state = createNewCampaign(SMALL);
    const { powerHistory, botAccumulated } = freshAccumulators();
    const result = processCycle(
      state,
      { actions: [{ type: "move-fleet" }] },
      powerHistory,
      botAccumulated,
    );
    expect(result.committed).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
