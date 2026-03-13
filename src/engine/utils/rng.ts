/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Seeded PRNG (Mulberry32)
   
   Deterministic random number generator for reproducible
   galaxy generation from a single seed value.
   ══════════════════════════════════════════════════════════════ */

export class SeededRNG {
    private state: number;

    constructor(seed: number) {
        this.state = seed | 0;
    }

    /** Returns a float in [0, 1) */
    next(): number {
        this.state |= 0;
        this.state = (this.state + 0x6d2b79f5) | 0;
        let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /** Returns a float in [min, max) */
    range(min: number, max: number): number {
        return min + this.next() * (max - min);
    }

    /** Returns an integer in [min, max] (inclusive) */
    int(min: number, max: number): number {
        return Math.floor(this.range(min, max + 1));
    }

    /** Pick a random element from an array */
    pick<T>(arr: T[]): T {
        return arr[this.int(0, arr.length - 1)];
    }

    /** Shuffle an array in place (Fisher–Yates) */
    shuffle<T>(arr: T[]): T[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = this.int(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /** Weighted random selection */
    weighted<T>(items: T[], weights: number[]): T {
        const total = weights.reduce((a, b) => a + b, 0);
        let r = this.next() * total;
        for (let i = 0; i < items.length; i++) {
            r -= weights[i];
            if (r <= 0) return items[i];
        }
        return items[items.length - 1];
    }
}
