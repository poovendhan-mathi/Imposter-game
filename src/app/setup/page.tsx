"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import GlowButton from "@/components/ui/GlowButton";
import CategoryCard from "@/components/ui/CategoryCard";
import PlayerChip from "@/components/ui/PlayerChip";
import { useGame } from "@/lib/game-context";
import { getAllCategories } from "@/lib/game-logic";
import { getPresetPlayers, savePresetPlayers } from "@/lib/storage";
import { Player, Category, DEFAULT_PRESET_NAMES } from "@/lib/types";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function SetupPage() {
  const router = useRouter();
  const { startGame } = useGame();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(
    new Set(),
  );
  const [newPlayerName, setNewPlayerName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(),
  );
  const [imposterCount, setImposterCount] = useState<1 | 2>(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const preset = getPresetPlayers();
    if (preset.length > 0) {
      setPlayers(preset);
      setSelectedPlayerIds(new Set(preset.map((p) => p.id)));
    }
    setCategories(getAllCategories());
  }, []);

  // Filter out names already in the players list for suggestions
  const availableSuggestions = DEFAULT_PRESET_NAMES.filter(
    (name) => !players.some((p) => p.name.toLowerCase() === name.toLowerCase()),
  );

  const addPlayer = useCallback(() => {
    const name = newPlayerName.trim();
    if (!name || name.length > 15) return;
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      return;
    const id = generateId();
    const newPlayer = { id, name };
    const updated = [...players, newPlayer];
    setPlayers(updated);
    setSelectedPlayerIds((prev) => new Set([...prev, id]));
    savePresetPlayers(updated);
    setNewPlayerName("");
  }, [newPlayerName, players]);

  const addSuggestedPlayer = useCallback(
    (name: string) => {
      const id = generateId();
      const newPlayer = { id, name };
      const updated = [...players, newPlayer];
      setPlayers(updated);
      setSelectedPlayerIds((prev) => new Set([...prev, id]));
      savePresetPlayers(updated);
    },
    [players],
  );

  const deletePlayer = useCallback(
    (id: string) => {
      const updated = players.filter((p) => p.id !== id);
      setPlayers(updated);
      setSelectedPlayerIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      savePresetPlayers(updated);
    },
    [players],
  );

  const togglePlayer = useCallback((id: string) => {
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (id === "random") {
        if (next.has("random")) {
          next.delete("random");
        } else {
          next.clear();
          next.add("random");
        }
      } else {
        next.delete("random");
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, []);

  const selectedPlayers = players.filter((p) => selectedPlayerIds.has(p.id));
  const canStart =
    selectedPlayers.length >= 3 &&
    selectedCategoryIds.size > 0 &&
    (imposterCount === 1 || selectedPlayers.length >= 5);

  const handleStart = () => {
    if (!canStart) return;
    startGame({
      players: selectedPlayers,
      categoryIds: Array.from(selectedCategoryIds),
      imposterCount,
    });
    router.push("/play");
  };

  return (
    <PageWrapper className="flex flex-col px-5 py-6 safe-top safe-bottom">
      <div className="max-w-lg mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-foreground/50 hover:text-nova transition-colors text-xl cursor-pointer"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-nova glow-text-nova">
            Game Setup
          </h1>
        </div>

        {/* Players Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
              Players ({selectedPlayers.length})
            </h2>
            {selectedPlayers.length < 3 && (
              <span className="text-xs text-rose/70">Min 3 required</span>
            )}
          </div>

          {/* Player chips */}
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {players.map((player) => (
                <PlayerChip
                  key={player.id}
                  name={player.name}
                  selected={selectedPlayerIds.has(player.id)}
                  onToggle={() => togglePlayer(player.id)}
                  onDelete={() => deletePlayer(player.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Suggested names */}
          {availableSuggestions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-xs text-nova/50 hover:text-nova/80 transition-colors text-left cursor-pointer"
              >
                {showSuggestions ? "▾ Hide" : "▸ Quick add"} suggestions
              </button>
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-1.5 overflow-hidden"
                  >
                    {availableSuggestions.map((name) => (
                      <motion.button
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addSuggestedPlayer(name)}
                        className="px-3 py-1.5 rounded-full border border-dashed border-nova/25
                          bg-nova/5 text-xs text-nova/70 hover:bg-nova/10 hover:border-nova/40
                          transition-all cursor-pointer"
                      >
                        + {name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Add player */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              placeholder="Player name..."
              maxLength={15}
              className="flex-1 bg-surface border border-border rounded-2xl px-4 py-2.5
                text-sm text-foreground placeholder:text-foreground/30
                focus:border-nova/40 focus:outline-none transition-colors"
            />
            <GlowButton
              color="nova"
              size="sm"
              onClick={addPlayer}
              disabled={!newPlayerName.trim()}
            >
              Add
            </GlowButton>
          </div>
        </section>

        {/* Category Section — multi-select */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
              Categories
            </h2>
            <span className="text-xs text-foreground/30">
              {selectedCategoryIds.size === 0
                ? "Select one or more"
                : selectedCategoryIds.has("random")
                  ? "Random"
                  : `${selectedCategoryIds.size} selected`}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <CategoryCard
              name="Random"
              icon="🎲"
              selected={selectedCategoryIds.has("random")}
              onClick={() => toggleCategory("random")}
            />
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                icon={cat.icon}
                selected={selectedCategoryIds.has(cat.id)}
                onClick={() => toggleCategory(cat.id)}
                isCustom={cat.isCustom}
              />
            ))}
          </div>
        </section>

        {/* Imposter Count */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
            Imposters
          </h2>
          <div className="flex gap-3">
            {([1, 2] as const).map((count) => (
              <motion.button
                key={count}
                whileTap={{ scale: 0.95 }}
                onClick={() => setImposterCount(count)}
                disabled={count === 2 && selectedPlayers.length < 5}
                className={`
                  flex-1 py-3 rounded-2xl border text-center font-semibold transition-all duration-300 cursor-pointer
                  backdrop-blur-sm
                  ${
                    imposterCount === count
                      ? "border-rose/60 bg-rose/15 text-rose glow-rose"
                      : "border-border bg-glass text-foreground/50 hover:border-rose/30"
                  }
                  ${
                    count === 2 && selectedPlayers.length < 5
                      ? "opacity-30 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {count} Imposter{count > 1 ? "s" : ""}
              </motion.button>
            ))}
          </div>
          {imposterCount === 2 && selectedPlayers.length < 5 && (
            <p className="text-xs text-rose/60">
              Need at least 5 players for 2 imposters
            </p>
          )}
        </section>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-2"
        >
          <GlowButton
            color="mint"
            size="lg"
            className="w-full text-center"
            onClick={handleStart}
            disabled={!canStart}
          >
            🚀 Start Game
          </GlowButton>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
