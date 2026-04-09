"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import GlowButton from "@/components/ui/GlowButton";
import { useGame } from "@/lib/game-context";
import { getPlayerRole } from "@/lib/game-logic";

const HOLD_DURATION = 1200; // ms

export default function PlayPage() {
  const router = useRouter();
  const { gameState, nextPlayer, setPhase } = useGame();
  const [isHolding, setIsHolding] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartTime = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (progressInterval.current) clearInterval(progressInterval.current);
    holdTimer.current = null;
    progressInterval.current = null;
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const startHold = useCallback(() => {
    if (revealed) return;
    setIsHolding(true);
    holdStartTime.current = Date.now();

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTime.current;
      setHoldProgress(Math.min(elapsed / HOLD_DURATION, 1));
    }, 16);

    holdTimer.current = setTimeout(() => {
      setRevealed(true);
      setIsHolding(false);
      setHoldProgress(1);
      clearTimers();
    }, HOLD_DURATION);
  }, [revealed, clearTimers]);

  const endHold = useCallback(() => {
    if (revealed) return;
    setIsHolding(false);
    setHoldProgress(0);
    clearTimers();
  }, [revealed, clearTimers]);

  const handleGotIt = useCallback(() => {
    if (!gameState) return;
    const isLast =
      gameState.currentPlayerIndex >= gameState.playerOrder.length - 1;
    if (isLast) {
      setPhase("discussion");
    } else {
      nextPlayer();
    }
    setRevealed(false);
    setHoldProgress(0);
    setIsHolding(false);
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
  const isFirst = gameState.currentPlayerIndex === 0;
  const isDiscussion = gameState.phase === "discussion";

  // SVG circle properties for the hold ring
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;

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

              {/* Who starts first */}
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

              {/* Player order list */}
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
          ) : !revealed ? (
            /* HOLD TO REVEAL PHASE */
            <motion.div
              key={`ready-${currentPlayer.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6"
            >
              <div className="text-center">
                <p className="text-foreground/40 text-sm mb-1">
                  Player {gameState.currentPlayerIndex + 1} of{" "}
                  {gameState.playerOrder.length}
                </p>
                <h2 className="text-3xl font-bold text-nova glow-text-nova">
                  {currentPlayer.name}
                </h2>
                {isFirst && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-foreground/30 mt-2"
                  >
                    Pass the phone to each player
                  </motion.p>
                )}
              </div>

              {/* Hold-to-reveal circle */}
              <motion.div
                className="relative w-56 h-56 flex items-center justify-center select-none"
                onPointerDown={startHold}
                onPointerUp={endHold}
                onPointerLeave={endHold}
                onPointerCancel={endHold}
                style={{ touchAction: "none" }}
              >
                {/* Background ring */}
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={circleRadius}
                    fill="none"
                    stroke="rgba(168, 85, 247, 0.1)"
                    strokeWidth="3"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={circleRadius}
                    fill="none"
                    stroke={isHolding ? "#a855f7" : "rgba(168, 85, 247, 0.3)"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - holdProgress)}
                    style={{
                      transition: isHolding
                        ? "none"
                        : "stroke-dashoffset 0.3s ease-out",
                    }}
                  />
                </svg>

                {/* Inner content */}
                <motion.div
                  animate={
                    isHolding ? { scale: 0.95 } : { scale: [1, 1.03, 1] }
                  }
                  transition={
                    isHolding
                      ? { duration: 0.15 }
                      : { duration: 3, repeat: Infinity }
                  }
                  className={`w-44 h-44 rounded-full border-2 flex flex-col items-center justify-center gap-3
                    cursor-pointer transition-all duration-300 backdrop-blur-sm
                    ${
                      isHolding
                        ? "border-nova/60 bg-nova/10 glow-nova"
                        : "border-border bg-glass hover:border-nova/30"
                    }`}
                >
                  <span className="text-4xl">{isHolding ? "👁️" : "🔒"}</span>
                  <p className="text-foreground/50 text-sm font-medium">
                    {isHolding ? "Keep holding..." : "Hold to reveal"}
                  </p>
                  <p className="text-foreground/25 text-[10px]">
                    Only {currentPlayer.name} should look
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            /* REVEALED PHASE */
            <motion.div
              key={`reveal-${currentPlayer.id}`}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6"
            >
              <div className="text-center">
                <p className="text-foreground/40 text-sm mb-1">
                  {currentPlayer.name}
                </p>
              </div>

              {role.isImposter ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                  className="w-56 h-72 rounded-3xl border-2 border-rose bg-rose/10
                    flex flex-col items-center justify-center gap-4 glow-rose backdrop-blur-sm"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-6xl"
                  >
                    🕵️
                  </motion.span>
                  <p className="text-2xl font-black text-rose glow-text-rose">
                    IMPOSTER
                  </p>
                  <p className="text-rose/50 text-xs px-4 text-center">
                    You don&apos;t know the word. Blend in!
                  </p>
                  <p className="text-foreground/30 text-xs">
                    Category: {gameState.categoryName}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                  className="w-56 h-72 rounded-3xl border-2 border-mint bg-mint/10
                    flex flex-col items-center justify-center gap-4 glow-mint backdrop-blur-sm"
                >
                  <span className="text-4xl">✅</span>
                  <p className="text-foreground/40 text-xs">Your word is</p>
                  <p className="text-2xl font-black text-mint glow-text-mint text-center px-4">
                    {role.word}
                  </p>
                  <p className="text-foreground/30 text-xs">
                    Category: {gameState.categoryName}
                  </p>
                </motion.div>
              )}

              <GlowButton
                color={role.isImposter ? "rose" : "mint"}
                size="lg"
                className="w-full text-center"
                onClick={handleGotIt}
              >
                {gameState.currentPlayerIndex < gameState.playerOrder.length - 1
                  ? `Pass to ${gameState.playerOrder[gameState.currentPlayerIndex + 1]?.name} →`
                  : "Start Discussion 💬"}
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
