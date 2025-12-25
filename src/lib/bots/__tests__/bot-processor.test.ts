import { describe, it, expect } from "vitest";
import { calculateBotStats } from "../bot-processor";
import type { BotProcessingResult } from "../types";

describe("Bot Processor", () => {
  describe("calculateBotStats", () => {
    it("should return zero stats for empty results", () => {
      const stats = calculateBotStats([]);
      expect(stats.totalBots).toBe(0);
      expect(stats.activeBots).toBe(0);
      expect(stats.eliminatedBots).toBe(0);
      expect(stats.avgDecisionTimeMs).toBe(0);
    });

    it("should calculate stats for successful results", () => {
      const results: BotProcessingResult[] = [
        {
          empireId: "1",
          empireName: "Empire Alpha",
          decision: { type: "do_nothing" },
          executed: true,
          durationMs: 10,
        },
        {
          empireId: "2",
          empireName: "Empire Beta",
          decision: { type: "do_nothing" },
          executed: true,
          durationMs: 20,
        },
        {
          empireId: "3",
          empireName: "Empire Gamma",
          decision: { type: "do_nothing" },
          executed: true,
          durationMs: 30,
        },
      ];

      const stats = calculateBotStats(results);
      expect(stats.totalBots).toBe(3);
      expect(stats.activeBots).toBe(3);
      expect(stats.eliminatedBots).toBe(0);
      expect(stats.avgDecisionTimeMs).toBe(20); // (10+20+30)/3
    });

    it("should track failed executions", () => {
      const results: BotProcessingResult[] = [
        {
          empireId: "1",
          empireName: "Empire Alpha",
          decision: { type: "do_nothing" },
          executed: true,
          durationMs: 10,
        },
        {
          empireId: "2",
          empireName: "Empire Beta",
          decision: { type: "build_units", unitType: "soldiers", quantity: 5 },
          executed: false,
          error: "Insufficient credits",
          durationMs: 5,
        },
      ];

      const stats = calculateBotStats(results);
      expect(stats.totalBots).toBe(2);
      expect(stats.activeBots).toBe(1);
      expect(stats.eliminatedBots).toBe(1); // Failed execution counted as eliminated
    });

    it("should calculate average duration correctly", () => {
      const results: BotProcessingResult[] = [
        {
          empireId: "1",
          empireName: "Empire Alpha",
          decision: { type: "do_nothing" },
          executed: true,
          durationMs: 100,
        },
        {
          empireId: "2",
          empireName: "Empire Beta",
          decision: { type: "do_nothing" },
          executed: false,
          durationMs: 50,
        },
      ];

      const stats = calculateBotStats(results);
      expect(stats.avgDecisionTimeMs).toBe(75); // (100+50)/2
    });
  });

  describe("Performance target", () => {
    it("should have a performance target of <1.5s for 25 bots", () => {
      // This is a documentation test to verify the performance target is known
      // Actual performance testing happens in E2E tests
      const TARGET_MS = 1500;
      const BOT_COUNT = 25;
      const MAX_PER_BOT = TARGET_MS / BOT_COUNT;

      expect(MAX_PER_BOT).toBe(60); // 60ms per bot max
    });
  });
});
