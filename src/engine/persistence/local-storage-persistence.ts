/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — LocalStorage Persistence Adapter

   Implements IStatePersistence using browser localStorage.
   Falls back gracefully if localStorage is unavailable.
   ══════════════════════════════════════════════════════════════ */

import type { GameState } from "../types/game-state";
import type { IStatePersistence } from "../interfaces";
import { serializeGameState, deserializeGameState } from "./state-serializer";

const STORAGE_PREFIX = "nexus-dominion-save-";
const INDEX_KEY = "nexus-dominion-save-index";

interface SaveIndexEntry {
  id: string;
  name: string;
  savedAt: string;
}

export class LocalStoragePersistence implements IStatePersistence {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const test = "__nexus_test__";
      localStorage.setItem(test, "1");
      localStorage.removeItem(test);
      return true;
    } catch {
      console.warn("[Persistence] localStorage not available, saves will not persist.");
      return false;
    }
  }

  private getIndex(): SaveIndexEntry[] {
    if (!this.isAvailable) return [];
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private setIndex(entries: SaveIndexEntry[]): void {
    if (!this.isAvailable) return;
    localStorage.setItem(INDEX_KEY, JSON.stringify(entries));
  }

  async save(state: GameState): Promise<void> {
    if (!this.isAvailable) return;

    const now = new Date().toISOString();
    const savedState: GameState = {
      ...state,
      campaign: { ...state.campaign, lastSavedAt: now },
    };

    const json = serializeGameState(savedState);
    const key = STORAGE_PREFIX + state.campaign.id;

    try {
      localStorage.setItem(key, json);

      // Update index
      const index = this.getIndex();
      const existing = index.findIndex((e) => e.id === state.campaign.id);
      const entry: SaveIndexEntry = {
        id: state.campaign.id,
        name: state.campaign.name,
        savedAt: now,
      };

      if (existing >= 0) {
        index[existing] = entry;
      } else {
        index.push(entry);
      }
      this.setIndex(index);
    } catch (e) {
      console.error("[Persistence] Save failed:", e);
    }
  }

  async load(campaignId: string): Promise<GameState | null> {
    if (!this.isAvailable) return null;

    try {
      const json = localStorage.getItem(STORAGE_PREFIX + campaignId);
      if (!json) return null;
      return deserializeGameState(json);
    } catch (e) {
      console.error("[Persistence] Load failed:", e);
      return null;
    }
  }

  async listSaves(): Promise<Array<{ id: string; name: string; savedAt: string }>> {
    return this.getIndex();
  }

  async deleteSave(campaignId: string): Promise<void> {
    if (!this.isAvailable) return;

    localStorage.removeItem(STORAGE_PREFIX + campaignId);
    const index = this.getIndex().filter((e) => e.id !== campaignId);
    this.setIndex(index);
  }
}
