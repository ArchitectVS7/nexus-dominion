import type { StarSystem, InstallationType, Installation } from "../types/galaxy";
import type { Empire } from "../types/empire";
import type { SystemId, InstallationId } from "../types/ids";

/* ── All installation types (for convenience) ── */

const ALL_INSTALLATION_TYPES: InstallationType[] = [
  "trade-hub", "agricultural-station", "mining-complex", "fuel-extraction",
  "research-station", "intelligence-nexus", "population-centre", "cultural-institute",
];

/* ── Biome-Allowed Installations ── */

/**
 * Defines which installation types are permitted on each biome.
 * Frontier-world is generalist (all types). Specialised biomes restrict
 * to thematically appropriate installations.
 */
export const BIOME_ALLOWED_INSTALLATIONS: Record<string, InstallationType[]> = {
  "core-world":            ["trade-hub", "population-centre", "cultural-institute", "research-station", "intelligence-nexus"],
  "mineral-world":         ["mining-complex", "fuel-extraction", "trade-hub", "research-station"],
  "verdant-world":         ["agricultural-station", "population-centre", "cultural-institute", "trade-hub", "research-station"],
  "void-station":          ["research-station", "intelligence-nexus", "trade-hub", "fuel-extraction"],
  "barren-world":          ["mining-complex", "fuel-extraction", "research-station", "intelligence-nexus"],
  "contested-ruin":        ["intelligence-nexus", "cultural-institute", "research-station", "mining-complex"],
  "frontier-world":        ALL_INSTALLATION_TYPES,
  "nexus-adjacent":        ["research-station", "intelligence-nexus", "cultural-institute", "trade-hub"],
  "resource-rich-anomaly": ["mining-complex", "fuel-extraction", "trade-hub", "research-station"],
};

/* ── Installation Queue Entry ── */

export interface InstallationQueueEntry {
  installationType: InstallationType;
  systemId: SystemId;
  startCycle: number;
  completionCycle: number;
}

/* ── Build Costs ── */

export const INSTALLATION_COSTS: Record<InstallationType, { credits: number; buildTime: number }> = {
  "trade-hub":            { credits: 200, buildTime: 3 },
  "agricultural-station": { credits: 150, buildTime: 2 },
  "mining-complex":       { credits: 175, buildTime: 3 },
  "fuel-extraction":      { credits: 150, buildTime: 2 },
  "research-station":     { credits: 250, buildTime: 4 },
  "intelligence-nexus":   { credits: 300, buildTime: 4 },
  "population-centre":    { credits: 200, buildTime: 3 },
  "cultural-institute":   { credits: 180, buildTime: 3 },
};

/* ── Slot Validation ── */

/**
 * Returns true if the given system has an empty unlocked slot, does not
 * already have an installation of the same type, AND the installation
 * type is allowed for the system's biome.
 */
export function canBuildInstallation(system: StarSystem, type: InstallationType): boolean {
  // Check biome restriction
  const allowed = BIOME_ALLOWED_INSTALLATIONS[system.biome];
  if (allowed && !allowed.includes(type)) return false;

  const hasEmpty = system.slots.some(s => !s.locked && s.installation === null);
  if (!hasEmpty) return false;

  const alreadyPresent = system.slots.some(
    s => s.installation !== null && s.installation!.type === type,
  );
  return !alreadyPresent;
}

/* ── Queue Advancement ── */

/**
 * Split the queue into entries that complete this cycle vs those still building.
 */
export function advanceInstallationQueue(
  queue: InstallationQueueEntry[],
  currentCycle: number,
): { completed: InstallationQueueEntry[]; remaining: InstallationQueueEntry[] } {
  const completed: InstallationQueueEntry[] = [];
  const remaining: InstallationQueueEntry[] = [];
  for (const entry of queue) {
    if (entry.completionCycle <= currentCycle) {
      completed.push(entry);
    } else {
      remaining.push(entry);
    }
  }
  return { completed, remaining };
}

/* ── Installation Creation ── */

/**
 * Create a fully operational Installation from a completed queue entry.
 */
export function createInstallationFromCompleted(
  entry: InstallationQueueEntry,
  installationId: InstallationId,
): Installation {
  return {
    id: installationId,
    type: entry.installationType,
    condition: 1.0,
    completionCycle: null,
  };
}

/* ── Queue Management ── */

/**
 * Attempt to add an installation to the empire's build queue.
 * Validates slot availability and credits. Returns true on success.
 */
export function addToInstallationQueue(
  empire: Empire,
  type: InstallationType,
  system: StarSystem,
  systemId: SystemId,
  currentCycle: number,
): boolean {
  if (!canBuildInstallation(system, type)) return false;

  const cost = INSTALLATION_COSTS[type];
  if (empire.resources.credits < cost.credits) return false;

  empire.resources.credits -= cost.credits;
  if (!empire.installationQueue) empire.installationQueue = [];
  empire.installationQueue.push({
    installationType: type,
    systemId,
    startCycle: currentCycle,
    completionCycle: currentCycle + cost.buildTime,
  });

  return true;
}
