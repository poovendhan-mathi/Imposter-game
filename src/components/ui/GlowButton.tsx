"use client";

import { motion } from "framer-motion";
import React from "react";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: "nova" | "ember" | "ice" | "rose" | "mint";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  nova: {
    bg: "bg-[#242424] hover:bg-[#111111]",
    border: "border-[#242424]",
    text: "text-white",
    glow: "glow-nova",
  },
  ember: {
    bg: "bg-white hover:bg-surface-light",
    border: "border-border-light",
    text: "text-foreground",
    glow: "glow-ember",
  },
  ice: {
    bg: "bg-ice hover:bg-ice/85",
    border: "border-[#5bd1d5]",
    text: "text-[#103133]",
    glow: "glow-ice",
  },
  rose: {
    bg: "bg-white hover:bg-[#fff7fb]",
    border: "border-rose-light/40",
    text: "text-rose-light",
    glow: "glow-rose",
  },
  mint: {
    bg: "bg-mint hover:bg-[#b8f212]",
    border: "border-[#b4e21a]",
    text: "text-[#1b1b1b]",
    glow: "glow-mint",
  },
};

const sizeMap = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function GlowButton({
  children,
  onClick,
  color = "nova",
  disabled = false,
  className = "",
  size = "md",
}: GlowButtonProps) {
  const c = colorMap[color];
  const s = sizeMap[size];

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${c.bg} ${c.border} ${c.text}
        ${s}
        border rounded-2xl font-extrabold uppercase tracking-wide
        transition-all duration-300 ease-out
        ${disabled ? "opacity-30 cursor-not-allowed" : `${c.glow} cursor-pointer active:brightness-105`}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
