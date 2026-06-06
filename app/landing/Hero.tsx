'use client'

import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export function Hero() {
  return (
    <section className="relative bg-[#ececec] overflow-hidden min-h-[90vh] flex items-center">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-85">
        {/* Track 1 (Left Area) */}
        <div className="absolute top-0 left-[4%] w-10 h-full bg-[#d6d6d6]" />
        <div className="absolute top-[25%] left-[4%] w-[12%] h-10 bg-[#d6d6d6]" />
        <div className="absolute top-[25%] left-[16%] w-10 h-[40%] bg-[#d6d6d6]" />
        <div className="absolute top-[65%] left-[8%] w-[8.5%] h-10 bg-[#d6d6d6]" />
        <div className="absolute top-[45%] left-[8%] w-10 h-[35%] bg-[#d6d6d6]" />

        {/* Track 2 (Center-Left / Behind Text) */}
        <div className="absolute top-0 left-[32%] w-10 h-[55%] bg-[#d6d6d6]" />
        <div className="absolute top-[55%] left-[20%] w-[25%] h-10 bg-[#d6d6d6]" />
        <div className="absolute top-[35%] left-[20%] w-10 h-[20%] bg-[#d6d6d6]" />
        <div className="absolute top-[35%] left-[20%] w-[8%] h-10 bg-[#d6d6d6]" />
        
        {/* Track 3 (Center-Right / Between Text & Image) */}
        <div className="absolute top-[15%] left-[48%] w-10 h-[75%] bg-[#d6d6d6]" />
        <div className="absolute top-[15%] left-[45%] w-[15%] h-10 bg-[#d6d6d6]" />
        <div className="absolute top-[45%] left-[48%] w-[18%] h-10 bg-[#d6d6d6]" />
        <div className="absolute top-[75%] left-[38%] w-[22%] h-10 bg-[#d6d6d6]" />
        <div className="absolute top-[75%] left-[38%] w-10 h-[25%] bg-[#d6d6d6]" />

        {/* Track 4 (Right Area / Behind Image) */}
        <div className="absolute top-0 right-[22%] w-10 h-full bg-[#d6d6d6]" />
        <div className="absolute top-[30%] right-[10%] w-[25%] h-10 bg-[#d6d6d6]" />
        <div className="absolute top-[30%] right-[10%] w-10 h-[40%] bg-[#d6d6d6]" />
        <div className="absolute top-[70%] right-[10%] w-[12%] h-10 bg-[#d6d6d6]" />
        <div className="absolute top-[50%] right-[30%] w-[8%] h-10 bg-[#d6d6d6]" />
        
        {/* Track 5 (Far Right Edge) */}
        <div className="absolute top-[10%] right-[4%] w-10 h-[80%] bg-[#d6d6d6]" />
        <div className="absolute top-[90%] right-[4%] w-[10%] h-10 bg-[#d6d6d6]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10 w-full">
        {/* Controlled gap to account for the larger image sizing */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-12 w-full">
          
          {/* Left Content Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-xl shrink-0"
          >
            {/* Heading */}
            <motion.h1 
              variants={itemVariants} 
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-fredoka font-bold text-[#2d4a3e] leading-[1.1] tracking-tight"
            >
              With <span className="text-[#ff5252]">Lernopia</span>,
              <br />
              Master any subject
            </motion.h1>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 rounded-[2rem] text-lg sm:text-xl font-medium text-white bg-[#ff5252] hover:bg-[#eb4b4b] hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Start Learning
              </a>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white bg-[#2d4a3e] hover:bg-[#233a30] hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                aria-label="Get Started"
              >
                <ArrowUpRight className="w-8 h-8 stroke-[1.5]" />
              </Link>
            </motion.div>

            {/* Description */}
            <motion.p variants={itemVariants} className="mt-8 text-lg md:text-xl text-neutral-600 max-w-md leading-relaxed font-medium">
              Turn your notes into interactive quizzes and smart flashcards. Study smarter, remember longer, and ace your goals.
            </motion.p>

            {/* Social Proof / Avatars */}
            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=11" alt="Student 1" className="w-12 h-12 rounded-full border-2 border-[#ececec] object-cover" />
                <img src="https://i.pravatar.cc/100?img=12" alt="Student 2" className="w-12 h-12 rounded-full border-2 border-[#ececec] object-cover" />
                <img src="https://i.pravatar.cc/100?img=13" alt="Student 3" className="w-12 h-12 rounded-full border-2 border-[#ececec] object-cover" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[#ff5252] font-bold text-sm">10K+</span>
                <span className="text-neutral-800 font-semibold text-sm">Students</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            // {/* Increased max-w from max-w-xl to max-w-2xl or max-w-3xl depending on preference */}
            className="w-full max-w-2xl lg:max-w-3xl shrink flex items-center justify-center relative"
          >
            <img
              src="/hero.png"
              alt="Student using Lernopia"
              className="object-contain w-full h-auto max-h-[100vh] transition-transform duration-500"
            />
          </motion.div>

        </div>
      </div>
    </section>
  )
}