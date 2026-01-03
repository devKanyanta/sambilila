'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { colors, gradients, theme } from '@/lib/theme'
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
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200"
      style={{ backgroundColor: theme.backgrounds.overlay }}
    >
      <div className="w-full max-w-2xl h-full sm:h-auto flex flex-col">
        {/* Header - Simplified for mobile */}
        <div 
          className={`border rounded-t-xl sm:rounded-t-2xl ${isMobile ? 'p-3' : 'p-4'} flex items-center justify-between shadow-lg flex-shrink-0`}
          style={{ 
            backgroundColor: styles.background.card,
            borderColor: styles.border.light,
            boxShadow: styles.shadow.lg
          }}
        >
          <div className="min-w-0 flex-1 mr-3">
            <h3 className={`${isMobile ? 'text-base font-semibold' : 'font-bold text-lg'} truncate`} style={{ color: styles.text.primary }}>
              {selectedSet.title}
            </h3>
            {!isMobile && (
              <p className="text-sm" style={{ color: colors.primary[400] }}>
                {selectedSet.subject}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`${isMobile ? 'p-1.5' : 'p-2'} hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0`}
            style={{ backgroundColor: 'transparent' }}
          >
            <X className={isMobile ? "w-5 h-5" : "w-6 h-6"} style={{ color: styles.text.secondary }} />
          </button>
        </div>

        {/* Card Area - Optimized for mobile */}
        <div 
          className={`border-x flex-1 flex items-center justify-center ${isMobile ? 'p-3' : 'p-8'}`}
          style={{ 
            backgroundColor: colors.neutral[50],
            borderColor: styles.border.light
          }}
        >
          {currentCard ? (
            <div
              onClick={onToggleFlip}
              className={`w-full ${isMobile ? 'h-full min-h-[280px]' : 'h-[320px]'} cursor-pointer perspective-1000`}
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
                  className="absolute inset-0 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl flex flex-col items-center justify-center p-4 sm:p-8 backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    background: gradients.primary,
                    boxShadow: styles.shadow.lg
                  }}
                >
                  <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} uppercase tracking-wider mb-3 sm:mb-4`} style={{ color: colors.neutral[200] }}>
                    Question
                  </p>
                  <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-center leading-tight px-2`} style={{ color: styles.text.inverted }}>
                    {currentCard.front}
                  </p>
                  {!isMobile && (
                    <p className="text-sm mt-6 sm:mt-8" style={{ color: colors.neutral[200] }}>
                      Click to reveal answer
                    </p>
                  )}
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl flex flex-col items-center justify-center p-4 sm:p-8 backface-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #58a4b0 0%, #373f51 100%)',
                    boxShadow: styles.shadow.lg
                  }}
                >
                  <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} uppercase tracking-wider mb-3 sm:mb-4`} style={{ color: colors.neutral[200] }}>
                    Answer
                  </p>
                  <p className={`${isMobile ? 'text-base' : 'text-xl'} font-medium text-center leading-tight px-2`} style={{ color: styles.text.inverted }}>
                    {currentCard.back}
                  </p>
                  {!isMobile && (
                    <p className="text-sm mt-6 sm:mt-8" style={{ color: colors.neutral[200] }}>
                      Click to see question
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: styles.text.secondary }}>No cards in this set</p>
          )}
        </div>

        {/* Footer Controls - Optimized for mobile */}
        <div 
          className={`border rounded-b-xl sm:rounded-b-2xl ${isMobile ? 'p-3' : 'p-4'} shadow-lg flex-shrink-0`}
          style={{ 
            backgroundColor: styles.background.card,
            borderColor: styles.border.light,
            boxShadow: styles.shadow.lg
          }}
        >
          {/* Simplified progress indicator for mobile */}
          <div className={`flex items-center justify-center mb-3 ${isMobile ? 'mb-2' : 'mb-3'}`}>
            <div className="text-center">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} mb-1`} style={{ color: styles.text.secondary }}>
                {isMobile ? `${currentCardIndex + 1}/${totalCards}` : `Card ${currentCardIndex + 1} of ${totalCards}`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onPrevCard}
              disabled={currentCardIndex === 0}
              className={`${isMobile ? 'p-2' : 'p-3'} rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95`}
              style={{ 
                backgroundColor: colors.neutral[100],
                minWidth: isMobile ? '44px' : 'auto'
              }}
            >
              <ChevronLeft className={isMobile ? "w-5 h-5" : "w-6 h-6"} style={{ color: styles.text.secondary }} />
            </button>

            {/* Flip button for mobile */}
            {isMobile && (
              <button
                onClick={onToggleFlip}
                className="px-4 py-2 rounded-lg font-medium text-sm active:scale-95"
                style={{ 
                  background: gradients.primary,
                  color: 'white',
                }}
              >
                Flip Card
              </button>
            )}

            <button
              onClick={onNextCard}
              disabled={currentCardIndex === totalCards - 1}
              className={`${isMobile ? 'p-2' : 'p-3'} rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95`}
              style={{ 
                backgroundColor: colors.neutral[100],
                minWidth: isMobile ? '44px' : 'auto'
              }}
            >
              <ChevronRight className={isMobile ? "w-5 h-5" : "w-6 h-6"} style={{ color: styles.text.secondary }} />
            </button>
          </div>

          {/* Mobile swipe hint */}
          {isMobile && totalCards > 1 && (
            <p className="text-center text-xs mt-3" style={{ color: styles.text.secondary }}>
              Swipe left/right or use buttons to navigate
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlashcardViewer