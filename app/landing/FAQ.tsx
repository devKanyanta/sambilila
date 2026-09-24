'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    question: "Do I need to create an account?",
    answer: "No. Lernopia works the moment you open it — your progress is saved automatically in your browser session. If you later want to sync across devices, you can claim your session with an email in a few seconds, but that's entirely optional."
  },
  {
    question: "Is it really free? What's the catch?",
    answer: "It's really free — every feature, no trial timers, no locked content. Lernopia is funded by optional donations from people who want to keep education accessible. That's the whole model."
  },
  {
    question: "How does the AI generate learning materials?",
    answer: "Our AI analyzes your content, identifies key concepts and relationships, and creates optimized quizzes and flashcards using natural language processing and educational best practices."
  },
  {
    question: "How do donations work?",
    answer: "You choose any amount (from $1) and pay once via PayPal or mobile money (MTN, Airtel). No recurring charges, ever — it's a one-time gift, not a subscription."
  },
  {
    question: "What are fair-use limits?",
    answer: "To keep AI costs sustainable, we apply generous caps: around 25 quizzes per week and 500 flashcards. For normal studying you'll never hit them — they only exist to prevent abuse."
  },
  {
    question: "Can I still create an account?",
    answer: "Yes! Creating an account (or claiming your guest session) lets you sync your quizzes, flashcards, and streaks across devices. Head to the Profile page any time to claim your session."
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-white py-16 md:py-24 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-fredoka font-bold text-neutral-900 tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-base text-neutral-500 max-w-xl mx-auto">
            Everything you need to know about Lernopia
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-xl overflow-hidden border border-neutral-200 bg-white hover:border-neutral-300 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex justify-between items-center text-left gap-4"
              >
                <span className="font-semibold text-neutral-900 text-sm md:text-base">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <Plus className="w-5 h-5 text-primary-500" />
                </motion.div>
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-6 pb-5"
                >
                  <p className="text-sm text-neutral-500 leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-sm text-neutral-500 mb-4">
            Still have questions? We&apos;d love to help
          </p>
          <Link
            href="/contact"
            className="btn-outline inline-flex px-6 py-3 text-sm rounded-xl"
          >
            Contact support
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
