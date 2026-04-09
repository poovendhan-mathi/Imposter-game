"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import GlowButton from "@/components/ui/GlowButton";
import { Category } from "@/lib/types";
import {
  getCustomCategories,
  saveCustomCategory,
  deleteCustomCategory,
} from "@/lib/storage";
import builtInCategories from "@/data/categories.json";

function generateId() {
  return "custom-" + Math.random().toString(36).substring(2, 9);
}

export default function CategoriesPage() {
  const router = useRouter();
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setCustomCategories(getCustomCategories());
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteCustomCategory(id);
    setCustomCategories(getCustomCategories());
    setDeleteConfirm(null);
  }, []);

  return (
    <PageWrapper className="flex flex-col px-5 py-6 safe-top safe-bottom">
      <div className="max-w-lg mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-foreground/50 hover:text-nova transition-colors text-xl cursor-pointer"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-nova glow-text-nova">
              Categories
            </h1>
          </div>
          {!showCreate && !editingId && (
            <GlowButton
              color="mint"
              size="sm"
              onClick={() => setShowCreate(true)}
            >
              + Create
            </GlowButton>
          )}
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {(showCreate || editingId) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CategoryForm
                editCategory={
                  editingId
                    ? customCategories.find((c) => c.id === editingId)
                    : undefined
                }
                onSave={(cat) => {
                  saveCustomCategory(cat);
                  setCustomCategories(getCustomCategories());
                  setShowCreate(false);
                  setEditingId(null);
                }}
                onCancel={() => {
                  setShowCreate(false);
                  setEditingId(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Categories */}
        {customCategories.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ember/70 uppercase tracking-wider">
              Your Categories
            </h2>
            {customCategories.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-semibold text-foreground/90">
                      {cat.name}
                    </span>
                    <span className="text-xs text-foreground/40">
                      ({cat.words.length} words)
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingId(cat.id)}
                      className="px-2 py-1 text-xs text-nova/70 hover:text-nova transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    {deleteConfirm === cat.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="px-2 py-1 text-xs text-rose hover:text-rose/80 transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-xs text-foreground/40 hover:text-foreground/60 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(cat.id)}
                        className="px-2 py-1 text-xs text-rose/50 hover:text-rose transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.words.map((word) => (
                    <span
                      key={word}
                      className="px-2 py-0.5 bg-surface-light border border-border
                        rounded-lg text-xs text-foreground/60"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </section>
        )}

        {/* Built-in Categories */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground/40 uppercase tracking-wider">
            Built-in Categories
          </h2>
          {(builtInCategories as Category[]).map((cat) => (
            <div
              key={cat.id}
              className="glass rounded-2xl p-4 opacity-80"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{cat.icon}</span>
                <span className="font-semibold text-foreground/70">
                  {cat.name}
                </span>
                <span className="text-xs text-foreground/30">
                  ({cat.words.length} words)
                </span>
                <span className="ml-auto text-xs text-foreground/20">
                  read-only
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.words.map((word) => (
                  <span
                    key={word}
                    className="px-2 py-0.5 bg-surface-light/50 border border-border/30
                      rounded-lg text-xs text-foreground/40"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </PageWrapper>
  );
}

/* Category Create/Edit Form */
function CategoryForm({
  editCategory,
  onSave,
  onCancel,
}: {
  editCategory?: Category;
  onSave: (cat: Category) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(editCategory?.name ?? "");
  const [icon, setIcon] = useState(editCategory?.icon ?? "📝");
  const [words, setWords] = useState<string[]>(editCategory?.words ?? []);
  const [newWord, setNewWord] = useState("");
  const [error, setError] = useState("");

  const addWord = useCallback(() => {
    const w = newWord.trim();
    if (!w) return;

    const wordCount = w.split(/\s+/).length;
    if (wordCount > 2) {
      setError("Max 2 words allowed");
      return;
    }
    if (w.length > 15) {
      setError("Max 15 characters allowed");
      return;
    }
    if (words.includes(w)) {
      setError("Word already exists");
      return;
    }

    setWords((prev) => [...prev, w]);
    setNewWord("");
    setError("");
  }, [newWord, words]);

  const removeWord = useCallback((word: string) => {
    setWords((prev) => prev.filter((w) => w !== word));
  }, []);

  const handleSave = () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (words.length < 5) {
      setError("At least 5 words required");
      return;
    }
    const category: Category = {
      id: editCategory?.id ?? generateId(),
      name: name.trim(),
      icon,
      words,
      isCustom: true,
    };
    onSave(category);
  };

  const commonIcons = [
    "📝", "🎮", "🎯", "⭐", "🔥", "💎", "🎭", "🌍", "🍿", "🎪",
  ];

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-mint glow-text-mint">
        {editCategory ? "Edit Category" : "Create Category"}
      </h3>

      {/* Icon selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-foreground/50">Icon</label>
        <div className="flex gap-2 flex-wrap">
          {commonIcons.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setIcon(emoji)}
              className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center
                transition-all duration-300 cursor-pointer
                ${
                  icon === emoji
                    ? "border-mint/60 bg-mint/15"
                    : "border-border bg-surface-light hover:border-mint/30"
                }
              `}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-foreground/50">Category Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tamil Snacks"
          maxLength={30}
          className="bg-surface-light border border-border rounded-2xl px-4 py-2.5
            text-sm text-foreground placeholder:text-foreground/30
            focus:border-mint/40 focus:outline-none transition-colors"
        />
      </div>

      {/* Words */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-foreground/50">
            Words ({words.length})
          </label>
          <span className="text-xs text-foreground/30">
            max 2 words, 15 chars
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
          <AnimatePresence>
            {words.map((word) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-light
                  border border-border rounded-lg text-xs text-foreground/60"
              >
                {word}
                <button
                  onClick={() => removeWord(word)}
                  className="text-rose/40 hover:text-rose transition-colors ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => {
              setNewWord(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && addWord()}
            placeholder="Add a word..."
            maxLength={15}
            className="flex-1 bg-surface-light border border-border rounded-2xl px-4 py-2.5
              text-sm text-foreground placeholder:text-foreground/30
              focus:border-mint/40 focus:outline-none transition-colors"
          />
          <GlowButton
            color="mint"
            size="sm"
            onClick={addWord}
            disabled={!newWord.trim()}
          >
            Add
          </GlowButton>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-rose">{error}</p>}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <GlowButton
          color="mint"
          size="md"
          className="flex-1 text-center"
          onClick={handleSave}
          disabled={!name.trim() || words.length < 5}
        >
          {editCategory ? "Update" : "Save Category"}
        </GlowButton>
        <GlowButton
          color="rose"
          size="md"
          className="text-center"
          onClick={onCancel}
        >
          Cancel
        </GlowButton>
      </div>
    </div>
  );
}
