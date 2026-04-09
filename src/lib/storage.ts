import { Category, Player, DEFAULT_PRESET_NAMES } from "./types";

const CUSTOM_CATEGORIES_KEY = "imposter-custom-categories";
const PRESET_PLAYERS_KEY = "imposter-preset-players";
const PLAYER_SUGGESTIONS_KEY = "imposter-player-suggestions";
const INITIALIZED_KEY = "imposter-initialized";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function hasDefaultPresetPlayers(players: Player[]): boolean {
  if (players.length !== DEFAULT_PRESET_NAMES.length) return false;
  return DEFAULT_PRESET_NAMES.every((name) =>
    players.some((player) => player.name.toLowerCase() === name.toLowerCase()),
  );
}

function ensureSuggestionSeed(): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(PLAYER_SUGGESTIONS_KEY);
  if (!existing) {
    localStorage.setItem(
      PLAYER_SUGGESTIONS_KEY,
      JSON.stringify(DEFAULT_PRESET_NAMES),
    );
  }
}

export function getCustomCategories(): Category[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCustomCategory(category: Category): void {
  const categories = getCustomCategories();
  const index = categories.findIndex((c) => c.id === category.id);
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
}

export function deleteCustomCategory(id: string): void {
  const categories = getCustomCategories().filter((c) => c.id !== id);
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
}

export function getPresetPlayers(): Player[] {
  if (typeof window === "undefined") return [];

  const initialized = localStorage.getItem(INITIALIZED_KEY);
  if (!initialized) {
    localStorage.setItem(PRESET_PLAYERS_KEY, JSON.stringify([]));
    ensureSuggestionSeed();
    localStorage.setItem(INITIALIZED_KEY, "1");
    return [];
  }

  ensureSuggestionSeed();

  const data = localStorage.getItem(PRESET_PLAYERS_KEY);
  const players = data ? (JSON.parse(data) as Player[]) : [];

  // Migrate older installs that stored default suggestions as active players.
  if (hasDefaultPresetPlayers(players)) {
    localStorage.setItem(PRESET_PLAYERS_KEY, JSON.stringify([]));
    return [];
  }

  return players;
}

export function savePresetPlayers(players: Player[]): void {
  localStorage.setItem(PRESET_PLAYERS_KEY, JSON.stringify(players));
}

export function getPlayerSuggestions(): string[] {
  if (typeof window === "undefined") return DEFAULT_PRESET_NAMES;

  const data = localStorage.getItem(PLAYER_SUGGESTIONS_KEY);
  if (!data) {
    localStorage.setItem(
      PLAYER_SUGGESTIONS_KEY,
      JSON.stringify(DEFAULT_PRESET_NAMES),
    );
    return DEFAULT_PRESET_NAMES;
  }

  try {
    const parsed = JSON.parse(data) as string[];
    return parsed.length > 0 ? parsed : DEFAULT_PRESET_NAMES;
  } catch {
    return DEFAULT_PRESET_NAMES;
  }
}

export function savePlayerSuggestions(names: string[]): void {
  localStorage.setItem(PLAYER_SUGGESTIONS_KEY, JSON.stringify(names));
}

export function addPlayerSuggestion(name: string): string[] {
  const normalized = name.trim();
  if (!normalized) return getPlayerSuggestions();

  const suggestions = getPlayerSuggestions();
  if (
    suggestions.some(
      (existing) => existing.toLowerCase() === normalized.toLowerCase(),
    )
  ) {
    return suggestions;
  }

  const updated = [...suggestions, normalized];
  savePlayerSuggestions(updated);
  return updated;
}
