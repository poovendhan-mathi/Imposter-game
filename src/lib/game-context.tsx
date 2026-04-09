"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { GameState, GameConfig } from "./types";
import { initGame } from "./game-logic";

interface GameContextType {
  gameState: GameState | null;
  startGame: (config: GameConfig) => void;
  nextPlayer: () => void;
  setPhase: (phase: GameState["phase"]) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const startGame = useCallback((config: GameConfig) => {
    const state = initGame(config);
    setGameState(state);
  }, []);

  const nextPlayer = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return null;
      const nextIndex = prev.currentPlayerIndex + 1;
      if (nextIndex >= prev.playerOrder.length) {
        return { ...prev, phase: "discussion" };
      }
      return { ...prev, currentPlayerIndex: nextIndex, phase: "ready" };
    });
  }, []);

  const setPhase = useCallback((phase: GameState["phase"]) => {
    setGameState((prev) => (prev ? { ...prev, phase } : null));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(null);
  }, []);

  return (
    <GameContext.Provider
      value={{ gameState, startGame, nextPlayer, setPhase, resetGame }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
