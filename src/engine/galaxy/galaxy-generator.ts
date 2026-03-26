/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Galaxy Generator
   
   Procedurally generates a galaxy of 250 star systems across
   10 sectors. Uses sector-clustered placement + k-nearest
   adjacency for natural-looking spatial distribution.
   ══════════════════════════════════════════════════════════════ */

import type { IGalaxyGenerator } from "../interfaces";
import type {
    Galaxy, GalaxyConfig, StarSystem, Sector, Position,
    BiomeType,
} from "../types";
import { SystemId, SectorId, EmpireId } from "../types/ids";
import { SeededRNG } from "../utils/rng";

/* ── Constants ── */

const SECTOR_NAMES = [
    "Cygnus Reach", "Orion Deep", "Vega Expanse", "Draco Rift",
    "Lyra Crossing", "Aquila Frontier", "Centauri Arc", "Perseus Veil",
    "Serpens Corridor", "Andromeda Gate",
];

const SYSTEM_PREFIXES = [
    "Keth", "Zara", "Nyx", "Vorn", "Riel", "Thal", "Mira", "Soran",
    "Xen", "Dael", "Bris", "Orna", "Fael", "Jira", "Kasp", "Udo",
    "Wren", "Elva", "Pyra", "Grim", "Ash", "Nova", "Sol", "Iris",
    "Opal", "Jade", "Rex", "Flux", "Cael", "Dusk", "Lux", "Vex",
    "Pax", "Aeon", "Zion", "Vale", "Rune", "Echo", "Haze", "Bolt",
];

const SYSTEM_SUFFIXES = [
    "Prime", "Major", "Minor", "Alpha", "Beta", "Gamma", "Delta",
    "Station", "Reach", "Point", "Gate", "Haven", "Deep", "Hold",
    "Spur", "Core", "Edge", "Rift", "Mark", "Post", "Rise", "Fall",
];

/** Biome distribution weights (Common = 4, Uncommon = 2, Rare = 1) */
const BIOME_WEIGHTS: { biome: BiomeType; weight: number }[] = [
    { biome: "core-world", weight: 4 },
    { biome: "mineral-world", weight: 4 },
    { biome: "verdant-world", weight: 4 },
    { biome: "barren-world", weight: 4 },
    { biome: "void-station", weight: 2 },
    { biome: "contested-ruin", weight: 2 },
    { biome: "frontier-world", weight: 2 },
    { biome: "nexus-adjacent", weight: 1 },
    { biome: "resource-rich-anomaly", weight: 1 },
];

const SLOTS_BY_BIOME: Record<BiomeType, number> = {
    "core-world": 5,
    "mineral-world": 4,
    "verdant-world": 4,
    "void-station": 3,
    "barren-world": 3,
    "contested-ruin": 4,
    "frontier-world": 5, // 2 active + 3 locked
    "nexus-adjacent": 3,
    "resource-rich-anomaly": 3,
};

/* ── Galaxy Generator ── */

export class GalaxyGenerator implements IGalaxyGenerator {
    generate(config: GalaxyConfig): Galaxy {
        const rng = new SeededRNG(config.seed);
        const galaxy: Galaxy = {
            systems: new Map(),
            sectors: new Map(),
        };

        // 1. Place sector centres in a rough grid with jitter
        const sectorCentres = this.placeSectorCentres(config.sectorCount, rng);

        // 2. For each sector, cluster systems around the centre
        const allSystems: StarSystem[] = [];

        for (let s = 0; s < config.sectorCount; s++) {
            const sectorId = SectorId(`sector-${s}`);
            const systemIds: import("../types").SystemId[] = [];

            for (let i = 0; i < config.systemsPerSector; i++) {
                const sysIndex = s * config.systemsPerSector + i;
                const systemId = SystemId(`sys-${sysIndex}`);
                const name = this.generateSystemName(rng, sysIndex);
                const biome = this.pickBiome(rng);

                // Position: cluster around sector centre with Gaussian-like spread
                const angle = rng.range(0, Math.PI * 2);
                const radius = rng.range(30, 120) * (0.5 + rng.next() * 0.5);
                const pos: Position = {
                    x: sectorCentres[s].x + Math.cos(angle) * radius,
                    y: sectorCentres[s].y + Math.sin(angle) * radius,
                };

                const system: StarSystem = {
                    id: systemId,
                    name,
                    sectorId,
                    position: pos,
                    biome,
                    owner: null,
                    slots: this.createSlots(biome),
                    baseProduction: {},
                    adjacentSystemIds: [], // filled after all systems placed
                    claimedCycle: null,
                    isHomeSystem: false,
                };

                allSystems.push(system);
                systemIds.push(systemId);
                galaxy.systems.set(systemId, system);
            }

            const sector: Sector = {
                id: sectorId,
                name: SECTOR_NAMES[s] ?? `Sector ${s + 1}`,
                systemIds: systemIds as unknown as import("../types").SystemId[],
                centre: sectorCentres[s],
            };
            galaxy.sectors.set(sectorId, sector);
        }

        // 3. Build adjacency via k-nearest (k=4) within sector + closest cross-sector
        this.buildAdjacency(allSystems, 4);
        this.addCrossSectorLinks(allSystems, galaxy);

        // 4. Assign empires (player + bots) to home systems
        this.assignHomeworlds(allSystems, config.empireCount, rng);

        return galaxy;
    }

    /* ── Helpers ── */

    private placeSectorCentres(count: number, rng: SeededRNG): Position[] {
        // Arrange in a roughly 4×3 grid with jitter for organic feel
        const cols = Math.ceil(Math.sqrt(count * 1.5));
        const spacing = 300;
        const centres: Position[] = [];

        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            centres.push({
                x: col * spacing + rng.range(-40, 40),
                y: row * spacing + rng.range(-40, 40),
            });
        }

        // Centre the whole grid around 0,0
        const cx = centres.reduce((s, p) => s + p.x, 0) / centres.length;
        const cy = centres.reduce((s, p) => s + p.y, 0) / centres.length;
        return centres.map((p) => ({ x: p.x - cx, y: p.y - cy }));
    }

    private pickBiome(rng: SeededRNG): BiomeType {
        return rng.weighted(
            BIOME_WEIGHTS.map((b) => b.biome),
            BIOME_WEIGHTS.map((b) => b.weight),
        );
    }

    private generateSystemName(rng: SeededRNG, index: number): string {
        const prefix = SYSTEM_PREFIXES[index % SYSTEM_PREFIXES.length];
        const suffix = rng.pick(SYSTEM_SUFFIXES);
        // Occasionally add a Roman numeral
        const numeral = rng.next() > 0.7 ? ` ${["II", "III", "IV", "V", "VI"][rng.int(0, 4)]}` : "";
        return `${prefix} ${suffix}${numeral}`;
    }

    private createSlots(biome: BiomeType): import("../types").DevelopmentSlot[] {
        const count = SLOTS_BY_BIOME[biome];
        const slots: import("../types").DevelopmentSlot[] = [];
        for (let i = 0; i < count; i++) {
            slots.push({
                installation: null,
                locked: biome === "frontier-world" && i >= 2, // first 2 open, rest locked
            });
        }
        return slots;
    }

    private buildAdjacency(systems: StarSystem[], k: number): void {
        // For each system, connect to k nearest neighbours
        for (const sys of systems) {
            const distances = systems
                .filter((s) => s.id !== sys.id)
                .map((s) => ({
                    id: s.id,
                    dist: Math.hypot(s.position.x - sys.position.x, s.position.y - sys.position.y),
                }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, k);

            for (const { id } of distances) {
                if (!sys.adjacentSystemIds.includes(id)) {
                    sys.adjacentSystemIds.push(id);
                }
                // Make bidirectional
                const other = systems.find((s) => s.id === id)!;
                if (!other.adjacentSystemIds.includes(sys.id)) {
                    other.adjacentSystemIds.push(sys.id);
                }
            }
        }
    }

    /**
     * For each pair of sectors, connect the closest system in each
     * so that border-system adjacency exists across sectors.
     */
    private addCrossSectorLinks(systems: StarSystem[], galaxy: Galaxy): void {
        const sectorIds = [...galaxy.sectors.keys()];
        for (let i = 0; i < sectorIds.length; i++) {
            for (let j = i + 1; j < sectorIds.length; j++) {
                const sysA = systems.filter((s) => s.sectorId === sectorIds[i]);
                const sysB = systems.filter((s) => s.sectorId === sectorIds[j]);
                let bestDist = Infinity;
                let bestA: StarSystem | null = null;
                let bestB: StarSystem | null = null;
                for (const a of sysA) {
                    for (const b of sysB) {
                        const d = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);
                        if (d < bestDist) {
                            bestDist = d;
                            bestA = a;
                            bestB = b;
                        }
                    }
                }
                if (bestA && bestB) {
                    if (!bestA.adjacentSystemIds.includes(bestB.id)) {
                        bestA.adjacentSystemIds.push(bestB.id);
                    }
                    if (!bestB.adjacentSystemIds.includes(bestA.id)) {
                        bestB.adjacentSystemIds.push(bestA.id);
                    }
                }
            }
        }
    }

    private assignHomeworlds(
        systems: StarSystem[],
        empireCount: number,
        rng: SeededRNG,
    ): void {
        // Pick the best-spread systems as homeworlds (one per sector first, then fill)
        const candidates = rng.shuffle([...systems]);
        const usedSectors = new Set<string>();
        const homeworlds: StarSystem[] = [];

        // Phase 1: one homeworld per sector
        for (const sys of candidates) {
            if (homeworlds.length >= empireCount) break;
            if (!usedSectors.has(sys.sectorId)) {
                usedSectors.add(sys.sectorId);
                homeworlds.push(sys);
            }
        }

        // Phase 2: fill remaining slots from any sector
        for (const sys of candidates) {
            if (homeworlds.length >= empireCount) break;
            if (!homeworlds.includes(sys)) {
                homeworlds.push(sys);
            }
        }

        // Assign empires
        for (let i = 0; i < homeworlds.length; i++) {
            const sys = homeworlds[i];
            const empireId = EmpireId(`empire-${i}`);
            sys.owner = empireId;
            sys.isHomeSystem = true;
            sys.claimedCycle = 0;
            sys.biome = "core-world"; // Home systems are always Core Worlds

            // Store colour as a data attribute (will create empires later in Milestone 1.3)
            // For now we use a lookup map in the renderer
        }
    }
}

/** Empire colour lookup (used by renderer before full Empire objects exist) */
export function getEmpireColour(empireId: string): string {
    const COLOURS = [
        "#3498DB", "#E74C3C", "#2ECC71", "#F39C12", "#9B59B6",
        "#1ABC9C", "#E67E22", "#FF6B81", "#A29BFE", "#00CEC9",
        "#FD79A8", "#6C5CE7", "#FDCB6E", "#00B894", "#D63031",
        "#74B9FF", "#55EFC4", "#81ECEC", "#FAB1A0", "#DFE6E9",
    ];
    const idx = parseInt(empireId.replace("empire-", ""), 10);
    return COLOURS[idx % COLOURS.length];
}
