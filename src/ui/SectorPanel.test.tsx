// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SectorPanel } from "./SectorPanel";
import type { GameState } from "../engine/types";

const PLAYER = "empire-0";
const RIVAL = "empire-1";
const SECTOR = "sector-0";

/**
 * Build a minimal GameState with a single 25-system sector.
 *
 * `playerCount` systems are owned by the player, `rivalCount` by a rival,
 * and the remainder are unclaimed. With playerCount >= 13 the player is the
 * dominant empire; otherwise the sector is contested.
 */
function makeState(playerCount: number, rivalCount: number): GameState {
  const systems = new Map<any, any>();
  const systemIds: string[] = [];
  for (let i = 0; i < 25; i++) {
    const id = `sys-${i}`;
    systemIds.push(id);
    let owner: string | null;
    if (i < playerCount) owner = PLAYER;
    else if (i < playerCount + rivalCount) owner = RIVAL;
    else owner = null;
    systems.set(id, { id, name: `System ${i}`, owner });
  }

  const sectors = new Map<any, any>([
    [SECTOR, { id: SECTOR, name: "Sector Zero", systemIds, centre: { x: 0, y: 0 } }],
  ]);

  const empires = new Map<any, any>([
    [PLAYER, { id: PLAYER, name: "Player" }],
    [RIVAL, { id: RIVAL, name: "Rival Empire" }],
  ]);

  return {
    galaxy: { systems, sectors },
    empires,
    playerEmpireId: PLAYER,
  } as unknown as GameState;
}

afterEach(() => cleanup());

describe("SectorPanel", () => {
  it("renders the system count, per-empire ownership tallies, and a dominance line", () => {
    // 13× player (dominant), 8× rival, 4× unclaimed.
    render(
      <SectorPanel
        sectorId={SECTOR as any}
        state={makeState(13, 8)}
        onClose={() => {}}
      />,
    );

    // System count in the section heading.
    expect(screen.getByText(/Systems \(25\)/)).toBeInTheDocument();
    // 25 system rows rendered.
    expect(screen.getAllByText(/^System \d+$/)).toHaveLength(25);

    // Per-empire ownership tallies (player shown as "Yours").
    const ownershipList = screen.getByText("Ownership Breakdown").parentElement!;
    expect(ownershipList).toHaveTextContent(/Yours\s*13/);
    expect(ownershipList).toHaveTextContent(/Rival Empire\s*8/);
    expect(ownershipList).toHaveTextContent(/Unclaimed\s*4/);

    // Dominance line — player holds the majority.
    const dominance = screen.getByRole("status");
    expect(dominance).toHaveTextContent(/Dominated by Yours/);
  });

  it("shows a contested dominance line when no empire holds a majority", () => {
    // 12× player, 12× rival, 1× unclaimed — nobody reaches 13.
    render(
      <SectorPanel
        sectorId={SECTOR as any}
        state={makeState(12, 12)}
        onClose={() => {}}
      />,
    );

    const dominance = screen.getByRole("status");
    expect(dominance).toHaveTextContent(/Contested/);
    expect(dominance).not.toHaveTextContent(/Dominated by/);
  });

  it("fires onClose from the panel close control", () => {
    const onClose = vi.fn();
    render(
      <SectorPanel
        sectorId={SECTOR as any}
        state={makeState(13, 8)}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /close panel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fires onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <SectorPanel
        sectorId={SECTOR as any}
        state={makeState(13, 8)}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("returns null for a missing sector", () => {
    const { container } = render(
      <SectorPanel
        sectorId={"no-such" as any}
        state={makeState(13, 8)}
        onClose={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
