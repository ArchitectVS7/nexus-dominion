// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SystemPanel } from "./SystemPanel";
import type { GameState } from "../engine/types";

const PLAYER = "empire-player";
const ENEMY = "empire-enemy";
const TARGET_SYS = "sys-target";
const UNIT_A = "unit-a";
const UNIT_B = "unit-b";

/**
 * Builds a minimal GameState containing only the fields SystemPanel reads.
 * `owner` on the target system determines the own/enemy/unclaimed branch.
 * When `withUnits` is false the player empire has no fleets/units.
 */
function makeState(owner: string | null, withUnits = true): GameState {
  const systems = new Map<any, any>([
    [
      TARGET_SYS,
      {
        id: TARGET_SYS,
        name: "Target Prime",
        sectorId: "sector-0",
        biome: "core-world",
        owner,
        slots: [],
        adjacentSystemIds: [],
        claimedCycle: owner ? 0 : null,
      },
    ],
  ]);

  const sectors = new Map<any, any>([
    ["sector-0", { id: "sector-0", name: "Sector Zero", systemIds: [TARGET_SYS], centre: { x: 0, y: 0 } }],
  ]);

  const units = new Map<any, any>();
  const fleets = new Map<any, any>();
  const fleetIds: string[] = [];
  if (withUnits) {
    units.set(UNIT_A, { id: UNIT_A, typeId: "frigate", currentHp: 100, completionCycle: null });
    units.set(UNIT_B, { id: UNIT_B, typeId: "legion", currentHp: 100, completionCycle: null });
    fleets.set("fleet-1", {
      id: "fleet-1",
      ownerId: PLAYER,
      name: "First Fleet",
      locationSystemId: TARGET_SYS,
      unitIds: [UNIT_A, UNIT_B],
      targetSystemId: null,
      arrivalCycle: null,
    });
    fleetIds.push("fleet-1");
  }

  const unitTypes = new Map<any, any>([
    ["frigate", { id: "frigate", name: "Frigate", category: "fleet" }],
    ["legion", { id: "legion", name: "Legion", category: "ground" }],
  ]);

  const empires = new Map<any, any>([
    [
      PLAYER,
      {
        id: PLAYER,
        name: "Player",
        homeSystemId: "sys-home",
        fleetIds,
        resources: { credits: 500, ore: 100 },
      },
    ],
    [ENEMY, { id: ENEMY, name: "Enemy Empire", fleetIds: [], resources: { credits: 0, ore: 0 } }],
  ]);

  return {
    galaxy: { systems, sectors },
    empires,
    playerEmpireId: PLAYER,
    unitTypes,
    units,
    fleets,
  } as unknown as GameState;
}

afterEach(() => cleanup());

describe("SystemPanel — attack control", () => {
  it("renders the attack control for an enemy-owned system and fires onAttack with the selected unit ids", () => {
    const onAttack = vi.fn();
    render(
      <SystemPanel
        systemId={TARGET_SYS as any}
        state={makeState(ENEMY)}
        onClose={() => {}}
        onAttack={onAttack}
      />,
    );

    const launch = screen.getByRole("button", { name: /launch attack/i });
    expect(launch).toBeInTheDocument();
    // Disabled until at least one unit is selected.
    expect(launch).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/Frigate \(fleet\)/i));
    expect(launch).toBeEnabled();

    fireEvent.click(launch);
    expect(onAttack).toHaveBeenCalledTimes(1);
    expect(onAttack).toHaveBeenCalledWith(TARGET_SYS, [UNIT_A]);
  });

  it("selects all units via the select-all checkbox", () => {
    const onAttack = vi.fn();
    render(
      <SystemPanel
        systemId={TARGET_SYS as any}
        state={makeState(ENEMY)}
        onClose={() => {}}
        onAttack={onAttack}
      />,
    );

    fireEvent.click(screen.getByLabelText(/select all units/i));
    fireEvent.click(screen.getByRole("button", { name: /launch attack/i }));
    expect(onAttack).toHaveBeenCalledWith(TARGET_SYS, [UNIT_A, UNIT_B]);
  });

  it("does not render the attack control for a player-owned system", () => {
    render(
      <SystemPanel
        systemId={TARGET_SYS as any}
        state={makeState(PLAYER)}
        onClose={() => {}}
        onAttack={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /launch attack/i })).toBeNull();
  });

  it("does not render the attack control for an unclaimed system", () => {
    render(
      <SystemPanel
        systemId={TARGET_SYS as any}
        state={makeState(null)}
        onClose={() => {}}
        onAttack={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /launch attack/i })).toBeNull();
  });

  it("disables the attack button with an inline reason when the player has no units", () => {
    render(
      <SystemPanel
        systemId={TARGET_SYS as any}
        state={makeState(ENEMY, false)}
        onClose={() => {}}
        onAttack={vi.fn()}
      />,
    );
    expect(screen.getByText(/no military units available/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /launch attack/i })).toBeDisabled();
  });
});
