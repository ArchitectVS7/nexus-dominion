import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LockedFeature, LockedSection } from "../LockedFeature";

describe("LockedFeature", () => {
  describe("when feature is unlocked", () => {
    it("renders children normally", () => {
      render(
        <LockedFeature feature="core_mechanics" currentTurn={1}>
          <div data-testid="child-content">Unlocked Content</div>
        </LockedFeature>
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Unlocked Content")).toBeVisible();
    });

    it("does not show locked indicator", () => {
      render(
        <LockedFeature feature="diplomacy_basics" currentTurn={10}>
          <div>Diplomacy Panel</div>
        </LockedFeature>
      );

      expect(screen.queryByTestId("locked-feature-diplomacy_basics")).not.toBeInTheDocument();
    });
  });

  describe("when feature is locked", () => {
    it("shows locked state with overlay variant", () => {
      render(
        <LockedFeature feature="diplomacy_basics" currentTurn={5}>
          <div data-testid="child-content">Diplomacy Panel</div>
        </LockedFeature>
      );

      expect(screen.getByTestId("locked-feature-diplomacy_basics")).toBeInTheDocument();
      expect(screen.getByText("Diplomacy Basics")).toBeInTheDocument();
    });

    it("shows correct unlock turn", () => {
      render(
        <LockedFeature feature="diplomacy_basics" currentTurn={5}>
          <div>Diplomacy Panel</div>
        </LockedFeature>
      );

      // Diplomacy unlocks at turn 10
      expect(screen.getByText("Turn 10")).toBeInTheDocument();
    });

    it("shows correct turns remaining", () => {
      render(
        <LockedFeature feature="diplomacy_basics" currentTurn={5} showCountdown={true}>
          <div>Diplomacy Panel</div>
        </LockedFeature>
      );

      // 10 - 5 = 5 turns remaining
      expect(screen.getByText("5 turns remaining")).toBeInTheDocument();
    });

    it("shows singular turn when 1 remaining", () => {
      render(
        <LockedFeature feature="diplomacy_basics" currentTurn={9} showCountdown={true}>
          <div>Diplomacy Panel</div>
        </LockedFeature>
      );

      expect(screen.getByText("1 turn remaining")).toBeInTheDocument();
    });

    it("shows replace variant correctly", () => {
      render(
        <LockedFeature feature="black_market" currentTurn={15} variant="replace">
          <div data-testid="child-content">Black Market Panel</div>
        </LockedFeature>
      );

      // Child content should not be visible
      expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
      // Should show Black Market name
      expect(screen.getByText("Black Market")).toBeInTheDocument();
    });

    it("shows disable variant correctly", () => {
      render(
        <LockedFeature feature="coalitions" currentTurn={10} variant="disable">
          <div data-testid="child-content">Coalition Panel</div>
        </LockedFeature>
      );

      // Content should be visible but in locked container
      expect(screen.getByTestId("locked-feature-coalitions")).toBeInTheDocument();
    });

    it("uses custom message when provided", () => {
      render(
        <LockedFeature
          feature="diplomacy_basics"
          currentTurn={5}
          customMessage="Custom lock message"
        >
          <div>Diplomacy Panel</div>
        </LockedFeature>
      );

      expect(screen.getByText("Custom lock message")).toBeInTheDocument();
    });

    it("hides countdown when showCountdown is false", () => {
      render(
        <LockedFeature feature="diplomacy_basics" currentTurn={5} showCountdown={false}>
          <div>Diplomacy Panel</div>
        </LockedFeature>
      );

      expect(screen.queryByText("5 turns remaining")).not.toBeInTheDocument();
    });
  });

  describe("unlock thresholds", () => {
    it("locks diplomacy before turn 10", () => {
      render(
        <LockedFeature feature="diplomacy_basics" currentTurn={9}>
          <div data-testid="content">Content</div>
        </LockedFeature>
      );

      expect(screen.getByTestId("locked-feature-diplomacy_basics")).toBeInTheDocument();
    });

    it("unlocks diplomacy at turn 10", () => {
      render(
        <LockedFeature feature="diplomacy_basics" currentTurn={10}>
          <div data-testid="content">Content</div>
        </LockedFeature>
      );

      expect(screen.queryByTestId("locked-feature-diplomacy_basics")).not.toBeInTheDocument();
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("locks black market before turn 30", () => {
      render(
        <LockedFeature feature="black_market" currentTurn={29}>
          <div data-testid="content">Content</div>
        </LockedFeature>
      );

      expect(screen.getByTestId("locked-feature-black_market")).toBeInTheDocument();
    });

    it("unlocks black market at turn 30", () => {
      render(
        <LockedFeature feature="black_market" currentTurn={30}>
          <div data-testid="content">Content</div>
        </LockedFeature>
      );

      expect(screen.queryByTestId("locked-feature-black_market")).not.toBeInTheDocument();
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("locks advanced ships before turn 50", () => {
      render(
        <LockedFeature feature="advanced_ships" currentTurn={49}>
          <div data-testid="content">Content</div>
        </LockedFeature>
      );

      expect(screen.getByTestId("locked-feature-advanced_ships")).toBeInTheDocument();
    });

    it("unlocks advanced ships at turn 50", () => {
      render(
        <LockedFeature feature="advanced_ships" currentTurn={50}>
          <div data-testid="content">Content</div>
        </LockedFeature>
      );

      expect(screen.queryByTestId("locked-feature-advanced_ships")).not.toBeInTheDocument();
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });
});

describe("LockedSection", () => {
  it("renders children when unlocked", () => {
    render(
      <LockedSection feature="core_mechanics" currentTurn={1}>
        <div data-testid="section-content">Section Content</div>
      </LockedSection>
    );

    expect(screen.getByTestId("section-content")).toBeInTheDocument();
    expect(screen.queryByTestId("locked-section-core_mechanics")).not.toBeInTheDocument();
  });

  it("shows locked section when locked", () => {
    render(
      <LockedSection feature="superweapons" currentTurn={50}>
        <div data-testid="section-content">Superweapons Section</div>
      </LockedSection>
    );

    expect(screen.getByTestId("locked-section-superweapons")).toBeInTheDocument();
    expect(screen.queryByTestId("section-content")).not.toBeInTheDocument();
  });

  it("shows unlock turn", () => {
    render(
      <LockedSection feature="superweapons" currentTurn={50}>
        <div>Superweapons Section</div>
      </LockedSection>
    );

    // Superweapons unlock at turn 100
    expect(screen.getByText(/Turn 100/)).toBeInTheDocument();
  });

  it("uses custom title when provided", () => {
    render(
      <LockedSection feature="superweapons" currentTurn={50} title="Nuclear Arsenal">
        <div>Section</div>
      </LockedSection>
    );

    expect(screen.getByText("Nuclear Arsenal")).toBeInTheDocument();
  });
});
