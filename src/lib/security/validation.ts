/**
 * Input Validation Utilities for Server Actions
 *
 * Centralized validation functions for security-sensitive operations.
 * All server actions should validate inputs at the boundary before processing.
 */

import { db } from "@/lib/db";
import { empires } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { UNIT_TYPES, type UnitType } from "@/lib/game/unit-config";
import type { ContractType } from "@/lib/game/constants/syndicate";

// =============================================================================
// SECTOR TYPES (from database schema)
// =============================================================================

export const VALID_SECTOR_TYPES = [
  "food",
  "ore",
  "petroleum",
  "tourism",
  "urban",
  "education",
  "government",
  "research",
  "supply",
  "anti_pollution",
  "industrial",
] as const;

export type ValidSectorType = (typeof VALID_SECTOR_TYPES)[number];

// =============================================================================
// UUID VALIDATION
// =============================================================================

/**
 * Validate UUID format (v1-v5 compatible).
 */
export function isValidUUID(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Validate that a value is a valid sector type.
 */
export function isValidSectorType(type: unknown): type is ValidSectorType {
  if (typeof type !== "string") return false;
  return VALID_SECTOR_TYPES.includes(type as ValidSectorType);
}

/**
 * Validate that a value is a valid unit type.
 */
export function isValidUnitType(type: unknown): type is UnitType {
  if (typeof type !== "string") return false;
  return UNIT_TYPES.includes(type as UnitType);
}

/**
 * Validate that a value is a positive integer.
 */
export function isPositiveInteger(value: unknown): value is number {
  if (typeof value !== "number") return false;
  return Number.isInteger(value) && value > 0 && Number.isFinite(value);
}

/**
 * Validate that a value is a non-negative integer.
 */
export function isNonNegativeInteger(value: unknown): value is number {
  if (typeof value !== "number") return false;
  return Number.isInteger(value) && value >= 0 && Number.isFinite(value);
}

// =============================================================================
// AUTHORIZATION HELPERS
// =============================================================================

export interface OwnershipResult {
  valid: boolean;
  error?: string;
}

/**
 * Verify that an empire belongs to a specific game.
 * SECURITY: Critical for preventing cross-game operations.
 *
 * @param empireId - The empire ID from cookies
 * @param gameId - The game ID from cookies
 * @returns Result indicating if ownership is valid
 */
export async function verifyEmpireOwnership(
  empireId: string,
  gameId: string
): Promise<OwnershipResult> {
  // Validate input formats first
  if (!isValidUUID(empireId)) {
    return { valid: false, error: "Invalid empire ID format" };
  }
  if (!isValidUUID(gameId)) {
    return { valid: false, error: "Invalid game ID format" };
  }

  // Check that empire exists and belongs to the specified game
  const empire = await db.query.empires.findFirst({
    where: and(eq(empires.id, empireId), eq(empires.gameId, gameId)),
    columns: { id: true, isEliminated: true, type: true },
  });

  if (!empire) {
    return { valid: false, error: "Empire not found or does not belong to this game" };
  }

  if (empire.isEliminated) {
    return { valid: false, error: "Empire has been eliminated" };
  }

  // Only player empires can perform actions via cookies
  if (empire.type !== "player") {
    return { valid: false, error: "Only player empires can perform this action" };
  }

  return { valid: true };
}

// =============================================================================
// QUANTITY VALIDATION
// =============================================================================

/**
 * Sanitize and validate a quantity value.
 * Returns undefined if invalid.
 *
 * @param value - The value to sanitize
 * @param min - Minimum allowed value (default: 1)
 * @param max - Maximum allowed value (default: 1,000,000)
 */
export function sanitizeQuantity(
  value: unknown,
  min: number = 1,
  max: number = 1_000_000
): number | undefined {
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return undefined;
    value = parsed;
  }

  if (typeof value !== "number") return undefined;
  if (!Number.isFinite(value)) return undefined;

  const rounded = Math.floor(value);
  if (rounded < min || rounded > max) return undefined;

  return rounded;
}

// =============================================================================
// CONTRACT TYPE VALIDATION (Syndicate Expansion)
// =============================================================================

/**
 * Valid syndicate contract types
 */
export const VALID_CONTRACT_TYPES = [
  // Tier 1: Pirate Raids
  "supply_run",
  "disruption",
  "salvage_op",
  "intel_gathering",
  // Tier 2: Standard Contracts
  "intimidation",
  "economic_warfare",
  "military_probe",
  "hostile_takeover",
  // Tier 3: Targeted Contracts
  "kingslayer",
  "market_manipulation",
  "regime_change",
  "decapitation_strike",
  // Tier 4: Syndicate Operations
  "proxy_war",
  "scorched_earth",
  "the_equalizer",
] as const;

/**
 * Validate that a value is a valid contract type.
 */
export function isValidContractType(type: unknown): type is ContractType {
  if (typeof type !== "string") return false;
  return VALID_CONTRACT_TYPES.includes(type as ContractType);
}

// =============================================================================
// STRING SANITIZATION
// =============================================================================

/**
 * Sanitize user-provided text content.
 * Removes potentially dangerous characters and normalizes whitespace.
 *
 * @param input - User-provided string
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeText(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";

  // Basic sanitization: remove control characters except newline/tab
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}
