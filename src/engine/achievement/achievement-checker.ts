import type { EmpireId } from "../types/ids";
import type { Empire } from "../types/empire";
import type { Galaxy } from "../types/galaxy";
import type { AchievementEvent, ConvergenceAlertEvent } from "../types/events";

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
  /** Share of fuelCells production per empire (0-1) */
  fuelCellsProductionShare?: Map<EmpireId, number>;
  /** Empires that have led coalitions to topple targets */
  coalitionLeaderships?: Map<EmpireId, EmpireId[]>;
  /** Covert ops tracking stats for Stealth Sovereign */
  covertOpsStats?: Map<EmpireId, { totalOpsCompleted: number; timesDetectedAsAttacker: number }>;
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
    check: (id, _empire, _galaxy, ctx) => {
      const leaderships = ctx.coalitionLeaderships?.get(id);
      return (leaderships?.length ?? 0) > 0;
    },
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
    check: (id, _empire, _galaxy, ctx) => {
      const share = ctx.fuelCellsProductionShare?.get(id) ?? 0;
      return share >= 0.90;
    },
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
  {
    id: "stealth-sovereign",
    name: "Stealth Sovereign",
    description: "Completed 15 or more covert operations without ever being detected as the attacker",
    check: (id, _empire, _galaxy, ctx) => {
      const stats = ctx.covertOpsStats?.get(id);
      return !!stats && stats.totalOpsCompleted >= 15 && stats.timesDetectedAsAttacker === 0;
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

/* ── Achievement Progress Thresholds ── */

const PROGRESS_THRESHOLDS: Record<string, (empire: Empire, galaxy: Galaxy, ctx: AchievementContext, empireId: EmpireId) => number> = {
  conquest: (empire, galaxy) => Math.min(1.0, empire.systemIds.length / (galaxy.systems.size * 0.3)),
  "trade-prince": (_empire, _galaxy, ctx, empireId) => {
    const myWorth = ctx.empireNetWorth.get(empireId) ?? 0;
    let secondHighest = 0;
    for (const [eid, worth] of ctx.empireNetWorth) {
      if (eid !== empireId && worth > secondHighest) secondHighest = worth;
    }
    if (secondHighest === 0) return myWorth > 0 ? 1.0 : 0;
    return Math.min(1.0, myWorth / (secondHighest * 2));
  },
  warlord: (empire) => Math.min(1.0, empire.systemIds.length / 40),
  singularity: (empire) => Math.min(1.0, empire.researchTier / 8),
  "grand-architect": (_empire, _galaxy, ctx, empireId) => {
    const leaderships = ctx.coalitionLeaderships?.get(empireId);
    return (leaderships?.length ?? 0) > 0 ? 1.0 : 0;
  },
  endurance: (_empire, _galaxy, ctx, empireId) => {
    const survived = ctx.coalitionsSurvived.get(empireId) ?? 0;
    return Math.min(1.0, survived / 5);
  },
  "market-overlord": (empire) => Math.min(1.0, empire.systemIds.length / 12),
  "cartel-boss": (_empire, _galaxy, ctx, empireId) => {
    const share = ctx.fuelCellsProductionShare?.get(empireId) ?? 0;
    return Math.min(1.0, share / 0.9);
  },
  "shadow-throne": (_empire, _galaxy, ctx, empireId) => {
    let score = 0;
    if (ctx.syndicateController === empireId) score += 0.33;
    if (!ctx.syndicateExposed.has(empireId)) score += 0.33;
    if ((ctx.earnedAchievements.get(empireId)?.size ?? 0) >= 1) score += 0.34;
    return Math.min(1.0, score);
  },
  "stealth-sovereign": (_empire, _galaxy, ctx, empireId) => {
    const stats = ctx.covertOpsStats?.get(empireId);
    if (!stats || stats.timesDetectedAsAttacker > 0) return 0;
    return Math.min(1.0, stats.totalOpsCompleted / 15);
  },
};

/**
 * Returns detailed progress percentages for all achievements.
 */
export function getAchievementProgressDetailed(
  empireId: EmpireId,
  empire: Empire,
  galaxy: Galaxy,
  context: AchievementContext,
): { id: string; name: string; earned: boolean; progress: number }[] {
  const earned = context.earnedAchievements.get(empireId) ?? new Set();
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const isEarned = earned.has(def.id) || def.check(empireId, empire, galaxy, context);
    const progressFn = PROGRESS_THRESHOLDS[def.id];
    const progress = isEarned ? 1.0 : (progressFn ? progressFn(empire, galaxy, context, empireId) : 0);
    return {
      id: def.id,
      name: def.name,
      earned: isEarned,
      progress,
    };
  });
}

/* ── Convergence Alerts ── */

/** Progress threshold at which the Nexus emits a Convergence Alert */
export const CONVERGENCE_ALERT_THRESHOLD = 0.8;

/**
 * Check all empires for near-achievement progress and emit Convergence Alerts.
 * Alerts fire once per empire+achievement pair when progress >= 80%.
 * Does not fire for already-earned achievements or previously-alerted pairs.
 *
 * @param priorAlerts Set of "empireId::achievementId" keys for alerts already emitted
 * @param cycle Current game cycle
 * @returns Array of ConvergenceAlertEvents and updated alert keys to add to priorAlerts
 */
export function checkConvergenceAlerts(
  empires: Map<EmpireId, Empire>,
  galaxy: Galaxy,
  context: AchievementContext,
  alreadyEarned: Map<EmpireId, Set<string>>,
  priorAlerts: Set<string>,
  cycle: number,
): ConvergenceAlertEvent[] {
  const alerts: ConvergenceAlertEvent[] = [];

  for (const [empireId, empire] of empires) {
    const earned = alreadyEarned.get(empireId) ?? new Set();

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (earned.has(def.id)) continue;

      const alertKey = `${empireId}::${def.id}`;
      if (priorAlerts.has(alertKey)) continue;

      const progressFn = PROGRESS_THRESHOLDS[def.id];
      if (!progressFn) continue;

      const progress = progressFn(empire, galaxy, context, empireId);
      if (progress >= CONVERGENCE_ALERT_THRESHOLD) {
        alerts.push({
          type: "convergence-alert",
          empireId,
          cycle,
          achievementId: def.id,
          progress,
        });
      }
    }
  }

  return alerts;
}
