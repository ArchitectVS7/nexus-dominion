import { describe, it, expect } from "vitest";
import {
  computeDedupeKey,
  enqueueOrder,
  removeOrder,
  toEngineActions,
  summarizeOrders,
  type QueuedOrder,
  type OrderInput,
} from "./orders";

let seq = 0;
function input(
  type: string,
  details: Record<string, unknown>,
  label = "L",
): OrderInput {
  return { id: `ord-${seq++}`, type, details, label };
}

/** Enqueue a chain of inputs starting from empty. */
function chain(...inputs: OrderInput[]): QueuedOrder[] {
  return inputs.reduce<QueuedOrder[]>((acc, i) => enqueueOrder(acc, i), []);
}

describe("computeDedupeKey", () => {
  it("keys claim-system by systemId and attack by targetSystemId (shared family)", () => {
    expect(computeDedupeKey("claim-system", { systemId: "sys-x" })).toBe(
      "system-intent:sys-x",
    );
    expect(computeDedupeKey("attack", { targetSystemId: "sys-x" })).toBe(
      "system-intent:sys-x",
    );
  });

  it("keys trade by resource+direction and fund-syndicate by a constant", () => {
    expect(
      computeDedupeKey("trade", { resource: "ore", direction: "buy" }),
    ).toBe("trade:ore:buy");
    expect(computeDedupeKey("fund-syndicate", { amount: 10 })).toBe(
      "fund-syndicate",
    );
  });

  it("keys the last-wins singles", () => {
    expect(computeDedupeKey("move-fleet", { fleetId: "f1" })).toBe(
      "move-fleet:f1",
    );
    expect(computeDedupeKey("propose-pact", { targetId: "e1" })).toBe(
      "pact:e1",
    );
    expect(computeDedupeKey("launch-covert-op", { targetId: "e1" })).toBe(
      "covert:e1",
    );
    expect(computeDedupeKey("research", {})).toBe("research");
    expect(computeDedupeKey("select-doctrine", {})).toBe("doctrine");
    expect(computeDedupeKey("select-specialization", {})).toBe("specialization");
    expect(
      computeDedupeKey("build-wormhole", { targetSystemId: "sys-z" }),
    ).toBe("wormhole:sys-z");
  });

  it("keys the idempotent actions", () => {
    expect(computeDedupeKey("break-pact", { pactId: "p1" })).toBe(
      "break-pact:p1",
    );
    expect(
      computeDedupeKey("purchase-black-register", { itemId: "i1" }),
    ).toBe("br:i1");
  });

  it("keys build-installation per (system, type) [planner decision]", () => {
    expect(
      computeDedupeKey("build-installation", {
        systemId: "sys-a",
        installationType: "mine",
      }),
    ).toBe("install:sys-a:mine");
  });

  it("returns null for stackable build-unit and unmapped types", () => {
    expect(computeDedupeKey("build-unit", { unitTypeId: "u1" })).toBeNull();
    expect(computeDedupeKey("some-future-action", {})).toBeNull();
  });
});

describe("enqueueOrder — system-intent family (last-wins across family)", () => {
  it("attack replaces a queued colonise of the same system", () => {
    const orders = chain(
      input("claim-system", { systemId: "sys-x" }, "COLONISE X"),
      input("attack", { targetSystemId: "sys-x", unitIds: ["u1"] }, "ATTACK X"),
    );
    expect(orders).toHaveLength(1);
    expect(orders[0].type).toBe("attack");
    expect(orders[0].label).toBe("ATTACK X");
  });

  it("colonise replaces a queued attack of the same system (reverse)", () => {
    const orders = chain(
      input("attack", { targetSystemId: "sys-x", unitIds: ["u1"] }, "ATTACK X"),
      input("claim-system", { systemId: "sys-x" }, "COLONISE X"),
    );
    expect(orders).toHaveLength(1);
    expect(orders[0].type).toBe("claim-system");
  });

  it("different systems stay independent", () => {
    const orders = chain(
      input("claim-system", { systemId: "sys-x" }),
      input("attack", { targetSystemId: "sys-y", unitIds: [] }),
    );
    expect(orders).toHaveLength(2);
  });
});

describe("enqueueOrder — merges", () => {
  it("sums trade quantities for the same resource+direction and rebuilds the label", () => {
    const orders = chain(
      input("trade", { resource: "ore", quantity: 10, direction: "buy" }),
      input("trade", { resource: "ore", quantity: 20, direction: "buy" }),
    );
    expect(orders).toHaveLength(1);
    expect(orders[0].details.quantity).toBe(30);
    expect(orders[0].label).toBe("BUY 30 ORE");
  });

  it("keeps buy vs sell and different resources separate", () => {
    const orders = chain(
      input("trade", { resource: "ore", quantity: 10, direction: "buy" }),
      input("trade", { resource: "ore", quantity: 10, direction: "sell" }),
      input("trade", { resource: "food", quantity: 10, direction: "buy" }),
    );
    expect(orders).toHaveLength(3);
  });

  it("sums fund-syndicate amounts and rebuilds the label", () => {
    const orders = chain(
      input("fund-syndicate", { amount: 100 }),
      input("fund-syndicate", { amount: 400 }),
    );
    expect(orders).toHaveLength(1);
    expect(orders[0].details.amount).toBe(500);
    expect(orders[0].label).toBe("FUND SYNDICATE — 500 CT");
  });

  it("merge keeps the first order's id and position", () => {
    const first = input("fund-syndicate", { amount: 100 });
    const orders = chain(
      input("research", {}),
      first,
      input("fund-syndicate", { amount: 50 }),
    );
    const fund = orders.find((o) => o.type === "fund-syndicate")!;
    expect(fund.id).toBe(first.id);
    expect(orders[1].type).toBe("fund-syndicate");
  });
});

describe("enqueueOrder — build-unit stackable", () => {
  it("stacks every build-unit as an independent order with null key", () => {
    const orders = chain(
      input("build-unit", { unitTypeId: "fighter" }),
      input("build-unit", { unitTypeId: "fighter" }),
      input("build-unit", { unitTypeId: "cruiser" }),
    );
    expect(orders).toHaveLength(3);
    expect(orders.every((o) => o.dedupeKey === null)).toBe(true);
  });
});

describe("enqueueOrder — last-wins singles", () => {
  it("move-fleet with the same fleet keeps only the latest details", () => {
    const orders = chain(
      input("move-fleet", { fleetId: "f1", targetSystemId: "sys-a" }),
      input("move-fleet", { fleetId: "f1", targetSystemId: "sys-b" }),
    );
    expect(orders).toHaveLength(1);
    expect(orders[0].details.targetSystemId).toBe("sys-b");
  });

  it("different fleets stay independent", () => {
    const orders = chain(
      input("move-fleet", { fleetId: "f1", targetSystemId: "sys-a" }),
      input("move-fleet", { fleetId: "f2", targetSystemId: "sys-a" }),
    );
    expect(orders).toHaveLength(2);
  });

  it.each([
    ["propose-pact", { targetId: "e1", type: "star-covenant" }],
    ["launch-covert-op", { targetId: "e1", opType: "sabotage" }],
    ["research", {}],
    ["select-doctrine", { pathId: "p1" }],
    ["select-specialization", { specId: "s1" }],
    ["build-wormhole", { targetSystemId: "sys-z" }],
  ] as const)("%s collapses repeats to one order", (type, details) => {
    const orders = chain(input(type, { ...details }), input(type, { ...details }));
    expect(orders).toHaveLength(1);
  });
});

describe("enqueueOrder — idempotent", () => {
  it("break-pact dedupes and keeps the first order's id/position", () => {
    const first = input("break-pact", { pactId: "p1" });
    const orders = chain(first, input("break-pact", { pactId: "p1" }));
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe(first.id);
  });

  it("purchase-black-register dedupes on itemId", () => {
    const orders = chain(
      input("purchase-black-register", { itemId: "i1" }),
      input("purchase-black-register", { itemId: "i1" }),
    );
    expect(orders).toHaveLength(1);
  });

  it("different pact/item ids stay independent", () => {
    const orders = chain(
      input("break-pact", { pactId: "p1" }),
      input("break-pact", { pactId: "p2" }),
      input("purchase-black-register", { itemId: "i1" }),
      input("purchase-black-register", { itemId: "i2" }),
    );
    expect(orders).toHaveLength(4);
  });
});

describe("enqueueOrder — build-installation [planner decision: idempotent per system+type]", () => {
  it("dedupes the same system + type", () => {
    const orders = chain(
      input("build-installation", { systemId: "sys-a", installationType: "mine" }),
      input("build-installation", { systemId: "sys-a", installationType: "mine" }),
    );
    expect(orders).toHaveLength(1);
  });

  it("keeps different systems or types independent", () => {
    const orders = chain(
      input("build-installation", { systemId: "sys-a", installationType: "mine" }),
      input("build-installation", { systemId: "sys-b", installationType: "mine" }),
      input("build-installation", { systemId: "sys-a", installationType: "farm" }),
    );
    expect(orders).toHaveLength(3);
  });
});

describe("removeOrder", () => {
  it("drops the matching id and leaves the rest", () => {
    const orders = chain(
      input("research", {}),
      input("build-unit", { unitTypeId: "fighter" }),
    );
    const removed = removeOrder(orders, orders[0].id);
    expect(removed).toHaveLength(1);
    expect(removed[0].type).toBe("build-unit");
  });

  it("is a no-op for an unknown id", () => {
    const orders = chain(input("research", {}));
    expect(removeOrder(orders, "nope")).toHaveLength(1);
  });
});

describe("summarizeOrders", () => {
  it("empty queue → empty maps/arrays and all-false/null flags", () => {
    const s = summarizeOrders([]);
    expect(s.systemIntents.size).toBe(0);
    expect(s.buildUnitCounts.size).toBe(0);
    expect(s.trades).toEqual([]);
    expect(s.researchQueued).toBe(false);
    expect(s.doctrineQueued).toBeNull();
    expect(s.specializationQueued).toBeNull();
    expect(s.totalOrders).toBe(0);
  });

  it("groups build-unit orders into per-type counts", () => {
    const orders = chain(
      input("build-unit", { unitTypeId: "fighter" }),
      input("build-unit", { unitTypeId: "fighter" }),
      input("build-unit", { unitTypeId: "cruiser" }),
    );
    const s = summarizeOrders(orders);
    expect(s.buildUnitCounts.get("fighter")).toBe(2);
    expect(s.buildUnitCounts.get("cruiser")).toBe(1);
    expect(s.totalOrders).toBe(3);
  });

  it("projects merged trades with resource/direction/quantity and label passthrough, buy vs sell separate", () => {
    const orders = chain(
      input("trade", { resource: "ore", quantity: 10, direction: "buy" }),
      input("trade", { resource: "ore", quantity: 20, direction: "buy" }),
      input("trade", { resource: "ore", quantity: 5, direction: "sell" }),
    );
    const s = summarizeOrders(orders);
    expect(s.trades).toHaveLength(2);
    const buy = s.trades.find((t) => t.direction === "buy")!;
    expect(buy.resource).toBe("ore");
    expect(buy.quantity).toBe(30);
    expect(buy.label).toBe("BUY 30 ORE");
    const sell = s.trades.find((t) => t.direction === "sell")!;
    expect(sell.quantity).toBe(5);
  });

  it("tracks family intents per system (colonise/attack/wormhole) independently", () => {
    const orders = chain(
      input("claim-system", { systemId: "sys-a" }),
      input("attack", { targetSystemId: "sys-b", unitIds: ["u1"] }),
      input("build-wormhole", { targetSystemId: "sys-c" }),
    );
    const s = summarizeOrders(orders);
    expect(s.systemIntents.get("sys-a")).toBe("colonise");
    expect(s.systemIntents.get("sys-b")).toBe("attack");
    expect(s.systemIntents.get("sys-c")).toBe("wormhole");
    expect(s.systemIntents.size).toBe(3);
  });

  it("reflects a claim→attack overwrite on the same system as a single 'attack' intent", () => {
    const orders = chain(
      input("claim-system", { systemId: "sys-x" }),
      input("attack", { targetSystemId: "sys-x", unitIds: ["u1"] }),
    );
    const s = summarizeOrders(orders);
    expect(s.systemIntents.get("sys-x")).toBe("attack");
    expect(s.systemIntents.size).toBe(1);
  });

  it("sets research/doctrine/specialization flags to their queued values", () => {
    const orders = chain(
      input("research", {}),
      input("select-doctrine", { pathId: "war-machine" }),
      input("select-specialization", { specId: "shock-troops" }),
    );
    const s = summarizeOrders(orders);
    expect(s.researchQueued).toBe(true);
    expect(s.doctrineQueued).toBe("war-machine");
    expect(s.specializationQueued).toBe("shock-troops");
  });

  it("totalOrders equals the input length", () => {
    const orders = chain(
      input("research", {}),
      input("build-unit", { unitTypeId: "fighter" }),
      input("trade", { resource: "food", quantity: 50, direction: "buy" }),
    );
    expect(summarizeOrders(orders).totalOrders).toBe(orders.length);
  });
});

describe("toEngineActions", () => {
  it("maps to { type, details } preserving order and dropping ui-only fields", () => {
    const orders = chain(
      input("claim-system", { systemId: "sys-x" }, "COLONISE X"),
      input("build-unit", { unitTypeId: "fighter" }, "BUILD F"),
    );
    expect(toEngineActions(orders)).toEqual([
      { type: "claim-system", details: { systemId: "sys-x" } },
      { type: "build-unit", details: { unitTypeId: "fighter" } },
    ]);
  });
});
