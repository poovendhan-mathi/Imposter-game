"use client";

import { motion } from "framer-motion";

interface CategoryCardProps {
  name: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
  isCustom?: boolean;
}

export default function CategoryCard({
  name,
  icon,
  selected,
  onClick,
  isCustom,
}: CategoryCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-1.5
        p-3 rounded-2xl border cursor-pointer bg-white
        transition-all duration-300 ease-out min-h-[84px]
        ${
          selected
            ? "border-[#222222] bg-[#fafafa] shadow-[0_8px_18px_rgba(37,35,33,0.08)]"
            : "border-border bg-white hover:border-nova/30 hover:bg-surface-light"
        }
      `}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className={`text-[11px] font-medium text-center leading-tight ${
          selected ? "text-foreground" : "text-foreground/70"
        }`}
      >
        {name}
      </span>
      {isCustom && (
        <span className="absolute top-1 right-1.5 text-[9px] text-ember-light font-mono">
          custom
        </span>
      )}
    </motion.button>
  );
}
