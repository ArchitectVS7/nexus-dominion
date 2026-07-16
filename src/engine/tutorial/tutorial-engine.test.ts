import { describe, it, expect } from "vitest";
import {
  createTutorialState,
  markTutorialSignal,
  markTutorialAction,
  skipTutorial,
  isTutorialProtectionActive,
  advanceTutorial,
  countPlayerUnits,
  TUTORIAL_OBJECTIVES,
  TUTORIAL_MAX_CYCLE,
} from "./tutorial-engine";
import { makeMinimalGameState } from "../cycle/cycle-test-fixtures";
import { createNewCampaign } from "../campaign/campaign-factory";
import type { GameState, TutorialState } from "../types/game-state";
import type { Fleet } from "../types/military";
import { EmpireId, SystemId, FleetId, UnitId } from "../types/ids";

/** Attach a fresh, active tutorial at a given objective index. */
function withTutorial(state: GameState, objectiveIndex: number, overrides: Partial<TutorialState> = {}): GameState {
  state.tutorial = {
    active: true,
    objectiveIndex,
    completed: TUTORIAL_OBJECTIVES.slice(0, objectiveIndex),
    signals: [],
    baselineUnitCount: 0,
    skipped: false,
    ...overrides,
  };
  return state;
}

/** Add a player-owned fleet carrying `unitCount` unit ids. */
function addPlayerFleet(state: GameState, unitCount: number): void {
  const fleet: Fleet = {
    id: FleetId("fleet-p"),
    ownerId: EmpireId("empire-0"),
    name: "Home Fleet",
    locationSystemId: SystemId("sys-0"),
    unitIds: Array.from({ length: unitCount }, (_, i) => UnitId(`u-${i}`)),
    targetSystemId: null,
    arrivalCycle: null,
  };
  state.fleets.set(fleet.id, fleet);
}

const SMALL_CONFIG = { totalSystems: 20, sectorCount: 2, systemsPerSector: 10, empireCount: 3, seed: 7 };

describe("Tutorial Engine", () => {
  describe("createTutorialState / opt-in factory", () => {
    it("createTutorialState starts active at objective 0 with empty progress", () => {
      const state = makeMinimalGameState(3);
      const t = createTutorialState(state);
      expect(t.active).toBe(true);
      expect(t.objectiveIndex).toBe(0);
      expect(t.completed).toEqual([]);
      expect(t.signals).toEqual([]);
      expect(t.baselineUnitCount).toBe(0);
      expect(t.skipped).toBe(false);
    });

    it("factory with { tutorial: true } starts an active tutorial at objective 0", () => {
      const state = createNewCampaign(SMALL_CONFIG, "Tutorial Run", { tutorial: true });
      expect(state.tutorial).toBeDefined();
      expect(state.tutorial!.active).toBe(true);
      expect(state.tutorial!.objectiveIndex).toBe(0);
    });

    it("factory without opt-in leaves tutorial undefined", () => {
      const state = createNewCampaign(SMALL_CONFIG, "Normal Run");
      expect(state.tutorial).toBeUndefined();
    });
  });

  describe("countPlayerUnits", () => {
    it("counts player fleet units plus build queue", () => {
      const state = makeMinimalGameState(3);
      expect(countPlayerUnits(state)).toBe(0);
      addPlayerFleet(state, 2);
      state.empires.get(EmpireId("empire-0"))!.buildQueue = [{} as any];
      expect(countPlayerUnits(state)).toBe(3);
    });
  });

  describe("objective completion — strict in-order", () => {
    it("explore: completes only after 'explored' signal", () => {
      const state = withTutorial(makeMinimalGameState(3), 0);
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(0); // not before its signal
      markTutorialSignal(state, "explored");
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(1);
      expect(state.tutorial!.completed).toEqual(["explore"]);
    });

    it("does NOT complete a later objective early (in-order enforcement)", () => {
      // At objective 0 (explore) but expand's condition is already satisfied.
      const state = withTutorial(makeMinimalGameState(3), 0);
      state.empires.get(EmpireId("empire-0"))!.systemIds = [SystemId("sys-0"), SystemId("sys-9")];
      advanceTutorial(state);
      // No "explored" signal → nothing advances despite expand being met.
      expect(state.tutorial!.objectiveIndex).toBe(0);
      expect(state.tutorial!.completed).toEqual([]);
    });

    it("expand: completes when player owns >= 2 systems", () => {
      const state = withTutorial(makeMinimalGameState(3), 1);
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(1); // still 1 system
      state.empires.get(EmpireId("empire-0"))!.systemIds = [SystemId("sys-0"), SystemId("sys-9")];
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(2);
    });

    it("military: completes when unit count exceeds baseline", () => {
      const state = withTutorial(makeMinimalGameState(3), 2, { baselineUnitCount: 0 });
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(2); // no units yet
      addPlayerFleet(state, 1);
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(3);
    });

    it("market: completes when 'market' action is marked", () => {
      const state = withTutorial(makeMinimalGameState(3), 3);
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(3);
      markTutorialAction(state, "market");
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(4);
    });

    it("combat-prep: completes on 'move-fleet' mark", () => {
      const state = withTutorial(makeMinimalGameState(3), 4);
      markTutorialAction(state, "move-fleet");
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(5);
      expect(state.tutorial!.completed).toEqual([...TUTORIAL_OBJECTIVES]);
    });

    it("combat-prep: also completes on 'attack' mark", () => {
      const state = withTutorial(makeMinimalGameState(3), 4);
      markTutorialAction(state, "attack");
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(5);
    });

    it("advances at most one objective per call", () => {
      const state = withTutorial(makeMinimalGameState(3), 0);
      // Satisfy explore AND market signals at once.
      markTutorialSignal(state, "explored");
      markTutorialSignal(state, "market");
      advanceTutorial(state);
      expect(state.tutorial!.objectiveIndex).toBe(1); // only explore advanced
    });
  });

  describe("deactivation after cycle 10", () => {
    it("hard-deactivates and makes no progress at TUTORIAL_MAX_CYCLE", () => {
      const state = withTutorial(makeMinimalGameState(3), 0);
      markTutorialSignal(state, "explored");
      state.time.currentCycle = TUTORIAL_MAX_CYCLE;
      advanceTutorial(state);
      expect(state.tutorial!.active).toBe(false);
      expect(state.tutorial!.objectiveIndex).toBe(0);
    });
  });

  describe("skipTutorial", () => {
    it("returns a new state with tutorial deactivated + skipped, original unmutated", () => {
      const state = withTutorial(makeMinimalGameState(3), 0);
      const next = skipTutorial(state);
      expect(next).not.toBe(state);
      expect(next.tutorial!.active).toBe(false);
      expect(next.tutorial!.skipped).toBe(true);
      // Purity: original object untouched.
      expect(state.tutorial!.active).toBe(true);
      expect(state.tutorial!.skipped).toBe(false);
    });

    it("is a no-op when no tutorial exists", () => {
      const state = makeMinimalGameState(3);
      expect(skipTutorial(state)).toBe(state);
    });
  });

  describe("isTutorialProtectionActive", () => {
    it("true when active, false after skip / deactivation / when absent", () => {
      const active = withTutorial(makeMinimalGameState(3), 0);
      expect(isTutorialProtectionActive(active)).toBe(true);

      expect(isTutorialProtectionActive(skipTutorial(active))).toBe(false);

      const deactivated = withTutorial(makeMinimalGameState(3), 0, { active: false });
      expect(isTutorialProtectionActive(deactivated)).toBe(false);

      expect(isTutorialProtectionActive(makeMinimalGameState(3))).toBe(false);
    });
  });

  describe("mark helpers are no-ops when inactive", () => {
    it("does not record signals when tutorial absent or inactive", () => {
      const absent = makeMinimalGameState(3);
      markTutorialSignal(absent, "explored");
      expect(absent.tutorial).toBeUndefined();

      const inactive = withTutorial(makeMinimalGameState(3), 0, { active: false });
      markTutorialSignal(inactive, "explored");
      expect(inactive.tutorial!.signals).toEqual([]);
    });

    it("deduplicates signals", () => {
      const state = withTutorial(makeMinimalGameState(3), 0);
      markTutorialSignal(state, "explored");
      markTutorialSignal(state, "explored");
      expect(state.tutorial!.signals).toEqual(["explored"]);
    });
  });
});
