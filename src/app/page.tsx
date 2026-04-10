"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageWrapper from "@/components/ui/PageWrapper";
import GlowButton from "@/components/ui/GlowButton";

export default function Home() {
  return (
    <PageWrapper className="flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <img
                src="/pool-ball-yellow-stripe.svg"
                alt=""
                aria-hidden="true"
                className="h-[2.2rem] w-[2.2rem]"
              />
              <p className="title-lockup title-lockup-pool text-[3rem]">
                OrangeBall
              </p>
            </div>
            <p className="title-lockup text-[2.75rem]">The Imposter</p>
          </div>
          <p className="text-foreground/45 text-sm tracking-[0.22em] uppercase font-semibold">
            Pass And Play Party Game
          </p>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-px bg-linear-to-r from-transparent via-border-light to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-foreground/55 text-center text-sm leading-relaxed"
        >
          Find the imposter among your friends! Everyone gets the same word
          except the imposter. Discuss and figure out who&apos;s faking it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 w-full"
        >
          <Link href="/setup" className="w-full">
            <GlowButton
              color="mint"
              size="lg"
              className="block w-full max-w-76 mx-auto text-center"
            >
              Start Game
            </GlowButton>
          </Link>
          <Link href="/categories" className="w-full">
            <GlowButton color="ember" size="md" className="w-full text-center">
              Manage Categories
            </GlowButton>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full glass rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
            How to Play
          </h3>
          <ol className="text-xs text-foreground/55 space-y-2.5">
            <li className="flex gap-2.5">
              <span className="text-foreground/35 font-mono">01</span>
              <span>Add players and pick categories</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-foreground/35 font-mono">02</span>
              <span>Pass the phone — hold to peek at your word</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-foreground/35 font-mono">03</span>
              <span>Discuss & describe your word without saying it</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-foreground/35 font-mono">04</span>
              <span>Vote out who you think is the imposter!</span>
            </li>
          </ol>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
