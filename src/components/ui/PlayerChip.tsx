"use client";

import { motion } from "framer-motion";

interface PlayerChipProps {
  name: string;
  selected: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}

export default function PlayerChip({
  name,
  selected,
  onToggle,
  onDelete,
}: PlayerChipProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        inline-flex items-center gap-1.5 px-3 py-2 rounded-full
        border cursor-pointer transition-all duration-300 ease-out text-sm
        backdrop-blur-sm
        ${
          selected
            ? "border-nova/60 bg-nova/15 text-nova-light"
            : "border-border bg-glass text-foreground/60 hover:border-nova/30"
        }
      `}
      onClick={onToggle}
    >
      <span className="truncate max-w-[120px]">{name}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-0.5 w-5 h-5 flex items-center justify-center rounded-full
            hover:bg-rose/20 text-foreground/40 hover:text-rose transition-colors text-xs"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}
