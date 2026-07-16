// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TutorialOverlay } from "./TutorialOverlay";
import type { TutorialState } from "../engine/types";

function makeTutorial(overrides: Partial<TutorialState> = {}): TutorialState {
  return {
    active: true,
    objectiveIndex: 0,
    completed: [],
    signals: [],
    baselineUnitCount: 0,
    skipped: false,
    ...overrides,
  };
}

afterEach(() => cleanup());

describe("TutorialOverlay", () => {
  it("renders the DIRECTED START header with completed count out of 5", () => {
    render(<TutorialOverlay tutorial={makeTutorial()} onSkip={vi.fn()} />);
    expect(screen.getByText("DIRECTED START 0/5")).toBeInTheDocument();
  });

  it("reflects progress in the header count", () => {
    render(
      <TutorialOverlay
        tutorial={makeTutorial({ objectiveIndex: 2, completed: ["explore", "expand"] })}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText("DIRECTED START 2/5")).toBeInTheDocument();
  });

  it("has the fixed-position class on the root element", () => {
    render(<TutorialOverlay tutorial={makeTutorial()} onSkip={vi.fn()} />);
    expect(screen.getByTestId("tutorial-overlay")).toHaveClass("tutorial-overlay");
  });

  it("marks completed / current / future items and shows the current instruction", () => {
    render(
      <TutorialOverlay
        tutorial={makeTutorial({ objectiveIndex: 1, completed: ["explore"] })}
        onSkip={vi.fn()}
      />,
    );
    const items = screen
      .getByTestId("tutorial-overlay")
      .querySelectorAll(".tutorial-overlay__item");
    expect(items[0]).toHaveClass("tutorial-overlay__item--done");
    expect(items[1]).toHaveClass("tutorial-overlay__item--current");
    expect(items[2]).toHaveClass("tutorial-overlay__item--future");

    // Current objective shows its instruction text; a future one does not.
    expect(
      screen.getByText("Queue COLONISE on a system, then COMMIT CYCLE."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Queue MOVE or ATTACK, then COMMIT CYCLE."),
    ).toBeNull();
  });

  it("renders a pending tick on the current objective once its signal is recorded", () => {
    render(
      <TutorialOverlay
        tutorial={makeTutorial({ objectiveIndex: 0, signals: ["explored"] })}
        onSkip={vi.fn()}
      />,
    );
    const items = screen
      .getByTestId("tutorial-overlay")
      .querySelectorAll(".tutorial-overlay__item");
    expect(items[0]).toHaveClass("tutorial-overlay__item--current-pending");
  });

  it("collapse toggle hides then re-shows the checklist body", () => {
    render(<TutorialOverlay tutorial={makeTutorial()} onSkip={vi.fn()} />);
    const toggle = screen.getByRole("button", { name: "collapse tutorial" });

    // Visible initially.
    expect(screen.getByText("Scan the neighbourhood")).toBeInTheDocument();

    // Collapse → checklist gone, aria updated.
    fireEvent.click(toggle);
    expect(screen.queryByText("Scan the neighbourhood")).toBeNull();
    expect(
      screen.getByRole("button", { name: "expand tutorial" }),
    ).toHaveAttribute("aria-expanded", "false");

    // Expand → checklist back.
    fireEvent.click(screen.getByRole("button", { name: "expand tutorial" }));
    expect(screen.getByText("Scan the neighbourhood")).toBeInTheDocument();
  });

  it("SKIP requires two clicks before onSkip fires", () => {
    const onSkip = vi.fn();
    render(<TutorialOverlay tutorial={makeTutorial()} onSkip={onSkip} />);

    // First click arms the confirm; onSkip not called yet.
    fireEvent.click(screen.getByRole("button", { name: "SKIP TUTORIAL" }));
    expect(onSkip).not.toHaveBeenCalled();

    // Button relabels to CONFIRM SKIP; second click fires onSkip once.
    const confirm = screen.getByRole("button", { name: "CONFIRM SKIP" });
    fireEvent.click(confirm);
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
