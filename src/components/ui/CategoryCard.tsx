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
        p-3 rounded-2xl border cursor-pointer
        transition-all duration-300 ease-out min-h-[84px]
        backdrop-blur-sm
        ${
          selected
            ? "border-nova/60 bg-nova/15 glow-nova"
            : "border-border bg-glass hover:bg-glass-light hover:border-nova/25"
        }
      `}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className={`text-[11px] font-medium text-center leading-tight ${
          selected ? "text-nova-light" : "text-foreground/70"
        }`}
      >
        {name}
      </span>
      {isCustom && (
        <span className="absolute top-1 right-1.5 text-[9px] text-ember/50 font-mono">
          custom
        </span>
      )}
    </motion.button>
  );
}
