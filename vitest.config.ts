import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov", "json-summary"],
      // =========================================================================
      // COVERAGE EXCLUSION RATIONALE
      // =========================================================================
      // Files are excluded from coverage for these reasons:
      // 1. DB-DEPENDENT: Requires database connections, tested via E2E tests
      // 2. EXTERNAL-API: Requires external APIs (LLM providers), tested via E2E
      // 3. SIMULATION: Complex logic tested via simulation/integration tests
      // 4. INFRASTRUCTURE: Test utilities, config files, type definitions
      // 5. STATIC: Index files (re-exports), constants, JSON data
      //
      // NOT EXCLUDED: Pure function files with comprehensive unit tests
      // (e.g., attack-validation-service.ts, formulas/*, victory/conditions.ts)
      // =========================================================================
      exclude: [
        // === INFRASTRUCTURE (always excluded) ===
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/**",
        "e2e/",
        "scripts/",
        "tests/simulation/**",
        "**/index.ts",
        "**/types.ts",
        "data/**",
        "src/data/**",

        // === DB-DEPENDENT LAYERS ===
        "**/db/**",
        "**/performance/**",
        "**/app/**",
        "**/repositories/**",

        // === DB-DEPENDENT SERVICES ===
        // These services make database calls; pure helper functions within
        // them may still be tested, but overall coverage is via E2E
        "src/lib/game/services/build-queue-service.ts",
        "src/lib/game/services/research-service.ts",
        "src/lib/game/services/planet-service.ts",
        "src/lib/game/services/upgrade-service.ts",
        "src/lib/game/services/core/turn-processor.ts",
        "src/lib/game/services/core/save-service.ts",
        "src/lib/game/services/core/victory-service.ts",
        "src/lib/game/services/core/session-service.ts",
        "src/lib/game/services/combat/combat-service.ts",
        "src/lib/game/services/covert/covert-service.ts",
        "src/lib/game/services/coalition-service.ts",
        "src/lib/game/services/event-service.ts",
        "src/lib/game/services/crafting/crafting-service.ts",
        "src/lib/game/services/border-discovery-service.ts",
        "src/lib/game/services/checkpoint-service.ts",
        "src/lib/game/services/expansion-service.ts",
        "src/lib/game/services/research/research-service.ts",
        "src/lib/game/services/threat-service.ts",
        "src/lib/game/services/wormhole-construction-service.ts",
        "src/lib/game/services/galaxy-generation-service.ts",

        // === EXTERNAL API INTEGRATION ===
        "src/lib/llm/**",

        // === MESSAGE/DIPLOMACY INTEGRATION ===
        "src/lib/diplomacy/treaty-service.ts",
        "src/lib/market/market-service.ts",
        "src/lib/messages/message-service.ts",
        "src/lib/messages/triggers.ts",
        "src/lib/messages/template-loader.ts",

        // === BOT SYSTEM (DB + complex decision logic) ===
        "src/lib/bots/bot-actions.ts",
        "src/lib/bots/bot-processor.ts",
        "src/lib/bots/bot-generator.ts",
        "src/lib/bots/references.ts",
        "src/lib/bots/decision-engine.ts",
        "src/lib/bots/research-preferences.ts",
        "src/lib/bots/memory/**",
        "src/lib/bots/archetypes/**",

        // === CONFIG LOADERS (file system access) ===
        "src/lib/game/config/penalty-loader.ts",
        "src/lib/game/config/unit-loader.ts",
        "src/lib/game/config/combat-loader.ts",

        // === UI INTEGRATION ===
        "src/lib/tutorial/**",
        "src/lib/theme/names.ts",

        // === STATIC CONFIGURATION ===
        "src/lib/game/constants/index.ts",
        "src/lib/game/constants.ts",
        "src/lib/game/build-config.ts",

        // === SIMULATION-TESTED (complex logic) ===
        "src/lib/combat/volley-combat-v2.ts",
        "src/lib/combat/theater-control.ts",
        "src/lib/combat/nuclear.ts",
        "src/lib/events/economic.ts",
        "src/lib/events/military.ts",
        "src/lib/events/narrative.ts",
        "src/lib/events/political.ts",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@data": path.resolve(__dirname, "./data"),
    },
  },
});
