// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { CombatReportModal } from "./CombatReport";
import type { CombatEvent, EmpireId } from "../engine/types";

const PLAYER = "empire-player" as EmpireId;
const ENEMY = "empire-enemy";
const SYS = "sys-target";

afterEach(cleanup);

/** Three-phase engagement won by the player, capturing the system. */
function makeCombatEvent(): CombatEvent {
  // Branded EmpireId/UnitId are string-backed; cast the plain-string fixture.
  const event = {
    type: "combat",
    cycle: 5,
    attackerId: PLAYER,
    defenderId: ENEMY,
    victor: PLAYER,
    ownershipChanged: true,
    result: {
      phase: "ground-assault",
      attackerId: PLAYER,
      defenderId: ENEMY,
      systemId: SYS,
      attackerLosses: ["unit-a1", "unit-a2"],
      defenderLosses: ["unit-d1", "unit-d2", "unit-d3", "unit-d4"],
      victor: PLAYER,
      systemCaptured: true,
      moraleBreak: true,
    },
    results: [
      {
        phase: "fleet-engagement",
        attackerId: PLAYER,
        defenderId: ENEMY,
        systemId: SYS,
        attackerLosses: ["unit-a1"], // 1
        defenderLosses: ["unit-d1", "unit-d2", "unit-d3"], // 3
        victor: PLAYER,
        systemCaptured: false,
      },
      {
        phase: "orbital-bombardment",
        attackerId: PLAYER,
        defenderId: ENEMY,
        systemId: SYS,
        attackerLosses: [], // 0
        defenderLosses: ["unit-d4"], // 1 -> unique
        victor: PLAYER,
        systemCaptured: false,
        infrastructureDamage: 45,
      },
      {
        phase: "ground-assault",
        attackerId: PLAYER,
        defenderId: ENEMY,
        systemId: SYS,
        attackerLosses: ["unit-a2", "unit-a3"], // 2
        defenderLosses: ["unit-d5", "unit-d6", "unit-d7", "unit-d8", "unit-d9"], // 5
        victor: PLAYER,
        systemCaptured: true,
        moraleBreak: true,
      },
    ],
  };
  return event as unknown as CombatEvent;
}

describe("CombatReportModal", () => {
  it("renders each phase with its casualties", () => {
    const { container } = render(
      <CombatReportModal
        event={makeCombatEvent()}
        playerEmpireId={PLAYER}
        onClose={() => {}}
      />,
    );

    const phaseSection = (phase: string) =>
      container.querySelector(`[data-phase="${phase}"]`) as HTMLElement;

    // Fleet engagement: 1 attacker / 3 defender
    const fleet = phaseSection("fleet-engagement");
    expect(within(fleet).getByText("Fleet Engagement")).toBeInTheDocument();
    expect(within(fleet).getByText("Attacker Losses").parentElement).toHaveTextContent("1");
    expect(within(fleet).getByText("Defender Losses").parentElement).toHaveTextContent("3");

    // Orbital bombardment: 0 attacker / 1 defender
    const orbital = phaseSection("orbital-bombardment");
    expect(within(orbital).getByText("Orbital Bombardment")).toBeInTheDocument();
    expect(within(orbital).getByText("Attacker Losses").parentElement).toHaveTextContent("0");
    expect(within(orbital).getByText("Defender Losses").parentElement).toHaveTextContent("1");

    // Ground assault: 2 attacker / 5 defender, morale break
    const ground = phaseSection("ground-assault");
    expect(within(ground).getByText("Ground Assault")).toBeInTheDocument();
    expect(within(ground).getByText("Attacker Losses").parentElement).toHaveTextContent("2");
    expect(within(ground).getByText("Defender Losses").parentElement).toHaveTextContent("5");
    expect(within(ground).getByText(/Morale Break/i)).toBeInTheDocument();
  });

  it("shows the final victor and ownership change in the footer", () => {
    render(
      <CombatReportModal
        event={makeCombatEvent()}
        playerEmpireId={PLAYER}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText(/Outcome:/i)).toHaveTextContent("Victory");
    expect(screen.getByText(/Outcome:/i)).toHaveTextContent(`${PLAYER} (You)`);

    const ownership = screen.getByText(/Ownership:/i);
    expect(ownership).toHaveTextContent(/System captured/i);
    expect(ownership).toHaveTextContent(`${PLAYER} (You)`);
  });

  it("closes via the DISMISS control", () => {
    const onClose = vi.fn();
    render(
      <CombatReportModal
        event={makeCombatEvent()}
        playerEmpireId={PLAYER}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("DISMISS"));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes via the Panel × control", () => {
    const onClose = vi.fn();
    render(
      <CombatReportModal
        event={makeCombatEvent()}
        playerEmpireId={PLAYER}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByLabelText("Close panel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("falls back to the single decisive result when results[] is absent", () => {
    const event = makeCombatEvent();
    delete event.results;
    const { container } = render(
      <CombatReportModal event={event} playerEmpireId={PLAYER} onClose={() => {}} />,
    );

    const ground = container.querySelector('[data-phase="ground-assault"]') as HTMLElement;
    expect(within(ground).getByText("Ground Assault")).toBeInTheDocument();
    expect(within(ground).getByText("Attacker Losses").parentElement).toHaveTextContent("2");
    expect(within(ground).getByText("Defender Losses").parentElement).toHaveTextContent("4");
  });
});
