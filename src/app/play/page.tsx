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
            /* CARD — hold to peek, release to hide */
            <motion.div
              key={`card-${currentPlayer.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6"
            >
              {/* Player info */}
              <div className="text-center">
                <p className="text-foreground/40 text-sm mb-1">
                  Player {gameState.currentPlayerIndex + 1} of{" "}
                  {gameState.playerOrder.length}
                </p>
                <h2 className="text-3xl font-bold text-nova glow-text-nova">
                  {currentPlayer.name}
                </h2>
              </div>

              {/* The card — flips between front (hidden) and back (word) */}
              <div
                className="relative w-64 h-80 select-none"
                style={{ perspective: "800px", touchAction: "none" }}
                onPointerDown={() => setIsPeeking(true)}
                onPointerUp={() => setIsPeeking(false)}
                onPointerLeave={() => setIsPeeking(false)}
                onPointerCancel={() => setIsPeeking(false)}
              >
                {/* Card container with 3D flip */}
                <motion.div
                  animate={{ rotateY: isPeeking ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full h-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* FRONT — hidden face */}
                  <div
                    className="absolute inset-0 rounded-3xl border-2 border-nova/30 bg-surface
                      flex flex-col items-center justify-center gap-4 backdrop-blur-sm"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-5xl"
                    >
                      🔒
                    </motion.span>
                    <p className="text-foreground/50 text-sm font-medium">
                      Hold to peek
                    </p>
                    <p className="text-foreground/25 text-xs">
                      Only {currentPlayer.name} should look
                    </p>
                  </div>

                  {/* BACK — revealed word or imposter */}
                  <div
                    className={`absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center gap-4
                      backdrop-blur-sm ${
                        role.isImposter
                          ? "border-rose bg-rose/10 glow-rose"
                          : "border-mint bg-mint/10 glow-mint"
                      }`}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="text-foreground/50 text-xs uppercase tracking-wider">
                      {currentPlayer.name}
                    </p>
                    {role.isImposter ? (
                      <>
                        <span className="text-5xl">🕵️</span>
                        <p className="text-2xl font-black text-rose glow-text-rose">
                          IMPOSTER!
                        </p>
                        <p className="text-rose/50 text-xs px-6 text-center">
                          You don&apos;t know the word. Blend in!
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground/40 text-xs">
                          Your word is
                        </p>
                        <div className="px-5 py-2.5 rounded-2xl border border-foreground/20 bg-background/40">
                          <p className="text-2xl font-black text-mint glow-text-mint text-center">
                            {role.word}
                          </p>
                        </div>
                      </>
                    )}
                    <p className="text-foreground/25 text-xs mt-1">
                      {gameState.categoryName}
                    </p>
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
                  : `Next → ${gameState.playerOrder[gameState.currentPlayerIndex + 1]?.name}`}
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
