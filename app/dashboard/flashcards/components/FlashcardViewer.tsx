'use client'

import { ChevronLeft, ChevronRight, X, RotateCw, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { FlashcardSet } from './types'
import { useEffect, useState } from 'react'

interface FlashcardViewerProps {
  selectedSet: FlashcardSet
  currentCardIndex: number
  isFlipped: boolean
  onClose: () => void
  onNextCard: () => void
  onPrevCard: () => void
  onToggleFlip: () => void
  showSignupCta?: boolean
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  selectedSet,
  currentCardIndex,
  isFlipped,
  onClose,
  onNextCard,
  onPrevCard,
  onToggleFlip,
  showSignupCta = false
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentCard = selectedSet.cards?.[currentCardIndex]
  const totalCards = selectedSet.cards?.length || 0

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50">
      <div className="w-full max-w-2xl h-full sm:h-auto flex flex-col">
        {/* Header */}
        <div className="border-x border-t border-neutral-100 rounded-t-2xl p-4 flex items-center justify-between bg-white flex-shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <h3 className="text-lg font-heading font-medium truncate text-neutral-900">
              {selectedSet.title}
            </h3>
            {!isMobile && <p className="text-sm text-neutral-400">{selectedSet.subject}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Card Area */}
        <div className={`border-x border-neutral-100 flex-1 flex items-center justify-center p-4 sm:p-8 bg-neutral-50`}>
          {currentCard ? (
            <div
              onClick={onToggleFlip}
              className="w-full sm:max-w-lg h-full min-h-[300px] sm:h-[340px] cursor-pointer perspective"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front */}
                <div className="absolute inset-0 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 sm:p-10 backface-hidden bg-white border border-neutral-100">
                  <p className="text-[10px] uppercase tracking-widest mb-4 text-neutral-400 font-medium">
                    Question
                  </p>
                  <p className="text-xl sm:text-2xl font-heading font-medium text-center leading-relaxed text-neutral-900">
                    {currentCard.front}
                  </p>
                  <p className="text-sm mt-auto text-neutral-300">Tap to reveal answer</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 sm:p-10 backface-hidden bg-primary-50 border border-primary-100"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <p className="text-[10px] uppercase tracking-widest mb-4 text-primary-400 font-medium">
                    Answer
                  </p>
                  <p className="text-lg sm:text-xl font-medium text-center leading-relaxed text-neutral-900">
                    {currentCard.back}
                  </p>
                  <p className="text-sm mt-auto text-primary-300">Tap to see question</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-neutral-400">No cards in this set</p>
          )}
        </div>

        {/* Footer Controls */}
        <div className="border-x border-b border-neutral-100 rounded-b-2xl p-4 bg-white flex-shrink-0">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-3">
            <p className="text-xs text-neutral-400">
              {currentCardIndex + 1} / {totalCards}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onPrevCard}
              disabled={currentCardIndex === 0}
              className="p-3 rounded-xl bg-white border border-neutral-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-neutral-50 hover:border-neutral-300"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-600" />
            </button>

            <button
              onClick={onToggleFlip}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm active:scale-95 bg-primary-500 text-white shadow-sm hover:shadow-md hover:bg-primary-600 transition-all"
            >
              <RotateCw className="w-4 h-4" />
              Flip
            </button>

            <button
              onClick={onNextCard}
              disabled={currentCardIndex === totalCards - 1}
              className="p-3 rounded-xl bg-white border border-neutral-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-neutral-50 hover:border-neutral-300"
            >
              <ChevronRight className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {showSignupCta && (
            <Link
              href="/auth/register"
              className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Create your own flashcards — Sign up free
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlashcardViewer
