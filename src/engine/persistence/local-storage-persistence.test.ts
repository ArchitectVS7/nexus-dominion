// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { LocalStoragePersistence } from "./local-storage-persistence";
import { EmpireId, SystemId, SectorId } from "../types/ids";
import type { GameState } from "../types/game-state";

/* ── Minimal GameState fixture ── */

function createTestState(campaignId = "campaign-1", name = "Test Campaign", cycle = 3): GameState {
  const empireId = EmpireId("e-player");
  const sys1 = SystemId("sys-1");
  const sec1 = SectorId("sec-1");

  return {
    galaxy: {
      systems: new Map([[sys1, {
        id: sys1, name: "Alpha", sectorId: sec1, position: { x: 0, y: 0 },
        biome: "core-world", owner: empireId, slots: [], baseProduction: {},
        adjacentSystemIds: [], claimedCycle: 1, isHomeSystem: true,
      } as any]]),
      sectors: new Map([[sec1, {
        id: sec1, name: "Sec-A", systemIds: [sys1], centre: { x: 0, y: 0 },
      } as any]]),
    },
    empires: new Map([[empireId, {
      id: empireId, name: "Player", colour: "#f00", isPlayer: true,
      systemIds: [sys1], homeSystemId: sys1,
      resources: { credits: 500, food: 100, ore: 50, fuelCells: 30, researchPoints: 10, intelligencePoints: 0 },
      population: 50, populationCapacity: 100, stabilityScore: 70,
      stabilityLevel: "content", researchTier: 1, powerScore: 50, fleetIds: [],
    } as any]]),
    playerEmpireId: empireId,
    unitTypes: new Map(),
    units: new Map(),
    fleets: new Map(),
    bots: new Map(),
    diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
    time: {
      currentCycle: cycle,
      currentConfluence: 1,
      cyclesUntilReckoning: 7,
      cosmicOrder: { tiers: new Map(), rankings: [] },
    },
    currentCycleEvents: [],
    campaign: {
      id: campaignId,
      name,
      createdAt: "2026-03-29T00:00:00Z",
      lastSavedAt: "2026-03-29T00:00:00Z",
      seed: 42,
    },
  };
}

describe("LocalStoragePersistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("list/load/delete round-trip preserves cycle metadata", async () => {
    const persistence = new LocalStoragePersistence();
    await persistence.save(createTestState("c1", "Alpha", 10));
    await persistence.save(createTestState("c2", "Beta", 20));

    // listSaves includes id, name, savedAt, and cycle for each campaign
    const listed = await persistence.listSaves();
    expect(listed).toHaveLength(2);
    const byId = new Map(listed.map((s) => [s.id, s]));
    expect(byId.get("c1")!.name).toBe("Alpha");
    expect(byId.get("c1")!.cycle).toBe(10);
    expect(byId.get("c2")!.cycle).toBe(20);
    expect(new Date(byId.get("c1")!.savedAt).getTime()).not.toBeNaN();

    // load restores full state
    const loaded1 = await persistence.load("c1");
    expect(loaded1).not.toBeNull();
    expect(loaded1!.time.currentCycle).toBe(10);
    expect(loaded1!.empires).toBeInstanceOf(Map);

    // delete removes only the target; list reflects it
    await persistence.deleteSave("c1");
    const afterDelete = await persistence.listSaves();
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0].id).toBe("c2");
    expect(afterDelete[0].cycle).toBe(20);
    expect(await persistence.load("c1")).toBeNull();
  });

  it("overwriting a campaign updates its cycle in the index", async () => {
    const persistence = new LocalStoragePersistence();
    await persistence.save(createTestState("c1", "Game", 5));
    await persistence.save(createTestState("c1", "Game", 42));
    const listed = await persistence.listSaves();
    expect(listed).toHaveLength(1);
    expect(listed[0].cycle).toBe(42);
  });
});
