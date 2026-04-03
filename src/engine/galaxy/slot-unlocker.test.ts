import { describe, it, expect } from "vitest";
import { processSlotUnlocks, processAnomalyDiscovery } from "./slot-unlocker";
import type { GameState } from "../types/game-state";
import { EmpireId, SystemId } from "../types/ids";

describe("Slot and Anomaly Logic", () => {
  const createBaseState = (): GameState => ({
    galaxy: {
      systems: new Map(),
      sectors: new Map(),
    },
    empires: new Map(),
    playerEmpireId: "empire-0" as EmpireId,
    unitTypes: new Map(),
    units: new Map(),
    fleets: new Map(),
    bots: new Map(),
    diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
    time: { currentCycle: 1, cosmicOrder: { tiers: new Map(), rankings: [] } },
    campaign: { seed: 123 },
  } as any);

  it("unlocks slots on frontier-world based on research tier", () => {
    const state = createBaseState();
    const empireId = "empire-0" as EmpireId;
    const sysId = "sys-1" as SystemId;

    state.empires.set(empireId, {
      id: empireId,
      name: "Test Empire",
      resources: { credits: 0, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 },
      systemIds: [sysId],
      researchTier: 4, // Enough for 1 slot
    } as any);

    state.galaxy.systems.set(sysId, {
      id: sysId,
      biome: "frontier-world",
      slots: [
        { locked: false, installation: null },
        { locked: false, installation: null },
        { locked: true, installation: null }, // index 2
        { locked: true, installation: null },
        { locked: true, installation: null },
      ],
    } as any);

    const events = processSlotUnlocks(state, 1);
    expect(events.length).toBe(1);
    expect(state.galaxy.systems.get(sysId)!.slots[2].locked).toBe(false);
    expect(state.galaxy.systems.get(sysId)!.slots[3].locked).toBe(true);

    // Now advance to tier 6
    state.empires.get(empireId)!.researchTier = 6;
    const events2 = processSlotUnlocks(state, 1);
    expect(events2.length).toBe(1); // One more unlocked
    expect(state.galaxy.systems.get(sysId)!.slots[3].locked).toBe(false);
    expect(state.galaxy.systems.get(sysId)!.slots[4].locked).toBe(true);
  });

  it("triggers anomaly discovery only on FIRST claim", () => {
    const state = createBaseState();
    const empireId = "empire-0" as EmpireId;
    const sysId = "sys-1" as SystemId;

    state.empires.set(empireId, {
      id: empireId,
      resources: { credits: 0, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0 },
    } as any);

    const anomalySys = {
      id: sysId,
      biome: "resource-rich-anomaly",
      claimedCycle: 1,
    } as any;

    const events = processAnomalyDiscovery(anomalySys, empireId, state, 1);
    expect(events.length).toBe(1);
    expect(state.empires.get(empireId)!.resources.credits).toBe(150);

    // Call again - should not trigger if not the same cycle
    const events2 = processAnomalyDiscovery(anomalySys, empireId, state, 2);
    expect(events2.length).toBe(0);
    expect(state.empires.get(empireId)!.resources.credits).toBe(150); // unchanged
  });
});
