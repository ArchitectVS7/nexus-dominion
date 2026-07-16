/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — UGT harness core

   The pure request→response core of the JSON-lines test harness
   (the Node stdio shell lives in harness/ugt-harness.mjs — NOT
   here, so this module stays free of Node globals and is
   typechecked + vitest-covered like the rest of src/).

   This is a TRANSPORT layer over the real engine. It contains no
   game logic and adds no validation the engine does not perform
   itself: player actions are passed to processCycle verbatim, so
   the harness observes exactly what a real client would get.

   Ops: create | commit | state | save | load
   Every response carries `stateHash` — a content hash of the
   serialized GameState with the nondeterministic campaign
   metadata (id/createdAt/lastSavedAt) normalized out, so two
   same-seed campaigns hash identically.

   Accumulator contract: processCycle takes caller-owned
   powerHistory/botAccumulated maps, and the caller must push each
   empire's powerScore after every committed cycle (see
   src/engine/integration/integration.test.ts and the
   rollingAveragePowerScores contract in nexus-engine.ts). The
   harness owns both maps per campaign and includes them in
   save/load payloads — losing them across a resume would change
   Reckoning tiers and bot action budgets.
   ══════════════════════════════════════════════════════════════ */

import { createNewCampaign } from "../engine/campaign/campaign-factory";
import { processCycle } from "../engine/cycle/cycle-processor";
import type { PlayerActions, CycleResult } from "../engine/cycle/cycle-processor";
import {
  serializeGameState,
  deserializeGameState,
} from "../engine/persistence/state-serializer";
import type { GameState } from "../engine/types/game-state";
import type { GalaxyConfig } from "../engine/types/galaxy";
import type { EmpireId } from "../engine/types/ids";

/* ── Protocol types ── */

export type RequestId = number | string;

export interface CreateRequest {
  op: "create";
  id?: RequestId;
  config: {
    seed: number;
    empireCount?: number;
    totalSystems?: number;
    sectorCount?: number;
    systemsPerSector?: number;
  };
  name?: string;
  tutorial?: boolean;
}

export interface CommitRequest {
  op: "commit";
  id?: RequestId;
  campaignId: string;
  actions: { type: string; details?: Record<string, unknown> }[];
}

export interface StateRequest {
  op: "state";
  id?: RequestId;
  campaignId: string;
  full?: boolean;
}

export interface SaveRequest {
  op: "save";
  id?: RequestId;
  campaignId: string;
}

export interface LoadRequest {
  op: "load";
  id?: RequestId;
  payload: SavePayload;
}

export type Request =
  | CreateRequest
  | CommitRequest
  | StateRequest
  | SaveRequest
  | LoadRequest;

export interface SavePayload {
  version: 1;
  /** The game's own save format: serializeGameState output, verbatim. */
  state: string;
  powerHistory: [string, number[]][];
  botAccumulated: [string, number][];
}

export interface ErrorInfo {
  kind:
    | "BAD_REQUEST"
    | "UNKNOWN_CAMPAIGN"
    | "CREATE_FAILED"
    | "LOAD_FAILED"
    | "INTERNAL";
  reason: string;
}

/* ── Campaign registry ── */

interface CampaignEntry {
  state: GameState;
  powerHistory: Map<EmpireId, number[]>;
  botAccumulated: Map<EmpireId, number>;
}

export interface HarnessRegistry {
  entries: Map<string, CampaignEntry>;
  nextId: number;
}

export function createRegistry(): HarnessRegistry {
  return { entries: new Map(), nextId: 1 };
}

/* ── PRD defaults (docs/prd.md: 250 systems, 10 sectors, 100 empires) ── */

const DEFAULT_CONFIG = {
  totalSystems: 250,
  sectorCount: 10,
  systemsPerSector: 25,
  empireCount: 100,
};

/* ── State hash: FNV-1a over the normalized serialized state ──
   Not cryptographic — a divergence detector. Campaign id and
   timestamps are the only nondeterministic fields in GameState
   (campaign-factory.ts uses Date.now()/new Date()), so they are
   pinned before hashing. */

export function normalizedSerialize(state: GameState): string {
  const normalized: GameState = {
    ...state,
    campaign: {
      ...state.campaign,
      id: "normalized",
      createdAt: "normalized",
      lastSavedAt: "normalized",
    },
  };
  return serializeGameState(normalized);
}

export function stateHash(state: GameState): string {
  const text = normalizedSerialize(state);
  // Two FNV-1a 32-bit passes with distinct offset bases → 64 hash bits.
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = ((h1 ^ c) * 0x01000193) >>> 0;
    h2 = ((h2 ^ ((c >> 8) & 0xff)) * 0x01000193) >>> 0;
    h2 = ((h2 ^ (c & 0xff)) * 0x01000193) >>> 0;
  }
  return (
    h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")
  );
}

/* ── Summary projection (pure reads; no game rules) ── */

export function summarize(entry: CampaignEntry): Record<string, unknown> {
  const { state } = entry;
  const player = state.empires.get(state.playerEmpireId);
  const systems = [...state.galaxy.systems.values()];

  // Units owned by an empire = units in that empire's fleets (the same
  // ownership relation processCycle uses for maintenance).
  let playerUnitCount = 0;
  if (player) {
    for (const fleet of state.fleets.values()) {
      if (fleet.ownerId === state.playerEmpireId) {
        playerUnitCount += fleet.unitIds.length;
      }
    }
  }

  const playerAchievements = [
    ...(state.earnedAchievements?.get(state.playerEmpireId) ?? new Set()),
  ];
  let totalAchievements = 0;
  for (const set of (state.earnedAchievements ?? new Map()).values()) {
    totalAchievements += (set as Set<string>).size;
  }

  return {
    cycle: state.time.currentCycle,
    confluence: state.time.currentConfluence,
    cyclesUntilReckoning: state.time.cyclesUntilReckoning,
    empireCount: state.empires.size,
    botCount: state.bots.size,
    systemCount: systems.length,
    unclaimedSystems: systems.filter((s) => s.owner === null).length,
    playerTier: state.time.cosmicOrder.tiers.get(state.playerEmpireId) ?? null,
    player: player
      ? {
          id: player.id,
          credits: player.resources.credits,
          food: player.resources.food,
          ore: player.resources.ore,
          fuelCells: player.resources.fuelCells,
          researchPoints: player.resources.researchPoints,
          intelligencePoints: player.resources.intelligencePoints,
          population: player.population,
          populationCapacity: player.populationCapacity,
          stabilityScore: player.stabilityScore,
          stabilityLevel: player.stabilityLevel,
          researchTier: player.researchTier,
          researchPath: player.researchPath,
          specialization: player.specialization,
          powerScore: player.powerScore,
          globalReputation: player.globalReputation,
          systemsOwned: player.systemIds.length,
          fleetCount: player.fleetIds.length,
          unitCount: playerUnitCount,
          buildQueueLength: player.buildQueue?.length ?? 0,
          installationQueueLength: player.installationQueue?.length ?? 0,
        }
      : null,
    market: state.market ? { prices: { ...state.market.prices } } : null,
    pactCount: state.diplomacy.pacts.size,
    coalitionCount: state.diplomacy.coalitions.size,
    playerAchievements,
    totalAchievements,
    syndicateController: state.syndicate?.controllerId ?? null,
    tutorialActive: state.tutorial ? state.tutorial.active === true : false,
    powerHistoryLengths: {
      harness: entry.powerHistory.get(state.playerEmpireId)?.length ?? 0,
      state: state.powerHistory?.get(state.playerEmpireId)?.length ?? 0,
    },
  };
}

/* ── Dispatch ── */

type Json = Record<string, unknown>;

export function dispatch(request: Request, registry: HarnessRegistry): Json {
  try {
    switch (request.op) {
      case "create":
        return handleCreate(request, registry);
      case "commit":
        return handleCommit(request, registry);
      case "state":
        return handleState(request, registry);
      case "save":
        return handleSave(request, registry);
      case "load":
        return handleLoad(request, registry);
      default:
        return errorResponse(
          (request as { op?: string }).op ?? "unknown",
          idOf(request),
          {
            kind: "BAD_REQUEST",
            reason: `unknown op ${JSON.stringify((request as { op?: string }).op)}`,
          },
        );
    }
  } catch (err) {
    return errorResponse(request.op, idOf(request), {
      kind: "INTERNAL",
      reason: reasonOf(err),
    });
  }
}

function handleCreate(req: CreateRequest, registry: HarnessRegistry): Json {
  const id = idOf(req);
  const cfg = req.config;
  if (!cfg || typeof cfg.seed !== "number" || !Number.isFinite(cfg.seed)) {
    // Fail LOUD on a missing seed — a silently-defaulted seed is a
    // different campaign, not a default (the exact-config-key lesson).
    return errorResponse("create", id, {
      kind: "BAD_REQUEST",
      reason: "config.seed (finite number) is required",
    });
  }
  for (const key of [
    "empireCount",
    "totalSystems",
    "sectorCount",
    "systemsPerSector",
  ] as const) {
    const v = cfg[key];
    if (v !== undefined && (typeof v !== "number" || !Number.isInteger(v) || v <= 0)) {
      return errorResponse("create", id, {
        kind: "BAD_REQUEST",
        reason: `config.${key} must be a positive integer when given`,
      });
    }
  }

  const config: GalaxyConfig = {
    seed: cfg.seed,
    totalSystems: cfg.totalSystems ?? DEFAULT_CONFIG.totalSystems,
    sectorCount: cfg.sectorCount ?? DEFAULT_CONFIG.sectorCount,
    systemsPerSector: cfg.systemsPerSector ?? DEFAULT_CONFIG.systemsPerSector,
    empireCount: cfg.empireCount ?? DEFAULT_CONFIG.empireCount,
  };

  let state: GameState;
  try {
    state = createNewCampaign(config, req.name ?? "UGT Campaign", {
      tutorial: req.tutorial === true,
    });
  } catch (err) {
    return errorResponse("create", id, {
      kind: "CREATE_FAILED",
      reason: reasonOf(err),
    });
  }

  const campaignId = `c${registry.nextId++}`;
  const entry: CampaignEntry = {
    state,
    powerHistory: new Map(),
    botAccumulated: new Map(),
  };
  registry.entries.set(campaignId, entry);
  return {
    op: "create",
    id,
    ok: true,
    campaignId,
    config,
    summary: summarize(entry),
    stateHash: stateHash(state),
  };
}

function handleCommit(req: CommitRequest, registry: HarnessRegistry): Json {
  const id = idOf(req);
  const entry = registry.entries.get(req.campaignId);
  if (!entry) return unknownCampaign("commit", id, req.campaignId);
  if (!Array.isArray(req.actions)) {
    return errorResponse("commit", id, {
      kind: "BAD_REQUEST",
      reason: "actions must be an array",
    });
  }
  // Deliberately NO validation of action types/details beyond shape: the
  // engine's own handling of unknown or malformed actions is part of what
  // the harness exists to observe.
  for (const a of req.actions) {
    if (a === null || typeof a !== "object" || typeof a.type !== "string") {
      return errorResponse("commit", id, {
        kind: "BAD_REQUEST",
        reason: "each action must be an object with a string `type`",
      });
    }
  }

  const playerActions: PlayerActions = { actions: req.actions };
  const result: CycleResult = processCycle(
    entry.state,
    playerActions,
    entry.powerHistory,
    entry.botAccumulated,
  );

  if (result.committed) {
    entry.state = result.state;
    // Caller-owned accumulator contract: push each empire's powerScore,
    // most recent last (integration.test.ts / rollingAveragePowerScores).
    for (const [empireId, empire] of entry.state.empires) {
      let history = entry.powerHistory.get(empireId);
      if (!history) {
        history = [];
        entry.powerHistory.set(empireId, history);
      }
      history.push(empire.powerScore);
    }
  }

  return {
    op: "commit",
    id,
    ok: true,
    committed: result.committed,
    ...(result.error !== undefined ? { error: result.error } : {}),
    report: {
      cycle: result.report.cycle,
      reckoningOccurred: result.report.reckoningOccurred,
      playerResourceDeltas: result.report.playerResourceDeltas,
      events: result.report.events,
    },
    summary: summarize(entry),
    stateHash: stateHash(entry.state),
  };
}

function handleState(req: StateRequest, registry: HarnessRegistry): Json {
  const id = idOf(req);
  const entry = registry.entries.get(req.campaignId);
  if (!entry) return unknownCampaign("state", id, req.campaignId);
  return {
    op: "state",
    id,
    ok: true,
    summary: summarize(entry),
    stateHash: stateHash(entry.state),
    ...(req.full === true
      ? { state: JSON.parse(serializeGameState(entry.state)) as unknown }
      : {}),
  };
}

function handleSave(req: SaveRequest, registry: HarnessRegistry): Json {
  const id = idOf(req);
  const entry = registry.entries.get(req.campaignId);
  if (!entry) return unknownCampaign("save", id, req.campaignId);
  const payload: SavePayload = {
    version: 1,
    state: serializeGameState(entry.state),
    powerHistory: [...entry.powerHistory.entries()] as [string, number[]][],
    botAccumulated: [...entry.botAccumulated.entries()] as [string, number][],
  };
  return {
    op: "save",
    id,
    ok: true,
    payload,
    stateHash: stateHash(entry.state),
  };
}

function handleLoad(req: LoadRequest, registry: HarnessRegistry): Json {
  const id = idOf(req);
  const p = req.payload;
  if (
    !p ||
    p.version !== 1 ||
    typeof p.state !== "string" ||
    !Array.isArray(p.powerHistory) ||
    !Array.isArray(p.botAccumulated)
  ) {
    return errorResponse("load", id, {
      kind: "BAD_REQUEST",
      reason:
        "payload must be {version:1, state:string, powerHistory:[], botAccumulated:[]}",
    });
  }
  let state: GameState;
  try {
    state = deserializeGameState(p.state);
  } catch (err) {
    return errorResponse("load", id, {
      kind: "LOAD_FAILED",
      reason: reasonOf(err),
    });
  }
  if (!state || typeof state !== "object" || !state.time || !state.empires) {
    return errorResponse("load", id, {
      kind: "LOAD_FAILED",
      reason: "payload.state did not deserialize to a GameState",
    });
  }
  const campaignId = `c${registry.nextId++}`;
  const entry: CampaignEntry = {
    state,
    powerHistory: new Map(p.powerHistory as [EmpireId, number[]][]),
    botAccumulated: new Map(p.botAccumulated as [EmpireId, number][]),
  };
  registry.entries.set(campaignId, entry);
  return {
    op: "load",
    id,
    ok: true,
    campaignId,
    summary: summarize(entry),
    stateHash: stateHash(state),
  };
}

/* ── Line parsing (used by the stdio shell) ── */

export function parseRequestLine(
  line: string,
): { ok: true; request: Request } | { ok: false; response: Json } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch (err) {
    return {
      ok: false,
      response: errorResponse("parse", null, {
        kind: "BAD_REQUEST",
        reason: `not valid JSON: ${reasonOf(err)}`,
      }),
    };
  }
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    typeof (parsed as { op?: unknown }).op !== "string"
  ) {
    return {
      ok: false,
      response: errorResponse("parse", null, {
        kind: "BAD_REQUEST",
        reason: "request must be a JSON object with a string `op`",
      }),
    };
  }
  return { ok: true, request: parsed as Request };
}

/* ── Helpers ── */

function idOf(req: { id?: RequestId }): RequestId | null {
  return req.id ?? null;
}

function reasonOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function unknownCampaign(
  op: string,
  id: RequestId | null,
  campaignId: string,
): Json {
  return errorResponse(op, id, {
    kind: "UNKNOWN_CAMPAIGN",
    reason: `no campaign ${JSON.stringify(campaignId)}`,
  });
}

function errorResponse(op: string, id: RequestId | null, error: ErrorInfo): Json {
  return { op, id, ok: false, error };
}
