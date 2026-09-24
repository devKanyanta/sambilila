'use client'

import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export function Hero() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle grid pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(20,21,24,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,21,24,0.045) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 100%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-semibold mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Free forever — no account needed
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-[4.25rem] font-fredoka font-bold text-neutral-900 leading-[1.08] tracking-tight"
            >
              Master any subject{' '}
              <span className="text-primary-500">in minutes</span>, not hours
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed"
            >
              Turn your notes into interactive quizzes and smart flashcards.
              No sign-up, no paywall — just start studying.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                href="/dashboard"
                className="btn-primary w-full sm:w-auto px-8 py-4 text-base rounded-xl"
              >
                Start studying free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-outline w-full sm:w-auto px-8 py-4 text-base rounded-xl"
              >
                See how it works
              </a>
            </motion.div>

            {/* Trust line */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-neutral-400 font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                No credit card
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                Works on any device
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                Powered by AI
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
