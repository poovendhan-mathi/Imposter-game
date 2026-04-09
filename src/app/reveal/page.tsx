"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import GlowButton from "@/components/ui/GlowButton";
import { useGame } from "@/lib/game-context";

export default function RevealPage() {
  const router = useRouter();
  const { gameState, resetGame, startGame } = useGame();

  if (!gameState) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center px-6 safe-top safe-bottom">
        <div className="text-center">
          <p className="text-foreground/60 mb-4">No game data</p>
          <GlowButton color="nova" onClick={() => router.push("/")}>
            Go Home
          </GlowButton>
        </div>
      </PageWrapper>
    );
  }

  const imposters = gameState.playerOrder.filter((p) =>
    gameState.imposterIds.includes(p.id),
  );

  const handlePlayAgain = () => {
    startGame(gameState.config);
    router.push("/play");
  };

  const handleNewGame = () => {
    resetGame();
    router.push("/setup");
  };

  return (
    <PageWrapper className="flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="max-w-sm w-full flex flex-col items-center gap-8">
        {/* Spotlight effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "backOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-rose/20 rounded-full blur-3xl scale-150" />
          <div
            className="relative w-48 h-48 rounded-full border-2 border-rose bg-rose/10
            flex flex-col items-center justify-center glow-rose backdrop-blur-sm"
          >
            <motion.span
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "backOut" }}
              className="text-5xl mb-2"
            >
              🕵️
            </motion.span>
            <p className="text-xs text-rose/60 uppercase tracking-wider">
              {imposters.length > 1 ? "Imposters" : "Imposter"}
            </p>
          </div>
        </motion.div>

        {/* Imposter names */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          {imposters.map((imp, i) => (
            <motion.h2
              key={imp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.2 }}
              className="text-3xl font-black text-rose glow-text-rose"
            >
              {imp.name}
            </motion.h2>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />

        {/* The word */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-foreground/50 text-sm mb-2">The word was</p>
          <p className="text-2xl font-bold text-mint glow-text-mint">
            {gameState.word}
          </p>
          <p className="text-foreground/30 text-xs mt-1">
            {gameState.categoryName}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="w-full flex flex-col gap-3 pt-4"
        >
          <GlowButton
            color="nova"
            size="lg"
            className="w-full text-center"
            onClick={handlePlayAgain}
          >
            🔄 Play Again
          </GlowButton>
          <GlowButton
            color="ember"
            size="md"
            className="w-full text-center"
            onClick={handleNewGame}
          >
            ⚙️ New Game
          </GlowButton>
          <button
            onClick={() => {
              resetGame();
              router.push("/");
            }}
            className="text-foreground/30 text-sm hover:text-foreground/50 transition-colors py-2 cursor-pointer"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
