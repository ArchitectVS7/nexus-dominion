interface PerformanceEntry {
  operation: string;
  durationMs: number;
  gameId?: string;
  metadata?: Record<string, unknown>;
}

// In-memory buffer for batch inserts
let logBuffer: PerformanceEntry[] = [];
const BUFFER_SIZE = 50;
const FLUSH_INTERVAL_MS = 5000;

/**
 * Performance logger for tracking operation timings
 * Supports both database storage and console output
 */
class PerformanceLogger {
  private static instance: PerformanceLogger;
  private enabled: boolean;
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.enabled = process.env.ENABLE_PERFORMANCE_LOGGING === "true";
  }

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  /**
   * Time an async operation and log the result
   */
  async time<T>(
    operation: string,
    fn: () => Promise<T>,
    options?: { gameId?: string; metadata?: Record<string, unknown> }
  ): Promise<T> {
    if (!this.enabled) {
      return fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);

      await this.log({
        operation,
        durationMs,
        gameId: options?.gameId,
        metadata: options?.metadata,
      });

      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);

      await this.log({
        operation: `${operation}_error`,
        durationMs,
        gameId: options?.gameId,
        metadata: { ...options?.metadata, error: String(error) },
      });

      throw error;
    }
  }

  /**
   * Log a performance entry
   */
  async log(entry: PerformanceEntry): Promise<void> {
    if (!this.enabled) return;

    // Console log for development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[PERF] ${entry.operation}: ${entry.durationMs}ms`,
        entry.metadata ? JSON.stringify(entry.metadata) : ""
      );
    }

    // Add to buffer
    logBuffer.push(entry);

    // Flush if buffer is full
    if (logBuffer.length >= BUFFER_SIZE) {
      await this.flush();
    } else {
      // Schedule flush
      this.scheduleFlush();
    }
  }

  /**
   * Flush log buffer to database
   */
  async flush(): Promise<void> {
    if (logBuffer.length === 0) return;

    const entries = [...logBuffer];
    logBuffer = [];

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    // Only write to database if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      // Log to console as fallback
      entries.forEach((entry) => {
        console.log(`[PERF-FALLBACK] ${JSON.stringify(entry)}`);
      });
      return;
    }

    try {
      const { db } = await import("@/lib/db");
      const { performanceLogs } = await import("@/lib/db/schema");

      await db.insert(performanceLogs).values(
        entries.map((entry) => ({
          operation: entry.operation,
          durationMs: entry.durationMs,
          gameId: entry.gameId,
          metadata: entry.metadata,
        }))
      );
    } catch (error) {
      // Log to console if DB insert fails
      console.error("[PERF] Failed to flush logs:", error);
      entries.forEach((entry) => {
        console.log(`[PERF-FALLBACK] ${JSON.stringify(entry)}`);
      });
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) return;

    this.flushTimeout = setTimeout(() => {
      void this.flush();
    }, FLUSH_INTERVAL_MS);
  }
}

// Export singleton instance
export const perfLogger = PerformanceLogger.getInstance();

// Convenience wrapper for timing operations
export async function timeOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  options?: { gameId?: string; metadata?: Record<string, unknown> }
): Promise<T> {
  return perfLogger.time(operation, fn, options);
}
