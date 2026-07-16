/* Harness core tests — the protocol contract the UGT trial drives.
   Small galaxies (30 systems / 10 empires) keep these fast; the config is
   parametric and the engine is scale-agnostic. */

import { describe, it, expect } from "vitest";
import {
  createRegistry,
  dispatch,
  parseRequestLine,
  type Request,
  type SavePayload,
} from "./harness-core";

const SMALL = {
  seed: 20260716,
  totalSystems: 30,
  sectorCount: 6,
  systemsPerSector: 5,
  empireCount: 10,
};

function create(registry: ReturnType<typeof createRegistry>, seed = SMALL.seed) {
  return dispatch(
    { op: "create", id: 1, config: { ...SMALL, seed } } as Request,
    registry,
  );
}

describe("harness-core protocol", () => {
  it("create: same seed → identical stateHash; different seed → different", () => {
    const r1 = create(createRegistry());
    const r2 = create(createRegistry());
    const r3 = create(createRegistry(), SMALL.seed + 1);
    expect(r1.ok).toBe(true);
    expect(r1.stateHash).toBe(r2.stateHash);
    expect(r1.stateHash).not.toBe(r3.stateHash);
  });

  it("create: missing seed is refused loudly", () => {
    const resp = dispatch(
      { op: "create", id: 2, config: {} } as unknown as Request,
      createRegistry(),
    );
    expect(resp.ok).toBe(false);
    expect((resp.error as { kind: string }).kind).toBe("BAD_REQUEST");
  });

  it("commit: empty order list advances the cycle atomically", () => {
    const registry = createRegistry();
    const created = create(registry);
    const resp = dispatch(
      {
        op: "commit",
        id: 3,
        campaignId: created.campaignId as string,
        actions: [],
      } as Request,
      registry,
    );
    expect(resp.ok).toBe(true);
    expect(resp.committed).toBe(true);
    const summary = resp.summary as { cycle: number };
    expect(summary.cycle).toBe(1);
    expect(resp.stateHash).not.toBe(created.stateHash);
  });

  it("commit: maintains the caller-owned powerHistory contract", () => {
    const registry = createRegistry();
    const created = create(registry);
    const campaignId = created.campaignId as string;
    for (let i = 0; i < 3; i++) {
      dispatch({ op: "commit", id: 10 + i, campaignId, actions: [] } as Request, registry);
    }
    const state = dispatch(
      { op: "state", id: 20, campaignId } as Request,
      registry,
    );
    const lengths = (state.summary as {
      powerHistoryLengths: { harness: number; state: number };
    }).powerHistoryLengths;
    expect(lengths.harness).toBe(3);
  });

  it("save → load → continue reproduces an uninterrupted run exactly", () => {
    // Run A: create + 4 commits straight through.
    const regA = createRegistry();
    const a = create(regA);
    const idA = a.campaignId as string;
    let lastA: Record<string, unknown> = a;
    for (let i = 0; i < 4; i++) {
      lastA = dispatch({ op: "commit", id: 30 + i, campaignId: idA, actions: [] } as Request, regA);
    }

    // Run B: create + 2 commits, save, load, 2 more commits.
    const regB = createRegistry();
    const b = create(regB);
    const idB = b.campaignId as string;
    for (let i = 0; i < 2; i++) {
      dispatch({ op: "commit", id: 40 + i, campaignId: idB, actions: [] } as Request, regB);
    }
    const saved = dispatch({ op: "save", id: 50, campaignId: idB } as Request, regB);
    expect(saved.ok).toBe(true);
    const loaded = dispatch(
      { op: "load", id: 51, payload: saved.payload as SavePayload } as Request,
      regB,
    );
    expect(loaded.ok).toBe(true);
    expect(loaded.stateHash).toBe(saved.stateHash);
    const idB2 = loaded.campaignId as string;
    let lastB: Record<string, unknown> = loaded;
    for (let i = 0; i < 2; i++) {
      lastB = dispatch({ op: "commit", id: 60 + i, campaignId: idB2, actions: [] } as Request, regB);
    }

    expect(lastB.stateHash).toBe(lastA.stateHash);
  });

  it("state full: returns the game's own serialized form", () => {
    const registry = createRegistry();
    const created = create(registry);
    const resp = dispatch(
      { op: "state", id: 70, campaignId: created.campaignId as string, full: true } as Request,
      registry,
    );
    expect(resp.ok).toBe(true);
    const full = resp.state as { empires: { __t: string; e: unknown[] } };
    expect(full.empires.__t).toBe("Map");
    expect(full.empires.e.length).toBe(SMALL.empireCount);
  });

  it("unknown op and unknown campaign are typed errors", () => {
    const registry = createRegistry();
    const bad = dispatch({ op: "warp" } as unknown as Request, registry);
    expect(bad.ok).toBe(false);
    expect((bad.error as { kind: string }).kind).toBe("BAD_REQUEST");

    const missing = dispatch(
      { op: "commit", campaignId: "c999", actions: [] } as Request,
      registry,
    );
    expect(missing.ok).toBe(false);
    expect((missing.error as { kind: string }).kind).toBe("UNKNOWN_CAMPAIGN");
  });

  it("parseRequestLine: rejects non-JSON and op-less lines", () => {
    expect(parseRequestLine("{nope").ok).toBe(false);
    expect(parseRequestLine('{"noOp":1}').ok).toBe(false);
    expect(parseRequestLine('{"op":"state","campaignId":"c1"}').ok).toBe(true);
  });
});
