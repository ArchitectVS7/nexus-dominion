/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Branded ID Types
   
   Nominal (branded) types prevent accidental mixing of IDs.
   e.g., you can't pass an EmpireId where a SystemId is expected.
   ══════════════════════════════════════════════════════════════ */

declare const __brand: unique symbol;

/** Creates a branded string type for type-safe IDs */
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type EmpireId = Brand<string, "EmpireId">;
export type SystemId = Brand<string, "SystemId">;
export type SectorId = Brand<string, "SectorId">;
export type FleetId = Brand<string, "FleetId">;
export type UnitId = Brand<string, "UnitId">;
export type PactId = Brand<string, "PactId">;
export type CoalitionId = Brand<string, "CoalitionId">;
export type InstallationId = Brand<string, "InstallationId">;

/** Helper to create a branded ID from a plain string */
export function createId<T extends string>(value: string): Brand<string, T> {
    return value as Brand<string, T>;
}

/** Convenience factories */
export const EmpireId = (v: string) => createId<"EmpireId">(v) as EmpireId;
export const SystemId = (v: string) => createId<"SystemId">(v) as SystemId;
export const SectorId = (v: string) => createId<"SectorId">(v) as SectorId;
export const FleetId = (v: string) => createId<"FleetId">(v) as FleetId;
export const UnitId = (v: string) => createId<"UnitId">(v) as UnitId;
export const PactId = (v: string) => createId<"PactId">(v) as PactId;
export const CoalitionId = (v: string) => createId<"CoalitionId">(v) as CoalitionId;
export const InstallationId = (v: string) => createId<"InstallationId">(v) as InstallationId;
