import { describe, it, expect } from "vitest";
import { computeSectorDominance, SECTOR_DOMINANCE_THRESHOLD } from "./sector-dominance";
import type { Galaxy } from "../types";

/**
 * Build a minimal Galaxy with one sector whose 25 systems are owned
 * according to `owners` (an array of EmpireId-or-null of length 25).
 */
function makeGalaxy(owners: (string | null)[]): Galaxy {
  const systems = new Map<any, any>();
  const systemIds: string[] = [];
  owners.forEach((owner, i) => {
    const id = `sys-${i}`;
    systemIds.push(id);
    systems.set(id, { id, owner });
  });

  const sectors = new Map<any, any>([
    ["sector-0", { id: "sector-0", name: "Sector Zero", systemIds, centre: { x: 0, y: 0 } }],
  ]);

  return { systems, sectors } as unknown as Galaxy;
}

/** Repeat a value n times as a fixed-length owner list segment. */
function repeat(value: string | null, n: number): (string | null)[] {
  return Array.from({ length: n }, () => value);
}

describe("computeSectorDominance", () => {
  it("tallies per-empire ownership and excludes unclaimed systems", () => {
    // 10× empire-a, 5× empire-b, 10× unclaimed = 25 systems.
    const owners = [
      ...repeat("empire-a", 10),
      ...repeat("empire-b", 5),
      ...repeat(null, 10),
    ];
    const dominance = computeSectorDominance(makeGalaxy(owners), "sector-0" as any);

    expect(dominance.sectorId).toBe("sector-0");
    expect(dominance.ownership.get("empire-a" as any)).toBe(10);
    expect(dominance.ownership.get("empire-b" as any)).toBe(5);
    // Unclaimed systems must not appear as a bucket.
    expect(dominance.ownership.has(null as any)).toBe(false);
    expect(dominance.ownership.size).toBe(2);
  });

  it("returns null dominantEmpire when no empire reaches the threshold", () => {
    // 12× empire-a is one short of the 13-system majority.
    const owners = [
      ...repeat("empire-a", 12),
      ...repeat("empire-b", 12),
      ...repeat(null, 1),
    ];
    const dominance = computeSectorDominance(makeGalaxy(owners), "sector-0" as any);

    expect(dominance.ownership.get("empire-a" as any)).toBe(12);
    expect(dominance.dominantEmpire).toBeNull();
  });

  it("sets dominantEmpire when an empire holds the threshold or more", () => {
    const owners = [
      ...repeat("empire-a", SECTOR_DOMINANCE_THRESHOLD),
      ...repeat("empire-b", 25 - SECTOR_DOMINANCE_THRESHOLD),
    ];
    const dominance = computeSectorDominance(makeGalaxy(owners), "sector-0" as any);

    expect(dominance.ownership.get("empire-a" as any)).toBe(SECTOR_DOMINANCE_THRESHOLD);
    expect(dominance.dominantEmpire).toBe("empire-a");
  });

  it("returns an empty ownership map and null dominant for an all-unclaimed sector", () => {
    const dominance = computeSectorDominance(makeGalaxy(repeat(null, 25)), "sector-0" as any);

    expect(dominance.ownership.size).toBe(0);
    expect(dominance.dominantEmpire).toBeNull();
  });

  it("returns an empty dominance for a missing sector", () => {
    const dominance = computeSectorDominance(makeGalaxy(repeat("empire-a", 25)), "no-such" as any);

    expect(dominance.sectorId).toBe("no-such");
    expect(dominance.ownership.size).toBe(0);
    expect(dominance.dominantEmpire).toBeNull();
  });
});
