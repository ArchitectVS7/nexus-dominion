// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GameStateProvider } from "./hooks/useGameState";
import App from "./App";
import { processCycle } from "./engine/cycle/cycle-processor";
import type { CycleResult } from "./engine/cycle/cycle-processor";
import type { GameState } from "./engine/types";

/* ── Minimal GameState builder (hoisted so the vi.mock factory can use it) ── */
const { buildState } = vi.hoisted(() => {
  const PLAYER = "empire-player";
  const SYS_HOME = "sys-home";

  function buildState(): GameState {
    const systems = new Map<any, any>([
      [SYS_HOME, { id: SYS_HOME, name: "Home Base", owner: PLAYER }],
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
      galaxy: { systems, sectors: new Map() },
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

  return { buildState };
});

vi.mock("./engine/campaign/campaign-factory", () => ({
  createNewCampaign: () => buildState(),
}));

vi.mock("./engine/cycle/cycle-processor", () => ({
  processCycle: vi.fn(),
}));

const mockedProcessCycle = vi.mocked(processCycle);

/** Default: a successful commit that advances the cycle by exactly one. */
function successResult(state: GameState): CycleResult {
  const nextCycle = state.time.currentCycle + 1;
  return {
    state: {
      ...state,
      time: { ...state.time, currentCycle: nextCycle },
    } as GameState,
    report: {
      cycle: nextCycle,
      events: [],
      playerResourceDeltas: {},
      reckoningOccurred: false,
    },
    committed: true,
  };
}

beforeEach(() => {
  mockedProcessCycle.mockReset();
  mockedProcessCycle.mockImplementation((state) => successResult(state));
});

afterEach(() => cleanup());

/* ── Helpers ── */

function renderApp() {
  return render(
    <GameStateProvider>
      <App />
    </GameStateProvider>,
  );
}

function startCampaign() {
  fireEvent.click(screen.getByText("NEW CAMPAIGN"));
}

function commitButton(): HTMLButtonElement {
  const btn = screen
    .getAllByRole("button")
    .find((b) => /CYCLE/.test(b.textContent ?? ""));
  if (!btn) throw new Error("commit button not found");
  return btn as HTMLButtonElement;
}

function cycleNumber(container: HTMLElement): string {
  // The TurnStatus readout renders "CYCLE {n} · CONFLUENCE …"; pull the cycle.
  const readout =
    container.querySelector('[data-testid="turn-status-readout"]')
      ?.textContent ?? "";
  return readout.match(/CYCLE (\d+)/)?.[1] ?? "";
}

function creditsValue(container: HTMLElement): string {
  // First resource item in the HUD bottom bar is credits.
  return (
    container.querySelector(".hud__res-item .hud__res-val")?.textContent ?? ""
  );
}

/** Open MARKET and queue a BUY of the currently-selected resource (100 units). */
function buyOre() {
  fireEvent.click(screen.getByRole("button", { name: "MARKET" }));
  fireEvent.click(screen.getByRole("button", { name: "⟫ BUY" }));
}

describe("App — orders queue (queue-then-commit)", () => {
  it("a panel action enqueues without advancing the cycle or changing resources", () => {
    const { container } = renderApp();
    startCampaign();

    const cycleBefore = cycleNumber(container);
    const creditsBefore = creditsValue(container);
    expect(cycleBefore).toBe("1");
    expect(creditsBefore).toBe("500");

    buyOre();
    // Close the market panel by clicking its overlay is unnecessary; assert state.
    expect(mockedProcessCycle).not.toHaveBeenCalled();
    expect(cycleNumber(container)).toBe("1");
    expect(creditsValue(container)).toBe("500");

    // The order appears in the tray.
    const tray = screen.getByTestId("orders-tray");
    expect(within(tray).getByText("BUY 100 ORE")).toBeInTheDocument();
  });

  it("COMMIT advances the cycle exactly once, shows one report, and clears the queue", () => {
    const { container } = renderApp();
    startCampaign();
    buyOre();

    fireEvent.click(commitButton());

    expect(mockedProcessCycle).toHaveBeenCalledTimes(1);
    expect(cycleNumber(container)).toBe("2");
    expect(screen.getAllByText(/Cycle 2 Report/i)).toHaveLength(1);

    const tray = screen.getByTestId("orders-tray");
    expect(within(tray).getByText("NO ORDERS QUEUED")).toBeInTheDocument();
  });

  it("committing an EMPTY queue requires two clicks", () => {
    renderApp();
    startCampaign();

    // First click arms the confirm; nothing is committed yet.
    fireEvent.click(commitButton());
    expect(mockedProcessCycle).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "CONFIRM: PASS CYCLE" }),
    ).toBeInTheDocument();

    // Second click passes the (empty) cycle.
    fireEvent.click(commitButton());
    expect(mockedProcessCycle).toHaveBeenCalledTimes(1);
    expect(mockedProcessCycle.mock.calls[0][1].actions).toEqual([]);
  });

  it("a removed order is not sent to the engine", () => {
    renderApp();
    startCampaign();

    // Queue two distinct trades: BUY ORE then BUY FOOD.
    fireEvent.click(screen.getByRole("button", { name: "MARKET" }));
    fireEvent.click(screen.getByRole("button", { name: "⟫ BUY" })); // ore (default)
    fireEvent.click(screen.getByRole("button", { name: /food/i })); // select food card
    fireEvent.click(screen.getByRole("button", { name: "⟫ BUY" })); // food

    const tray = screen.getByTestId("orders-tray");
    expect(within(tray).getByText("BUY 100 ORE")).toBeInTheDocument();
    expect(within(tray).getByText("BUY 100 FOOD")).toBeInTheDocument();

    // Remove the ORE order.
    fireEvent.click(
      within(tray).getByRole("button", { name: "remove BUY 100 ORE" }),
    );
    expect(within(tray).queryByText("BUY 100 ORE")).toBeNull();

    fireEvent.click(commitButton());
    expect(mockedProcessCycle).toHaveBeenCalledTimes(1);
    expect(mockedProcessCycle.mock.calls[0][1].actions).toEqual([
      { type: "trade", details: { resource: "food", quantity: 100, direction: "buy" } },
    ]);
  });

  it("powerHistory accrues one score per empire per committed cycle (ND-P1)", () => {
    renderApp();
    startCampaign();

    // Two committed cycles (each via an order so no double-click confirm).
    buyOre();
    fireEvent.click(commitButton());
    buyOre();
    fireEvent.click(commitButton());
    buyOre();
    fireEvent.click(commitButton());

    // The App hands processCycle a LIVE Map it maintains; after 3 committed
    // cycles it must hold 3 pushed scores per empire — the caller-maintained
    // contract (integration.test.ts). Before the fix it was permanently empty.
    const third = mockedProcessCycle.mock.calls[2];
    const history = third[2] as Map<string, number[]>;
    expect(history.get("empire-player")?.length).toBe(3);
  });

  it("a failed commit preserves the queue and shows the error banner", () => {
    const { container } = renderApp();
    startCampaign();
    buyOre();

    mockedProcessCycle.mockImplementationOnce((state) => ({
      state,
      report: {
        cycle: state.time.currentCycle,
        events: [],
        playerResourceDeltas: {},
        reckoningOccurred: false,
      },
      committed: false,
      error: "forced tier-1 failure",
    }));

    fireEvent.click(commitButton());

    // Banner shown, cycle not advanced, order still queued.
    expect(screen.getByRole("alert")).toHaveTextContent(/COMMIT FAILED/i);
    expect(cycleNumber(container)).toBe("1");
    const tray = screen.getByTestId("orders-tray");
    expect(within(tray).getByText("BUY 100 ORE")).toBeInTheDocument();
  });
});
