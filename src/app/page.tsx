"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageWrapper from "@/components/ui/PageWrapper";
import GlowButton from "@/components/ui/GlowButton";

export default function Home() {
  return (
    <PageWrapper className="flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      {/* Liquid blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] w-72 h-72 bg-nova/8 blur-3xl animate-blob"
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[5%] w-64 h-64 bg-ember/6 blur-3xl animate-blob"
          style={{ animationDelay: "2s" }}
        />
        <motion.div
          animate={{ x: [0, 20, -30, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[50%] right-[30%] w-48 h-48 bg-ice/5 blur-3xl animate-blob"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            🕵️
          </motion.div>
          <h1 className="text-5xl font-black tracking-wider text-nova glow-text-nova">
            IMPOSTER
          </h1>
          <p className="text-foreground/40 text-sm tracking-[0.3em] uppercase font-light">
            Tamil Word Game
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-px bg-gradient-to-r from-transparent via-nova/30 to-transparent"
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-foreground/50 text-center text-sm leading-relaxed"
        >
          Find the imposter among your friends! Everyone gets the same word
          except the imposter. Discuss and figure out who&apos;s faking it.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 w-full"
        >
          <Link href="/setup" className="w-full">
            <GlowButton color="nova" size="lg" className="w-full text-center">
              🎮 Start Game
            </GlowButton>
          </Link>
          <Link href="/categories" className="w-full">
            <GlowButton color="ember" size="md" className="w-full text-center">
              📂 Manage Categories
            </GlowButton>
          </Link>
        </motion.div>

        {/* How to play */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full glass rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold text-nova/70 uppercase tracking-wider mb-3">
            How to Play
          </h3>
          <ol className="text-xs text-foreground/50 space-y-2.5">
            <li className="flex gap-2.5">
              <span className="text-nova/50 font-mono">01</span>
              <span>Add players and pick categories</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-nova/50 font-mono">02</span>
              <span>Pass the phone — hold to peek at your word</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-nova/50 font-mono">03</span>
              <span>Discuss & describe your word without saying it</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-nova/50 font-mono">04</span>
              <span>Vote out who you think is the imposter!</span>
            </li>
          </ol>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
