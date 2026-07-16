// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GameStateProvider, useGameState } from "./hooks/useGameState";
import App from "./App";
import { processCycle } from "./engine/cycle/cycle-processor";
import type { CycleResult } from "./engine/cycle/cycle-processor";
import type { GameState } from "./engine/types";

/* ── Fixtures (hoisted so the vi.mock factory can reach them) ──
   The campaign-factory mock honours the tutorial option — this is what T-117
   wires from App via isFirstPlay(). A plain state carries no `tutorial` key
   (mirrors an old save); a tutorial state carries an active TutorialState. */
const { buildPlainState, buildTutorialState } = vi.hoisted(() => {
  const PLAYER = "empire-player";
  const SYS_HOME = "sys-home";

  function baseState(): GameState {
    // Home system positioned at the world origin so the StarMap hit-test can
    // resolve a click there to a system selection.
    const systems = new Map<any, any>([
      [
        SYS_HOME,
        {
          id: SYS_HOME,
          name: "Home Base",
          owner: PLAYER,
          isHomeSystem: true,
          sectorId: "sector-0",
          position: { x: 0, y: 0 },
          biome: "temperate-world",
          adjacentSystemIds: [],
          slots: [],
        },
      ],
    ]);

    const sectors = new Map<any, any>([
      [
        "sector-0",
        {
          id: "sector-0",
          name: "Sector Zero",
          systemIds: [SYS_HOME],
          centre: { x: 0, y: 0 },
        },
      ],
    ]);

    const empires = new Map<any, any>([
      [
        PLAYER,
        {
          id: PLAYER,
          name: "Player",
          homeSystemId: SYS_HOME,
          systemIds: [SYS_HOME],
          fleetIds: [],
          resources: {
            credits: 500,
            food: 100,
            ore: 100,
            fuelCells: 100,
            researchPoints: 50,
          },
          buildQueue: [],
          powerScore: 0,
          researchTier: 0,
          researchPath: "balanced",
        },
      ],
    ]);

    return {
      galaxy: { systems, sectors },
      empires,
      playerEmpireId: PLAYER,
      unitTypes: new Map(),
      units: new Map(),
      fleets: new Map(),
      time: { currentCycle: 1 },
      market: {
        prices: { food: 2, ore: 2, fuelCells: 2 },
        basePrices: { food: 2, ore: 2, fuelCells: 2 },
      },
      currentCycleEvents: [],
      diplomacy: { pacts: new Map(), relationships: new Map() },
      campaign: { seed: 42 },
    } as unknown as GameState;
  }

  function buildPlainState(): GameState {
    return baseState();
  }

  function buildTutorialState(): GameState {
    const state = baseState();
    (state as any).tutorial = {
      active: true,
      objectiveIndex: 0,
      completed: [],
      signals: [],
      baselineUnitCount: 0,
      skipped: false,
    };
    return state;
  }

  return { buildPlainState, buildTutorialState };
});

vi.mock("./engine/campaign/campaign-factory", () => ({
  createNewCampaign: (_c: any, _n: any, opts?: { tutorial?: boolean }) =>
    opts?.tutorial ? buildTutorialState() : buildPlainState(),
}));

vi.mock("./engine/cycle/cycle-processor", () => ({
  processCycle: vi.fn(),
}));

const mockedProcessCycle = vi.mocked(processCycle);

function successResult(state: GameState): CycleResult {
  const nextCycle = state.time.currentCycle + 1;
  return {
    state: { ...state, time: { ...state.time, currentCycle: nextCycle } } as GameState,
    report: {
      cycle: nextCycle,
      events: [],
      playerResourceDeltas: {},
      reckoningOccurred: false,
    },
    committed: true,
  };
}

/* ── StarMap click harness (mirrors StarMap.test.tsx) ── */
const RECT = { left: 0, top: 0, width: 800, height: 600 };
const ZOOM = 0.8;
function worldToClient(wx: number, wy: number) {
  return {
    clientX: wx * ZOOM + RECT.width / 2 + RECT.left,
    clientY: wy * ZOOM + RECT.height / 2 + RECT.top,
  };
}
function clickWorld(canvas: HTMLCanvasElement, wx: number, wy: number) {
  const { clientX, clientY } = worldToClient(wx, wy);
  fireEvent.mouseDown(canvas, { clientX, clientY });
  fireEvent.mouseUp(window, { clientX, clientY });
}

beforeEach(() => {
  localStorage.clear();
  mockedProcessCycle.mockReset();
  mockedProcessCycle.mockImplementation((state) => successResult(state));
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    ...RECT,
    right: RECT.left + RECT.width,
    bottom: RECT.top + RECT.height,
    x: RECT.left,
    y: RECT.top,
    toJSON: () => ({}),
  } as DOMRect);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/* Reads the live context state and mirrors tutorial.skipped into the DOM so
   tests can assert the state-level outcome of the skip flow (not just overlay
   absence, which alone can't distinguish a skip from a cycle-10 deactivation). */
function TutorialStateProbe() {
  const { state } = useGameState();
  const skipped = (state as any)?.tutorial?.skipped;
  return (
    <div
      data-testid="tutorial-state-probe"
      data-skipped={skipped === undefined ? "undefined" : String(skipped)}
    />
  );
}

function renderApp() {
  return render(
    <GameStateProvider>
      <App />
      <TutorialStateProbe />
    </GameStateProvider>,
  );
}

function startCampaign() {
  fireEvent.click(screen.getByText("NEW CAMPAIGN"));
}

describe("App — tutorial overlay + first-play flag (T-117)", () => {
  it("clean localStorage → NEW CAMPAIGN yields an active tutorial + visible overlay", () => {
    renderApp();
    startCampaign();
    expect(screen.getByTestId("tutorial-overlay")).toBeInTheDocument();
    expect(screen.getByText("DIRECTED START 0/5")).toBeInTheDocument();
  });

  it("a second NEW CAMPAIGN (flag now set) yields neither tutorial nor overlay", () => {
    // First campaign sets the first-play flag via markFirstPlayDone(). Once a
    // campaign is loaded the title screen (and its NEW CAMPAIGN button) is gone,
    // so we remount for the second start — localStorage persists across the
    // remount (only beforeEach clears it), so the flag stays set.
    renderApp();
    startCampaign();
    expect(screen.getByTestId("tutorial-overlay")).toBeInTheDocument();

    cleanup();

    // Second campaign: isFirstPlay() is now false → factory returns a plain
    // (no-tutorial) state → no overlay (also covers old-save `tutorial` undefined).
    renderApp();
    startCampaign();
    expect(screen.queryByTestId("tutorial-overlay")).toBeNull();
  });

  it("selecting a system at objective 0 records the signal and updates the checklist", () => {
    const { container } = renderApp();
    startCampaign();

    const canvas = container.querySelector("canvas")!;
    clickWorld(canvas, 0, 0); // hits the home system at the origin

    // The explore row now shows the pending tick; the header has NOT advanced
    // (the engine confirms/advances on the next commit).
    const items = screen
      .getByTestId("tutorial-overlay")
      .querySelectorAll(".tutorial-overlay__item");
    expect(items[0]).toHaveClass("tutorial-overlay__item--current-pending");
    expect(screen.getByText("DIRECTED START 0/5")).toBeInTheDocument();
  });

  it("SKIP requires two clicks, hides the overlay, and sets tutorial.skipped = true", () => {
    renderApp();
    startCampaign();

    // Tutorial is active but not yet skipped.
    expect(screen.getByTestId("tutorial-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("tutorial-state-probe")).toHaveAttribute(
      "data-skipped",
      "false",
    );

    // First click arms the confirm; overlay still present, still not skipped.
    fireEvent.click(screen.getByRole("button", { name: "SKIP TUTORIAL" }));
    expect(screen.getByTestId("tutorial-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("tutorial-state-probe")).toHaveAttribute(
      "data-skipped",
      "false",
    );

    // Second click dispatches skipTutorial → active=false → overlay removed,
    // and — crucially — the live GameState now carries tutorial.skipped = true.
    fireEvent.click(screen.getByRole("button", { name: "CONFIRM SKIP" }));
    expect(screen.queryByTestId("tutorial-overlay")).toBeNull();
    expect(screen.getByTestId("tutorial-state-probe")).toHaveAttribute(
      "data-skipped",
      "true",
    );
  });
});
