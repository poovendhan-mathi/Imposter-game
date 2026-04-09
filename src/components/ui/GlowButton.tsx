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
    bg: "bg-nova/10 hover:bg-nova/20",
    border: "border-nova/40",
    text: "text-nova-light",
    glow: "glow-nova",
  },
  ember: {
    bg: "bg-ember/10 hover:bg-ember/20",
    border: "border-ember/40",
    text: "text-ember-light",
    glow: "glow-ember",
  },
  ice: {
    bg: "bg-ice/10 hover:bg-ice/20",
    border: "border-ice/40",
    text: "text-ice-light",
    glow: "glow-ice",
  },
  rose: {
    bg: "bg-rose/10 hover:bg-rose/20",
    border: "border-rose/40",
    text: "text-rose-light",
    glow: "glow-rose",
  },
  mint: {
    bg: "bg-mint/10 hover:bg-mint/20",
    border: "border-mint/40",
    text: "text-mint",
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
        border rounded-2xl font-semibold
        backdrop-blur-sm
        transition-all duration-300 ease-out
        ${disabled ? "opacity-30 cursor-not-allowed" : `${c.glow} cursor-pointer active:brightness-110`}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
