/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Syndicate System Types
   ══════════════════════════════════════════════════════════════ */

import type { EmpireId } from "./ids";

/* ── Rank ── */

/** 0 = Unaware (not in the system), 1–8 = active ranks */
export type SyndicateRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const RANK_INFLUENCE_THRESHOLDS: Record<SyndicateRank, number> = {
  0: 0,
  1: 50,
  2: 100,
  3: 200,
  4: 350,
  5: 550,
  6: 800,
  7: 1100,
  8: 1500,
};

/* ── Contracts ── */

export type SyndicateContractId =
  | "production-disruption"
  | "civil-agitation"
  | "market-interference"
  | "phantom-raid"
  | "intelligence-broadcast"
  | "supply-embargo"
  | "leadership-crisis"
  | "doctrine-theft"
  | "proxy-war"
  | "the-convergence";

export interface SyndicateContractDef {
  id: SyndicateContractId;
  tier: 1 | 2 | 3 | 4;
  /** Minimum rank required to execute */
  minRank: SyndicateRank;
  /** Influence awarded on completion */
  influenceReward: number;
  /** Shadow signature growth from executing */
  shadowSignatureGrowth: number;
}

export const CONTRACT_DEFINITIONS: Record<SyndicateContractId, SyndicateContractDef> = {
  // Tier 1 — minRank 2
  "production-disruption":  { id: "production-disruption",  tier: 1, minRank: 2, influenceReward: 20, shadowSignatureGrowth: 5 },
  "civil-agitation":        { id: "civil-agitation",        tier: 1, minRank: 2, influenceReward: 18, shadowSignatureGrowth: 4 },
  "market-interference":    { id: "market-interference",    tier: 1, minRank: 2, influenceReward: 22, shadowSignatureGrowth: 5 },
  "phantom-raid":           { id: "phantom-raid",           tier: 1, minRank: 2, influenceReward: 25, shadowSignatureGrowth: 6 },
  // Tier 2 — minRank 3
  "intelligence-broadcast": { id: "intelligence-broadcast", tier: 2, minRank: 3, influenceReward: 35, shadowSignatureGrowth: 10 },
  "supply-embargo":         { id: "supply-embargo",         tier: 2, minRank: 3, influenceReward: 40, shadowSignatureGrowth: 12 },
  // Tier 3 — minRank 4
  "leadership-crisis":      { id: "leadership-crisis",      tier: 3, minRank: 4, influenceReward: 65, shadowSignatureGrowth: 20 },
  "doctrine-theft":         { id: "doctrine-theft",         tier: 3, minRank: 4, influenceReward: 70, shadowSignatureGrowth: 22 },
  // Tier 4 — minRank 6
  "proxy-war":              { id: "proxy-war",              tier: 4, minRank: 6, influenceReward: 110, shadowSignatureGrowth: 40 },
  "the-convergence":        { id: "the-convergence",        tier: 4, minRank: 6, influenceReward: 120, shadowSignatureGrowth: 50 },
};

/* ── Member State ── */

export interface SyndicateMember {
  empireId: EmpireId;
  rank: SyndicateRank;
  /** Accumulated influence points */
  influence: number;
  /** Shadow Signature: observable trace level (0–100) */
  shadowSignature: number;
  /** Whether this empire has been publicly exposed */
  exposed: boolean;
  /** Cycle when this empire first joined the Syndicate */
  discoveredCycle: number;
}

/* ── Black Register ── */

export type BlackRegisterItemId =
  | "empire-dossier"
  | "covenant-map"
  | "advance-signals"
  | "syndicate-audit"
  | "fleet-trace"
  | "cascade-disruptor"
  | "supply-chain-virus"
  | "frequency-jammer"
  | "shadow-veil"
  | "orbital-blindspot"
  | "neural-static"
  | "nexus-backdoor"
  | "void-ledger";

export interface BlackRegisterItemDef {
  id: BlackRegisterItemId;
  /** Minimum syndicate rank to purchase */
  minRank: SyndicateRank;
  /** Base credit cost (before rank premium) */
  baseCost: number;
  /** Shadow signature increase from purchasing */
  signatureGrowth: number;
  /** Category: intelligence or disruption */
  category: "intelligence" | "disruption";
}

/** Rank premium multiplier: lower-rank members pay more. Controller (rank 8) pays 1.0x. */
export const BLACK_REGISTER_RANK_PREMIUMS: Record<SyndicateRank, number> = {
  0: 0,    // cannot access
  1: 0,    // cannot access
  2: 2.0,  // 2x base cost
  3: 1.75,
  4: 1.5,
  5: 1.35,
  6: 1.2,
  7: 1.1,
  8: 1.0,  // controller rate
};

export const BLACK_REGISTER_ITEMS: Record<BlackRegisterItemId, BlackRegisterItemDef> = {
  // Intelligence Services (Rank 2+)
  "empire-dossier":     { id: "empire-dossier",     minRank: 2, baseCost: 100, signatureGrowth: 3,  category: "intelligence" },
  "covenant-map":       { id: "covenant-map",       minRank: 2, baseCost: 150, signatureGrowth: 3,  category: "intelligence" },
  "advance-signals":    { id: "advance-signals",    minRank: 3, baseCost: 200, signatureGrowth: 5,  category: "intelligence" },
  "syndicate-audit":    { id: "syndicate-audit",    minRank: 3, baseCost: 175, signatureGrowth: 5,  category: "intelligence" },
  "fleet-trace":        { id: "fleet-trace",        minRank: 3, baseCost: 250, signatureGrowth: 5,  category: "intelligence" },
  // Strategic Disruption Tools (Rank 4+)
  "cascade-disruptor":  { id: "cascade-disruptor",  minRank: 4, baseCost: 500, signatureGrowth: 15, category: "disruption" },
  "supply-chain-virus": { id: "supply-chain-virus", minRank: 4, baseCost: 400, signatureGrowth: 12, category: "disruption" },
  "frequency-jammer":   { id: "frequency-jammer",   minRank: 4, baseCost: 350, signatureGrowth: 10, category: "disruption" },
  "shadow-veil":        { id: "shadow-veil",        minRank: 4, baseCost: 600, signatureGrowth: 0,  category: "disruption" }, // reduces signature
  // Elite Services (Rank 7+)
  "orbital-blindspot":  { id: "orbital-blindspot",  minRank: 7, baseCost: 1000, signatureGrowth: 10, category: "intelligence" },
  "neural-static":      { id: "neural-static",      minRank: 7, baseCost: 1200, signatureGrowth: 20, category: "disruption" },
  // Sovereign Assets (Rank 8)
  "nexus-backdoor":     { id: "nexus-backdoor",     minRank: 8, baseCost: 2500, signatureGrowth: 40, category: "intelligence" },
  "void-ledger":        { id: "void-ledger",        minRank: 8, baseCost: 3000, signatureGrowth: 50, category: "disruption" },
};

/* ── Global Syndicate State ── */

export interface SyndicateState {
  /** All member empires (only empires that have discovered the Syndicate) */
  members: Map<EmpireId, SyndicateMember>;
  /** The current controller (empire with highest rank; null if no active members) */
  controllerId: EmpireId | null;
  /**
   * Pre-computed set of exposed empire IDs for fast achievement lookups.
   * Mirrors the exposed flag on SyndicateMember.
   */
  exposedEmpires: Set<EmpireId>;
}
