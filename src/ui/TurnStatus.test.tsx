// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TurnStatus } from "./TurnStatus";
import type { GameState } from "../engine/types";

const PLAYER = "empire-player";
const ENEMY = "empire-enemy";

interface StateOpts {
  currentCycle?: number;
  currentConfluence?: number;
  cyclesUntilReckoning?: number;
  tier?: string;
  credits?: number;
  researchPoints?: number;
  /** systems keyed by id: { owner, adjacentSystemIds, slots } */
  systems?: Record<
    string,
    {
      owner: string | null;
      adjacentSystemIds?: string[];
      slots?: { locked: boolean; installation: unknown }[];
    }
  >;
  playerSystemIds?: string[];
  unitTypes?: Record<string, { buildCost: number }>;
  fleets?: Record<string, { ownerId: string; unitIds: string[] }>;
  units?: Record<string, { completionCycle: number | null }>;
}

function makeState(opts: StateOpts = {}): GameState {
  const systems = new Map<any, any>();
  for (const [id, s] of Object.entries(opts.systems ?? {})) {
    systems.set(id, {
      id,
      owner: s.owner,
      adjacentSystemIds: s.adjacentSystemIds ?? [],
      slots: s.slots ?? [],
    });
  }

  const unitTypes = new Map<any, any>();
  for (const [id, u] of Object.entries(opts.unitTypes ?? {})) {
    unitTypes.set(id, { id, ...u });
  }

  const fleets = new Map<any, any>();
  for (const [id, f] of Object.entries(opts.fleets ?? {})) {
    fleets.set(id, { id, ...f });
  }

  const units = new Map<any, any>();
  for (const [id, u] of Object.entries(opts.units ?? {})) {
    units.set(id, { id, ...u });
  }

  const empires = new Map<any, any>([
    [
      PLAYER,
      {
        id: PLAYER,
        systemIds: opts.playerSystemIds ?? [],
        resources: {
          credits: opts.credits ?? 0,
          researchPoints: opts.researchPoints ?? 0,
        },
      },
    ],
  ]);

  return {
    galaxy: { systems, sectors: new Map() },
    empires,
    playerEmpireId: PLAYER,
    unitTypes,
    units,
    fleets,
    time: {
      currentCycle: opts.currentCycle ?? 1,
      currentConfluence: opts.currentConfluence ?? 1,
      cyclesUntilReckoning: opts.cyclesUntilReckoning ?? 9,
      cosmicOrder: {
        tiers: new Map([[PLAYER, opts.tier ?? "sovereign"]]),
        rankings: [],
      },
    },
  } as unknown as GameState;
}

afterEach(() => cleanup());

describe("TurnStatus — readout", () => {
  it("renders the exact readout string for a fixture state", () => {
    render(
      <TurnStatus
        state={makeState({
          currentCycle: 7,
          currentConfluence: 2,
          cyclesUntilReckoning: 3,
          tier: "sovereign",
        })}
        onCommitCycle={vi.fn()}
      />,
    );

    expect(screen.getByTestId("turn-status-readout").textContent).toBe(
      "CYCLE 7 · CONFLUENCE 2 · RECKONING IN 3 · SOVEREIGN",
    );
  });
});

describe("TurnStatus — commit button", () => {
  it("renders the queued-order count on the commit button", () => {
    render(
      <TurnStatus state={makeState()} orderCount={4} onCommitCycle={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "⟫ COMMIT CYCLE (4)" }),
    ).toBeInTheDocument();
  });

  it("shows PASS CYCLE when no orders are queued", () => {
    render(
      <TurnStatus state={makeState()} orderCount={0} onCommitCycle={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "⟫ PASS CYCLE" }),
    ).toBeInTheDocument();
  });

  it("shows the confirming pass label when pendingPass is set", () => {
    render(
      <TurnStatus
        state={makeState()}
        orderCount={0}
        pendingPass
        onCommitCycle={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "CONFIRM: PASS CYCLE" }),
    ).toBeInTheDocument();
  });
});

describe("TurnStatus — available-actions dropdown", () => {
  it("is hidden until the chevron is expanded, then shows the list", () => {
    render(<TurnStatus state={makeState()} onCommitCycle={vi.fn()} />);

    // Trade is always available — but the list is not rendered until expanded.
    expect(screen.queryByTestId("turn-status-actions")).toBeNull();
    expect(screen.queryByText(/Trade/)).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /available actions/i }),
    );

    expect(screen.getByTestId("turn-status-actions")).toBeInTheDocument();
    expect(screen.getByText(/Trade/)).toBeInTheDocument();
  });

  it("shows the Colonise row when an adjacent unclaimed system exists", () => {
    const state = makeState({
      playerSystemIds: ["sys-home"],
      systems: {
        "sys-home": { owner: PLAYER, adjacentSystemIds: ["sys-empty"] },
        "sys-empty": { owner: null },
      },
    });
    render(<TurnStatus state={state} onCommitCycle={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /available actions/i }),
    );

    expect(screen.getByText(/Colonise/)).toBeInTheDocument();
  });

  it("omits the Colonise row when no adjacent system is unclaimed", () => {
    const state = makeState({
      playerSystemIds: ["sys-home"],
      systems: {
        "sys-home": { owner: PLAYER, adjacentSystemIds: ["sys-enemy"] },
        "sys-enemy": { owner: ENEMY },
      },
    });
    render(<TurnStatus state={state} onCommitCycle={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /available actions/i }),
    );

    // The dropdown is open (Trade proves it) but Colonise is absent.
    expect(screen.getByText(/Trade/)).toBeInTheDocument();
    expect(screen.queryByText(/Colonise/)).toBeNull();
  });
});
