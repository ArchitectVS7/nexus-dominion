// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { CommitErrorBanner } from "./CommitErrorBanner";
import type { CycleResult } from "../engine/cycle/cycle-processor";

afterEach(() => cleanup());

// Drive the UI from the real failed-commit result shape (committed === false
// with an error message), tying the test to the engine contract.
const failedResult: Pick<CycleResult, "committed" | "error"> = {
  committed: false,
  error: "forced tier-1 failure",
};

describe("CommitErrorBanner", () => {
  it("renders the error message from a failed-commit result", () => {
    render(<CommitErrorBanner message={failedResult.error!} onDismiss={vi.fn()} />);
    const banner = screen.getByRole("alert");
    expect(banner).toHaveTextContent("forced tier-1 failure");
    expect(banner).toHaveTextContent("COMMIT FAILED");
  });

  it("calls onDismiss when dismissed", () => {
    const onDismiss = vi.fn();
    render(<CommitErrorBanner message="x" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText("DISMISS"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
