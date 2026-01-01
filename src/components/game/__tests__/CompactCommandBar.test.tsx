import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompactCommandBar } from "../CompactCommandBar";

describe("CompactCommandBar", () => {
  const defaultProps = {
    credits: 100000,
    food: 5000,
    ore: 2000,
    petroleum: 1500,
    researchPoints: 3000,
    population: 12500,
    sectorCount: 15,
    networth: 250000,
    civilStatus: "content",
  };

  it("renders without crashing", () => {
    render(<CompactCommandBar {...defaultProps} />);
    // Should render the compact bar
    expect(screen.getByText("100K")).toBeInTheDocument();
  });

  describe("Resource Display", () => {
    it("displays credits in compact format", () => {
      render(<CompactCommandBar {...defaultProps} />);
      // 100000 / 1000 = 100K
      expect(screen.getByText("100K")).toBeInTheDocument();
    });

    it("displays food in compact format", () => {
      render(<CompactCommandBar {...defaultProps} />);
      // 5000 / 1000 = 5K
      expect(screen.getByText("5K")).toBeInTheDocument();
    });

    it("displays ore in compact format", () => {
      render(<CompactCommandBar {...defaultProps} />);
      // 2000 / 1000 = 2K
      expect(screen.getByText("2K")).toBeInTheDocument();
    });

    it("displays petroleum in compact format", () => {
      render(<CompactCommandBar {...defaultProps} />);
      // 1500 / 1000 = 1K (Math.floor)
      expect(screen.getByText("1K")).toBeInTheDocument();
    });

    it("displays research points in compact format", () => {
      render(<CompactCommandBar {...defaultProps} />);
      // 3000 / 1000 = 3K
      expect(screen.getByText("3K")).toBeInTheDocument();
    });

    it("displays population in compact format", () => {
      render(<CompactCommandBar {...defaultProps} />);
      // 12500 / 1000 = 12K (Math.floor)
      expect(screen.getByText("12K")).toBeInTheDocument();
    });

    it("displays sector count", () => {
      render(<CompactCommandBar {...defaultProps} />);
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText(/Sectors/)).toBeInTheDocument();
    });
  });

  describe("Expand/Collapse functionality", () => {
    it("starts in collapsed state", () => {
      render(<CompactCommandBar {...defaultProps} />);
      expect(screen.getByText("More")).toBeInTheDocument();
      expect(screen.queryByText("Civil Status")).not.toBeInTheDocument();
    });

    it("expands when More button is clicked", () => {
      render(<CompactCommandBar {...defaultProps} />);

      const moreButton = screen.getByText("More").closest("button");
      expect(moreButton).toBeInTheDocument();
      fireEvent.click(moreButton!);

      expect(screen.getByText("Less")).toBeInTheDocument();
      expect(screen.getByText("Civil Status")).toBeInTheDocument();
    });

    it("collapses when Less button is clicked", () => {
      render(<CompactCommandBar {...defaultProps} />);

      // Expand first
      fireEvent.click(screen.getByText("More").closest("button")!);
      expect(screen.getByText("Less")).toBeInTheDocument();

      // Collapse
      fireEvent.click(screen.getByText("Less").closest("button")!);
      expect(screen.getByText("More")).toBeInTheDocument();
      expect(screen.queryByText("Civil Status")).not.toBeInTheDocument();
    });
  });

  describe("Expanded view content", () => {
    it("shows civil status when expanded", () => {
      render(<CompactCommandBar {...defaultProps} />);

      fireEvent.click(screen.getByText("More").closest("button")!);

      expect(screen.getByText("Civil Status")).toBeInTheDocument();
      expect(screen.getByText("content")).toBeInTheDocument();
    });

    it("shows renown (networth) when expanded", () => {
      render(<CompactCommandBar {...defaultProps} />);

      fireEvent.click(screen.getByText("More").closest("button")!);

      expect(screen.getByText("Renown")).toBeInTheDocument();
      expect(screen.getByText("250,000")).toBeInTheDocument();
    });

    it("shows food balance when expanded", () => {
      render(<CompactCommandBar {...defaultProps} />);

      fireEvent.click(screen.getByText("More").closest("button")!);

      expect(screen.getByText("Food Balance")).toBeInTheDocument();
      // Positive food shows + prefix
      expect(screen.getByText("+5000")).toBeInTheDocument();
    });

    it("shows research level when expanded", () => {
      render(<CompactCommandBar {...defaultProps} />);

      fireEvent.click(screen.getByText("More").closest("button")!);

      expect(screen.getByText("Research Level")).toBeInTheDocument();
      // 3000 / 1000 = 3
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("Food balance styling", () => {
    it("shows green for high food", () => {
      render(<CompactCommandBar {...defaultProps} food={2000} />);
      fireEvent.click(screen.getByText("More").closest("button")!);

      const foodBalance = screen.getByText("+2000");
      expect(foodBalance).toHaveClass("text-green-400");
    });

    it("shows yellow for low but positive food", () => {
      render(<CompactCommandBar {...defaultProps} food={500} />);
      fireEvent.click(screen.getByText("More").closest("button")!);

      const foodBalance = screen.getByText("+500");
      expect(foodBalance).toHaveClass("text-yellow-400");
    });

    it("shows red for negative food", () => {
      render(<CompactCommandBar {...defaultProps} food={-100} />);
      fireEvent.click(screen.getByText("More").closest("button")!);

      // Negative food doesn't get + prefix - find the one in the Food Balance section
      const foodBalances = screen.getAllByText("-100");
      // The second one should be the Food Balance display with red color
      const foodBalanceElement = foodBalances.find(el => el.classList.contains("text-red-400"));
      expect(foodBalanceElement).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles zero values", () => {
      render(
        <CompactCommandBar
          {...defaultProps}
          credits={0}
          food={0}
          ore={0}
          petroleum={0}
          researchPoints={0}
          population={0}
          sectorCount={0}
          networth={0}
        />
      );

      // Multiple zeros should render
      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThanOrEqual(1);
    });

    it("handles very large values", () => {
      render(
        <CompactCommandBar
          {...defaultProps}
          credits={1500000000}
          networth={999999999}
        />
      );

      // 1500000000 / 1000000 = 1500.0M
      expect(screen.getByText("1500.0M")).toBeInTheDocument();
    });

    it("handles different civil status values", () => {
      const statuses = ["ecstatic", "happy", "content", "neutral", "unhappy", "angry", "rioting", "revolting"];

      statuses.forEach((status) => {
        const { unmount } = render(
          <CompactCommandBar {...defaultProps} civilStatus={status} />
        );
        fireEvent.click(screen.getByText("More").closest("button")!);
        expect(screen.getByText(status)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
