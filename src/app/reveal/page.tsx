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
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <img
              src="/pool-ball-yellow-stripe.svg"
              alt=""
              aria-hidden="true"
              className="h-8 w-8"
            />
            <p className="title-lockup title-lockup-pool text-[2.45rem]">OrangeBall</p>
          </div>
          <p className="title-lockup text-[2.3rem]">The Imposter</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="relative"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 scale-[1.2] rounded-[2.5rem] bg-rose/50 blur-2xl"
          />
          <div
            className="relative w-48 h-48 rounded-[2rem] border border-[#242424]/15 bg-rose
            flex flex-col items-center justify-center glow-rose"
          >
            <motion.span
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: [0, 8, -8, 0], scale: 1 }}
              transition={{ duration: 1.8, delay: 0.3, ease: "easeInOut" }}
              className="text-5xl mb-2"
            >
              🕵️
            </motion.span>
            <p className="text-xs text-[#5b303f] uppercase tracking-wider font-bold">
              {imposters.length > 1 ? "Imposters" : "Imposter"}
            </p>
          </div>
        </motion.div>

        {/* Imposter names */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-2 w-full"
        >
          {imposters.map((imp, i) => (
            <motion.h2
              key={imp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.2 }}
              className="text-3xl font-black text-foreground rounded-full border border-border bg-white px-5 py-2 shadow-[0_6px_14px_rgba(37,35,33,0.06)]"
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
          className="text-center rounded-[1.4rem] border border-border bg-white px-6 py-5 shadow-[0_8px_20px_rgba(37,35,33,0.06)]"
        >
          <p className="text-foreground/50 text-sm mb-2 uppercase tracking-[0.18em]">
            The word was
          </p>
          <p className="text-3xl font-black text-foreground">
            {gameState.word}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="text-sm">{gameState.categoryIcon}</span>
            <p className="text-foreground/30 text-xs">
              {gameState.categoryName}
            </p>
          </div>
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
            className="block w-full max-w-64 mx-auto text-center"
            onClick={handlePlayAgain}
          >
            Play Again
          </GlowButton>
          <GlowButton
            color="ember"
            size="md"
            className="block w-full max-w-64 mx-auto text-center"
            onClick={handleNewGame}
          >
            New Game
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
