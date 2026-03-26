import type { EmpireId } from "../types/ids";
import type { Empire } from "../types/empire";
import type { Galaxy } from "../types/galaxy";
import type { AchievementEvent } from "../types/events";

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  check: (empireId: EmpireId, empire: Empire, galaxy: Galaxy, context: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalEmpires: number;
  eliminatedCount: number;
  maxResearchTier: number;
  empireNetWorth: Map<EmpireId, number>;
  coalitionsSurvived: Map<EmpireId, number>;
  syndicateController: EmpireId | null;
  syndicateExposed: Set<EmpireId>;
  earnedAchievements: Map<EmpireId, Set<string>>;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "conquest",
    name: "Conquest",
    description: "Holds a dominant share of star systems",
    check: (_id, empire, galaxy) => {
      const totalSystems = galaxy.systems.size;
      return empire.systemIds.length >= totalSystems * 0.3;
    },
  },
  {
    id: "trade-prince",
    name: "Trade Prince",
    description: "Net worth exceeds nearest rival by sustained margin",
    check: (id, _empire, _galaxy, ctx) => {
      const myWorth = ctx.empireNetWorth.get(id) ?? 0;
      let secondHighest = 0;
      for (const [eid, worth] of ctx.empireNetWorth) {
        if (eid !== id && worth > secondHighest) secondHighest = worth;
      }
      return myWorth > secondHighest * 2;
    },
  },
  {
    id: "warlord",
    name: "Warlord",
    description: "Directly defeated a defined number of rival empires",
    check: (_id, empire) => {
      return empire.systemIds.length >= 40;
    },
  },
  {
    id: "singularity",
    name: "Singularity",
    description: "Completed a full research path to Capstone",
    check: (_id, empire) => {
      return empire.researchTier >= 8;
    },
  },
  {
    id: "grand-architect",
    name: "Grand Architect",
    description: "Led the coalition that toppled the dominant power",
    check: () => false, // checked externally via coalition resolution
  },
  {
    id: "endurance",
    name: "Endurance",
    description: "Survived a defined number of coalition attempts",
    check: (id, _empire, _galaxy, ctx) => {
      return (ctx.coalitionsSurvived.get(id) ?? 0) >= 5;
    },
  },
  {
    id: "market-overlord",
    name: "Market Overlord",
    description: "Controls majority of high-volume trade hub systems",
    check: (_id, empire) => {
      return empire.systemIds.length >= 12; // simplified
    },
  },
  {
    id: "cartel-boss",
    name: "Cartel Boss",
    description: "Corners a critical resource for a sustained period",
    check: () => false, // checked externally via market state
  },
  {
    id: "shadow-throne",
    name: "Shadow Throne",
    description: "Controls the Syndicate while holding another achievement, never exposed",
    check: (id, _empire, _galaxy, ctx) => {
      return (
        ctx.syndicateController === id &&
        !ctx.syndicateExposed.has(id) &&
        (ctx.earnedAchievements.get(id)?.size ?? 0) >= 1
      );
    },
  },
];

/**
 * Check all achievements for all empires. Returns newly earned achievements.
 */
export function checkAchievements(
  empires: Map<EmpireId, Empire>,
  galaxy: Galaxy,
  context: AchievementContext,
  alreadyEarned: Map<EmpireId, Set<string>>,
): AchievementEvent[] {
  const events: AchievementEvent[] = [];

  for (const [empireId, empire] of empires) {
    const earned = alreadyEarned.get(empireId) ?? new Set();
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (earned.has(def.id)) continue;
      if (def.check(empireId, empire, galaxy, context)) {
        events.push({
          type: "achievement",
          empireId,
          cycle: 0, // caller sets this
          achievementId: def.id,
          achievementName: def.name,
        });
      }
    }
  }

  return events;
}

/**
 * All achievement paths are tracked simultaneously — returns progress for all paths.
 */
export function getAchievementProgress(
  empireId: EmpireId,
  empire: Empire,
  galaxy: Galaxy,
  context: AchievementContext,
): { id: string; name: string; earned: boolean }[] {
  const earned = context.earnedAchievements.get(empireId) ?? new Set();
  return ACHIEVEMENT_DEFINITIONS.map((def) => ({
    id: def.id,
    name: def.name,
    earned: earned.has(def.id) || def.check(empireId, empire, galaxy, context),
  }));
}
