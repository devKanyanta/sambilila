'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { BookOpen, Brain, Sparkles, GraduationCap, ArrowRight, X } from 'lucide-react'
import { useEffect } from 'react'

interface FirstTimeModalProps {
  show: boolean
  onClose: () => void
}

export default function FirstTimeModal({ show, onClose }: FirstTimeModalProps) {
  const router = useRouter()

  // Lock body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [show])

  const handleCreateFlashcards = () => {
    onClose()
    router.push('/dashboard/flashcards?create=true')
  }

  const handleCreateQuiz = () => {
    onClose()
    router.push('/dashboard/quiz?create=true')
  }

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Decorative header gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary-500/10 via-primary-400/5 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-neutral-400 hover:text-neutral-600 hover:bg-white transition-all shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-6 sm:p-8 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4 shadow-sm"
              >
                <GraduationCap className="w-8 h-8 text-primary-600" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <h2 className="text-xl sm:text-2xl font-heading font-semibold text-neutral-900 mb-1">
                  Welcome to Lernopia!
                </h2>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  Start your learning journey by creating your first study material. Choose an option below to get started.
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="h-px bg-neutral-100 my-6 mx-2"
              />

              {/* Option cards */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
                }}
                className="space-y-3"
              >
                {/* Create Flashcards */}
                <motion.button
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 250, damping: 22 } },
                  }}
                  onClick={handleCreateFlashcards}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-neutral-100 hover:border-primary-300 hover:bg-primary-50/30 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-heading font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                      Create Flashcards
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Generate AI-powered flashcards from your notes or PDFs
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </motion.button>

                {/* Create Quiz */}
                <motion.button
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 250, damping: 22 } },
                  }}
                  onClick={handleCreateQuiz}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-neutral-100 hover:border-secondary-300 hover:bg-secondary-50/30 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center group-hover:bg-secondary-100 transition-colors flex-shrink-0">
                    <Brain className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-heading font-semibold text-neutral-900 group-hover:text-secondary-600 transition-colors">
                      Generate a Quiz
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Test your knowledge with AI-generated quizzes from your content
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-secondary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </motion.button>
              </motion.div>

              {/* Sparkle footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="mt-6 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                <span className="text-xs text-neutral-400">
                  Powered by AI — just paste your notes and we'll do the rest
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
