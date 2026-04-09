"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import GlowButton from "@/components/ui/GlowButton";
import CategoryCard from "@/components/ui/CategoryCard";
import { useGame } from "@/lib/game-context";
import { getAllCategories } from "@/lib/game-logic";
import { getPresetPlayers } from "@/lib/storage";
import { Player, Category } from "@/lib/types";

const SELECTED_IDS_KEY = "imposter-selected-player-ids";

function loadSelectedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const data = localStorage.getItem(SELECTED_IDS_KEY);
  return data ? new Set(JSON.parse(data)) : new Set();
}

export default function SetupPage() {
  const router = useRouter();
  const { startGame } = useGame();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(
    new Set(),
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(),
  );
  const [imposterCount, setImposterCount] = useState<1 | 2>(1);

  useEffect(() => {
    const preset = getPresetPlayers();
    setPlayers(preset);
    const savedIds = loadSelectedIds();
    if (savedIds.size > 0) {
      // Only keep IDs that still exist
      const validIds = new Set(
        [...savedIds].filter((id) => preset.some((p) => p.id === id)),
      );
      setSelectedPlayerIds(validIds);
    } else {
      setSelectedPlayerIds(new Set());
    }
    setCategories(getAllCategories());
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-foreground/45 hover:text-foreground transition-colors text-xl cursor-pointer"
          >
            ←
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl">🟠</span>
              <p className="title-lockup text-[1.95rem]">OrangeBall</p>
            </div>
            <p className="title-lockup text-[1.85rem]">The Imposter</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/players")}
          className="flex items-center justify-between w-full px-4 py-4 rounded-2xl
            border border-border bg-white cursor-pointer hover:border-nova/30 transition-all shadow-[0_8px_18px_rgba(37,35,33,0.05)]"
        >
          <div className="flex flex-col items-start gap-1">
            <h2 className="text-sm font-semibold text-foreground/55 uppercase tracking-wider flex items-center gap-2">
              <span>✋</span>
              Players
            </h2>
            <span className="text-sm text-foreground/50">
              {selectedPlayers.length > 0
                ? selectedPlayers.map((p) => p.name).join(", ")
                : "Tap to add players"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${selectedPlayers.length >= 3 ? "text-foreground" : "text-rose-light"}`}
            >
              {selectedPlayers.length}
            </span>
            <span className="text-foreground/30 text-lg">›</span>
          </div>
        </motion.button>
        {selectedPlayers.length < 3 && (
          <p className="text-xs text-rose/60 -mt-3 ml-1">
            Min 3 players required
          </p>
        )}

        {/* Category Section — multi-select */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground/55 uppercase tracking-wider">
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
          <h2 className="text-sm font-semibold text-foreground/55 uppercase tracking-wider">
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
                  flex-1 py-3 rounded-2xl border text-center font-semibold transition-all duration-300 cursor-pointer bg-white
                  ${
                    imposterCount === count
                      ? "border-[#242424] text-foreground shadow-[0_8px_18px_rgba(37,35,33,0.08)]"
                      : "border-border text-foreground/55 hover:border-foreground/25"
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
          className="pt-4 flex justify-center"
        >
          <GlowButton
            color="mint"
            size="lg"
            className="block w-full max-w-76 mx-auto text-center"
            onClick={handleStart}
            disabled={!canStart}
          >
            Start Game
          </GlowButton>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
