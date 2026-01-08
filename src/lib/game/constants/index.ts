/**
 * Feature-Specific Constants Module
 *
 * This module contains FEATURE-SPECIFIC constants for individual game systems.
 *
 * Directory Structure:
 * - `@/lib/constants/`: Core mechanics (diplomacy, unlocks)
 * - `@/lib/game/constants/` (this directory): Feature-specific systems
 *
 * Exports:
 * - Crafting system constants - Recipes, components, timers
 * - Syndicate/Black Market constants - Trust levels, contracts
 * - Nuclear warfare constants - WMD mechanics, fallout
 */

// Crafting System
export * from "./crafting";

// Syndicate/Black Market System
export * from "./syndicate";

// Nuclear Warfare System
export * from "./nuclear";
