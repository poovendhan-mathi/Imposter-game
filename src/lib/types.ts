export interface Category {
  id: string;
  name: string;
  icon: string;
  words: string[];
  isCustom?: boolean;
}

export interface Player {
  id: string;
  name: string;
}

export interface GameConfig {
  players: Player[];
  categoryIds: string[];
  imposterCount: 1 | 2;
}

export interface GameState {
  config: GameConfig;
  word: string;
  categoryName: string;
  categoryIcon: string;
  imposterIds: string[];
  playerOrder: Player[];
  currentPlayerIndex: number;
  phase: "ready" | "reveal" | "transition" | "discussion" | "result";
  revealedPlayers: string[];
}

export const DEFAULT_PRESET_NAMES = [
  "Pooven",
  "Hari",
  "Sanja",
  "Akash",
  "Sathish",
];
