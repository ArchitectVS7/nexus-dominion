import { describe, it, expect } from "vitest";
import { InMemoryStatePersistence } from "./state-persistence";
import { EmpireId, SystemId, SectorId } from "../types/ids";
import type { GameState } from "../types/game-state";

/* ── Minimal GameState fixture ── */

function createTestState(campaignId = "campaign-1", name = "Test Campaign"): GameState {
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
      currentCycle: 3,
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

/* ── Tests ── */

describe("InMemoryStatePersistence", () => {
  describe("save", () => {
    it("saves a game state without throwing", async () => {
      const persistence = new InMemoryStatePersistence();
      const state = createTestState();
      await expect(persistence.save(state)).resolves.toBeUndefined();
    });

    it("updates lastSavedAt timestamp on save", async () => {
      const persistence = new InMemoryStatePersistence();
      const state = createTestState();
      state.campaign.lastSavedAt = "2020-01-01T00:00:00Z";
      await persistence.save(state);
      const loaded = await persistence.load("campaign-1");
      // lastSavedAt should be more recent than the original
      expect(loaded!.campaign.lastSavedAt).not.toBe("2020-01-01T00:00:00Z");
    });
  });

  describe("load", () => {
    it("loads a previously saved state", async () => {
      const persistence = new InMemoryStatePersistence();
      const state = createTestState();
      await persistence.save(state);
      const loaded = await persistence.load("campaign-1");
      expect(loaded).not.toBeNull();
      expect(loaded!.campaign.id).toBe("campaign-1");
      expect(loaded!.campaign.name).toBe("Test Campaign");
    });

    it("returns null for non-existent campaign", async () => {
      const persistence = new InMemoryStatePersistence();
      const loaded = await persistence.load("nonexistent");
      expect(loaded).toBeNull();
    });

    it("restores Map instances after round-trip", async () => {
      const persistence = new InMemoryStatePersistence();
      const state = createTestState();
      await persistence.save(state);
      const loaded = await persistence.load("campaign-1");
      expect(loaded!.empires).toBeInstanceOf(Map);
      expect(loaded!.galaxy.systems).toBeInstanceOf(Map);
      expect(loaded!.diplomacy.pacts).toBeInstanceOf(Map);
    });

    it("preserves empire data after round-trip", async () => {
      const persistence = new InMemoryStatePersistence();
      const state = createTestState();
      await persistence.save(state);
      const loaded = await persistence.load("campaign-1");
      const empire = loaded!.empires.get(EmpireId("e-player"))!;
      expect(empire.name).toBe("Player");
      expect(empire.resources.credits).toBe(500);
    });
  });

  describe("listSaves", () => {
    it("returns empty array when no saves exist", async () => {
      const persistence = new InMemoryStatePersistence();
      const saves = await persistence.listSaves();
      expect(saves).toHaveLength(0);
    });

    it("lists all saved campaigns", async () => {
      const persistence = new InMemoryStatePersistence();
      await persistence.save(createTestState("c1", "Campaign Alpha"));
      await persistence.save(createTestState("c2", "Campaign Beta"));
      const saves = await persistence.listSaves();
      expect(saves).toHaveLength(2);
      expect(saves.map(s => s.id)).toContain("c1");
      expect(saves.map(s => s.id)).toContain("c2");
    });

    it("each entry has id, name, and savedAt", async () => {
      const persistence = new InMemoryStatePersistence();
      await persistence.save(createTestState("c1", "My Game"));
      const saves = await persistence.listSaves();
      expect(saves[0].id).toBe("c1");
      expect(saves[0].name).toBe("My Game");
      expect(saves[0].savedAt).toBeDefined();
    });

    it("overwrites existing save for same campaign", async () => {
      const persistence = new InMemoryStatePersistence();
      await persistence.save(createTestState("c1", "Version 1"));
      await persistence.save(createTestState("c1", "Version 2"));
      const saves = await persistence.listSaves();
      expect(saves).toHaveLength(1);
      expect(saves[0].name).toBe("Version 2");
    });
  });

  describe("deleteSave", () => {
    it("removes a saved campaign", async () => {
      const persistence = new InMemoryStatePersistence();
      await persistence.save(createTestState("c1", "Doomed"));
      await persistence.deleteSave("c1");
      const loaded = await persistence.load("c1");
      expect(loaded).toBeNull();
    });

    it("does not throw for non-existent campaign", async () => {
      const persistence = new InMemoryStatePersistence();
      await expect(persistence.deleteSave("nonexistent")).resolves.toBeUndefined();
    });

    it("only deletes the specified campaign", async () => {
      const persistence = new InMemoryStatePersistence();
      await persistence.save(createTestState("c1", "Keep"));
      await persistence.save(createTestState("c2", "Delete"));
      await persistence.deleteSave("c2");
      const saves = await persistence.listSaves();
      expect(saves).toHaveLength(1);
      expect(saves[0].id).toBe("c1");
    });
  });

  describe("isolation", () => {
    it("loaded state is independent of subsequent saves", async () => {
      const persistence = new InMemoryStatePersistence();
      const state = createTestState("c1", "Original");
      await persistence.save(state);
      const loaded1 = await persistence.load("c1");

      // Modify original and re-save
      state.campaign.name = "Modified";
      state.empires.get(EmpireId("e-player"))!.resources.credits = 9999;
      await persistence.save(state);

      // First loaded state should not have changed
      expect(loaded1!.campaign.name).toBe("Original");
      expect(loaded1!.empires.get(EmpireId("e-player"))!.resources.credits).toBe(500);
    });

    it("two loads of same campaign return independent objects", async () => {
      const persistence = new InMemoryStatePersistence();
      await persistence.save(createTestState("c1", "Test"));
      const a = await persistence.load("c1");
      const b = await persistence.load("c1");
      // Mutate one, check other is unaffected
      a!.empires.get(EmpireId("e-player"))!.resources.credits = 0;
      expect(b!.empires.get(EmpireId("e-player"))!.resources.credits).toBe(500);
    });
  });

  describe("listSaves — timestamps", () => {
    it("savedAt is a valid ISO 8601 string", async () => {
      const persistence = new InMemoryStatePersistence();
      await persistence.save(createTestState("c1", "Test"));
      const saves = await persistence.listSaves();
      const parsed = new Date(saves[0].savedAt);
      expect(parsed.getTime()).not.toBeNaN();
    });

    it("later save has more recent savedAt", async () => {
      const persistence = new InMemoryStatePersistence();
      await persistence.save(createTestState("c1", "First"));
      const saves1 = await persistence.listSaves();
      const t1 = saves1[0].savedAt;

      // Small delay to ensure different timestamp
      await new Promise(r => setTimeout(r, 5));
      await persistence.save(createTestState("c1", "Second"));
      const saves2 = await persistence.listSaves();
      const t2 = saves2[0].savedAt;
      expect(t2 >= t1).toBe(true);
    });
  });

  describe("save + load preserves time state", () => {
    it("currentCycle and cosmicOrder survive round-trip", async () => {
      const persistence = new InMemoryStatePersistence();
      const state = createTestState();
      await persistence.save(state);
      const loaded = await persistence.load("campaign-1");
      expect(loaded!.time.currentCycle).toBe(3);
      expect(loaded!.time.cosmicOrder.tiers).toBeInstanceOf(Map);
    });
  });
});
