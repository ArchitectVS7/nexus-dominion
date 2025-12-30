/**
 * Configuration Module
 *
 * Exports configuration utilities including feature flags.
 */

export {
  FEATURE_FLAGS,
  isFeatureEnabled,
  isFeatureEnabledForGame,
  getEnabledFeatures,
  getAllFeatureFlags,
  FEATURE_FLAG_DESCRIPTIONS,
  type FeatureFlag,
  type GameFeatureFlags,
} from './feature-flags';
