// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MarketPanel } from "./MarketPanel";
import { summarizeOrders, type OrdersSummary, type QueuedOrder } from "./orders";
import type { GameState } from "../engine/types";

const PLAYER = "empire-player";

/** Builds a minimal GameState containing only the fields MarketPanel reads. */
function makeState(): GameState {
  const empires = new Map<any, any>([
    [
      PLAYER,
      {
        id: PLAYER,
        name: "Player",
        resources: { credits: 5000, food: 200, ore: 200, fuelCells: 200 },
      },
    ],
  ]);

  return {
    market: {
      prices: { food: 10, ore: 12, fuelCells: 15 },
      basePrices: { food: 10, ore: 12, fuelCells: 15 },
    },
    empires,
    playerEmpireId: PLAYER,
    diplomacy: { pacts: new Map() },
    currentCycleEvents: [],
  } as unknown as GameState;
}

/** Summary fixture with one pending buy trade. */
function summaryWithTrade(): OrdersSummary {
  const orders: QueuedOrder[] = [
    {
      id: "ord-0",
      type: "trade",
      details: { resource: "food", quantity: 50, direction: "buy" },
      label: "BUY 50 FOOD",
      dedupeKey: "trade:food:buy",
    },
  ];
  return summarizeOrders(orders);
}

afterEach(() => cleanup());

describe("MarketPanel — pending trade rows", () => {
  it("renders a PENDING row for a queued trade", () => {
    render(
      <MarketPanel
        state={makeState()}
        summary={summaryWithTrade()}
        onClose={() => {}}
        onTrade={vi.fn()}
      />,
    );

    expect(screen.getByText(/PENDING: BUY 50 FOOD/i)).toBeInTheDocument();
  });

  it("renders no PENDING row when the queue has no trades", () => {
    render(
      <MarketPanel
        state={makeState()}
        summary={summarizeOrders([])}
        onClose={() => {}}
        onTrade={vi.fn()}
      />,
    );

    expect(screen.queryByText(/PENDING:/i)).toBeNull();
  });
});
