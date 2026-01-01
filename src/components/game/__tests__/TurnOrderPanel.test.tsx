import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TurnOrderPanel } from "../TurnOrderPanel";

describe("TurnOrderPanel", () => {
  const defaultProps = {
    currentTurn: 42,
    turnLimit: 200,
    foodStatus: "stable" as const,
    armyStrength: "moderate" as const,
    threatCount: 2,
    unreadMessages: 0,
  };

  it("renders with data-testid", () => {
    render(<TurnOrderPanel {...defaultProps} />);
    expect(screen.getByTestId("turn-order-panel")).toBeInTheDocument();
  });

  describe("Turn display", () => {
    it("displays current turn prominently", () => {
      render(<TurnOrderPanel {...defaultProps} />);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("displays turn limit", () => {
      render(<TurnOrderPanel {...defaultProps} />);
      expect(screen.getByText("of 200")).toBeInTheDocument();
    });

    it("displays Current Turn label", () => {
      render(<TurnOrderPanel {...defaultProps} />);
      expect(screen.getByText("Current Turn")).toBeInTheDocument();
    });
  });

  describe("Turn color based on progress", () => {
    it("shows amber color for early/mid game", () => {
      render(<TurnOrderPanel {...defaultProps} currentTurn={42} />);

      const turnNumber = screen.getByText("42");
      expect(turnNumber).toHaveClass("text-lcars-amber");
    });

    it("shows salmon color for endgame (turn >= 180 but not final stretch)", () => {
      // Use turnLimit of 250 so turn 185 isn't in final stretch
      render(<TurnOrderPanel {...defaultProps} currentTurn={185} turnLimit={250} />);

      const turnNumber = screen.getByText("185");
      expect(turnNumber).toHaveClass("text-lcars-salmon");
    });

    it("shows yellow for final stretch (when not in endgame)", () => {
      // For yellow, need: not endgame (turn < 180) but in final stretch (turn >= limit - 20)
      // With turnLimit=195, final stretch starts at 175, endgame at 180
      // Turn 176: not endgame, but in final stretch
      render(<TurnOrderPanel {...defaultProps} currentTurn={176} turnLimit={195} />);

      const turnNumber = screen.getByText("176");
      expect(turnNumber).toHaveClass("text-yellow-400");
    });
  });

  describe("Protection period", () => {
    it("shows protection badge when protected", () => {
      render(
        <TurnOrderPanel {...defaultProps} protectionTurnsLeft={5} />
      );

      expect(screen.getByText(/Protected for 5 more turns/)).toBeInTheDocument();
    });

    it("does not show protection badge when not protected", () => {
      render(<TurnOrderPanel {...defaultProps} protectionTurnsLeft={0} />);

      expect(screen.queryByText(/Protected/)).not.toBeInTheDocument();
    });
  });

  describe("Actions list", () => {
    it("displays all action links", () => {
      render(<TurnOrderPanel {...defaultProps} />);

      // Use getAllByRole to find links with specific names
      expect(screen.getByRole("link", { name: /Forces/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Sectors/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Combat/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Diplomacy/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Exchange/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Intel Ops/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Manufacturing/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Research/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Starmap/i })).toBeInTheDocument();
    });

    it("has links to correct pages", () => {
      render(<TurnOrderPanel {...defaultProps} />);

      const militaryLink = screen.getByRole("link", { name: /Forces/i });
      expect(militaryLink).toHaveAttribute("href", "/game/military");

      const combatLink = screen.getByRole("link", { name: /Combat/i });
      expect(combatLink).toHaveAttribute("href", "/game/combat");
    });

    it("displays messages link", () => {
      render(<TurnOrderPanel {...defaultProps} />);

      expect(screen.getByRole("link", { name: /Comms/i })).toBeInTheDocument();
    });

    it("shows unread message count when > 0", () => {
      render(<TurnOrderPanel {...defaultProps} unreadMessages={5} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("does not show message badge when no unread messages", () => {
      render(<TurnOrderPanel {...defaultProps} unreadMessages={0} />);

      // The badge element should not exist
      const badge = screen.queryByText("0", { selector: ".bg-red-500" });
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe("Quick status", () => {
    it("displays food status", () => {
      render(<TurnOrderPanel {...defaultProps} foodStatus="surplus" />);

      expect(screen.getByText("Surplus")).toBeInTheDocument();
    });

    it("displays army strength", () => {
      render(<TurnOrderPanel {...defaultProps} armyStrength="strong" />);

      expect(screen.getByText("Strong")).toBeInTheDocument();
    });

    it("displays threat count", () => {
      render(<TurnOrderPanel {...defaultProps} threatCount={3} />);

      // Shows "3 Domains" (GAME_TERMS.empires)
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it("shows singular Domain for 1 threat", () => {
      render(<TurnOrderPanel {...defaultProps} threatCount={1} />);

      expect(screen.getByText(/1 Domain/)).toBeInTheDocument();
    });

    it("shows plural Domains for multiple threats", () => {
      render(<TurnOrderPanel {...defaultProps} threatCount={3} />);

      expect(screen.getByText(/Domains/)).toBeInTheDocument();
    });
  });

  describe("Status styling", () => {
    it("applies green styling for surplus food", () => {
      render(<TurnOrderPanel {...defaultProps} foodStatus="surplus" />);

      const status = screen.getByText("Surplus");
      expect(status).toHaveClass("text-green-400");
    });

    it("applies blue styling for stable food", () => {
      render(<TurnOrderPanel {...defaultProps} foodStatus="stable" />);

      const status = screen.getByText("Stable");
      expect(status).toHaveClass("text-blue-400");
    });

    it("applies yellow styling for deficit food", () => {
      render(<TurnOrderPanel {...defaultProps} foodStatus="deficit" />);

      const status = screen.getByText("Deficit");
      expect(status).toHaveClass("text-yellow-400");
    });

    it("applies red styling for critical food", () => {
      render(<TurnOrderPanel {...defaultProps} foodStatus="critical" />);

      const status = screen.getByText("Critical");
      expect(status).toHaveClass("text-red-400");
    });
  });

  describe("End Turn button", () => {
    it("renders End Turn button with data-testid", () => {
      render(<TurnOrderPanel {...defaultProps} />);

      expect(screen.getByTestId("turn-order-end-turn")).toBeInTheDocument();
    });

    it("shows correct button text", () => {
      render(<TurnOrderPanel {...defaultProps} />);

      expect(screen.getByTestId("turn-order-end-turn")).toHaveTextContent(/NEXT CYCLE/i);
    });

    it("calls onEndTurn when clicked", () => {
      const mockOnEndTurn = vi.fn();
      render(<TurnOrderPanel {...defaultProps} onEndTurn={mockOnEndTurn} />);

      fireEvent.click(screen.getByTestId("turn-order-end-turn"));

      expect(mockOnEndTurn).toHaveBeenCalledTimes(1);
    });

    it("shows processing state", () => {
      render(<TurnOrderPanel {...defaultProps} isProcessing={true} />);

      expect(screen.getByTestId("turn-order-end-turn")).toHaveTextContent(/PROCESSING/i);
    });

    it("disables button when processing", () => {
      render(<TurnOrderPanel {...defaultProps} isProcessing={true} />);

      expect(screen.getByTestId("turn-order-end-turn")).toBeDisabled();
    });
  });

  describe("Dashboard link", () => {
    it("shows link back to dashboard", () => {
      render(<TurnOrderPanel {...defaultProps} />);

      const dashboardLink = screen.getByRole("link", { name: /Command Center/i });
      expect(dashboardLink).toHaveAttribute("href", "/game");
    });
  });

  describe("Suggestions panel", () => {
    it("shows food critical suggestion", () => {
      render(<TurnOrderPanel {...defaultProps} foodStatus="critical" />);

      expect(screen.getByText(/Food critical/)).toBeInTheDocument();
    });

    it("shows food deficit suggestion", () => {
      render(<TurnOrderPanel {...defaultProps} foodStatus="deficit" />);

      expect(screen.getByText(/Food deficit/)).toBeInTheDocument();
    });

    it("shows army critical suggestion", () => {
      render(<TurnOrderPanel {...defaultProps} armyStrength="critical" />);

      expect(screen.getByText(/Military critical/)).toBeInTheDocument();
    });

    it("shows protection ending warning", () => {
      render(<TurnOrderPanel {...defaultProps} protectionTurnsLeft={3} />);

      expect(screen.getByText(/Protection ends in 3 turns/)).toBeInTheDocument();
    });

    it("shows early game tip on turn <= 5", () => {
      render(<TurnOrderPanel {...defaultProps} currentTurn={3} />);

      expect(screen.getByText(/Early game: focus on expansion/)).toBeInTheDocument();
    });

    it("shows threat warning for many threats", () => {
      render(<TurnOrderPanel {...defaultProps} threatCount={5} />);

      expect(screen.getByText(/Many threats/)).toBeInTheDocument();
    });
  });

  describe("Responsive behavior", () => {
    it("has hidden class for mobile", () => {
      render(<TurnOrderPanel {...defaultProps} />);

      const panel = screen.getByTestId("turn-order-panel");
      expect(panel).toHaveClass("hidden", "lg:flex");
    });
  });

  describe("Edge cases", () => {
    it("handles no onEndTurn callback", () => {
      render(<TurnOrderPanel {...defaultProps} />);

      const button = screen.getByTestId("turn-order-end-turn");
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it("handles zero threats", () => {
      render(<TurnOrderPanel {...defaultProps} threatCount={0} />);

      expect(screen.getByText(/0 Domains/)).toBeInTheDocument();
    });
  });
});
