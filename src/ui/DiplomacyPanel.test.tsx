// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DiplomacyPanel } from "./DiplomacyPanel";
import type { GameState } from "../engine/types";

const PLAYER = "empire-player";
const OTHER = "empire-other";
const TARGET = "empire-target";

interface CoalitionOpts {
  id: string;
  targetId: string;
  memberIds: string[];
  active?: boolean;
  combatBonus?: number;
}

function makeState(coalitions: CoalitionOpts[]): GameState {
  const empires = new Map<any, any>([
    [PLAYER, { id: PLAYER, name: "Player", powerScore: 100, globalReputation: 55 }],
    [OTHER, { id: OTHER, name: "Vorlon Concord", powerScore: 80 }],
    [TARGET, { id: TARGET, name: "Krell Hegemony", powerScore: 90 }],
  ]);

  const coalitionMap = new Map<any, any>();
  for (const c of coalitions) {
    coalitionMap.set(c.id, {
      id: c.id,
      targetId: c.targetId,
      memberIds: c.memberIds,
      warChest: 0,
      combatBonus: c.combatBonus ?? 10,
      formedCycle: 1,
      active: c.active ?? true,
    });
  }

  return {
    empires,
    playerEmpireId: PLAYER,
    diplomacy: {
      pacts: new Map(),
      coalitions: coalitionMap,
      relationships: new Map(),
    },
    time: { cosmicOrder: { tiers: new Map() } },
  } as unknown as GameState;
}

afterEach(() => cleanup());

describe("DiplomacyPanel — coalition memberships", () => {
  it("lists a coalition the player is a member of", () => {
    render(
      <DiplomacyPanel
        state={makeState([
          { id: "coalition-1", targetId: TARGET, memberIds: [PLAYER, OTHER], combatBonus: 15 },
        ])}
        onClose={vi.fn()}
        onProposePact={vi.fn()}
        onBreakPact={vi.fn()}
      />,
    );
    expect(screen.getByText("Coalition Memberships")).toBeInTheDocument();
    expect(screen.getByText(/Coalition against Krell Hegemony/i)).toBeInTheDocument();
    expect(screen.getByText(/\+15% combat/i)).toBeInTheDocument();
  });

  it("shows the empty state when the player is in no coalition", () => {
    render(
      <DiplomacyPanel
        state={makeState([
          // A coalition that does not include the player.
          { id: "coalition-1", targetId: PLAYER, memberIds: [OTHER, TARGET] },
        ])}
        onClose={vi.fn()}
        onProposePact={vi.fn()}
        onBreakPact={vi.fn()}
      />,
    );
    expect(screen.getByText("Not part of any coalition.")).toBeInTheDocument();
  });
});
