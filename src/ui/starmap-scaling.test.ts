import { describe, it, expect } from "vitest";
import { nodeScreenRadius, hitRadiusWorld } from "./StarMap";

describe("nodeScreenRadius", () => {
    const BASE = 10;

    it("has spot values at zoom 0.15 / 0.8 / 4.0 (multiplier clamped to [0.35, 1.5])", () => {
        expect(nodeScreenRadius(BASE, 0.15)).toBe(3.5); // clamp -> 0.35
        expect(nodeScreenRadius(BASE, 0.8)).toBe(8); // 0.8
        expect(nodeScreenRadius(BASE, 4.0)).toBe(15); // clamp -> 1.5
    });

    it("is monotonic non-decreasing in zoom", () => {
        const zooms = [0.05, 0.15, 0.35, 0.8, 1.5, 4.0];
        let prev = -Infinity;
        for (const z of zooms) {
            const r = nodeScreenRadius(BASE, z);
            expect(r).toBeGreaterThanOrEqual(prev);
            prev = r;
        }
    });

    it("scales linearly with base radius", () => {
        expect(nodeScreenRadius(5, 0.8)).toBe(4);
        expect(nodeScreenRadius(7, 0.8)).toBeCloseTo(5.6, 10);
    });
});

describe("hitRadiusWorld", () => {
    it("returns exactly 14 at zoom 0.8", () => {
        expect(hitRadiusWorld(0.8)).toBe(14); // max(14, 8/0.8=10) === 14
    });

    it("has spot values at zoom 0.15 / 0.8 / 4.0", () => {
        expect(hitRadiusWorld(0.15)).toBeCloseTo(8 / 0.15, 10); // ~53.33, the 8/zoom branch
        expect(hitRadiusWorld(0.8)).toBe(14);
        expect(hitRadiusWorld(4.0)).toBe(14); // max(14, 2) === 14
    });

    it("is monotonic non-increasing in zoom", () => {
        const zooms = [0.05, 0.15, 0.35, 0.8, 1.5, 4.0];
        let prev = Infinity;
        for (const z of zooms) {
            const r = hitRadiusWorld(z);
            expect(r).toBeLessThanOrEqual(prev);
            prev = r;
        }
    });
});
