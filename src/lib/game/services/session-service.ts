/**
 * Session Service
 *
 * Manages game sessions for campaign mode.
 * Auto-save only - NO manual save/load to prevent save-scumming.
 *
 * Sessions track:
 * - Turn ranges (start/end)
 * - Play time (started/ended timestamps)
 * - Notable events for session recaps
 */

import { db } from "@/lib/db";
import {
  games,
  gameSessions,
  type GameSession,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// =============================================================================
// SESSION EVENT TYPES
// =============================================================================

export type SessionEventType =
  | "elimination"
  | "combat_victory"
  | "combat_defeat"
  | "alliance_formed"
  | "alliance_broken"
  | "boss_emergence"
  | "milestone"
  | "turn_start";

export interface SessionEvent {
  turn: number;
  type: SessionEventType;
  description: string;
  empireIds?: string[];
  metadata?: Record<string, unknown>;
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

export interface SessionStartResult {
  session: GameSession;
  isNewSession: boolean;
}

/**
 * Start or resume a session for a game.
 * If there's an active (unended) session, returns it.
 * Otherwise creates a new session.
 */
export async function startSession(gameId: string): Promise<SessionStartResult> {
  // Check for existing active session
  const activeSession = await db.query.gameSessions.findFirst({
    where: and(
      eq(gameSessions.gameId, gameId),
      // Active session has no endTurn
    ),
    orderBy: [desc(gameSessions.sessionNumber)],
  });

  // If there's an active session (no endTurn), return it
  if (activeSession && activeSession.endTurn === null) {
    return {
      session: activeSession,
      isNewSession: false,
    };
  }

  // Get game to determine session number and current turn
  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
  });

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  const sessionNumber = game.sessionCount + 1;

  // Create new session
  const [session] = await db
    .insert(gameSessions)
    .values({
      gameId,
      sessionNumber,
      startTurn: game.currentTurn,
    })
    .returning();

  // Update game session count
  await db
    .update(games)
    .set({
      sessionCount: sessionNumber,
      lastSessionAt: new Date(),
    })
    .where(eq(games.id, gameId));

  return {
    session: session!,
    isNewSession: true,
  };
}

/**
 * End the current session for a game.
 * Records the end turn and timestamp.
 */
export async function endSession(gameId: string): Promise<GameSession | null> {
  // Get the game's current turn
  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
  });

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  // Find active session
  const activeSession = await db.query.gameSessions.findFirst({
    where: and(
      eq(gameSessions.gameId, gameId),
    ),
    orderBy: [desc(gameSessions.sessionNumber)],
  });

  if (!activeSession || activeSession.endTurn !== null) {
    // No active session to end
    return null;
  }

  // End the session
  const [updatedSession] = await db
    .update(gameSessions)
    .set({
      endTurn: game.currentTurn,
      endedAt: new Date(),
    })
    .where(eq(gameSessions.id, activeSession.id))
    .returning();

  return updatedSession ?? null;
}

/**
 * Get the current active session for a game.
 */
export async function getCurrentSession(gameId: string): Promise<GameSession | null> {
  const session = await db.query.gameSessions.findFirst({
    where: eq(gameSessions.gameId, gameId),
    orderBy: [desc(gameSessions.sessionNumber)],
  });

  // Return only if it's active (no endTurn)
  if (session && session.endTurn === null) {
    return session;
  }

  return null;
}

/**
 * Get all sessions for a game.
 */
export async function getGameSessions(gameId: string): Promise<GameSession[]> {
  return db.query.gameSessions.findMany({
    where: eq(gameSessions.gameId, gameId),
    orderBy: [desc(gameSessions.sessionNumber)],
  });
}

/**
 * Record a notable event for the current session.
 * Events are stored as JSON strings for session recaps.
 */
export async function recordSessionEvent(
  gameId: string,
  event: SessionEvent | string
): Promise<void> {
  const session = await getCurrentSession(gameId);
  if (!session) {
    // No active session, skip
    return;
  }

  const eventString = typeof event === "string" ? event : JSON.stringify(event);
  const currentEvents = session.notableEvents ?? [];
  await db
    .update(gameSessions)
    .set({
      notableEvents: [...currentEvents, eventString],
    })
    .where(eq(gameSessions.id, session.id));
}

/**
 * Record an empire elimination event.
 */
export async function recordElimination(
  gameId: string,
  turn: number,
  eliminatedEmpireId: string,
  eliminatedEmpireName: string,
  eliminatorId?: string,
  eliminatorName?: string
): Promise<void> {
  const session = await getCurrentSession(gameId);
  if (!session) {
    return;
  }

  const description = eliminatorId
    ? `${eliminatedEmpireName} was eliminated by ${eliminatorName}`
    : `${eliminatedEmpireName} collapsed`;

  const event: SessionEvent = {
    turn,
    type: "elimination",
    description,
    empireIds: eliminatorId
      ? [eliminatedEmpireId, eliminatorId]
      : [eliminatedEmpireId],
  };

  // Update both events and elimination count
  const currentEvents = session.notableEvents ?? [];
  await db
    .update(gameSessions)
    .set({
      notableEvents: [...currentEvents, JSON.stringify(event)],
      empiresEliminated: session.empiresEliminated + 1,
    })
    .where(eq(gameSessions.id, session.id));
}

/**
 * Record a combat result event.
 */
export async function recordCombat(
  gameId: string,
  turn: number,
  isVictory: boolean,
  attackerName: string,
  defenderName: string,
  attackerId: string,
  defenderId: string
): Promise<void> {
  const event: SessionEvent = {
    turn,
    type: isVictory ? "combat_victory" : "combat_defeat",
    description: isVictory
      ? `${attackerName} defeated ${defenderName} in battle`
      : `${attackerName} was repelled by ${defenderName}`,
    empireIds: [attackerId, defenderId],
  };

  await recordSessionEvent(gameId, event);
}

/**
 * Record an alliance event.
 */
export async function recordAlliance(
  gameId: string,
  turn: number,
  formed: boolean,
  empire1Name: string,
  empire2Name: string,
  empire1Id: string,
  empire2Id: string
): Promise<void> {
  const event: SessionEvent = {
    turn,
    type: formed ? "alliance_formed" : "alliance_broken",
    description: formed
      ? `${empire1Name} and ${empire2Name} formed an alliance`
      : `Alliance between ${empire1Name} and ${empire2Name} dissolved`,
    empireIds: [empire1Id, empire2Id],
  };

  await recordSessionEvent(gameId, event);
}

/**
 * Record a milestone event (e.g., turn 50, turn 100).
 */
export async function recordMilestone(
  gameId: string,
  turn: number,
  description: string
): Promise<void> {
  const event: SessionEvent = {
    turn,
    type: "milestone",
    description,
  };

  await recordSessionEvent(gameId, event);
}

// =============================================================================
// SESSION SUMMARY
// =============================================================================

export interface SessionSummary {
  sessionNumber: number;
  turnsPlayed: number;
  duration: number | null; // milliseconds
  empiresEliminated: number;
  notableEvents: SessionEvent[];
  rawEvents: string[];
  startTurn: number;
  endTurn: number | null;
}

/**
 * Parse stored event strings into SessionEvent objects.
 * Handles both JSON-formatted events and plain strings.
 */
export function parseSessionEvents(eventStrings: string[]): SessionEvent[] {
  return eventStrings
    .map((str) => {
      try {
        const parsed = JSON.parse(str);
        if (parsed && typeof parsed === "object" && "type" in parsed) {
          return parsed as SessionEvent;
        }
        // Plain string, convert to milestone event
        return {
          turn: 0,
          type: "milestone" as const,
          description: str,
        };
      } catch {
        // Not JSON, treat as plain string description
        return {
          turn: 0,
          type: "milestone" as const,
          description: str,
        };
      }
    });
}

/**
 * Get a summary of a completed session.
 */
export function getSessionSummary(session: GameSession): SessionSummary {
  const turnsPlayed = session.endTurn
    ? session.endTurn - session.startTurn
    : 0;

  const duration =
    session.endedAt && session.startedAt
      ? session.endedAt.getTime() - session.startedAt.getTime()
      : null;

  const rawEvents = session.notableEvents ?? [];

  return {
    sessionNumber: session.sessionNumber,
    turnsPlayed,
    duration,
    empiresEliminated: session.empiresEliminated,
    notableEvents: parseSessionEvents(rawEvents),
    rawEvents,
    startTurn: session.startTurn,
    endTurn: session.endTurn,
  };
}

/**
 * Get summaries for all sessions in a game.
 */
export async function getAllSessionSummaries(
  gameId: string
): Promise<SessionSummary[]> {
  const sessions = await getGameSessions(gameId);
  return sessions.map(getSessionSummary);
}
