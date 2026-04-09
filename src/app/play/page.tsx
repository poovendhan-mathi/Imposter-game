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
  const discussionOrder = gameState.playerOrder.map(
    (_, index) =>
      gameState.playerOrder[
        (gameState.discussionStarterIndex + index) %
          gameState.playerOrder.length
      ],
  );

  return (
    <PageWrapper className="flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="max-w-sm w-full flex flex-col items-center gap-5">
        <div className="text-center pt-2">
          <p className="title-lockup text-[2.9rem]">Imposter</p>
          <p className="title-lockup text-[2.9rem]">Who?</p>
        </div>
        <AnimatePresence mode="wait">
          {isDiscussion ? (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6 text-center w-full"
            >
              <h2 className="text-3xl font-bold text-foreground">
                Discussion Time!
              </h2>

              <div className="glass rounded-full px-5 py-2 inline-flex items-center gap-2">
                <span className="text-lg">{gameState.categoryIcon}</span>
                <span className="text-sm font-medium text-foreground/60">
                  {gameState.categoryName}
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl px-5 py-3 w-full"
              >
                <p className="text-xs text-foreground/40 mb-1">
                  Start describing from
                </p>
                <p className="text-lg font-bold text-foreground">
                  {discussionOrder[0].name}
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
                  {discussionOrder.map((p, i) => (
                    <motion.span
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                      className={`px-3 py-1.5 rounded-full text-sm border
                        ${
                          i === 0
                            ? "bg-mint border-[#b4e21a] text-foreground font-bold"
                            : "bg-white border-border text-foreground/60"
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
            <motion.div
              key={`card-${currentPlayer.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-5 w-full"
            >
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
                        ? "w-2 h-2 bg-[#1f1f1f]"
                        : i === currentIdx
                          ? "w-3 h-3 bg-[#1f1f1f] glow-nova"
                          : "w-2 h-2 bg-foreground/20"
                    }`}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-foreground/40 text-xs mb-1 uppercase tracking-wider">
                  Player {currentIdx + 1} of {totalPlayers}
                </p>
                <h2 className="text-3xl font-bold text-foreground">
                  {currentPlayer.name}
                </h2>
              </div>

              <div
                className="relative w-[15.5rem] h-[18.5rem] select-none"
                style={{ perspective: "900px", touchAction: "none" }}
                onPointerDown={() => setIsPeeking(true)}
                onPointerUp={() => setIsPeeking(false)}
                onPointerLeave={() => setIsPeeking(false)}
                onPointerCancel={() => setIsPeeking(false)}
              >
                <motion.div
                  animate={{ rotateY: isPeeking ? 180 : 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full h-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="absolute inset-0 rounded-[1.2rem] border border-[#242424]/12 bg-white
                      flex flex-col items-center justify-center gap-5 overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-4 px-6">
                      <div className="w-20 h-20 rounded-full bg-[#f4f4f1] border border-border flex items-center justify-center">
                        <span className="text-4xl">🔒</span>
                      </div>
                      <div className="text-center">
                        <p className="text-foreground/60 text-sm font-semibold">
                          Hold to Peek
                        </p>
                        <p className="text-foreground/25 text-xs mt-1">
                          Only {currentPlayer.name} should look
                        </p>
                      </div>
                    </div>

                    <div
                      className="absolute bottom-4 left-1/2 -translate-x-1/2
                      px-3 py-1.5 rounded-full bg-surface-light border border-border
                      flex items-center gap-1.5"
                    >
                      <span className="text-sm">{gameState.categoryIcon}</span>
                      <span className="text-[11px] text-foreground/40">
                        {gameState.categoryName}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 rounded-[1.2rem] border border-[#242424]/12 flex flex-col items-center justify-center overflow-hidden ${
                      role.isImposter ? "bg-rose" : "bg-ice"
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                      <p className="text-[2rem] font-black text-foreground uppercase">
                        {currentPlayer.name}
                      </p>

                      {role.isImposter ? (
                        <>
                          <div className="rounded-2xl border border-[#242424] bg-white px-4 py-3 shadow-[0_6px_14px_rgba(37,35,33,0.08)]">
                            <p className="text-xl font-black text-[#ff3d30] leading-tight uppercase">
                              You Are The Imposter!
                            </p>
                          </div>
                          <div className="w-full mt-1 rounded-2xl border border-[#242424]/10 bg-white/55 px-4 py-3">
                            <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-semibold mb-1.5">
                              Your Hint
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-2xl">
                                {gameState.categoryIcon}
                              </span>
                              <span className="text-lg font-bold text-foreground">
                                {role.hint}
                              </span>
                            </div>
                            <p className="text-[10px] text-foreground/35 mt-2 text-center">
                              Use this to blend in during discussion
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-2xl border border-[#242424] bg-white px-5 py-2.5 shadow-[0_6px_14px_rgba(37,35,33,0.08)]">
                            <p className="text-2xl font-black text-foreground text-center">
                              {role.word}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-sm">
                              {gameState.categoryIcon}
                            </span>
                            <span className="text-xs text-foreground/40">
                              {gameState.categoryName}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              <GlowButton
                color="nova"
                size="lg"
                className="w-[68%] text-center"
                onClick={handleNext}
              >
                {isLast ? "Start Discussion" : "Next Player"}
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
