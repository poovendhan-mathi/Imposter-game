"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import GlowButton from "@/components/ui/GlowButton";
import PlayerChip from "@/components/ui/PlayerChip";
import { getPresetPlayers, savePresetPlayers } from "@/lib/storage";
import { Player, DEFAULT_PRESET_NAMES } from "@/lib/types";

const SELECTED_IDS_KEY = "imposter-selected-player-ids";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function loadSelectedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const data = localStorage.getItem(SELECTED_IDS_KEY);
  return data ? new Set(JSON.parse(data)) : new Set();
}

function saveSelectedIds(ids: Set<string>) {
  localStorage.setItem(SELECTED_IDS_KEY, JSON.stringify([...ids]));
}

export default function PlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const preset = getPresetPlayers();
    setPlayers(preset);
    const saved = loadSelectedIds();
    // If nothing saved yet, select all
    if (saved.size === 0 && preset.length > 0) {
      const allIds = new Set(preset.map((p) => p.id));
      setSelectedIds(allIds);
      saveSelectedIds(allIds);
    } else {
      // Only keep IDs that still exist
      const validIds = new Set(
        [...saved].filter((id) => preset.some((p) => p.id === id)),
      );
      setSelectedIds(validIds);
    }
  }, []);

  const availableSuggestions = DEFAULT_PRESET_NAMES.filter(
    (name) => !players.some((p) => p.name.toLowerCase() === name.toLowerCase()),
  );

  const togglePlayer = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSelectedIds(next);
      return next;
    });
  }, []);

  const addPlayer = useCallback(() => {
    const name = newName.trim();
    if (!name || name.length > 15) return;
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      return;
    const id = generateId();
    const updated = [...players, { id, name }];
    setPlayers(updated);
    savePresetPlayers(updated);
    setSelectedIds((prev) => {
      const next = new Set([...prev, id]);
      saveSelectedIds(next);
      return next;
    });
    setNewName("");
  }, [newName, players]);

  const addSuggested = useCallback(
    (name: string) => {
      const id = generateId();
      const updated = [...players, { id, name }];
      setPlayers(updated);
      savePresetPlayers(updated);
      setSelectedIds((prev) => {
        const next = new Set([...prev, id]);
        saveSelectedIds(next);
        return next;
      });
    },
    [players],
  );

  const deletePlayer = useCallback(
    (id: string) => {
      const updated = players.filter((p) => p.id !== id);
      setPlayers(updated);
      savePresetPlayers(updated);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        saveSelectedIds(next);
        return next;
      });
    },
    [players],
  );

  const selectedCount = selectedIds.size;

  return (
    <PageWrapper className="flex flex-col px-5 py-6 safe-top safe-bottom">
      <div className="max-w-lg mx-auto w-full flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/setup")}
              className="text-foreground/45 hover:text-foreground transition-colors text-xl cursor-pointer"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-foreground">Players</h1>
          </div>
          <span className="text-sm text-foreground/50">
            {selectedCount} selected
          </span>
        </div>

        {/* Player list */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {players.map((player) => (
                <PlayerChip
                  key={player.id}
                  name={player.name}
                  selected={selectedIds.has(player.id)}
                  onToggle={() => togglePlayer(player.id)}
                  onDelete={() => deletePlayer(player.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {players.length === 0 && (
            <p className="text-sm text-foreground/40 text-center py-4">
              No players yet. Add some below!
            </p>
          )}
        </section>

        {/* Add player input */}
        <section className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
            placeholder="Enter player name..."
            maxLength={15}
            className="flex-1 bg-white border border-border rounded-2xl px-4 py-2.5
              text-sm text-foreground placeholder:text-foreground/30
              focus:border-nova/40 focus:outline-none transition-colors"
          />
          <GlowButton
            color="nova"
            size="sm"
            onClick={addPlayer}
            disabled={!newName.trim()}
          >
            Add
          </GlowButton>
        </section>

        {/* Quick suggestions */}
        {availableSuggestions.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Quick Add
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {availableSuggestions.map((name) => (
                <motion.button
                  key={name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addSuggested(name)}
                  className="px-3 py-1.5 rounded-full border border-dashed border-border-light
                    bg-white text-xs text-foreground/65 hover:bg-surface-light hover:border-foreground/25
                    transition-all cursor-pointer"
                >
                  + {name}
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Done button */}
        <div className="pt-4">
          <GlowButton
            color="mint"
            size="lg"
            className="w-full text-center"
            onClick={() => router.push("/setup")}
          >
            ✓ Done ({selectedCount} players)
          </GlowButton>
          {selectedCount < 3 && (
            <p className="text-xs text-rose/60 text-center mt-2">
              Select at least 3 players to start a game
            </p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
