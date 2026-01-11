/**
 * Seeded Random Number Generator
 *
 * Provides deterministic random number generation for reproducible game simulations.
 * Uses Mulberry32 PRNG algorithm - fast and produces good distribution.
 *
 * Same seed always produces same sequence of numbers, enabling:
 * - Reproducible test results
 * - Debugging specific game scenarios
 * - Bisecting balance issues
 */

export class SeededRandom {
  private seed: number;
  private initialSeed: number;

  constructor(seed: number) {
    this.seed = seed;
    this.initialSeed = seed;
  }

  /**
   * Get the initial seed (for logging/debugging)
   */
  getInitialSeed(): number {
    return this.initialSeed;
  }

  /**
   * Generate next random number in [0, 1) range
   * Uses Mulberry32 PRNG algorithm
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer in [min, max] range (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate random float in [min, max) range
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Return true with given probability (0-1)
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Pick random item from array
   */
  pick<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot pick from empty array");
    }
    return items[Math.floor(this.next() * items.length)]!;
  }

  /**
   * Shuffle array in-place using Fisher-Yates algorithm
   */
  shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j]!, result[i]!];
    }
    return result;
  }

  /**
   * Pick from weighted options
   * @param options Array of {item, weight} pairs
   * @returns Selected item based on weights
   */
  weightedChoice<T>(options: Array<{ item: T; weight: number }>): T {
    if (options.length === 0) {
      throw new Error("Cannot choose from empty options");
    }

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight <= 0) {
      throw new Error("Total weight must be positive");
    }

    let random = this.next() * totalWeight;

    for (const option of options) {
      random -= option.weight;
      if (random <= 0) {
        return option.item;
      }
    }

    // Fallback to last item (shouldn't happen with valid weights)
    return options[options.length - 1]!.item;
  }

  /**
   * Generate a UUID-like string (for empire/game IDs)
   * Not cryptographically secure, but deterministic
   */
  nextId(): string {
    const hex = () =>
      Math.floor(this.next() * 16)
        .toString(16)
        .padStart(1, "0");
    const segment = (len: number) =>
      Array.from({ length: len }, hex).join("");

    return `${segment(8)}-${segment(4)}-${segment(4)}-${segment(4)}-${segment(12)}`;
  }

  /**
   * Create a child random generator with derived seed
   * Useful for independent random streams (e.g., per-empire decisions)
   */
  fork(): SeededRandom {
    return new SeededRandom(Math.floor(this.next() * 0xffffffff));
  }
}
