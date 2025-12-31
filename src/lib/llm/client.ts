/**
 * M12: LLM Client (Groq + OpenAI-compatible APIs)
 *
 * Provides a unified interface for calling LLM providers with retry logic,
 * timeout handling, and cost tracking.
 */

import {
  type LlmProvider,
  type LlmCallStatus,
  type LlmPurpose,
  PROVIDER_CONFIGS,
  RATE_LIMITS,
  calculateRequestCost,
  FALLBACK_REASONS,
  type FallbackReason,
} from "./constants";

// ============================================
// TYPES
// ============================================

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmRequest {
  messages: LlmMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface LlmResponse {
  /** The generated text */
  content: string;

  /** Provider used */
  provider: LlmProvider;

  /** Model used */
  model: string;

  /** Status of the call */
  status: LlmCallStatus;

  /** Token usage */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  /** Cost in USD */
  costUsd: number;

  /** Latency in milliseconds */
  latencyMs: number;

  /** Whether failover occurred */
  didFallback: boolean;

  /** Reason for fallback (if any) */
  fallbackReason?: FallbackReason;

  /** Fallback provider (if different from original) */
  fallbackProvider?: LlmProvider;

  /** Error message (if failed) */
  error?: string;
}

interface OpenAICompatibleResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================
// CLIENT
// ============================================

/**
 * Call an LLM provider with retry logic and timeout.
 *
 * @param provider - The LLM provider to use
 * @param request - The request parameters
 * @param purpose - Purpose of the call (for logging)
 * @param timeoutMs - Optional timeout override
 * @returns LLM response with usage and cost data
 */
export async function callLlm(
  provider: LlmProvider,
  request: LlmRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _purpose: LlmPurpose = "decision",
  timeoutMs: number = RATE_LIMITS.REQUEST_TIMEOUT_MS
): Promise<LlmResponse> {
  const config = PROVIDER_CONFIGS[provider];

  if (!config.enabled) {
    throw new Error(`Provider ${provider} is not enabled`);
  }

  const apiKey = process.env[config.apiKeyEnvVar];
  if (!apiKey) {
    throw new Error(
      `Missing API key for ${provider}. Set ${config.apiKeyEnvVar} environment variable.`
    );
  }

  const startTime = Date.now();

  try {
    const response = await callWithRetry(
      provider,
      apiKey,
      request,
      config.defaultModel,
      timeoutMs
    );

    const latencyMs = Date.now() - startTime;
    const costUsd = calculateRequestCost(
      provider,
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    );

    return {
      content: response.choices[0]?.message?.content ?? "",
      provider,
      model: response.model,
      status: "completed",
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
      costUsd,
      latencyMs,
      didFallback: false,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    return {
      content: "",
      provider,
      model: config.defaultModel,
      status: "failed",
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      costUsd: 0,
      latencyMs,
      didFallback: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Call with exponential backoff retry logic.
 */
async function callWithRetry(
  provider: LlmProvider,
  apiKey: string,
  request: LlmRequest,
  model: string,
  timeoutMs: number,
  attempt: number = 0
): Promise<OpenAICompatibleResponse> {
  const config = PROVIDER_CONFIGS[provider];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1024,
        top_p: request.topP ?? 1.0,
        frequency_penalty: request.frequencyPenalty ?? 0,
        presence_penalty: request.presencePenalty ?? 0,
        stop: request.stop,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `${provider} API error (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as OpenAICompatibleResponse;
    return data;
  } catch (error) {
    // Retry logic
    if (attempt < RATE_LIMITS.MAX_RETRIES) {
      const delay = RATE_LIMITS.RETRY_DELAY_MS * Math.pow(2, attempt);
      console.warn(
        `${provider} call failed (attempt ${attempt + 1}/${RATE_LIMITS.MAX_RETRIES}). Retrying in ${delay}ms...`,
        error
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return callWithRetry(provider, apiKey, request, model, timeoutMs, attempt + 1);
    }

    throw error;
  }
}

/**
 * Call LLM with automatic failover to backup providers.
 *
 * @param request - The request parameters
 * @param purpose - Purpose of the call
 * @param primaryProvider - Primary provider to try first
 * @param failoverChain - Ordered list of fallback providers
 * @param timeoutMs - Timeout per attempt
 * @returns LLM response with failover tracking
 */
export async function callLlmWithFailover(
  request: LlmRequest,
  purpose: LlmPurpose = "decision",
  primaryProvider: LlmProvider = "groq",
  failoverChain: LlmProvider[] = ["together", "openai"],
  timeoutMs: number = RATE_LIMITS.REQUEST_TIMEOUT_MS
): Promise<LlmResponse> {
  // Try primary provider first
  const primaryResult = await callLlm(primaryProvider, request, purpose, timeoutMs);

  if (primaryResult.status === "completed") {
    return primaryResult;
  }

  // Primary failed, try failover chain
  const originalError = primaryResult.error;

  for (const fallbackProvider of failoverChain) {
    console.warn(
      `Primary provider ${primaryProvider} failed. Trying fallback: ${fallbackProvider}`
    );

    const fallbackResult = await callLlm(
      fallbackProvider,
      request,
      purpose,
      timeoutMs
    );

    if (fallbackResult.status === "completed") {
      return {
        ...fallbackResult,
        didFallback: true,
        fallbackReason: determineFallbackReason(originalError),
        fallbackProvider,
      };
    }
  }

  // All providers failed
  return {
    ...primaryResult,
    didFallback: true,
    fallbackReason: FALLBACK_REASONS.PROVIDER_UNAVAILABLE,
    error: `All providers failed. Last error: ${primaryResult.error}`,
  };
}

/**
 * Determine the reason for fallback based on error message.
 */
function determineFallbackReason(error?: string): FallbackReason {
  if (!error) {
    return FALLBACK_REASONS.API_ERROR;
  }

  const errorLower = error.toLowerCase();

  if (errorLower.includes("timeout") || errorLower.includes("aborted")) {
    return FALLBACK_REASONS.TIMEOUT;
  }

  if (errorLower.includes("rate limit") || errorLower.includes("429")) {
    return FALLBACK_REASONS.RATE_LIMITED;
  }

  if (errorLower.includes("content") || errorLower.includes("filtered")) {
    return FALLBACK_REASONS.CONTENT_FILTERED;
  }

  if (errorLower.includes("503") || errorLower.includes("unavailable")) {
    return FALLBACK_REASONS.PROVIDER_UNAVAILABLE;
  }

  return FALLBACK_REASONS.API_ERROR;
}
