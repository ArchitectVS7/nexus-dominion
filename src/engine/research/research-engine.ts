export const MAX_RESEARCH_TIER = 8;

export interface ResearchPath {
  id: string;
  name: string;
  /** Capstone ability unlocked at tier 8 */
  capstone: string;
}

export const RESEARCH_PATHS: ResearchPath[] = [
  { id: "war-machine", name: "War Machine", capstone: "Total Mobilisation" },
  { id: "fortress", name: "Fortress", capstone: "Impregnable Bastion" },
  { id: "commerce", name: "Commerce", capstone: "Trade Hegemony" },
];

/** Research cost per tier (research points required) */
export function researchCost(currentTier: number): number {
  return (currentTier + 1) * 50;
}

/**
 * Attempt to advance research tier. Returns updated tier or null if insufficient points.
 */
export function advanceResearch(
  currentTier: number,
  availableResearchPoints: number,
): { newTier: number; pointsConsumed: number } | null {
  if (currentTier >= MAX_RESEARCH_TIER) return null;
  const cost = researchCost(currentTier);
  if (availableResearchPoints < cost) return null;
  return { newTier: currentTier + 1, pointsConsumed: cost };
}

/**
 * Check if an empire has completed a full research path to capstone.
 */
export function hasCapstone(tier: number): boolean {
  return tier >= MAX_RESEARCH_TIER;
}
