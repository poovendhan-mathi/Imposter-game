import { GameConfig, GameState, Category } from "./types";
import builtInCategories from "@/data/categories.json";
import wordHints from "@/data/word-hints.json";
import { getCustomCategories } from "./storage";

type WordHintEntry = {
  categoryId: string;
  word: string;
  hint: string;
};

const wordHintLookup = new Map(
  (wordHints as WordHintEntry[]).map((entry) => [
    `${entry.categoryId}::${entry.word}`,
    entry.hint,
  ]),
);

export function getAllCategories(): Category[] {
  const custom = getCustomCategories().map((c) => ({ ...c, isCustom: true }));
  return [...(builtInCategories as Category[]), ...custom];
}

/** Cryptographically secure random integer in [0, max) */
function secureRandom(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

/** Fisher-Yates shuffle using crypto random */
function secureShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function initGame(config: GameConfig): GameState {
  const allCategories = getAllCategories();

  // Collect words from all selected categories (or random)
  let selectedCategories: Category[] = [];
  if (config.categoryIds.includes("random")) {
    const idx = secureRandom(allCategories.length);
    selectedCategories = [allCategories[idx]];
  } else {
    selectedCategories = allCategories.filter((c) =>
      config.categoryIds.includes(c.id),
    );
  }

  if (selectedCategories.length === 0)
    throw new Error("No categories selected");

  // Pick a random category from selected, then a random word
  const category = selectedCategories[secureRandom(selectedCategories.length)];
  const word = category.words[secureRandom(category.words.length)];
  const wordHint =
    wordHintLookup.get(`${category.id}::${word}`) ?? "Related clue unavailable";

  // Cryptographically shuffle players for play order
  const playerOrder = secureShuffle(config.players);

  // Select imposters independently from the reveal order
  const imposterPool = secureShuffle(config.players);
  const imposterIds = imposterPool
    .slice(0, config.imposterCount)
    .map((p) => p.id);

  // Pick a separate random discussion starter so the first speaker is independent too
  const discussionStarterIndex = secureRandom(playerOrder.length);

  return {
    config,
    word,
    wordHint,
    categoryName: category.name,
    categoryIcon: category.icon,
    imposterIds,
    playerOrder,
    discussionStarterIndex,
    currentPlayerIndex: 0,
    phase: "ready",
    revealedPlayers: [],
  };
}

export function getPlayerRole(
  state: GameState,
  playerIndex: number,
): { isImposter: boolean; word: string; hint: string } {
  const player = state.playerOrder[playerIndex];
  const isImposter = state.imposterIds.includes(player.id);
  return {
    isImposter,
    word: isImposter ? "" : state.word,
    hint: state.wordHint,
  };
}
