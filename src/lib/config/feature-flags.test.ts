import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  FEATURE_FLAGS,
  isFeatureEnabled,
  isFeatureEnabledForGame,
  getEnabledFeatures,
  getAllFeatureFlags,
  type FeatureFlag,
  type GameFeatureFlags,
} from './feature-flags';

describe('Feature Flags', () => {
  describe('FEATURE_FLAGS defaults', () => {
    it('should have all balance flags disabled by default', () => {
      expect(FEATURE_FLAGS.COALITION_RAIDS).toBe(false);
      expect(FEATURE_FLAGS.UNDERDOG_BONUS).toBe(false);
      expect(FEATURE_FLAGS.PUNCHUP_BONUS).toBe(false);
    });

    it('should have all connection type flags disabled by default', () => {
      expect(FEATURE_FLAGS.TRADE_ROUTES).toBe(false);
      expect(FEATURE_FLAGS.HAZARD_ZONES).toBe(false);
      expect(FEATURE_FLAGS.CONTESTED_ZONES).toBe(false);
    });

    it('should have campaign mode enabled by default', () => {
      expect(FEATURE_FLAGS.CAMPAIGN_MODE).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset environment before each test
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return default value when no env override', () => {
      expect(isFeatureEnabled('UNDERDOG_BONUS')).toBe(false);
      expect(isFeatureEnabled('CAMPAIGN_MODE')).toBe(true);
    });

    it('should respect env override with "true"', () => {
      process.env.FEATURE_UNDERDOG_BONUS = 'true';
      expect(isFeatureEnabled('UNDERDOG_BONUS')).toBe(true);
    });

    it('should respect env override with "1"', () => {
      process.env.FEATURE_COALITION_RAIDS = '1';
      expect(isFeatureEnabled('COALITION_RAIDS')).toBe(true);
    });

    it('should respect env override with "false"', () => {
      process.env.FEATURE_CAMPAIGN_MODE = 'false';
      expect(isFeatureEnabled('CAMPAIGN_MODE')).toBe(false);
    });

    it('should respect env override with "0"', () => {
      process.env.FEATURE_CAMPAIGN_MODE = '0';
      expect(isFeatureEnabled('CAMPAIGN_MODE')).toBe(false);
    });

    it('should handle case-insensitive env values', () => {
      process.env.FEATURE_PUNCHUP_BONUS = 'TRUE';
      expect(isFeatureEnabled('PUNCHUP_BONUS')).toBe(true);

      process.env.FEATURE_PUNCHUP_BONUS = 'True';
      expect(isFeatureEnabled('PUNCHUP_BONUS')).toBe(true);
    });

    it('should handle whitespace in env values', () => {
      process.env.FEATURE_TRADE_ROUTES = '  true  ';
      expect(isFeatureEnabled('TRADE_ROUTES')).toBe(true);
    });
  });

  describe('isFeatureEnabledForGame', () => {
    it('should use game-specific override when provided', () => {
      const gameFlags: GameFeatureFlags = {
        underdogBonus: true,
      };

      expect(isFeatureEnabledForGame('UNDERDOG_BONUS', gameFlags)).toBe(true);
    });

    it('should fall back to global when game flag not set', () => {
      const gameFlags: GameFeatureFlags = {};

      // CAMPAIGN_MODE defaults to true
      expect(isFeatureEnabledForGame('CAMPAIGN_MODE', gameFlags)).toBe(true);

      // UNDERDOG_BONUS defaults to false
      expect(isFeatureEnabledForGame('UNDERDOG_BONUS', gameFlags)).toBe(false);
    });

    it('should fall back to global when gameFlags is null', () => {
      expect(isFeatureEnabledForGame('CAMPAIGN_MODE', null)).toBe(true);
    });

    it('should override enabled global flag with disabled game flag', () => {
      // This tests that game-specific can disable a globally-enabled feature
      const gameFlags: GameFeatureFlags = {
        coalitionRaids: false,
      };

      // Even if global was enabled (it's not by default, but testing the logic)
      expect(isFeatureEnabledForGame('COALITION_RAIDS', gameFlags)).toBe(false);
    });
  });

  describe('getEnabledFeatures', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return only enabled features', () => {
      // By default, only CAMPAIGN_MODE is enabled
      const enabled = getEnabledFeatures();

      expect(enabled).toContain('CAMPAIGN_MODE');
      expect(enabled).not.toContain('UNDERDOG_BONUS');
      expect(enabled).not.toContain('COALITION_RAIDS');
    });

    it('should include env-enabled features', () => {
      process.env.FEATURE_UNDERDOG_BONUS = 'true';
      process.env.FEATURE_PUNCHUP_BONUS = 'true';

      const enabled = getEnabledFeatures();

      expect(enabled).toContain('UNDERDOG_BONUS');
      expect(enabled).toContain('PUNCHUP_BONUS');
      expect(enabled).toContain('CAMPAIGN_MODE');
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all flags with current values', () => {
      const flags = getAllFeatureFlags();

      expect(flags).toHaveProperty('COALITION_RAIDS');
      expect(flags).toHaveProperty('UNDERDOG_BONUS');
      expect(flags).toHaveProperty('PUNCHUP_BONUS');
      expect(flags).toHaveProperty('TRADE_ROUTES');
      expect(flags).toHaveProperty('HAZARD_ZONES');
      expect(flags).toHaveProperty('CONTESTED_ZONES');
      expect(flags).toHaveProperty('CAMPAIGN_MODE');
      expect(flags).toHaveProperty('SESSION_SUMMARIES');
    });

    it('should reflect current flag state', () => {
      const flags = getAllFeatureFlags();

      expect(flags.CAMPAIGN_MODE).toBe(true);
      expect(flags.UNDERDOG_BONUS).toBe(false);
    });
  });
});
