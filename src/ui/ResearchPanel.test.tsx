// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ResearchPanel } from "./ResearchPanel";
import type { OrdersSummary } from "./orders";
import type { GameState } from "../engine/types";

const PLAYER = "empire-player";

/** An OrdersSummary with nothing queued — satisfies the required prop. */
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

/**
 * Builds a minimal GameState containing only the fields ResearchPanel reads.
 * `researchPath` / `specialization` drive the doctrine/specialisation draft
 * branches; `researchTier` drives which draft (if any) is required.
 */
function makeState(opts: {
  researchTier: number;
  researchPath?: string | null;
  specialization?: string | null;
  researchPoints?: number;
}): GameState {
  const empires = new Map<any, any>([
    [
      PLAYER,
      {
        id: PLAYER,
        name: "Player",
        researchTier: opts.researchTier,
        researchPath: opts.researchPath ?? null,
        specialization: opts.specialization ?? null,
        resources: { researchPoints: opts.researchPoints ?? 1000 },
      },
    ],
  ]);

  return {
    empires,
    playerEmpireId: PLAYER,
  } as unknown as GameState;
}

afterEach(() => cleanup());

describe("ResearchPanel — tier-advance queued note", () => {
  it("renders TIER ADVANCE QUEUED when a research order is queued", () => {
    const summary = emptySummary();
    summary.researchQueued = true;
    summary.totalOrders = 1;

    render(
      <ResearchPanel
        state={makeState({ researchTier: 2, researchPath: "war-machine" })}
        summary={summary}
        onClose={() => {}}
        onResearch={vi.fn()}
        onSelectDoctrine={vi.fn()}
        onSelectSpecialization={vi.fn()}
      />,
    );

    expect(screen.getByText(/TIER ADVANCE QUEUED/i)).toBeInTheDocument();
  });

  it("does not render the queued note when nothing is queued, and fires onResearch on ADVANCE", () => {
    const onResearch = vi.fn();
    render(
      <ResearchPanel
        state={makeState({ researchTier: 2, researchPath: "war-machine" })}
        summary={emptySummary()}
        onClose={() => {}}
        onResearch={onResearch}
        onSelectDoctrine={vi.fn()}
        onSelectSpecialization={vi.fn()}
      />,
    );

    expect(screen.queryByText(/TIER ADVANCE QUEUED/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /ADVANCE TO TIER 3/i }));
    expect(onResearch).toHaveBeenCalledTimes(1);
  });
});

describe("ResearchPanel — queued doctrine path", () => {
  it("tags the queued doctrine path row with QUEUED + queued class", () => {
    const summary = emptySummary();
    summary.doctrineQueued = "war-machine";
    summary.totalOrders = 1;

    render(
      <ResearchPanel
        // tier >= DOCTRINE_TIER with no path selected → doctrine draft is open.
        state={makeState({ researchTier: 1, researchPath: null })}
        summary={summary}
        onClose={() => {}}
        onResearch={vi.fn()}
        onSelectDoctrine={vi.fn()}
        onSelectSpecialization={vi.fn()}
      />,
    );

    const pathRow = screen.getByText("War Machine").closest(".research-panel__path");
    expect(pathRow).not.toBeNull();
    expect(pathRow).toHaveClass("queued");
    expect(within(pathRow as HTMLElement).getByText(/^QUEUED$/i)).toBeInTheDocument();

    // A non-queued path must not carry the queued class.
    const otherRow = screen.getByText("Fortress").closest(".research-panel__path");
    expect(otherRow).not.toHaveClass("queued");
  });

  it("fires onSelectDoctrine with the path id when its DRAFT button is clicked", () => {
    const onSelectDoctrine = vi.fn();
    render(
      <ResearchPanel
        state={makeState({ researchTier: 1, researchPath: null })}
        summary={emptySummary()}
        onClose={() => {}}
        onResearch={vi.fn()}
        onSelectDoctrine={onSelectDoctrine}
        onSelectSpecialization={vi.fn()}
      />,
    );

    const pathRow = screen.getByText("War Machine").closest(".research-panel__path") as HTMLElement;
    fireEvent.click(within(pathRow).getByRole("button", { name: /^DRAFT$/i }));
    expect(onSelectDoctrine).toHaveBeenCalledWith("war-machine");
  });
});

describe("ResearchPanel — queued specialisation", () => {
  it("tags the queued specialisation row with QUEUED + queued class", () => {
    const summary = emptySummary();
    summary.specializationQueued = "shock-troops";
    summary.totalOrders = 1;

    render(
      <ResearchPanel
        // tier >= SPECIALIZATION_TIER, path chosen, no spec yet → spec draft open.
        state={makeState({ researchTier: 3, researchPath: "war-machine", specialization: null })}
        summary={summary}
        onClose={() => {}}
        onResearch={vi.fn()}
        onSelectDoctrine={vi.fn()}
        onSelectSpecialization={vi.fn()}
      />,
    );

    const specRow = screen.getByText("shock troops").closest(".research-panel__spec");
    expect(specRow).not.toBeNull();
    expect(specRow).toHaveClass("queued");
    expect(within(specRow as HTMLElement).getByText(/^QUEUED$/i)).toBeInTheDocument();

    const otherSpec = screen.getByText("siege engines").closest(".research-panel__spec");
    expect(otherSpec).not.toHaveClass("queued");
  });

  it("fires onSelectSpecialization with the spec id when its DRAFT button is clicked", () => {
    const onSelectSpecialization = vi.fn();
    render(
      <ResearchPanel
        state={makeState({ researchTier: 3, researchPath: "war-machine", specialization: null })}
        summary={emptySummary()}
        onClose={() => {}}
        onResearch={vi.fn()}
        onSelectDoctrine={vi.fn()}
        onSelectSpecialization={onSelectSpecialization}
      />,
    );

    const specRow = screen.getByText("shock troops").closest(".research-panel__spec") as HTMLElement;
    fireEvent.click(within(specRow).getByRole("button", { name: /^DRAFT$/i }));
    expect(onSelectSpecialization).toHaveBeenCalledWith("shock-troops");
  });
});
