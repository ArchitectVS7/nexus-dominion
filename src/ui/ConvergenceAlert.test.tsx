// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ConvergenceAlert } from "./ConvergenceAlert";
import type { ConvergenceAlertEvent } from "../engine/types";

const EVENT: ConvergenceAlertEvent = {
  type: "convergence-alert",
  empireId: "empire-krell" as any,
  cycle: 42,
  achievementId: "conquest",
  progress: 0.85,
};

afterEach(() => cleanup());

describe("ConvergenceAlert", () => {
  it("renders the empire name and threatened achievement from the event fixture", () => {
    render(
      <ConvergenceAlert
        event={EVENT}
        empireName="Krell Hegemony"
        achievementName="Conquest"
        onDismiss={vi.fn()}
      />,
    );
    const banner = screen.getByRole("alert");
    expect(banner).toHaveTextContent("Krell Hegemony");
    expect(banner).toHaveTextContent("Conquest");
    expect(banner).toHaveTextContent("85%");
  });

  it("calls onDismiss when the dismiss button is clicked", () => {
    const onDismiss = vi.fn();
    render(
      <ConvergenceAlert
        event={EVENT}
        empireName="Krell Hegemony"
        achievementName="Conquest"
        onDismiss={onDismiss}
      />,
    );
    fireEvent.click(screen.getByText("DISMISS"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
