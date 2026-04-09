"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import GlowButton from "@/components/ui/GlowButton";
import { useGame } from "@/lib/game-context";
import { getPlayerRole } from "@/lib/game-logic";

export default function PlayPage() {
  const router = useRouter();
  const { gameState, nextPlayer, setPhase } = useGame();
  const [isPeeking, setIsPeeking] = useState(false);

  const handleNext = useCallback(() => {
    if (!gameState) return;
    const isLast =
      gameState.currentPlayerIndex >= gameState.playerOrder.length - 1;
    if (isLast) {
      setPhase("discussion");
    } else {
      nextPlayer();
    }
    setIsPeeking(false);
  }, [gameState, nextPlayer, setPhase]);

  const handleRevealImposter = useCallback(() => {
    setPhase("result");
    router.push("/reveal");
  }, [setPhase, router]);

  if (!gameState) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center px-6 safe-top safe-bottom">
        <div className="text-center">
          <p className="text-foreground/60 mb-4">No active game</p>
          <GlowButton color="nova" onClick={() => router.push("/setup")}>
            Go to Setup
          </GlowButton>
        </div>
      </PageWrapper>
    );
  }

  const currentPlayer = gameState.playerOrder[gameState.currentPlayerIndex];
  const role = getPlayerRole(gameState, gameState.currentPlayerIndex);
  const isDiscussion = gameState.phase === "discussion";
  const isLast =
    gameState.currentPlayerIndex >= gameState.playerOrder.length - 1;
  const totalPlayers = gameState.playerOrder.length;
  const currentIdx = gameState.currentPlayerIndex;

  return (
    <PageWrapper className="flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="max-w-sm w-full">
        <AnimatePresence mode="wait">
          {/* DISCUSSION PHASE */}
          {isDiscussion ? (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6 text-center"
            >
              {/* Pulsing icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-6xl drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              >
                💬
              </motion.div>

              <h2 className="text-3xl font-bold text-nova glow-text-nova">
                Discussion Time!
              </h2>

              {/* Category badge */}
              <div className="glass rounded-full px-5 py-2 inline-flex items-center gap-2">
                <span className="text-lg">{gameState.categoryIcon}</span>
                <span className="text-sm font-medium text-foreground/60">
                  {gameState.categoryName}
                </span>
              </div>

              {/* First player callout */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl px-5 py-3"
              >
                <p className="text-xs text-foreground/40 mb-1">
                  Start describing from
                </p>
                <p className="text-lg font-bold text-ember glow-text-ember">
                  {gameState.playerOrder[0].name}
                </p>
              </motion.div>

              <p className="text-foreground/50 text-sm max-w-xs">
                Everyone describe your word without saying it. Find the
                imposter!
              </p>

              {/* Player order */}
              <div className="w-full glass rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">
                  Discussion Order
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {gameState.playerOrder.map((p, i) => (
                    <motion.span
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                      className={`px-3 py-1.5 rounded-full text-sm border backdrop-blur-sm
                        ${
                          i === 0
                            ? "bg-ember/15 border-ember/40 text-ember"
                            : "bg-glass border-border text-foreground/60"
                        }`}
                    >
                      {i + 1}. {p.name}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="w-full pt-4">
                <ConfirmRevealButton onConfirm={handleRevealImposter} />
              </div>
            </motion.div>
          ) : (
            /* CARD PHASE — hold to peek */
            <motion.div
              key={`card-${currentPlayer.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-5"
            >
              {/* Progress dots */}
              <div className="flex items-center gap-2">
                {gameState.playerOrder.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={false}
                    animate={{
                      scale: i === currentIdx ? 1.3 : 1,
                      opacity: i <= currentIdx ? 1 : 0.3,
                    }}
                    className={`rounded-full transition-colors duration-300 ${
                      i < currentIdx
                        ? "w-2 h-2 bg-mint"
                        : i === currentIdx
                          ? "w-3 h-3 bg-nova glow-nova"
                          : "w-2 h-2 bg-foreground/20"
                    }`}
                  />
                ))}
              </div>

              {/* Player info */}
              <div className="text-center">
                <p className="text-foreground/40 text-xs mb-1 uppercase tracking-wider">
                  Player {currentIdx + 1} of {totalPlayers}
                </p>
                <h2 className="text-3xl font-bold text-nova glow-text-nova">
                  {currentPlayer.name}
                </h2>
              </div>

              {/* The card — flips between front (hidden) and back (word) */}
              <div
                className="relative w-72 h-96 select-none"
                style={{ perspective: "900px", touchAction: "none" }}
                onPointerDown={() => setIsPeeking(true)}
                onPointerUp={() => setIsPeeking(false)}
                onPointerLeave={() => setIsPeeking(false)}
                onPointerCancel={() => setIsPeeking(false)}
              >
                {/* Card container with 3D flip */}
                <motion.div
                  animate={{ rotateY: isPeeking ? 180 : 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full h-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* FRONT — hidden face */}
                  <div
                    className="absolute inset-0 rounded-3xl border-2 border-nova/20
                      bg-gradient-to-br from-surface via-surface-light to-surface
                      flex flex-col items-center justify-center gap-5 overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Decorative gradient orb */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-nova/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-32 h-32 bg-ember/8 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-20 h-20 rounded-full bg-nova/10 border border-nova/20
                          flex items-center justify-center"
                      >
                        <span className="text-4xl">🔒</span>
                      </motion.div>
                      <div className="text-center">
                        <p className="text-foreground/60 text-sm font-semibold">
                          Hold to Peek
                        </p>
                        <p className="text-foreground/25 text-xs mt-1">
                          Only {currentPlayer.name} should look
                        </p>
                      </div>
                    </div>

                    {/* Category tag on front */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                      px-3 py-1.5 rounded-full bg-glass border border-border
                      flex items-center gap-1.5"
                    >
                      <span className="text-sm">{gameState.categoryIcon}</span>
                      <span className="text-[11px] text-foreground/40">
                        {gameState.categoryName}
                      </span>
                    </div>
                  </div>

                  {/* BACK — revealed word or imposter */}
                  <div
                    className={`absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center
                      overflow-hidden ${
                        role.isImposter
                          ? "border-rose/60 bg-gradient-to-br from-rose/5 via-surface to-rose/10"
                          : "border-mint/60 bg-gradient-to-br from-mint/5 via-surface to-mint/10"
                      }`}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {/* Background glow */}
                    {role.isImposter ? (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-40 h-40 bg-rose/15 rounded-full blur-3xl" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-40 h-40 bg-mint/15 rounded-full blur-3xl" />
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col items-center gap-4 px-6">
                      {/* Player name tag */}
                      <span className="px-3 py-1 rounded-full bg-glass border border-border text-foreground/40 text-xs">
                        {currentPlayer.name}
                      </span>

                      {role.isImposter ? (
                        <>
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, ease: "backOut" }}
                            className="text-5xl"
                          >
                            🕵️
                          </motion.span>
                          <p className="text-2xl font-black text-rose glow-text-rose tracking-wide">
                            IMPOSTER!
                          </p>

                          {/* HINT — prominent category clue */}
                          <div className="w-full mt-2 rounded-2xl border border-rose/20 bg-rose/5 px-4 py-3">
                            <p className="text-[10px] text-rose/50 uppercase tracking-widest font-semibold mb-1.5">
                              Your Hint
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-2xl">{gameState.categoryIcon}</span>
                              <span className="text-lg font-bold text-rose-light">
                                {role.hint}
                              </span>
                            </div>
                            <p className="text-[10px] text-foreground/30 mt-2 text-center">
                              Use this to blend in during discussion
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-foreground/40 text-xs uppercase tracking-wider">
                            Your word is
                          </p>
                          <div className="w-full px-5 py-3 rounded-2xl border border-mint/30 bg-mint/5">
                            <p className="text-2xl font-black text-mint glow-text-mint text-center">
                              {role.word}
                            </p>
                          </div>
                          {/* Category badge */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-sm">{gameState.categoryIcon}</span>
                            <span className="text-xs text-foreground/30">
                              {gameState.categoryName}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Next player button */}
              <GlowButton
                color={isLast ? "ember" : "nova"}
                size="lg"
                className="w-full text-center"
                onClick={handleNext}
              >
                {isLast
                  ? "Start Discussion 💬"
                  : `Next → ${gameState.playerOrder[currentIdx + 1]?.name}`}
              </GlowButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}

function ConfirmRevealButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <p className="text-rose text-sm font-medium text-center">
          Are you sure? This will reveal the imposter!
        </p>
        <div className="flex gap-2">
          <GlowButton
            color="rose"
            size="md"
            className="flex-1 text-center"
            onClick={onConfirm}
          >
            Yes, Reveal!
          </GlowButton>
          <GlowButton
            color="ice"
            size="md"
            className="flex-1 text-center"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </GlowButton>
        </div>
      </motion.div>
    );
  }

  return (
    <GlowButton
      color="rose"
      size="lg"
      className="w-full text-center"
      onClick={() => setConfirming(true)}
    >
      🔍 Reveal Imposter
    </GlowButton>
  );
}
