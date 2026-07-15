import { describe, it, expect } from "vitest";
import { computeCovenantEdges } from "./StarMap";
import type { Galaxy, DiplomacyState } from "../engine/types";

const PLAYER = "empire-player";
const ALLY = "empire-ally";
const SYS_PLAYER = "sys-player-home";
const SYS_ALLY = "sys-ally-home";

const PLAYER_POS = { x: 100, y: 200 };
const ALLY_POS = { x: 500, y: 600 };

function makeGalaxy(): Galaxy {
  const systems = new Map<any, any>([
    [SYS_PLAYER, { id: SYS_PLAYER, position: PLAYER_POS }],
    [SYS_ALLY, { id: SYS_ALLY, position: ALLY_POS }],
  ]);
  return { systems, sectors: new Map() } as unknown as Galaxy;
}

function makeEmpires(): Map<any, any> {
  return new Map<any, any>([
    [PLAYER, { id: PLAYER, name: "Player", homeSystemId: SYS_PLAYER }],
    [ALLY, { id: ALLY, name: "Ally", homeSystemId: SYS_ALLY }],
  ]);
}

function makeDiplomacy(pacts: any[]): DiplomacyState {
  return {
    pacts: new Map(pacts.map((p) => [p.id, p])),
    coalitions: new Map(),
    relationships: new Map(),
  } as unknown as DiplomacyState;
}

describe("computeCovenantEdges", () => {
  it("emits an edge for an active star-covenant with the player", () => {
    const edges = computeCovenantEdges(
      makeGalaxy(),
      makeEmpires(),
      makeDiplomacy([
        {
          id: "pact-1",
          type: "star-covenant",
          memberIds: [PLAYER, ALLY],
          active: true,
          formedCycle: 1,
        },
      ]),
      PLAYER,
    );
    expect(edges).toHaveLength(1);
    expect(edges[0].a).toEqual(PLAYER_POS);
    expect(edges[0].b).toEqual(ALLY_POS);
  });

  it("emits no edge for an inactive covenant", () => {
    const edges = computeCovenantEdges(
      makeGalaxy(),
      makeEmpires(),
      makeDiplomacy([
        {
          id: "pact-1",
          type: "star-covenant",
          memberIds: [PLAYER, ALLY],
          active: false,
          formedCycle: 1,
        },
      ]),
      PLAYER,
    );
    expect(edges).toEqual([]);
  });

  it("emits no edge for a non-covenant pact type (stillness-accord)", () => {
    const edges = computeCovenantEdges(
      makeGalaxy(),
      makeEmpires(),
      makeDiplomacy([
        {
          id: "pact-1",
          type: "stillness-accord",
          memberIds: [PLAYER, ALLY],
          active: true,
          formedCycle: 1,
        },
      ]),
      PLAYER,
    );
    expect(edges).toEqual([]);
  });

  it("emits no edge for a covenant not involving the player", () => {
    const edges = computeCovenantEdges(
      makeGalaxy(),
      makeEmpires(),
      makeDiplomacy([
        {
          id: "pact-1",
          type: "star-covenant",
          memberIds: [ALLY, "empire-other"],
          active: true,
          formedCycle: 1,
        },
      ]),
      PLAYER,
    );
    expect(edges).toEqual([]);
  });

  it("returns [] when there is no player empire id", () => {
    const edges = computeCovenantEdges(makeGalaxy(), makeEmpires(), makeDiplomacy([]), undefined);
    expect(edges).toEqual([]);
  });
});
