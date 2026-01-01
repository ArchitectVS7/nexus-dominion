import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TurnPhaseIndicator } from "../TurnPhaseIndicator";

describe("TurnPhaseIndicator", () => {
  const defaultProps = {
    currentTurn: 42,
    turnLimit: 200,
  };

  it("renders without crashing", () => {
    render(<TurnPhaseIndicator {...defaultProps} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  describe("Turn display", () => {
    it("displays current turn prominently", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);

      const turnNumber = screen.getByText("42");
      expect(turnNumber).toBeInTheDocument();
      expect(turnNumber).toHaveClass("text-3xl");
    });

    it("displays turn limit", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);
      expect(screen.getByText("of 200")).toBeInTheDocument();
    });

    it("displays Current Turn label", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);
      expect(screen.getByText("Current Turn")).toBeInTheDocument();
    });
  });

  describe("Turn phases checklist", () => {
    it("displays all four turn phases", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);

      expect(screen.getByText("Review Status")).toBeInTheDocument();
      expect(screen.getByText("Plan Actions")).toBeInTheDocument();
      expect(screen.getByText("Execute")).toBeInTheDocument();
      expect(screen.getByText("End Turn")).toBeInTheDocument();
    });

    it("shows optional marker for optional phases", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);

      const optionalMarkers = screen.getAllByText("(optional)");
      expect(optionalMarkers.length).toBe(2); // Review Status and Execute are optional
    });

    it("shows phase descriptions", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);

      expect(screen.getByText("Check resources, messages, threats")).toBeInTheDocument();
      expect(screen.getByText("Build units, buy sectors, research")).toBeInTheDocument();
      expect(screen.getByText("Attack, trade, spy, diplomacy")).toBeInTheDocument();
      expect(screen.getByText("Process turn and see results")).toBeInTheDocument();
    });
  });

  describe("Protection period", () => {
    it("shows protection badge when protected", () => {
      render(
        <TurnPhaseIndicator
          {...defaultProps}
          protectionTurnsLeft={5}
        />
      );

      expect(screen.getByText(/Protected/)).toBeInTheDocument();
      expect(screen.getByText(/5 turns left/)).toBeInTheDocument();
    });

    it("does not show protection badge when not protected", () => {
      render(<TurnPhaseIndicator {...defaultProps} protectionTurnsLeft={0} />);

      expect(screen.queryByText(/Protected/)).not.toBeInTheDocument();
    });

    it("does not show protection badge when undefined", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);

      expect(screen.queryByText(/Protected/)).not.toBeInTheDocument();
    });
  });

  describe("End Turn button", () => {
    it("renders End Turn button with correct text", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);

      expect(screen.getByRole("button", { name: /END TURN & CONTINUE/i })).toBeInTheDocument();
    });

    it("calls onEndTurn when clicked", () => {
      const mockOnEndTurn = vi.fn();
      render(<TurnPhaseIndicator {...defaultProps} onEndTurn={mockOnEndTurn} />);

      const button = screen.getByRole("button", { name: /END TURN & CONTINUE/i });
      fireEvent.click(button);

      expect(mockOnEndTurn).toHaveBeenCalledTimes(1);
    });

    it("shows processing state", () => {
      render(<TurnPhaseIndicator {...defaultProps} isProcessing={true} />);

      expect(screen.getByRole("button", { name: /PROCESSING TURN/i })).toBeInTheDocument();
    });

    it("disables button when processing", () => {
      render(<TurnPhaseIndicator {...defaultProps} isProcessing={true} />);

      const button = screen.getByRole("button", { name: /PROCESSING TURN/i });
      expect(button).toBeDisabled();
    });

    it("does not call onEndTurn when processing", () => {
      const mockOnEndTurn = vi.fn();
      render(
        <TurnPhaseIndicator
          {...defaultProps}
          onEndTurn={mockOnEndTurn}
          isProcessing={true}
        />
      );

      const button = screen.getByRole("button", { name: /PROCESSING TURN/i });
      fireEvent.click(button);

      expect(mockOnEndTurn).not.toHaveBeenCalled();
    });
  });

  describe("Helper text", () => {
    it("shows helper text with next turn number", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);

      expect(
        screen.getByText(/Click to process all empire actions and advance to Turn 43/)
      ).toBeInTheDocument();
    });
  });

  describe("Turn color based on progress", () => {
    it("shows amber color for early/mid game", () => {
      render(<TurnPhaseIndicator currentTurn={42} turnLimit={200} />);

      const turnNumber = screen.getByText("42");
      expect(turnNumber).toHaveClass("text-lcars-amber");
    });

    it("shows salmon color for endgame (turn >= 180 but not final stretch)", () => {
      // Turn 179 is >= 180? No, let's test turn 180 with limit 250
      render(<TurnPhaseIndicator currentTurn={180} turnLimit={250} />);

      const turnNumber = screen.getByText("180");
      expect(turnNumber).toHaveClass("text-lcars-salmon");
    });

    it("shows red color for final stretch (within 20 turns of limit)", () => {
      // Turn 182 with limit 200 is in final stretch (within 20 turns)
      render(<TurnPhaseIndicator currentTurn={182} turnLimit={200} />);

      const turnNumber = screen.getByText("182");
      expect(turnNumber).toHaveClass("text-red-400");
    });
  });

  describe("Progress bar", () => {
    it("renders progress bar", () => {
      const { container } = render(<TurnPhaseIndicator {...defaultProps} />);

      // Progress bar should have transition styles
      const progressBar = container.querySelector('[style*="width"]');
      expect(progressBar).toBeInTheDocument();
    });

    it("calculates correct progress percentage", () => {
      const { container } = render(
        <TurnPhaseIndicator currentTurn={50} turnLimit={200} />
      );

      // 50/200 = 25%
      const progressBar = container.querySelector('[style*="width: 25%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it("caps progress at 100%", () => {
      const { container } = render(
        <TurnPhaseIndicator currentTurn={250} turnLimit={200} />
      );

      // Should be capped at 100%
      const progressBar = container.querySelector('[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles turn 1", () => {
      render(<TurnPhaseIndicator currentTurn={1} turnLimit={200} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(
        screen.getByText(/advance to Turn 2/)
      ).toBeInTheDocument();
    });

    it("handles final turn", () => {
      render(<TurnPhaseIndicator currentTurn={200} turnLimit={200} />);

      expect(screen.getByText("200")).toBeInTheDocument();
    });

    it("handles no onEndTurn callback", () => {
      render(<TurnPhaseIndicator {...defaultProps} />);

      const button = screen.getByRole("button", { name: /END TURN & CONTINUE/i });
      // Should not throw when clicked without callback
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });
});
