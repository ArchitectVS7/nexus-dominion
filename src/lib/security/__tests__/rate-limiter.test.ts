/**
 * Tests for Rate Limiter
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  checkRateLimit,
  withRateLimit,
  getRateLimitStatus,
  clearRateLimit,
  clearAllRateLimits,
  RateLimitError,
  RATE_LIMIT_CONFIGS,
} from "../rate-limiter";

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkRateLimit", () => {
    it("should allow requests under the limit", () => {
      const result = checkRateLimit("user-1", "GAME_ACTION");

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests - 1);
    });

    it("should track multiple requests", () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit("user-2", "GAME_ACTION");
      }

      const status = getRateLimitStatus("user-2", "GAME_ACTION");
      expect(status.remaining).toBe(RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests - 5);
    });

    it("should block when limit exceeded", () => {
      const config = RATE_LIMIT_CONFIGS.AUTH_ACTION;

      // Exhaust the limit
      for (let i = 0; i < config.maxRequests; i++) {
        checkRateLimit("user-3", "AUTH_ACTION");
      }

      // Next request should be blocked
      const result = checkRateLimit("user-3", "AUTH_ACTION");

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.blockedUntil).toBeDefined();
    });

    it("should reset after window expires", () => {
      const config = RATE_LIMIT_CONFIGS.GAME_ACTION;

      // Make some requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit("user-4", "GAME_ACTION");
      }

      // Advance time past the window
      vi.advanceTimersByTime(config.windowMs + 1000);

      // Should be fully reset
      const result = checkRateLimit("user-4", "GAME_ACTION");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(config.maxRequests - 1);
    });

    it("should unblock after block duration", () => {
      const config = RATE_LIMIT_CONFIGS.AUTH_ACTION;

      // Exhaust limit and get blocked
      for (let i = 0; i <= config.maxRequests; i++) {
        checkRateLimit("user-5", "AUTH_ACTION");
      }

      // Verify blocked
      let result = checkRateLimit("user-5", "AUTH_ACTION");
      expect(result.allowed).toBe(false);

      // Advance past block duration
      vi.advanceTimersByTime(config.blockDurationMs + 1000);

      // Should be unblocked
      result = checkRateLimit("user-5", "AUTH_ACTION");
      expect(result.allowed).toBe(true);
    });

    it("should track different users independently", () => {
      // User A makes 5 requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit("user-A", "GAME_ACTION");
      }

      // User B should still have full quota
      const resultB = checkRateLimit("user-B", "GAME_ACTION");
      expect(resultB.remaining).toBe(RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests - 1);
    });

    it("should track different action types independently", () => {
      // Use up GAME_ACTION quota
      for (let i = 0; i < RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests; i++) {
        checkRateLimit("user-6", "GAME_ACTION");
      }

      // COMBAT_ACTION should still have quota
      const result = checkRateLimit("user-6", "COMBAT_ACTION");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_CONFIGS.COMBAT_ACTION.maxRequests - 1);
    });
  });

  describe("withRateLimit", () => {
    it("should execute action when under limit", async () => {
      const mockAction = vi.fn().mockResolvedValue("success");

      const result = await withRateLimit("user-7", "GAME_ACTION", mockAction);

      expect(result).toBe("success");
      expect(mockAction).toHaveBeenCalledOnce();
    });

    it("should throw RateLimitError when limit exceeded", async () => {
      const config = RATE_LIMIT_CONFIGS.AUTH_ACTION;

      // Exhaust limit
      for (let i = 0; i < config.maxRequests; i++) {
        await withRateLimit("user-8", "AUTH_ACTION", async () => "ok");
      }

      // Next request should throw
      const mockAction = vi.fn().mockResolvedValue("should not execute");

      await expect(
        withRateLimit("user-8", "AUTH_ACTION", mockAction)
      ).rejects.toThrow(RateLimitError);

      expect(mockAction).not.toHaveBeenCalled();
    });

    it("should include reset time in error", async () => {
      const config = RATE_LIMIT_CONFIGS.AUTH_ACTION;

      // Exhaust limit
      for (let i = 0; i < config.maxRequests; i++) {
        await withRateLimit("user-9", "AUTH_ACTION", async () => "ok");
      }

      try {
        await withRateLimit("user-9", "AUTH_ACTION", async () => "fail");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).resetAt).toBeGreaterThan(Date.now());
      }
    });
  });

  describe("getRateLimitStatus", () => {
    it("should return full quota for new user", () => {
      const status = getRateLimitStatus("new-user", "GAME_ACTION");

      expect(status.remaining).toBe(RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests);
      expect(status.blocked).toBe(false);
    });

    it("should return blocked status when blocked", () => {
      const config = RATE_LIMIT_CONFIGS.AUTH_ACTION;

      // Exhaust and trigger block
      for (let i = 0; i <= config.maxRequests; i++) {
        checkRateLimit("blocked-user", "AUTH_ACTION");
      }

      const status = getRateLimitStatus("blocked-user", "AUTH_ACTION");

      expect(status.blocked).toBe(true);
      expect(status.remaining).toBe(0);
      expect(status.blockedUntil).toBeDefined();
    });

    it("should not consume a request when checking status", () => {
      // Check status multiple times
      for (let i = 0; i < 10; i++) {
        getRateLimitStatus("status-user", "GAME_ACTION");
      }

      // Should still have full quota
      const status = getRateLimitStatus("status-user", "GAME_ACTION");
      expect(status.remaining).toBe(RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests);
    });
  });

  describe("clearRateLimit", () => {
    it("should clear rate limit for specific user and action", () => {
      // Use up some quota
      for (let i = 0; i < 10; i++) {
        checkRateLimit("clear-user", "GAME_ACTION");
      }

      // Clear the limit
      clearRateLimit("clear-user", "GAME_ACTION");

      // Should have full quota again
      const status = getRateLimitStatus("clear-user", "GAME_ACTION");
      expect(status.remaining).toBe(RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests);
    });

    it("should not affect other users or action types", () => {
      // User A uses GAME_ACTION
      for (let i = 0; i < 5; i++) {
        checkRateLimit("user-A", "GAME_ACTION");
      }

      // User B uses GAME_ACTION
      for (let i = 0; i < 3; i++) {
        checkRateLimit("user-B", "GAME_ACTION");
      }

      // Clear only user-A
      clearRateLimit("user-A", "GAME_ACTION");

      // User B should be unaffected
      const statusB = getRateLimitStatus("user-B", "GAME_ACTION");
      expect(statusB.remaining).toBe(RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests - 3);
    });
  });

  describe("RATE_LIMIT_CONFIGS", () => {
    it("should have reasonable defaults for game actions", () => {
      expect(RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests).toBeGreaterThan(10);
      expect(RATE_LIMIT_CONFIGS.GAME_ACTION.windowMs).toBeGreaterThanOrEqual(60000);
    });

    it("should have stricter limits for auth actions", () => {
      expect(RATE_LIMIT_CONFIGS.AUTH_ACTION.maxRequests).toBeLessThan(
        RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests
      );
    });

    it("should have stricter limits for combat actions", () => {
      expect(RATE_LIMIT_CONFIGS.COMBAT_ACTION.maxRequests).toBeLessThan(
        RATE_LIMIT_CONFIGS.GAME_ACTION.maxRequests
      );
    });
  });
});
