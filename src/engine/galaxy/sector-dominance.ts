/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Sector Dominance
   Pure derivation of per-empire ownership and dominance for a sector.
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId, SectorId } from "../types/ids";
import type { Galaxy, SectorDominance } from "../types/galaxy";

/**
 * Number of systems an empire must hold within a sector to be its
 * dominant power. A sector has 25 systems, so 13 is a strict majority —
 * at most one empire can reach this threshold at a time.
 */
export const SECTOR_DOMINANCE_THRESHOLD = 13;

/**
 * Compute the ownership tally and dominant empire for a single sector.
 *
 * Unclaimed systems (owner === null) are not counted toward any empire's
 * tally; they are simply absent from the returned ownership map.
 *
 * @returns A {@link SectorDominance} with an empty ownership map and null
 *   `dominantEmpire` when the sector is missing or holds no owned systems.
 */
export function computeSectorDominance(
    galaxy: Galaxy,
    sectorId: SectorId,
): SectorDominance {
    const ownership = new Map<EmpireId, number>();
    const sector = galaxy.sectors.get(sectorId);

    if (!sector) {
        return { sectorId, ownership, dominantEmpire: null };
    }

    for (const systemId of sector.systemIds) {
        const system = galaxy.systems.get(systemId);
        if (!system || system.owner === null) continue;
        ownership.set(system.owner, (ownership.get(system.owner) ?? 0) + 1);
    }

    let dominantEmpire: EmpireId | null = null;
    for (const [empireId, count] of ownership) {
        if (count >= SECTOR_DOMINANCE_THRESHOLD) {
            dominantEmpire = empireId;
            break;
        }
    }

    return { sectorId, ownership, dominantEmpire };
}
