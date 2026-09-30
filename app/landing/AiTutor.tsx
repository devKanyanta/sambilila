'use client'

import { motion } from 'framer-motion'
import { Sparkles, MessageCircle, BookOpen, Brain, Bot } from 'lucide-react'

const points = [
  {
    icon: BookOpen,
    title: 'Any topic you choose',
    description:
      'No notes required. Pick a subject — from algebra to world history — and get a full lesson.',
  },
  {
    icon: MessageCircle,
    title: 'Learns by conversation',
    description:
      'Ask questions, get explanations, and go deeper until the concept truly clicks.',
  },
  {
    icon: Brain,
    title: 'Adapts to your pace',
    description:
      'The tutor checks understanding as it teaches and adjusts to exactly where you are.',
  },
]

const topicChips = ['Photosynthesis', 'Algebra', 'World War II']

const chat = [
  {
    from: 'tutor' as const,
    text: 'Great choice! Let\'s break photosynthesis into 3 simple steps. First, light is captured in the leaf…',
  },
  {
    from: 'user' as const,
    text: 'Why do plants need sunlight?',
  },
  {
    from: 'tutor' as const,
    text: 'Think of sunlight as the battery that powers everything — no light, no energy to build sugar…',
  },
]

export function AiTutor() {
  return (
    <section id="ai-tutor" className="bg-neutral-50 py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-y border-neutral-200/70">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Coming soon
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-fredoka font-bold text-neutral-900 tracking-tight leading-tight">
              Your personal{' '}
              <span className="text-primary-500">AI tutor</span>
            </h2>

            <p className="mt-5 text-lg text-neutral-500 leading-relaxed">
              We&apos;re building an AI tutor that teaches you any topic you
              choose — step by step, one conversation at a time. It&apos;s the
              next chapter of Lernopia, and it&apos;s on the way.
            </p>

            <div className="mt-8 space-y-5">
              {points.map((point) => {
                const Icon = point.icon
                return (
                  <div key={point.title} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary-500" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">{point.title}</h3>
                      <p className="text-sm text-neutral-500 mt-0.5 leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="mt-10 text-sm text-neutral-400">
              In development now — keep an eye on Lernopia.
            </p>
          </motion.div>

          {/* Visual chat preview */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="bg-secondary-800 rounded-3xl p-8 sm:p-10 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Lernopia Tutor</p>
                    <p className="text-white/50 text-xs">Your study companion</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                  Preview
                </span>
              </div>

              {/* Topic chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {topicChips.map((topic, i) => (
                  <span
                    key={topic}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border ${
                      i === 0
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/70'
                    }`}
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* Chat bubbles */}
              <div className="space-y-3 mb-6">
                {chat.map((message, i) =>
                  message.from === 'tutor' ? (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary-400" />
                      </div>
                      <div className="bg-white/10 rounded-xl rounded-tl-sm px-4 py-2.5 text-sm text-white/80 leading-relaxed max-w-[85%]">
                        {message.text}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-end">
                      <div className="bg-primary-500 rounded-xl rounded-tr-sm px-4 py-2.5 text-sm text-white leading-relaxed max-w-[85%]">
                        {message.text}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Fake input */}
              <div className="h-12 rounded-xl bg-white flex items-center px-4 text-sm text-neutral-400 mb-6">
                Ask your tutor anything…
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white font-fredoka">∞</p>
                  <p className="text-xs text-white/50">Topics</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-fredoka">1:1</p>
                  <p className="text-xs text-white/50">Just for you</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-fredoka">24/7</p>
                  <p className="text-xs text-white/50">Always available</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
