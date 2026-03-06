# Turn Processing System - Appendix

**Parent Document:** [TURN-PROCESSING-SYSTEM.md](../TURN-PROCESSING-SYSTEM.md)
**Purpose:** Complete implementation code examples, database schemas, and detailed technical specifications

---

## Table of Contents

1. [Code Examples](#1-code-examples)
2. [Database Schema](#2-database-schema)
3. [Implementation Details](#3-implementation-details)

---

## 1. Code Examples

### 1.1 Complete TurnProcessor Service

Full implementation of the main turn processing orchestrator:

```typescript
// src/lib/game/services/core/turn-processor.ts

import { db } from '@/lib/db';
import { IncomePhase } from './phases/income-phase';
import { AutoProductionPhase } from './phases/auto-production-phase';
import { PopulationPhase } from './phases/population-phase';
import { CivilStatusPhase } from './phases/civil-status-phase';
import { ResearchPhase } from './phases/research-phase';
import { BuildQueuePhase } from './phases/build-queue-phase';
import { CovertPhase } from './phases/covert-phase';
import { CraftingPhase } from './phases/crafting-phase';
import { BotDecisionsPhase } from './phases/bot-decisions-phase';
import { EmotionalDecayPhase } from './phases/emotional-decay-phase';
import { MemoryCleanupPhase } from './phases/memory-cleanup-phase';
import { MarketPhase } from './phases/market-phase';
import { BotMessagesPhase } from './phases/bot-messages-phase';
import { GalacticEventsPhase } from './phases/galactic-events-phase';
import { AllianceCheckpointsPhase } from './phases/alliance-checkpoints-phase';
import { VictoryCheckPhase } from './phases/victory-check-phase';
import { AutoSavePhase } from './phases/auto-save-phase';
import { TurnLogger } from './turn-logger';

export interface TurnProcessingResult {
  success: boolean;
  turn_number: number;
  tier1_success: boolean;
  tier2_errors: string[];
  execution_time_ms: number;
  phase_timings: Record<string, number>;
}

export class TurnProcessor {
  private gameId: string;
  private logger: TurnLogger;

  constructor(gameId: string) {
    this.gameId = gameId;
    this.logger = new TurnLogger(gameId);
  }

  /**
   * Main turn processing orchestrator
   * @spec REQ-TURN-001
   */
  async processTurn(): Promise<TurnProcessingResult> {
    const startTime = Date.now();
    const phaseTimings: Record<string, number> = {};
    const currentTurn = await this.getCurrentTurn();
    const nextTurn = currentTurn + 1;

    try {
      // Mark turn as processing
      await this.setTurnStatus('processing');

      // Tier 1: Transactional (atomic)
      const tier1Start = Date.now();
      const tier1Result = await this.processTier1(nextTurn, phaseTimings);
      const tier1Time = Date.now() - tier1Start;

      if (!tier1Result.success) {
        await this.setTurnStatus('error');
        return {
          success: false,
          turn_number: currentTurn,
          tier1_success: false,
          tier2_errors: [],
          execution_time_ms: Date.now() - startTime,
          phase_timings: phaseTimings,
        };
      }

      // Tier 2: Non-Transactional (graceful failure)
      const tier2Start = Date.now();
      const tier2Errors = await this.processTier2(nextTurn, phaseTimings);
      const tier2Time = Date.now() - tier2Start;

      // Increment turn number
      await this.incrementTurn(nextTurn);

      // Mark turn as idle
      await this.setTurnStatus('idle');

      const totalTime = Date.now() - startTime;

      // Performance logging
      this.logger.logPerformance({
        turn: nextTurn,
        tier1_time_ms: tier1Time,
        tier2_time_ms: tier2Time,
        total_time_ms: totalTime,
        phase_timings: phaseTimings,
      });

      // Warn if performance budget exceeded
      if (totalTime > 2000) {
        console.warn(
          `Turn ${nextTurn} exceeded performance budget: ${totalTime}ms > 2000ms`
        );
      }

      return {
        success: true,
        turn_number: nextTurn,
        tier1_success: true,
        tier2_errors,
        execution_time_ms: totalTime,
        phase_timings,
      };
    } catch (error) {
      await this.setTurnStatus('error');
      this.logger.logError(currentTurn, 'TurnProcessor', error);
      throw error;
    }
  }

  /**
   * Process Tier 1 (transactional phases)
   * @spec REQ-TURN-001
   */
  private async processTier1(
    turn: number,
    timings: Record<string, number>
  ): Promise<{ success: boolean }> {
    const transaction = await db.transaction();

    try {
      // Phase 1: Income
      const p1Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Income', 1);
      await new IncomePhase(this.gameId).process(transaction);
      await this.logger.logPhaseEnd(turn, 'Income', 1, 'success');
      timings['Phase 1: Income'] = Date.now() - p1Start;

      // Phase 2: Auto-Production
      const p2Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Auto-Production', 2);
      await new AutoProductionPhase(this.gameId).process(transaction);
      await this.logger.logPhaseEnd(turn, 'Auto-Production', 2, 'success');
      timings['Phase 2: Auto-Production'] = Date.now() - p2Start;

      // Phase 3: Population
      const p3Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Population', 3);
      await new PopulationPhase(this.gameId).process(transaction);
      await this.logger.logPhaseEnd(turn, 'Population', 3, 'success');
      timings['Phase 3: Population'] = Date.now() - p3Start;

      // Phase 4: Civil Status
      const p4Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Civil Status', 4);
      await new CivilStatusPhase(this.gameId).process(transaction);
      await this.logger.logPhaseEnd(turn, 'Civil Status', 4, 'success');
      timings['Phase 4: Civil Status'] = Date.now() - p4Start;

      // Phase 5: Research
      const p5Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Research', 5);
      await new ResearchPhase(this.gameId).process(transaction);
      await this.logger.logPhaseEnd(turn, 'Research', 5, 'success');
      timings['Phase 5: Research'] = Date.now() - p5Start;

      // Phase 6: Build Queue
      const p6Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Build Queue', 6);
      await new BuildQueuePhase(this.gameId).process(transaction);
      await this.logger.logPhaseEnd(turn, 'Build Queue', 6, 'success');
      timings['Phase 6: Build Queue'] = Date.now() - p6Start;

      // Phase 7: Covert
      const p7Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Covert', 7);
      await new CovertPhase(this.gameId).process(transaction);
      await this.logger.logPhaseEnd(turn, 'Covert', 7, 'success');
      timings['Phase 7: Covert'] = Date.now() - p7Start;

      // Phase 8: Crafting
      const p8Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Crafting', 8);
      await new CraftingPhase(this.gameId).process(transaction);
      await this.logger.logPhaseEnd(turn, 'Crafting', 8, 'success');
      timings['Phase 8: Crafting'] = Date.now() - p8Start;

      // Commit transaction
      await transaction.commit();
      return { success: true };
    } catch (error) {
      // Rollback on any error
      await transaction.rollback();
      await this.logger.logError(turn, 'Tier 1', error);
      console.error('Tier 1 rollback triggered:', error);
      return { success: false };
    }
  }

  /**
   * Process Tier 2 (non-transactional phases)
   * @spec REQ-TURN-001
   */
  private async processTier2(
    turn: number,
    timings: Record<string, number>
  ): Promise<string[]> {
    const errors: string[] = [];

    // Phase 9: Bot Decisions
    try {
      const p9Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Bot Decisions', 9);
      await new BotDecisionsPhase(this.gameId).process();
      await this.logger.logPhaseEnd(turn, 'Bot Decisions', 9, 'success');
      timings['Phase 9: Bot Decisions'] = Date.now() - p9Start;
    } catch (error) {
      errors.push('Bot Decisions: ' + error.message);
      await this.logger.logError(turn, 'Bot Decisions', error);
    }

    // Phase 10: Emotional Decay
    try {
      const p10Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Emotional Decay', 10);
      await new EmotionalDecayPhase(this.gameId).process();
      await this.logger.logPhaseEnd(turn, 'Emotional Decay', 10, 'success');
      timings['Phase 10: Emotional Decay'] = Date.now() - p10Start;
    } catch (error) {
      errors.push('Emotional Decay: ' + error.message);
      await this.logger.logError(turn, 'Emotional Decay', error);
    }

    // Phase 11: Memory Cleanup (every 5 turns)
    if (turn % 5 === 0) {
      try {
        const p11Start = Date.now();
        await this.logger.logPhaseStart(turn, 'Memory Cleanup', 11);
        await new MemoryCleanupPhase(this.gameId).process();
        await this.logger.logPhaseEnd(turn, 'Memory Cleanup', 11, 'success');
        timings['Phase 11: Memory Cleanup'] = Date.now() - p11Start;
      } catch (error) {
        errors.push('Memory Cleanup: ' + error.message);
        await this.logger.logError(turn, 'Memory Cleanup', error);
      }
    }

    // Phase 12: Market
    try {
      const p12Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Market', 12);
      await new MarketPhase(this.gameId).process();
      await this.logger.logPhaseEnd(turn, 'Market', 12, 'success');
      timings['Phase 12: Market'] = Date.now() - p12Start;
    } catch (error) {
      errors.push('Market: ' + error.message);
      await this.logger.logError(turn, 'Market', error);
    }

    // Phase 13: Bot Messages
    try {
      const p13Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Bot Messages', 13);
      await new BotMessagesPhase(this.gameId).process();
      await this.logger.logPhaseEnd(turn, 'Bot Messages', 13, 'success');
      timings['Phase 13: Bot Messages'] = Date.now() - p13Start;
    } catch (error) {
      errors.push('Bot Messages: ' + error.message);
      await this.logger.logError(turn, 'Bot Messages', error);
    }

    // Phase 14-17: Only if milestones unlocked (check dynamically)
    const milestones = await this.getMilestones();

    if (milestones.includes('M11')) {
      // Phase 14: Galactic Events
      try {
        const p14Start = Date.now();
        await this.logger.logPhaseStart(turn, 'Galactic Events', 14);
        await new GalacticEventsPhase(this.gameId).process();
        await this.logger.logPhaseEnd(turn, 'Galactic Events', 14, 'success');
        timings['Phase 14: Galactic Events'] = Date.now() - p14Start;
      } catch (error) {
        errors.push('Galactic Events: ' + error.message);
        await this.logger.logError(turn, 'Galactic Events', error);
      }

      // Phase 15: Alliance Checkpoints
      try {
        const p15Start = Date.now();
        await this.logger.logPhaseStart(turn, 'Alliance Checkpoints', 15);
        await new AllianceCheckpointsPhase(this.gameId).process();
        await this.logger.logPhaseEnd(turn, 'Alliance Checkpoints', 15, 'success');
        timings['Phase 15: Alliance Checkpoints'] = Date.now() - p15Start;
      } catch (error) {
        errors.push('Alliance Checkpoints: ' + error.message);
        await this.logger.logError(turn, 'Alliance Checkpoints', error);
      }
    }

    // Phase 16: Victory Check
    try {
      const p16Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Victory Check', 16);
      const victoryResult = await new VictoryCheckPhase(this.gameId).process();
      if (victoryResult.gameEnded) {
        // Game over - lock game state
        await this.lockGame(victoryResult.winner, victoryResult.victoryType);
      }
      await this.logger.logPhaseEnd(turn, 'Victory Check', 16, 'success');
      timings['Phase 16: Victory Check'] = Date.now() - p16Start;
    } catch (error) {
      errors.push('Victory Check: ' + error.message);
      await this.logger.logError(turn, 'Victory Check', error);
    }

    // Phase 17: Auto-Save
    try {
      const p17Start = Date.now();
      await this.logger.logPhaseStart(turn, 'Auto-Save', 17);
      await new AutoSavePhase(this.gameId).process();
      await this.logger.logPhaseEnd(turn, 'Auto-Save', 17, 'success');
      timings['Phase 17: Auto-Save'] = Date.now() - p17Start;
    } catch (error) {
      errors.push('Auto-Save: ' + error.message);
      await this.logger.logError(turn, 'Auto-Save', error);
    }

    return errors;
  }

  /**
   * Increment turn number
   * @spec REQ-TURN-002
   */
  private async incrementTurn(newTurn: number): Promise<void> {
    await db
      .update('game_state')
      .set({ current_turn: newTurn, last_processed_at: new Date() })
      .where({ game_id: this.gameId });
  }

  private async getCurrentTurn(): Promise<number> {
    const result = await db
      .select('current_turn')
      .from('game_state')
      .where({ game_id: this.gameId })
      .first();
    return result.current_turn;
  }

  private async setTurnStatus(status: string): Promise<void> {
    await db
      .update('game_state')
      .set({ turn_processing_status: status })
      .where({ game_id: this.gameId });
  }

  private async getMilestones(): Promise<string[]> {
    // Fetch unlocked milestones from database
    const result = await db
      .select('milestone_id')
      .from('unlocked_milestones')
      .where({ game_id: this.gameId });
    return result.map((r) => r.milestone_id);
  }

  private async lockGame(winner: string, victoryType: string): Promise<void> {
    await db
      .update('game_state')
      .set({
        turn_processing_status: 'game_ended',
        winner_empire_id: winner,
        victory_type: victoryType,
      })
      .where({ game_id: this.gameId });
  }
}
```

### 1.2 Server Actions

Complete implementation of turn processing server actions:

```typescript
// src/app/actions/turn-actions.ts

"use server";

import { TurnProcessor } from '@/lib/game/services/core/turn-processor';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export interface TurnActionResult {
  success: boolean;
  turn_number?: number;
  errors?: string[];
  execution_time_ms?: number;
}

/**
 * Process next turn
 * @spec REQ-TURN-001
 */
export async function processTurnAction(
  gameId: string
): Promise<TurnActionResult> {
  try {
    const processor = new TurnProcessor(gameId);
    const result = await processor.processTurn();

    if (!result.success) {
      return {
        success: false,
        errors: ['Turn processing failed in Tier 1. Transaction rolled back.'],
      };
    }

    // Revalidate game page to show updated state
    revalidatePath(`/game/${gameId}`);

    return {
      success: true,
      turn_number: result.turn_number,
      execution_time_ms: result.execution_time_ms,
      errors: result.tier2_errors.length > 0 ? result.tier2_errors : undefined,
    };
  } catch (error) {
    console.error('Turn processing error:', error);
    return {
      success: false,
      errors: [error.message],
    };
  }
}

/**
 * Get current turn number
 */
export async function getCurrentTurnAction(
  gameId: string
): Promise<{ turn: number; maxTurns: number }> {
  const result = await db
    .select(['current_turn', 'max_turns'])
    .from('game_state')
    .where({ game_id: gameId })
    .first();

  return {
    turn: result.current_turn,
    maxTurns: result.max_turns,
  };
}

/**
 * Get turn processing status
 */
export async function getTurnStatusAction(
  gameId: string
): Promise<{ status: string; lastProcessedAt: string | null }> {
  const result = await db
    .select(['turn_processing_status', 'last_processed_at'])
    .from('game_state')
    .where({ game_id: gameId })
    .first();

  return {
    status: result.turn_processing_status,
    lastProcessedAt: result.last_processed_at?.toISOString() || null,
  };
}
```

### 1.3 UI Components

Complete UI component implementations:

```typescript
// src/components/turn/TurnCounter.tsx

import { getCurrentTurnAction } from '@/app/actions/turn-actions';

interface TurnCounterProps {
  gameId: string;
}

export async function TurnCounter({ gameId }: TurnCounterProps) {
  const { turn, maxTurns } = await getCurrentTurnAction(gameId);

  return (
    <div className="turn-counter bg-lcars-orange/20 border border-lcars-orange rounded-lg p-4">
      <div className="text-lcars-orange text-sm font-bold uppercase tracking-wider">
        Turn Progress
      </div>
      <div className="text-white text-2xl font-bold mt-1">
        {turn} / {maxTurns}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
        <div
          className="bg-lcars-orange h-2 rounded-full transition-all duration-300"
          style={{ width: `${(turn / maxTurns) * 100}%` }}
        />
      </div>
    </div>
  );
}

// src/components/turn/TurnButton.tsx

'use client';

import { useState } from 'react';
import { processTurnAction } from '@/app/actions/turn-actions';
import { TurnProcessingOverlay } from './TurnProcessingOverlay';

interface TurnButtonProps {
  gameId: string;
}

export function TurnButton({ gameId }: TurnButtonProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');

  const handleEndTurn = async () => {
    setProcessing(true);
    setError(null);
    setProgress(0);

    // Simulate progress (real implementation would use WebSocket or polling)
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 95));
    }, 50);

    try {
      const result = await processTurnAction(gameId);

      clearInterval(progressInterval);
      setProgress(100);

      if (!result.success) {
        setError(result.errors?.[0] || 'Unknown error');
        setProcessing(false);
        return;
      }

      // Show tier 2 warnings if any
      if (result.errors && result.errors.length > 0) {
        console.warn('Tier 2 errors:', result.errors);
      }

      // Small delay to show 100% progress
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      setError('Network error. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleEndTurn}
        disabled={processing}
        className="end-turn-button bg-lcars-orange hover:bg-lcars-orange-light disabled:bg-gray-600 text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg uppercase tracking-wide"
      >
        {processing ? 'Processing...' : 'End Turn'}
      </button>
      {error && (
        <div className="error-message bg-red-600 text-white px-4 py-2 rounded mt-2">
          {error}
        </div>
      )}
      <TurnProcessingOverlay
        visible={processing}
        currentPhase={currentPhase}
        progress={progress}
      />
    </>
  );
}

// src/components/turn/TurnProcessingOverlay.tsx

interface TurnProcessingOverlayProps {
  visible: boolean;
  currentPhase: string;
  progress: number; // 0-100
}

export function TurnProcessingOverlay({
  visible,
  currentPhase,
  progress,
}: TurnProcessingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 border-2 border-lcars-orange rounded-lg p-8 max-w-md w-full">
        <h2 className="text-lcars-orange text-2xl font-bold mb-4 text-center">
          PROCESSING TURN
        </h2>
        <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-lcars-orange h-4 transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-center text-sm">
          {Math.round(progress)}% Complete
        </p>
        {currentPhase && (
          <p className="text-gray-400 text-center text-xs mt-2">
            {currentPhase}
          </p>
        )}
      </div>
    </div>
  );
}

// src/components/turn/TurnNotifications.tsx

'use client';

import { useEffect, useState } from 'react';

interface TurnNotification {
  type: 'success' | 'warning' | 'error';
  message: string;
}

interface TurnNotificationsProps {
  notifications: TurnNotification[];
}

export function TurnNotifications({ notifications }: TurnNotificationsProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (notifications.length > 0) {
      setVisible(true);
    }
  }, [notifications]);

  if (!visible || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-40 max-w-md">
      {notifications.map((notif, idx) => (
        <div
          key={idx}
          className={`mb-2 p-4 rounded-lg border ${
            notif.type === 'success'
              ? 'bg-green-900/80 border-green-500'
              : notif.type === 'warning'
              ? 'bg-yellow-900/80 border-yellow-500'
              : 'bg-red-900/80 border-red-500'
          } animate-slide-in`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notif.type === 'success' && <span className="text-green-500">✓</span>}
              {notif.type === 'warning' && <span className="text-yellow-500">⚠</span>}
              {notif.type === 'error' && <span className="text-red-500">✗</span>}
            </div>
            <div className="ml-3 text-white text-sm">{notif.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 2. Database Schema

Complete database schema for turn processing system:

```sql
-- ============================================================
-- TURN PROCESSING SYSTEM - DATABASE SCHEMA
-- ============================================================

-- Table: game_state
-- Purpose: Store current turn number and processing status
CREATE TABLE game_state (
  game_id UUID PRIMARY KEY,
  current_turn INTEGER NOT NULL DEFAULT 0,
  max_turns INTEGER NOT NULL DEFAULT 500,
  turn_processing_status VARCHAR(20) DEFAULT 'idle',  -- idle, processing, error, game_ended
  last_processed_at TIMESTAMPTZ,
  winner_empire_id UUID,  -- Set when game ends
  victory_type VARCHAR(50),  -- Military, Economic, Diplomatic, Research, Covert, Survival
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
ALTER TABLE game_state ADD CONSTRAINT chk_turn_range CHECK (current_turn >= 0 AND current_turn <= max_turns);
ALTER TABLE game_state ADD CONSTRAINT chk_turn_processing_status CHECK (turn_processing_status IN ('idle', 'processing', 'error', 'game_ended'));

-- Indexes
CREATE INDEX idx_game_state_status ON game_state(turn_processing_status);

-- ============================================================

-- Table: empires
-- Purpose: Store empire state (resources, population, morale, etc.)
CREATE TABLE empires (
  empire_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES game_state(game_id) ON DELETE CASCADE,
  empire_name VARCHAR(100) NOT NULL,
  is_player BOOLEAN DEFAULT FALSE,
  archetype VARCHAR(50),  -- Warlord, Diplomat, Merchant, Schemer, Turtle, Blitzkrieg, Tech Rush, Opportunist

  -- Resources (updated in Phase 1: Income)
  credits BIGINT DEFAULT 1000 CHECK (credits >= 0),
  ore BIGINT DEFAULT 500 CHECK (ore >= 0),
  food BIGINT DEFAULT 300 CHECK (food >= 0),

  -- Population (updated in Phase 3: Population)
  population BIGINT DEFAULT 1000 CHECK (population >= 0),

  -- Morale (updated in Phase 4: Civil Status)
  morale INTEGER DEFAULT 75 CHECK (morale >= 0 AND morale <= 100),
  civil_status VARCHAR(20) DEFAULT 'Content' CHECK (civil_status IN ('Happy', 'Content', 'Unrest', 'Rebellion')),

  -- Research (updated in Phase 5: Research)
  current_research_id UUID,  -- Foreign key to research_projects table (defined elsewhere)
  research_progress INTEGER DEFAULT 0 CHECK (research_progress >= 0),

  -- Covert (updated in Phase 7: Covert)
  spy_points INTEGER DEFAULT 0 CHECK (spy_points >= 0 AND spy_points <= 500),

  -- Victory tracking
  victory_points INTEGER DEFAULT 0 CHECK (victory_points >= 0),
  sectors_controlled INTEGER DEFAULT 1 CHECK (sectors_controlled >= 0),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_empires_game_id ON empires(game_id);
CREATE INDEX idx_empires_is_player ON empires(is_player);
CREATE INDEX idx_empires_victory_points ON empires(victory_points DESC);
CREATE INDEX idx_empires_archetype ON empires(archetype);

-- ============================================================

-- Table: build_queue
-- Purpose: Track units/buildings in production (Phase 6: Build Queue)
CREATE TABLE build_queue (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(empire_id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('unit', 'building')),
  item_id VARCHAR(100) NOT NULL,  -- Reference to unit/building definition
  turns_remaining INTEGER NOT NULL CHECK (turns_remaining >= 0),
  cost_paid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_build_queue_empire_id ON build_queue(empire_id);
CREATE INDEX idx_build_queue_turns ON build_queue(turns_remaining);

-- ============================================================

-- Table: crafting_queue
-- Purpose: Track crafting items in production (Phase 8: Crafting)
CREATE TABLE crafting_queue (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(empire_id) ON DELETE CASCADE,
  recipe_id VARCHAR(100) NOT NULL,  -- Reference to crafting recipe definition
  turns_remaining INTEGER NOT NULL CHECK (turns_remaining >= 0),
  input_resources JSONB,  -- Resources consumed when queued
  output_item JSONB,  -- Item to be produced
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crafting_queue_empire_id ON crafting_queue(empire_id);
CREATE INDEX idx_crafting_queue_turns ON crafting_queue(turns_remaining);

-- ============================================================

-- Table: bot_emotions
-- Purpose: Store bot emotional states (Phase 10: Emotional Decay)
CREATE TABLE bot_emotions (
  emotion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_empire_id UUID NOT NULL REFERENCES empires(empire_id) ON DELETE CASCADE,
  target_empire_id UUID NOT NULL REFERENCES empires(empire_id) ON DELETE CASCADE,
  emotion_type VARCHAR(20) NOT NULL CHECK (emotion_type IN ('anger', 'gratitude', 'fear')),
  intensity INTEGER DEFAULT 0 CHECK (intensity >= 0 AND intensity <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
ALTER TABLE bot_emotions ADD CONSTRAINT chk_not_self_emotion CHECK (bot_empire_id != target_empire_id);

-- Indexes
CREATE INDEX idx_bot_emotions_bot_id ON bot_emotions(bot_empire_id);
CREATE INDEX idx_bot_emotions_target_id ON bot_emotions(target_empire_id);
CREATE INDEX idx_bot_emotions_type ON bot_emotions(emotion_type);
CREATE UNIQUE INDEX idx_bot_emotions_unique ON bot_emotions(bot_empire_id, target_empire_id, emotion_type);

-- ============================================================

-- Table: bot_memories
-- Purpose: Store bot memories for AI decision-making (Phase 11: Memory Cleanup)
CREATE TABLE bot_memories (
  memory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_empire_id UUID NOT NULL REFERENCES empires(empire_id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  event_type VARCHAR(50) NOT NULL,  -- attack, trade, alliance, betrayal, etc.
  importance INTEGER DEFAULT 1 CHECK (importance >= 1 AND importance <= 10),
  memory_data JSONB,  -- Flexible storage for event details (who, what, where, outcome)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bot_memories_bot_id ON bot_memories(bot_empire_id);
CREATE INDEX idx_bot_memories_turn ON bot_memories(turn_number);
CREATE INDEX idx_bot_memories_importance ON bot_memories(importance);
CREATE INDEX idx_bot_memories_event_type ON bot_memories(event_type);

-- ============================================================

-- Table: market_prices
-- Purpose: Track resource prices (Phase 12: Market)
CREATE TABLE market_prices (
  price_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES game_state(game_id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,  -- credits, ore, food
  current_price DECIMAL(10, 2) DEFAULT 1.0 CHECK (current_price >= 0.5 AND current_price <= 2.0),
  supply_last_turn BIGINT DEFAULT 0,
  demand_last_turn BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_market_prices_game_id ON market_prices(game_id);
CREATE UNIQUE INDEX idx_market_prices_resource ON market_prices(game_id, resource_type);

-- ============================================================

-- Table: turn_processing_log
-- Purpose: Log phase execution for debugging and monitoring
CREATE TABLE turn_processing_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES game_state(game_id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  phase_name VARCHAR(50) NOT NULL,
  phase_number INTEGER NOT NULL CHECK (phase_number >= 1 AND phase_number <= 17),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'started')),
  execution_time_ms INTEGER,  -- NULL for 'started' status
  error_message TEXT,  -- Only populated for 'error' status
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_turn_log_game_turn ON turn_processing_log(game_id, turn_number);
CREATE INDEX idx_turn_log_status ON turn_processing_log(status);
CREATE INDEX idx_turn_log_phase ON turn_processing_log(phase_number);

-- ============================================================

-- Table: unlocked_milestones
-- Purpose: Track which milestones are unlocked (affects Phase 14-15)
CREATE TABLE unlocked_milestones (
  unlock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES game_state(game_id) ON DELETE CASCADE,
  milestone_id VARCHAR(20) NOT NULL,  -- M01, M02, ..., M11
  unlocked_at_turn INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_milestones_game_id ON unlocked_milestones(game_id);
CREATE UNIQUE INDEX idx_milestones_unique ON unlocked_milestones(game_id, milestone_id);

-- ============================================================

-- Table: game_events_log
-- Purpose: Log galactic events (Phase 14: Galactic Events)
CREATE TABLE game_events_log (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES game_state(game_id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  event_type VARCHAR(50) NOT NULL,  -- asteroid_strike, pirate_raid, tech_breakthrough, etc.
  affected_empire_id UUID REFERENCES empires(empire_id) ON DELETE SET NULL,
  event_data JSONB,  -- Flexible storage for event details
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_game_turn ON game_events_log(game_id, turn_number);
CREATE INDEX idx_events_type ON game_events_log(event_type);
CREATE INDEX idx_events_affected ON game_events_log(affected_empire_id);

-- ============================================================

-- Table: coalitions
-- Purpose: Track anti-leader coalitions (Phase 15: Alliance Checkpoints)
CREATE TABLE coalitions (
  coalition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES game_state(game_id) ON DELETE CASCADE,
  target_empire_id UUID NOT NULL REFERENCES empires(empire_id) ON DELETE CASCADE,
  formed_at_turn INTEGER NOT NULL,
  dissolved_at_turn INTEGER,  -- NULL if still active
  reason VARCHAR(100),  -- "Leader reached 7 VP", "Target eliminated", etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coalitions_game_id ON coalitions(game_id);
CREATE INDEX idx_coalitions_target ON coalitions(target_empire_id);
CREATE INDEX idx_coalitions_active ON coalitions(dissolved_at_turn) WHERE dissolved_at_turn IS NULL;

-- Table: coalition_members
-- Purpose: Track which empires are in each coalition
CREATE TABLE coalition_members (
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coalition_id UUID NOT NULL REFERENCES coalitions(coalition_id) ON DELETE CASCADE,
  empire_id UUID NOT NULL REFERENCES empires(empire_id) ON DELETE CASCADE,
  joined_at_turn INTEGER NOT NULL,
  left_at_turn INTEGER,  -- NULL if still member
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
ALTER TABLE coalition_members ADD CONSTRAINT chk_coalition_join_leave CHECK (left_at_turn IS NULL OR left_at_turn >= joined_at_turn);

-- Indexes
CREATE INDEX idx_coalition_members_coalition ON coalition_members(coalition_id);
CREATE INDEX idx_coalition_members_empire ON coalition_members(empire_id);
CREATE UNIQUE INDEX idx_coalition_members_active ON coalition_members(coalition_id, empire_id) WHERE left_at_turn IS NULL;

-- ============================================================

-- PERFORMANCE OPTIMIZATIONS
-- ============================================================

-- Batch update function for income phase (Phase 1)
CREATE OR REPLACE FUNCTION batch_update_income(p_game_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE empires e
  SET
    credits = credits + (
      (SELECT COUNT(*) FROM sectors s WHERE s.empire_id = e.empire_id) * 100 *
      CASE e.civil_status
        WHEN 'Happy' THEN 1.2
        WHEN 'Content' THEN 1.0
        WHEN 'Unrest' THEN 0.8
        WHEN 'Rebellion' THEN 0.5
      END
    ),
    ore = ore + (
      (SELECT COUNT(*) FROM sectors s WHERE s.empire_id = e.empire_id) * 50 *
      CASE e.civil_status
        WHEN 'Happy' THEN 1.2
        WHEN 'Content' THEN 1.0
        WHEN 'Unrest' THEN 0.8
        WHEN 'Rebellion' THEN 0.5
      END
    ),
    food = food + (
      (SELECT COUNT(*) FROM sectors s WHERE s.empire_id = e.empire_id) * 75 *
      CASE e.civil_status
        WHEN 'Happy' THEN 1.2
        WHEN 'Content' THEN 1.0
        WHEN 'Unrest' THEN 0.8
        WHEN 'Rebellion' THEN 0.5
      END
    ),
    updated_at = NOW()
  WHERE e.game_id = p_game_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================

-- Cleanup old logs (run periodically by admin)
CREATE OR REPLACE FUNCTION cleanup_old_turn_logs(p_game_id UUID, p_keep_last_turns INTEGER DEFAULT 50)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH current_turn AS (
    SELECT current_turn FROM game_state WHERE game_id = p_game_id
  )
  DELETE FROM turn_processing_log
  WHERE game_id = p_game_id
    AND turn_number < (SELECT current_turn FROM current_turn) - p_keep_last_turns;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
```

---

## 3. Implementation Details

### 3.1 Phase Implementation Template

Template for implementing individual phase processors:

```typescript
// src/lib/game/services/phases/[phase-name]-phase.ts

import { db, Transaction } from '@/lib/db';

export interface PhaseResult {
  success: boolean;
  errors?: string[];
  affectedEmpires?: string[];
}

export abstract class BasePhase {
  protected gameId: string;

  constructor(gameId: string) {
    this.gameId = gameId;
  }

  /**
   * Process the phase
   * @param transaction - Database transaction (Tier 1 only)
   */
  abstract process(transaction?: Transaction): Promise<PhaseResult>;

  /**
   * Get all empires in this game
   */
  protected async getEmpires(transaction?: Transaction): Promise<Empire[]> {
    const query = db
      .select('*')
      .from('empires')
      .where({ game_id: this.gameId });

    if (transaction) {
      return await query.transacting(transaction);
    }
    return await query;
  }
}

// Example: Income Phase implementation
export class IncomePhase extends BasePhase {
  async process(transaction: Transaction): Promise<PhaseResult> {
    try {
      const empires = await this.getEmpires(transaction);

      for (const empire of empires) {
        const sectorCount = await this.getSectorCount(empire.empire_id, transaction);
        const multiplier = this.getCivilStatusMultiplier(empire.civil_status);

        const creditsIncome = 100 * sectorCount * multiplier;
        const oreIncome = 50 * sectorCount * multiplier;
        const foodIncome = 75 * sectorCount * multiplier;

        await db
          .update('empires')
          .set({
            credits: empire.credits + creditsIncome,
            ore: empire.ore + oreIncome,
            food: empire.food + foodIncome,
            updated_at: new Date(),
          })
          .where({ empire_id: empire.empire_id })
          .transacting(transaction);
      }

      return {
        success: true,
        affectedEmpires: empires.map((e) => e.empire_id),
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
      };
    }
  }

  private async getSectorCount(
    empireId: string,
    transaction: Transaction
  ): Promise<number> {
    const result = await db
      .count('* as count')
      .from('sectors')
      .where({ empire_id: empireId })
      .transacting(transaction)
      .first();
    return result.count;
  }

  private getCivilStatusMultiplier(civilStatus: string): number {
    switch (civilStatus) {
      case 'Happy':
        return 1.2;
      case 'Content':
        return 1.0;
      case 'Unrest':
        return 0.8;
      case 'Rebellion':
        return 0.5;
      default:
        return 1.0;
    }
  }
}
```

### 3.2 Turn Logger Implementation

```typescript
// src/lib/game/services/core/turn-logger.ts

import { db } from '@/lib/db';

export class TurnLogger {
  private gameId: string;

  constructor(gameId: string) {
    this.gameId = gameId;
  }

  async logPhaseStart(
    turn: number,
    phaseName: string,
    phaseNumber: number
  ): Promise<void> {
    await db.insert('turn_processing_log').values({
      game_id: this.gameId,
      turn_number: turn,
      phase_name: phaseName,
      phase_number: phaseNumber,
      status: 'started',
    });
  }

  async logPhaseEnd(
    turn: number,
    phaseName: string,
    phaseNumber: number,
    status: 'success' | 'error',
    executionTimeMs?: number,
    errorMessage?: string
  ): Promise<void> {
    await db.insert('turn_processing_log').values({
      game_id: this.gameId,
      turn_number: turn,
      phase_name: phaseName,
      phase_number: phaseNumber,
      status,
      execution_time_ms: executionTimeMs,
      error_message: errorMessage,
    });
  }

  async logError(
    turn: number,
    phaseName: string,
    error: Error
  ): Promise<void> {
    console.error(`[Turn ${turn}] ${phaseName} error:`, error);
    await db.insert('turn_processing_log').values({
      game_id: this.gameId,
      turn_number: turn,
      phase_name: phaseName,
      phase_number: 0,
      status: 'error',
      error_message: error.message + '\n' + error.stack,
    });
  }

  logPerformance(data: {
    turn: number;
    tier1_time_ms: number;
    tier2_time_ms: number;
    total_time_ms: number;
    phase_timings: Record<string, number>;
  }): void {
    console.log(`[Turn ${data.turn}] Performance Report:`, {
      tier1: `${data.tier1_time_ms}ms`,
      tier2: `${data.tier2_time_ms}ms`,
      total: `${data.total_time_ms}ms`,
      budget_remaining: `${2000 - data.total_time_ms}ms`,
      phases: data.phase_timings,
    });
  }
}
```

---

**Appendix Complete**
**Version:** 1.0
**Created:** 2026-01-12
