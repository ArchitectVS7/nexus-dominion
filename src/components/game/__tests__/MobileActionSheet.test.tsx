import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileActionSheet } from "../MobileActionSheet";

// Mock gsap
vi.mock("gsap", () => ({
  default: {
    set: vi.fn(),
    to: vi.fn(),
    fromTo: vi.fn(),
  },
}));

describe("MobileActionSheet", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentTurn: 42,
    turnLimit: 200,
    foodStatus: "stable" as const,
    armyStrength: "moderate" as const,
    threatCount: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body scroll
    document.body.style.overflow = "";
  });

  it("renders with data-testid", () => {
    render(<MobileActionSheet {...defaultProps} />);
    expect(screen.getByTestId("mobile-action-sheet")).toBeInTheDocument();
  });

  describe("Header", () => {
    it("displays current turn", () => {
      render(<MobileActionSheet {...defaultProps} />);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("displays turn limit", () => {
      render(<MobileActionSheet {...defaultProps} />);

      expect(screen.getByText("/ 200")).toBeInTheDocument();
    });

    it("displays Turn label", () => {
      render(<MobileActionSheet {...defaultProps} />);

      expect(screen.getByText("Turn")).toBeInTheDocument();
    });

    it("has close button", () => {
      render(<MobileActionSheet {...defaultProps} />);

      const closeButton = screen.getByRole("button", { name: /Close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it("calls onClose when close button clicked", () => {
      const mockClose = vi.fn();
      render(<MobileActionSheet {...defaultProps} onClose={mockClose} />);

      const closeButton = screen.getByRole("button", { name: /Close/i });
      fireEvent.click(closeButton);

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Protection period", () => {
    it("shows protection badge when protected", () => {
      render(
        <MobileActionSheet {...defaultProps} protectionTurnsLeft={5} />
      );

      expect(screen.getByText(/Protected for 5 turns/)).toBeInTheDocument();
    });

    it("does not show protection badge when not protected", () => {
      render(<MobileActionSheet {...defaultProps} protectionTurnsLeft={0} />);

      expect(screen.queryByText(/Protected/)).not.toBeInTheDocument();
    });
  });

  describe("Actions grid", () => {
    it("displays all action links", () => {
      render(<MobileActionSheet {...defaultProps} />);

      // Use getByRole to find the links with specific accessible names
      expect(screen.getByRole("link", { name: /Forces/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Sectors/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Combat/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Diplomacy/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Exchange/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Intel Ops/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Manufacturing/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Research/i })).toBeInTheDocument();
      // Starmap appears twice (in actions and navigation), use getAllByRole
      expect(screen.getAllByRole("link", { name: /Starmap/i }).length).toBeGreaterThanOrEqual(1);
    });

    it("has links to correct pages", () => {
      render(<MobileActionSheet {...defaultProps} />);

      const militaryLink = screen.getByRole("link", { name: /Forces/i });
      expect(militaryLink).toHaveAttribute("href", "/game/military");

      const combatLink = screen.getByRole("link", { name: /Combat/i });
      expect(combatLink).toHaveAttribute("href", "/game/combat");
    });

    it("renders SVG icons for actions", () => {
      render(<MobileActionSheet {...defaultProps} />);

      // Icons are SVG elements rendered by Lucide React
      // Verify icons render alongside their labels
      const forcesLink = screen.getByRole("link", { name: /Forces/i });
      const sectorsLink = screen.getByRole("link", { name: /Sectors/i });
      const combatLink = screen.getByRole("link", { name: /Combat/i });

      // Check that SVG icons are rendered within the links
      expect(forcesLink.querySelector("svg")).toBeInTheDocument();
      expect(sectorsLink.querySelector("svg")).toBeInTheDocument();
      expect(combatLink.querySelector("svg")).toBeInTheDocument();
    });

    it("closes sheet when action link is clicked", () => {
      const mockClose = vi.fn();
      render(<MobileActionSheet {...defaultProps} onClose={mockClose} />);

      const militaryLink = screen.getByRole("link", { name: /Forces/i });
      fireEvent.click(militaryLink);

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Messages link", () => {
    it("displays messages link", () => {
      render(<MobileActionSheet {...defaultProps} />);

      expect(screen.getByText("Comms")).toBeInTheDocument();
    });

    it("shows unread message count when > 0", () => {
      render(<MobileActionSheet {...defaultProps} unreadMessages={5} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("does not show message badge when no unread messages", () => {
      render(<MobileActionSheet {...defaultProps} unreadMessages={0} />);

      // Badge should not be visible (but "Comms" should still be there)
      const badges = screen.queryAllByText("0");
      expect(badges.length).toBe(0);
    });

    it("closes sheet when messages link is clicked", () => {
      const mockClose = vi.fn();
      render(<MobileActionSheet {...defaultProps} onClose={mockClose} />);

      const messagesLink = screen.getByRole("link", { name: /Comms/i });
      fireEvent.click(messagesLink);

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Quick status", () => {
    it("displays food status", () => {
      render(<MobileActionSheet {...defaultProps} foodStatus="surplus" />);

      expect(screen.getByText("Surplus")).toBeInTheDocument();
    });

    it("displays army strength", () => {
      render(<MobileActionSheet {...defaultProps} armyStrength="strong" />);

      expect(screen.getByText("Strong")).toBeInTheDocument();
    });

    it("displays threat count", () => {
      render(<MobileActionSheet {...defaultProps} threatCount={3} />);

      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it("shows singular Domain for 1 threat", () => {
      render(<MobileActionSheet {...defaultProps} threatCount={1} />);

      expect(screen.getByText(/1 Domain/)).toBeInTheDocument();
    });

    it("shows plural Domains for multiple threats", () => {
      render(<MobileActionSheet {...defaultProps} threatCount={3} />);

      expect(screen.getByText(/Domains/)).toBeInTheDocument();
    });
  });

  describe("Status styling", () => {
    it("applies green styling for surplus food", () => {
      render(<MobileActionSheet {...defaultProps} foodStatus="surplus" />);

      const status = screen.getByText("Surplus");
      expect(status).toHaveClass("text-green-400");
    });

    it("applies red styling for critical threats", () => {
      render(<MobileActionSheet {...defaultProps} threatCount={5} />);

      const threatSection = screen.getByText(/5 Domains/);
      expect(threatSection).toHaveClass("text-red-400");
    });
  });

  describe("Navigation links", () => {
    it("shows dashboard link", () => {
      render(<MobileActionSheet {...defaultProps} />);

      const dashboardLink = screen.getByRole("link", { name: /Command Center/i });
      expect(dashboardLink).toHaveAttribute("href", "/game");
    });

    it("shows starmap link", () => {
      render(<MobileActionSheet {...defaultProps} />);

      const starmapLink = screen.getByRole("link", { name: /Star Chart/i });
      expect(starmapLink).toHaveAttribute("href", "/game/starmap");
    });

    it("closes sheet when navigation link is clicked", () => {
      const mockClose = vi.fn();
      render(<MobileActionSheet {...defaultProps} onClose={mockClose} />);

      const dashboardLink = screen.getByRole("link", { name: /Command Center/i });
      fireEvent.click(dashboardLink);

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Backdrop", () => {
    it("calls onClose when backdrop is clicked", () => {
      const mockClose = vi.fn();
      const { container } = render(
        <MobileActionSheet {...defaultProps} onClose={mockClose} />
      );

      // Find backdrop (the element with bg-black/60)
      const backdrop = container.querySelector(".bg-black\\/60");
      expect(backdrop).toBeInTheDocument();

      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("Keyboard navigation", () => {
    it("calls onClose when Escape is pressed", () => {
      const mockClose = vi.fn();
      render(<MobileActionSheet {...defaultProps} onClose={mockClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose for other keys", () => {
      const mockClose = vi.fn();
      render(<MobileActionSheet {...defaultProps} onClose={mockClose} />);

      fireEvent.keyDown(document, { key: "Enter" });

      expect(mockClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when closed and Escape is pressed", () => {
      const mockClose = vi.fn();
      render(<MobileActionSheet {...defaultProps} isOpen={false} onClose={mockClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockClose).not.toHaveBeenCalled();
    });
  });

  describe("Body scroll behavior", () => {
    it("prevents body scroll when open", () => {
      render(<MobileActionSheet {...defaultProps} isOpen={true} />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores body scroll when closed", () => {
      const { rerender } = render(<MobileActionSheet {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<MobileActionSheet {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("");
    });

    it("cleans up body scroll on unmount", () => {
      const { unmount } = render(<MobileActionSheet {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Responsive behavior", () => {
    it("has visible class for mobile only", () => {
      render(<MobileActionSheet {...defaultProps} />);

      const sheet = screen.getByTestId("mobile-action-sheet");
      expect(sheet).toHaveClass("lg:hidden");
    });
  });

  describe("Edge cases", () => {
    it("handles zero threats", () => {
      render(<MobileActionSheet {...defaultProps} threatCount={0} />);

      expect(screen.getByText(/0 Domains/)).toBeInTheDocument();
    });

    it("handles undefined unreadMessages", () => {
      render(<MobileActionSheet {...defaultProps} unreadMessages={undefined} />);

      // Should not crash
      expect(screen.getByTestId("mobile-action-sheet")).toBeInTheDocument();
    });

    it("handles undefined protectionTurnsLeft", () => {
      render(<MobileActionSheet {...defaultProps} protectionTurnsLeft={undefined} />);

      expect(screen.queryByText(/Protected/)).not.toBeInTheDocument();
    });
  });
});
