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
