/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Game State Context & Hook
   
   Provides centralised state access to all React components.
   The actual state is managed via useReducer internally.
   ══════════════════════════════════════════════════════════════ */

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { GameState } from "../engine/types";

/* ── Actions ── */

export type GameAction =
    | { type: "SET_STATE"; state: GameState }
    | { type: "ADVANCE_CYCLE"; nextState: GameState }
    | { type: "RESET" };

/* ── Reducer ── */

function gameReducer(state: GameState | null, action: GameAction): GameState | null {
    switch (action.type) {
        case "SET_STATE":
            return action.state;
        case "ADVANCE_CYCLE":
            return action.nextState;
        case "RESET":
            return null;
        default:
            return state;
    }
}

/* ── Context ── */

interface GameStateContextValue {
    state: GameState | null;
    dispatch: React.Dispatch<GameAction>;
    /** Whether a game is currently loaded */
    isLoaded: boolean;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

/* ── Provider ── */

export function GameStateProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, null);

    return (
        <GameStateContext.Provider value={{ state, dispatch, isLoaded: state !== null }}>
            {children}
        </GameStateContext.Provider>
    );
}

/* ── Hook ── */

export function useGameState(): GameStateContextValue {
    const ctx = useContext(GameStateContext);
    if (!ctx) {
        throw new Error("useGameState must be used within a <GameStateProvider>");
    }
    return ctx;
}

/** Hook that asserts the game is loaded and returns a non-null state */
export function useLoadedGameState(): { state: GameState; dispatch: React.Dispatch<GameAction> } {
    const { state, dispatch } = useGameState();
    if (!state) {
        throw new Error("useLoadedGameState called before a game is loaded");
    }
    return { state, dispatch };
}
