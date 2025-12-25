"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  startNewGame,
  getDashboardData,
  type DashboardData,
} from "@/lib/game/repositories/game-repository";
import type { Difficulty } from "@/lib/bots/types";

// =============================================================================
// COOKIE HELPERS
// =============================================================================

const GAME_ID_COOKIE = "gameId";
const EMPIRE_ID_COOKIE = "empireId";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function setGameCookies(gameId: string, empireId: string) {
  const cookieStore = await cookies();
  cookieStore.set(GAME_ID_COOKIE, gameId, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  cookieStore.set(EMPIRE_ID_COOKIE, empireId, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

async function getGameCookies(): Promise<{
  gameId: string | undefined;
  empireId: string | undefined;
}> {
  const cookieStore = await cookies();
  return {
    gameId: cookieStore.get(GAME_ID_COOKIE)?.value,
    empireId: cookieStore.get(EMPIRE_ID_COOKIE)?.value,
  };
}

async function clearGameCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(GAME_ID_COOKIE);
  cookieStore.delete(EMPIRE_ID_COOKIE);
}

// =============================================================================
// GAME ACTIONS
// =============================================================================

export interface StartGameResult {
  success: boolean;
  error?: string;
  gameId?: string;
  empireId?: string;
  botCount?: number;
  difficulty?: Difficulty;
}

/**
 * Start a new game with the given empire name and difficulty.
 * Sets cookies for game and empire IDs, then redirects to the game dashboard.
 * Creates 25 bot empires with random decision-making (M5).
 */
export async function startGameAction(formData: FormData): Promise<StartGameResult> {
  const empireName = formData.get("empireName") as string;
  const difficultyRaw = formData.get("difficulty") as string | null;

  // Validate difficulty
  const validDifficulties: Difficulty[] = ["easy", "normal", "hard", "nightmare"];
  const difficulty: Difficulty = validDifficulties.includes(difficultyRaw as Difficulty)
    ? (difficultyRaw as Difficulty)
    : "normal";

  if (!empireName || empireName.trim().length === 0) {
    return { success: false, error: "Empire name is required" };
  }

  if (empireName.length > 100) {
    return { success: false, error: "Empire name must be 100 characters or less" };
  }

  try {
    const { game, empire, bots } = await startNewGame(
      "New Game",
      empireName.trim(),
      undefined,
      difficulty,
      25 // Default bot count
    );

    await setGameCookies(game.id, empire.id);

    // Note: We don't redirect here because we want the client to handle it
    return {
      success: true,
      gameId: game.id,
      empireId: empire.id,
      botCount: bots.length,
      difficulty,
    };
  } catch (error) {
    console.error("Failed to start game:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start game",
    };
  }
}

/**
 * Fetch dashboard data for the current player's empire.
 */
export async function fetchDashboardDataAction(): Promise<DashboardData | null> {
  const { empireId } = await getGameCookies();

  if (!empireId) {
    return null;
  }

  try {
    return await getDashboardData(empireId);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return null;
  }
}

/**
 * Check if there's an active game.
 */
export async function hasActiveGameAction(): Promise<boolean> {
  const { gameId, empireId } = await getGameCookies();
  return !!(gameId && empireId);
}

/**
 * Get the current game and empire IDs.
 */
export async function getCurrentGameAction(): Promise<{
  gameId: string | undefined;
  empireId: string | undefined;
}> {
  return getGameCookies();
}

/**
 * End the current game and clear cookies.
 */
export async function endGameAction(): Promise<void> {
  await clearGameCookies();
  redirect("/");
}
