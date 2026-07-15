import { describe, it, expect } from "vitest";
import { pointInPolygon } from "./StarMap";

// A unit square polygon (0,0)–(10,10).
const SQUARE = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe("pointInPolygon", () => {
  it("returns true for a point inside the polygon", () => {
    expect(pointInPolygon({ x: 5, y: 5 }, SQUARE)).toBe(true);
  });

  it("returns false for a point outside the polygon", () => {
    expect(pointInPolygon({ x: 20, y: 5 }, SQUARE)).toBe(false);
    expect(pointInPolygon({ x: -1, y: 5 }, SQUARE)).toBe(false);
  });

  it("handles a concave polygon", () => {
    // An arrow / chevron pointing right; the notch at x<3 near y=5 is outside.
    const chevron = [
      { x: 0, y: 0 },
      { x: 6, y: 0 },
      { x: 10, y: 5 },
      { x: 6, y: 10 },
      { x: 0, y: 10 },
      { x: 4, y: 5 },
    ];
    expect(pointInPolygon({ x: 5, y: 2 }, chevron)).toBe(true);
    // Point in the concave notch on the left is outside the shape.
    expect(pointInPolygon({ x: 1, y: 5 }, chevron)).toBe(false);
  });
});
