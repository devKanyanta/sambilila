'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { colors, gradients, theme } from '@/lib/theme'
import { FlashcardSet } from './types'

interface FlashcardViewerProps {
  selectedSet: FlashcardSet
  currentCardIndex: number
  isFlipped: boolean
  onClose: () => void
  onNextCard: () => void
  onPrevCard: () => void
  onToggleFlip: () => void
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  selectedSet,
  currentCardIndex,
  isFlipped,
  onClose,
  onNextCard,
  onPrevCard,
  onToggleFlip
}) => {
  const styles = {
    background: {
      card: theme.backgrounds.card,
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      inverted: theme.text.inverted,
    },
    border: {
      light: theme.borders.light,
    },
    shadow: theme.shadows,
  }

  const currentCard = selectedSet.cards?.[currentCardIndex]
  const totalCards = selectedSet.cards?.length || 0

  const handlePrevCardMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (currentCardIndex !== 0) {
      e.currentTarget.style.backgroundColor = colors.neutral[200]
    }
  }

  const handlePrevCardMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (currentCardIndex !== 0) {
      e.currentTarget.style.backgroundColor = colors.neutral[100]
    }
  }

  const handleNextCardMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (currentCardIndex !== totalCards - 1) {
      e.currentTarget.style.backgroundColor = colors.neutral[200]
    }
  }

  const handleNextCardMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (currentCardIndex !== totalCards - 1) {
      e.currentTarget.style.backgroundColor = colors.neutral[100]
    }
  }

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      style={{ backgroundColor: theme.backgrounds.overlay }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div 
          className="border rounded-t-2xl p-4 flex items-center justify-between shadow-lg"
          style={{ 
            backgroundColor: styles.background.card,
            borderColor: styles.border.light,
            boxShadow: styles.shadow.lg
          }}
        >
          <div>
            <h3 className="font-bold text-lg" style={{ color: styles.text.primary }}>
              {selectedSet.title}
            </h3>
            <p className="text-sm" style={{ color: colors.primary[400] }}>
              {selectedSet.subject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ backgroundColor: 'transparent' }}
          >
            <X className="w-6 h-6" style={{ color: styles.text.secondary }} />
          </button>
        </div>

        {/* Card */}
        <div 
          className="border-x p-8 min-h-[400px] flex items-center justify-center"
          style={{ 
            backgroundColor: colors.neutral[50],
            borderColor: styles.border.light
          }}
        >
          {currentCard ? (
            <div
              onClick={onToggleFlip}
              className="w-full h-[320px] cursor-pointer perspective-1000"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    background: gradients.primary,
                    boxShadow: styles.shadow.xl
                  }}
                >
                  <p className="text-xs uppercase tracking-wider mb-4" style={{ color: colors.neutral[200] }}>
                    Question
                  </p>
                  <p className="text-2xl font-bold text-center" style={{ color: styles.text.inverted }}>
                    {currentCard.front}
                  </p>
                  <p className="text-sm mt-8" style={{ color: colors.neutral[200] }}>
                    Click to reveal answer
                  </p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #58a4b0 0%, #373f51 100%)',
                    boxShadow: styles.shadow.xl
                  }}
                >
                  <p className="text-xs uppercase tracking-wider mb-4" style={{ color: colors.neutral[200] }}>
                    Answer
                  </p>
                  <p className="text-xl font-medium text-center" style={{ color: styles.text.inverted }}>
                    {currentCard.back}
                  </p>
                  <p className="text-sm mt-8" style={{ color: colors.neutral[200] }}>
                    Click to see question
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: styles.text.secondary }}>No cards in this set</p>
          )}
        </div>

        {/* Footer Controls */}
        <div 
          className="border rounded-b-2xl p-4 shadow-lg"
          style={{ 
            backgroundColor: styles.background.card,
            borderColor: styles.border.light,
            boxShadow: styles.shadow.lg
          }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={onPrevCard}
              disabled={currentCardIndex === 0}
              className="p-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: colors.neutral[100] }}
              onMouseEnter={handlePrevCardMouseEnter}
              onMouseLeave={handlePrevCardMouseLeave}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: styles.text.secondary }} />
            </button>

            <div className="text-center">
              <p className="text-sm mb-1" style={{ color: styles.text.secondary }}>
                Card {currentCardIndex + 1} of {totalCards}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: totalCards }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all"
                    style={{ 
                      width: i === currentCardIndex ? '2rem' : '0.375rem',
                      backgroundColor: i === currentCardIndex ? colors.primary[400] : colors.neutral[300]
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={onNextCard}
              disabled={currentCardIndex === totalCards - 1}
              className="p-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: colors.neutral[100] }}
              onMouseEnter={handleNextCardMouseEnter}
              onMouseLeave={handleNextCardMouseLeave}
            >
              <ChevronRight className="w-6 h-6" style={{ color: styles.text.secondary }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashcardViewer