/**
 * M12: LLM Cost Tracker
 *
 * Logs LLM usage to database for cost tracking and rate limiting.
 */

import { db } from "@/lib/db";
import { llmUsageLogs } from "@/lib/db/schema";
import type { LlmPurpose } from "./constants";
import type { LlmResponse } from "./client";

/**
 * Log an LLM API call to the database.
 *
 * @param gameId - The game ID
 * @param empireId - The bot empire ID (optional)
 * @param turn - The current turn
 * @param purpose - Purpose of the call
 * @param response - LLM response with usage data
 * @returns Log entry ID
 */
export async function logLlmCall(
  gameId: string,
  empireId: string | null,
  turn: number,
  purpose: LlmPurpose,
  response: LlmResponse
): Promise<string> {
  try {
    const [log] = await db
      .insert(llmUsageLogs)
      .values({
        gameId,
        empireId: empireId ?? undefined,
        provider: response.provider,
        model: response.model,
        status: response.status,
        purpose,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        costUsd: response.costUsd.toString(),
        latencyMs: response.latencyMs,
        turn,
        didFallback: response.didFallback,
        fallbackReason: response.fallbackReason ?? null,
        fallbackProvider: response.fallbackProvider ?? null,
        errorMessage: response.error ?? null,
      })
      .returning({ id: llmUsageLogs.id });

    if (!log) {
      throw new Error("Failed to log LLM call");
    }

    return log.id;
  } catch (error) {
    console.error("Failed to log LLM call:", error);
    throw error;
  }
}
