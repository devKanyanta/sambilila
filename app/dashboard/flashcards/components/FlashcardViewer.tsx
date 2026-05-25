'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentCard = selectedSet.cards?.[currentCardIndex]
  const totalCards = selectedSet.cards?.length || 0

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="w-full max-w-2xl h-full sm:h-auto flex flex-col">
        {/* Header */}
        <div className={`border-x border-t border-neutral-200 rounded-t-xl sm:rounded-t-2xl ${isMobile ? 'p-3' : 'p-4'} flex items-center justify-between bg-white flex-shrink-0 shadow-sm`}>
          <div className="min-w-0 flex-1 mr-3">
            <h3 className={`${isMobile ? 'text-base font-heading font-medium' : 'text-lg font-heading font-semibold'} truncate text-neutral-800`}>
              {selectedSet.title}
            </h3>
            {!isMobile && <p className="text-sm text-primary-500">{selectedSet.subject}</p>}
          </div>
          <button
            onClick={onClose}
            className={`${isMobile ? 'p-1.5' : 'p-2'} hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0`}
          >
            <X className={isMobile ? "w-5 h-5" : "w-6 h-6"} style={{ color: '#8a8a8a' }} />
          </button>
        </div>

        {/* Card Area */}
        <div className={`border-x border-neutral-200 flex-1 flex items-center justify-center ${isMobile ? 'p-3' : 'p-8'} bg-neutral-50`}>
          {currentCard ? (
            <div
              onClick={onToggleFlip}
              className={`w-full ${isMobile ? 'h-full min-h-[280px]' : 'h-[320px]'} cursor-pointer perspective`}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl flex flex-col items-center justify-center p-4 sm:p-8 backface-hidden bg-primary-500">
                  <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} uppercase tracking-wider mb-3 sm:mb-4 text-neutral-200/80`}>
                    Question
                  </p>
                  <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-heading font-semibold text-center leading-tight px-2 text-white`}>
                    {currentCard.front}
                  </p>
                  {!isMobile && <p className="text-sm mt-6 sm:mt-8 text-neutral-200/60">Click to reveal answer</p>}
                </div>

                {/* Back */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl flex flex-col items-center justify-center p-4 sm:p-8 backface-hidden bg-neutral-800"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} uppercase tracking-wider mb-3 sm:mb-4 text-neutral-200/80`}>
                    Answer
                  </p>
                  <p className={`${isMobile ? 'text-base' : 'text-xl'} font-medium text-center leading-tight px-2 text-white`}>
                    {currentCard.back}
                  </p>
                  {!isMobile && <p className="text-sm mt-6 sm:mt-8 text-neutral-200/60">Click to see question</p>}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-neutral-500">No cards in this set</p>
          )}
        </div>

        {/* Footer Controls */}
        <div className={`border-x border-b border-neutral-200 rounded-b-xl sm:rounded-b-2xl ${isMobile ? 'p-3' : 'p-4'} bg-white flex-shrink-0 shadow-sm`}>
          {/* Progress indicator */}
          <div className={`flex items-center justify-center ${isMobile ? 'mb-2' : 'mb-3'}`}>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-neutral-500`}>
              {isMobile ? `${currentCardIndex + 1}/${totalCards}` : `Card ${currentCardIndex + 1} of ${totalCards}`}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onPrevCard}
              disabled={currentCardIndex === 0}
              className={`${isMobile ? 'p-2.5' : 'p-3'} rounded-xl bg-white border-2 border-neutral-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-neutral-50 hover:border-neutral-300`}
              style={{ minWidth: isMobile ? '44px' : 'auto' }}
            >
              <ChevronLeft className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-neutral-600`} />
            </button>

            {isMobile && (
              <button
                onClick={onToggleFlip}
                className="px-5 py-2.5 rounded-xl font-medium text-sm active:scale-95 bg-primary-500 text-white shadow-sm hover:shadow-md transition-all"
              >
                Flip Card
              </button>
            )}

            <button
              onClick={onNextCard}
              disabled={currentCardIndex === totalCards - 1}
              className={`${isMobile ? 'p-2.5' : 'p-3'} rounded-xl bg-white border-2 border-neutral-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-neutral-50 hover:border-neutral-300`}
              style={{ minWidth: isMobile ? '44px' : 'auto' }}
            >
              <ChevronRight className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-neutral-600`} />
            </button>
          </div>

          {isMobile && totalCards > 1 && (
            <p className="text-center text-xs mt-3 text-neutral-500">Swipe left/right or use buttons to navigate</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlashcardViewer
