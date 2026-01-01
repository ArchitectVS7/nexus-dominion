import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileBottomBar } from "../MobileBottomBar";

describe("MobileBottomBar", () => {
  const defaultProps = {
    currentTurn: 42,
    turnLimit: 200,
    credits: 100000,
    foodStatus: "stable" as const,
    armyStrength: "moderate" as const,
    onEndTurn: vi.fn(),
    onOpenActions: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with data-testid", () => {
    render(<MobileBottomBar {...defaultProps} />);
    expect(screen.getByTestId("mobile-bottom-bar")).toBeInTheDocument();
  });

  describe("Turn display", () => {
    it("displays current turn", () => {
      render(<MobileBottomBar {...defaultProps} />);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("displays turn limit", () => {
      render(<MobileBottomBar {...defaultProps} />);

      expect(screen.getByText("/200")).toBeInTheDocument();
    });
  });

  describe("Credits display", () => {
    it("displays credits in compact format", () => {
      render(<MobileBottomBar {...defaultProps} />);
      // formatCompact: 100000 / 1000 = 100K
      expect(screen.getByText("100K")).toBeInTheDocument();
    });

    it("displays credits icon (SVG)", () => {
      const { container } = render(<MobileBottomBar {...defaultProps} />);

      // ResourceIcons.credits is now an SVG icon
      const svgIcons = container.querySelectorAll("svg");
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Food status display", () => {
    it("displays food status text", () => {
      render(<MobileBottomBar {...defaultProps} foodStatus="surplus" />);

      expect(screen.getByText("Surplus")).toBeInTheDocument();
    });

    it("displays food icon (SVG)", () => {
      const { container } = render(<MobileBottomBar {...defaultProps} />);

      // ResourceIcons.food is now an SVG icon
      // Multiple SVG icons should be present (credits, food, army, menu)
      const svgIcons = container.querySelectorAll("svg");
      expect(svgIcons.length).toBeGreaterThanOrEqual(3);
    });

    it("applies green color for surplus", () => {
      render(<MobileBottomBar {...defaultProps} foodStatus="surplus" />);

      const status = screen.getByText("Surplus");
      expect(status).toHaveClass("text-green-400");
    });

    it("applies blue color for stable", () => {
      render(<MobileBottomBar {...defaultProps} foodStatus="stable" />);

      const status = screen.getByText("Stable");
      expect(status).toHaveClass("text-blue-400");
    });

    it("applies yellow color for deficit", () => {
      render(<MobileBottomBar {...defaultProps} foodStatus="deficit" />);

      const status = screen.getByText("Deficit");
      expect(status).toHaveClass("text-yellow-400");
    });

    it("applies red color for critical", () => {
      render(<MobileBottomBar {...defaultProps} foodStatus="critical" />);

      const status = screen.getByText("Critical");
      expect(status).toHaveClass("text-red-400");
    });
  });

  describe("Army strength display", () => {
    it("displays army strength text", () => {
      render(<MobileBottomBar {...defaultProps} armyStrength="strong" />);

      expect(screen.getByText("Strong")).toBeInTheDocument();
    });

    it("applies green color for strong", () => {
      render(<MobileBottomBar {...defaultProps} armyStrength="strong" />);

      const status = screen.getByText("Strong");
      expect(status).toHaveClass("text-green-400");
    });

    it("applies blue color for moderate", () => {
      render(<MobileBottomBar {...defaultProps} armyStrength="moderate" />);

      const status = screen.getByText("Moderate");
      expect(status).toHaveClass("text-blue-400");
    });

    it("applies yellow color for weak", () => {
      render(<MobileBottomBar {...defaultProps} armyStrength="weak" />);

      const status = screen.getByText("Weak");
      expect(status).toHaveClass("text-yellow-400");
    });

    it("applies red color for critical", () => {
      render(<MobileBottomBar {...defaultProps} armyStrength="critical" />);

      const status = screen.getByText("Critical");
      expect(status).toHaveClass("text-red-400");
    });
  });

  describe("Open actions button", () => {
    it("calls onOpenActions when clicked", () => {
      const mockOpenActions = vi.fn();
      render(
        <MobileBottomBar {...defaultProps} onOpenActions={mockOpenActions} />
      );

      const button = screen.getByRole("button", { name: /Open actions/i });
      fireEvent.click(button);

      expect(mockOpenActions).toHaveBeenCalledTimes(1);
    });

    it("shows unread message badge when > 0", () => {
      render(
        <MobileBottomBar {...defaultProps} unreadMessages={5} />
      );

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("shows 9+ for unread messages > 9", () => {
      render(
        <MobileBottomBar {...defaultProps} unreadMessages={15} />
      );

      expect(screen.getByText("9+")).toBeInTheDocument();
    });

    it("does not show badge when no unread messages", () => {
      render(
        <MobileBottomBar {...defaultProps} unreadMessages={0} />
      );

      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  describe("End Turn button", () => {
    it("renders End Turn button with data-testid", () => {
      render(<MobileBottomBar {...defaultProps} />);

      expect(screen.getByTestId("mobile-end-turn")).toBeInTheDocument();
    });

    it("shows correct button text", () => {
      render(<MobileBottomBar {...defaultProps} />);

      expect(screen.getByTestId("mobile-end-turn")).toHaveTextContent(/NEXT CYCLE/i);
    });

    it("calls onEndTurn when clicked", () => {
      const mockOnEndTurn = vi.fn();
      render(<MobileBottomBar {...defaultProps} onEndTurn={mockOnEndTurn} />);

      fireEvent.click(screen.getByTestId("mobile-end-turn"));

      expect(mockOnEndTurn).toHaveBeenCalledTimes(1);
    });

    it("shows processing state", () => {
      render(<MobileBottomBar {...defaultProps} isProcessing={true} />);

      expect(screen.getByTestId("mobile-end-turn")).toHaveTextContent(/PROCESSING/i);
    });

    it("disables button when processing", () => {
      render(<MobileBottomBar {...defaultProps} isProcessing={true} />);

      expect(screen.getByTestId("mobile-end-turn")).toBeDisabled();
    });

    it("has animation when processing", () => {
      render(<MobileBottomBar {...defaultProps} isProcessing={true} />);

      expect(screen.getByTestId("mobile-end-turn")).toHaveClass("animate-pulse");
    });
  });

  describe("Responsive behavior", () => {
    it("has visible class for mobile only", () => {
      render(<MobileBottomBar {...defaultProps} />);

      const bar = screen.getByTestId("mobile-bottom-bar");
      expect(bar).toHaveClass("lg:hidden");
    });

    it("is fixed to bottom", () => {
      render(<MobileBottomBar {...defaultProps} />);

      const bar = screen.getByTestId("mobile-bottom-bar");
      expect(bar).toHaveClass("fixed", "bottom-0", "left-0", "right-0");
    });
  });

  describe("Edge cases", () => {
    it("handles zero credits", () => {
      render(<MobileBottomBar {...defaultProps} credits={0} />);
      // formatCompact: 0 returns "0"
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("handles very large credits", () => {
      render(<MobileBottomBar {...defaultProps} credits={1500000} />);
      // formatCompact: 1500000 / 1000000 = 1.5M
      expect(screen.getByText("1.5M")).toBeInTheDocument();
    });

    it("handles turn 1", () => {
      render(<MobileBottomBar {...defaultProps} currentTurn={1} />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("handles final turn", () => {
      render(<MobileBottomBar {...defaultProps} currentTurn={200} />);
      expect(screen.getByText("200")).toBeInTheDocument();
    });

    it("handles undefined unreadMessages", () => {
      render(<MobileBottomBar {...defaultProps} unreadMessages={undefined} />);
      // Should not crash and not show badge
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });
});
