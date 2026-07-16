// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MilitaryPanel } from "./MilitaryPanel";
import type { OrdersSummary } from "./orders";
import type { GameState } from "../engine/types";

/** An OrdersSummary with nothing queued — used to satisfy the required prop. */
function emptySummary(): OrdersSummary {
  return {
    systemIntents: new Map(),
    buildUnitCounts: new Map(),
    trades: [],
    researchQueued: false,
    doctrineQueued: null,
    specializationQueued: null,
    totalOrders: 0,
  };
}

const PLAYER = "empire-player";
const SYS_HOME = "sys-home";
const SYS_B = "sys-b";

interface FleetOpts {
  id: string;
  name: string;
  locationSystemId: string;
  targetSystemId?: string | null;
  arrivalCycle?: number | null;
}

function makeFleet(opts: FleetOpts) {
  return {
    id: opts.id,
    ownerId: PLAYER,
    name: opts.name,
    locationSystemId: opts.locationSystemId,
    unitIds: [],
    targetSystemId: opts.targetSystemId ?? null,
    arrivalCycle: opts.arrivalCycle ?? null,
  };
}

/**
 * Builds a minimal GameState containing only the fields MilitaryPanel reads.
 */
function makeState(fleetList: ReturnType<typeof makeFleet>[]): GameState {
  const systems = new Map<any, any>([
    [SYS_HOME, { id: SYS_HOME, name: "Home Base" }],
    [SYS_B, { id: SYS_B, name: "Rigel" }],
  ]);

  const fleets = new Map<any, any>();
  const fleetIds: string[] = [];
  for (const f of fleetList) {
    fleets.set(f.id, f);
    fleetIds.push(f.id);
  }

  const empires = new Map<any, any>([
    [
      PLAYER,
      {
        id: PLAYER,
        name: "Player",
        homeSystemId: SYS_HOME,
        fleetIds,
        resources: { credits: 500, ore: 100 },
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
    fleets,
    time: { currentCycle: 3 },
  } as unknown as GameState;
}

afterEach(() => cleanup());

describe("MilitaryPanel — fleet movement orders", () => {
  it("renders a fleet row with its location", () => {
    render(
      <MilitaryPanel
        state={makeState([
          makeFleet({ id: "fleet-1", name: "First Fleet", locationSystemId: SYS_HOME }),
        ])}
        summary={emptySummary()}
        onClose={() => {}}
        onBuildUnit={vi.fn()}
        onMoveFleet={vi.fn()}
      />,
    );

    expect(screen.getByText(/First Fleet/i)).toBeInTheDocument();
    expect(screen.getByText(/Location: Home Base/i)).toBeInTheDocument();
  });

  it("onMoveFleet fires with the chosen fleet + destination", () => {
    const onMoveFleet = vi.fn();
    render(
      <MilitaryPanel
        state={makeState([
          makeFleet({ id: "fleet-1", name: "First Fleet", locationSystemId: SYS_HOME }),
        ])}
        summary={emptySummary()}
        onClose={() => {}}
        onBuildUnit={vi.fn()}
        onMoveFleet={onMoveFleet}
      />,
    );

    const moveBtn = screen.getByRole("button", { name: /move/i });
    // Disabled until a destination is chosen.
    expect(moveBtn).toBeDisabled();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: SYS_B } });
    expect(moveBtn).toBeEnabled();

    fireEvent.click(moveBtn);
    expect(onMoveFleet).toHaveBeenCalledTimes(1);
    expect(onMoveFleet).toHaveBeenCalledWith("fleet-1", SYS_B);
  });

  it("in-transit fleet shows arrival cycle and no move control", () => {
    render(
      <MilitaryPanel
        state={makeState([
          makeFleet({
            id: "fleet-1",
            name: "First Fleet",
            locationSystemId: SYS_HOME,
            targetSystemId: SYS_B,
            arrivalCycle: 7,
          }),
        ])}
        summary={emptySummary()}
        onClose={() => {}}
        onBuildUnit={vi.fn()}
        onMoveFleet={vi.fn()}
      />,
    );

    expect(screen.getByText(/Arrival Cyc 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Rigel/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /move/i })).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});

describe("MilitaryPanel — queued build chips", () => {
  it("renders a QUEUED ×N chip on a unit with queued build orders", () => {
    const summary = emptySummary();
    summary.buildUnitCounts.set("fighter", 3);

    render(
      <MilitaryPanel
        state={makeState([])}
        summary={summary}
        onClose={() => {}}
        onBuildUnit={vi.fn()}
        onMoveFleet={vi.fn()}
      />,
    );

    expect(screen.getByText(/QUEUED ×3/i)).toBeInTheDocument();
  });

  it("renders no chip when nothing is queued for that unit", () => {
    render(
      <MilitaryPanel
        state={makeState([])}
        summary={emptySummary()}
        onClose={() => {}}
        onBuildUnit={vi.fn()}
        onMoveFleet={vi.fn()}
      />,
    );

    expect(screen.queryByText(/QUEUED ×/i)).toBeNull();
  });
});
