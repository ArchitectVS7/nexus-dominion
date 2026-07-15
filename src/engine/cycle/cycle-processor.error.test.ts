import { describe, it, expect, vi } from "vitest";

// Force a Tier-1 failure: advanceCycle is the very first Tier-1 statement in
// processCycle, so throwing here guarantees the atomic catch triggers before
// any committed state mutation. importOriginal preserves getResolutionOrder
// (also imported by the processor from this module).
vi.mock("../nexus/nexus-engine", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../nexus/nexus-engine")>()),
  advanceCycle: vi.fn(() => {
    throw new Error("forced tier-1 failure");
  }),
}));

import { processCycle } from "./cycle-processor";
import { makeMinimalGameState } from "./cycle-test-fixtures";

describe("processCycle atomic failure", () => {
  it("captures the thrown error and rolls back state", () => {
    const state = makeMinimalGameState();
    const snapshot = structuredClone(state); // deep snapshot for immutability check
    const result = processCycle(state, { actions: [] }, new Map(), new Map());

    expect(result.committed).toBe(false);
    expect(result.error).toContain("forced tier-1 failure");
    expect(result.state).toEqual(snapshot); // deep-equals the input
    expect(result.state).toBe(state); // returned the untouched original reference
  });
});
