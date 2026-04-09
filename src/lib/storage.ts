import { Category, Player, DEFAULT_PRESET_NAMES } from "./types";

const CUSTOM_CATEGORIES_KEY = "imposter-custom-categories";
const PRESET_PLAYERS_KEY = "imposter-preset-players";
const INITIALIZED_KEY = "imposter-initialized";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
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

  // Initialize default presets on first visit
  const initialized = localStorage.getItem(INITIALIZED_KEY);
  if (!initialized) {
    const defaults: Player[] = DEFAULT_PRESET_NAMES.map((name) => ({
      id: generateId(),
      name,
    }));
    localStorage.setItem(PRESET_PLAYERS_KEY, JSON.stringify(defaults));
    localStorage.setItem(INITIALIZED_KEY, "1");
    return defaults;
  }

  const data = localStorage.getItem(PRESET_PLAYERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePresetPlayers(players: Player[]): void {
  localStorage.setItem(PRESET_PLAYERS_KEY, JSON.stringify(players));
}
