/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — State Persistence Implementation

   InMemoryStatePersistence: implements IStatePersistence using
   an in-memory Map. Suitable for testing and as a base for
   localStorage/IndexedDB/SQLite adapters.
   ══════════════════════════════════════════════════════════════ */

import type { GameState } from "../types/game-state";
import type { IStatePersistence } from "../interfaces";
import { serializeGameState, deserializeGameState } from "./state-serializer";

interface SaveEntry {
  id: string;
  name: string;
  savedAt: string;
  json: string;
}

/**
 * In-memory implementation of IStatePersistence.
 * Uses serializeGameState/deserializeGameState for Map/Set round-tripping.
 */
export class InMemoryStatePersistence implements IStatePersistence {
  private store = new Map<string, SaveEntry>();

  async save(state: GameState): Promise<void> {
    const now = new Date().toISOString();
    const savedState: GameState = {
      ...state,
      campaign: { ...state.campaign, lastSavedAt: now },
    };
    const json = serializeGameState(savedState);
    this.store.set(state.campaign.id, {
      id: state.campaign.id,
      name: state.campaign.name,
      savedAt: now,
      json,
    });
  }

  async load(campaignId: string): Promise<GameState | null> {
    const entry = this.store.get(campaignId);
    if (!entry) return null;
    return deserializeGameState(entry.json);
  }

  async listSaves(): Promise<Array<{ id: string; name: string; savedAt: string }>> {
    return Array.from(this.store.values()).map(({ id, name, savedAt }) => ({
      id,
      name,
      savedAt,
    }));
  }

  async deleteSave(campaignId: string): Promise<void> {
    this.store.delete(campaignId);
  }
}
