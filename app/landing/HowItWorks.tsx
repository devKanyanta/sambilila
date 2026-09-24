'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Upload, Wand2, GraduationCap, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Add your notes',
    description:
      'Paste text or upload a PDF — lecture notes, textbook chapters, anything you need to learn.',
  },
  {
    icon: Wand2,
    step: '02',
    title: 'AI does the work',
    description:
      'Lernopia identifies the key concepts and builds a personalized quiz and flashcard deck in seconds.',
  },
  {
    icon: GraduationCap,
    step: '03',
    title: 'Study & track progress',
    description:
      'Practice with interactive quizzes, flip through smart flashcards, and watch your scores climb.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-neutral-50 py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-y border-neutral-200/70">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-fredoka font-bold text-neutral-900 tracking-tight"
          >
            Three steps to <span className="text-primary-500">smarter studying</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto"
          >
            From raw notes to confident recall — in under a minute.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="relative bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Step number */}
                <span className="absolute top-6 right-7 text-sm font-bold text-neutral-200 font-fredoka">
                  {step.step}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5 text-primary-500" strokeWidth={2} />
                </div>

                <h3 className="text-lg font-fredoka font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/dashboard"
            className="btn-primary inline-flex px-8 py-3.5 text-base rounded-xl"
          >
            Try it now — it&apos;s free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
