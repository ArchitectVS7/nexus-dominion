// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SaveSlotManager } from "./SaveSlotManager";
import type { SaveSlotSummary } from "./SaveSlotManager";

const FIXTURE: SaveSlotSummary[] = [
  { id: "c1", name: "Campaign Alpha", savedAt: "2026-07-10T12:00:00Z", cycle: 12 },
  { id: "c2", name: "Campaign Beta", savedAt: "2026-07-14T09:30:00Z", cycle: 47 },
  { id: "c3", name: "Campaign Gamma", savedAt: "2026-07-01T00:00:00Z", cycle: 3 },
];

afterEach(() => cleanup());

describe("SaveSlotManager", () => {
  it("renders every save's name and cycle from a multi-save fixture", () => {
    render(
      <SaveSlotManager saves={FIXTURE} onLoad={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText("Campaign Alpha")).toBeInTheDocument();
    expect(screen.getByText("Campaign Beta")).toBeInTheDocument();
    expect(screen.getByText("Campaign Gamma")).toBeInTheDocument();
    expect(screen.getByText("Cycle 12")).toBeInTheDocument();
    expect(screen.getByText("Cycle 47")).toBeInTheDocument();
    expect(screen.getByText("Cycle 3")).toBeInTheDocument();
    // Timestamps render (locale-formatted, so assert one row is present).
    expect(screen.getAllByText(/Cycle \d+/)).toHaveLength(3);
  });

  it("fires onLoad with the chosen save's id", () => {
    const onLoad = vi.fn();
    render(
      <SaveSlotManager saves={FIXTURE} onLoad={onLoad} onDelete={vi.fn()} onClose={vi.fn()} />,
    );
    // Newest-first ordering → Beta(14th), Alpha(10th), Gamma(1st).
    const loadButtons = screen.getAllByText("LOAD");
    expect(loadButtons).toHaveLength(3);
    // Click the LOAD button on the Alpha row (second row after sort).
    fireEvent.click(loadButtons[1]);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith("c1");
  });

  it("asks for confirmation before deleting and only fires onDelete on confirm", () => {
    const onDelete = vi.fn();
    render(
      <SaveSlotManager saves={FIXTURE} onLoad={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />,
    );
    // First click on a DELETE button arms confirmation, does NOT delete.
    const deleteButtons = screen.getAllByText("DELETE");
    fireEvent.click(deleteButtons[0]); // newest row = Beta (c2)
    expect(onDelete).not.toHaveBeenCalled();

    // A confirm control now appears.
    const confirm = screen.getByText("CONFIRM DELETE");
    expect(confirm).toBeInTheDocument();
    expect(screen.getByText("CANCEL")).toBeInTheDocument();

    // Confirming fires onDelete with that row's id.
    fireEvent.click(confirm);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("c2");
  });

  it("cancelling confirmation does not delete", () => {
    const onDelete = vi.fn();
    render(
      <SaveSlotManager saves={FIXTURE} onLoad={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />,
    );
    fireEvent.click(screen.getAllByText("DELETE")[0]);
    fireEvent.click(screen.getByText("CANCEL"));
    expect(onDelete).not.toHaveBeenCalled();
    // Back to the default LOAD/DELETE controls.
    expect(screen.getAllByText("DELETE")).toHaveLength(3);
  });

  it("renders an empty state when there are no saves", () => {
    render(
      <SaveSlotManager saves={[]} onLoad={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText("NO SAVED CAMPAIGNS")).toBeInTheDocument();
    expect(screen.queryByText("LOAD")).not.toBeInTheDocument();
  });
});
