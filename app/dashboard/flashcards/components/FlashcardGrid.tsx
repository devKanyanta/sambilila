'use client'

import { BookOpen, RotateCw, ChevronRight } from 'lucide-react'
import { colors, gradients, theme } from '@/lib/theme'
import { FlashcardSet } from './types'

interface FlashcardGridProps {
  flashcardSets: FlashcardSet[]
  onOpenSet: (set: FlashcardSet) => void
  onRefresh: () => void
  loading?: boolean
}

const FlashcardGrid: React.FC<FlashcardGridProps> = ({ 
  flashcardSets, 
  onOpenSet, 
  onRefresh,
  loading = false 
}) => {
  const styles = {
    background: {
      card: theme.backgrounds.card,
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      light: theme.text.light,
    },
    border: {
      light: theme.borders.light,
    },
    shadow: theme.shadows,
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = colors.primary[100]
    e.currentTarget.style.borderColor = colors.primary[300]
    e.currentTarget.style.boxShadow = styles.shadow.md
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = colors.primary[50]
    e.currentTarget.style.borderColor = colors.primary[200]
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div 
      className="border rounded-2xl p-6 shadow-lg"
      style={{ 
        backgroundColor: styles.background.card,
        borderColor: styles.border.light,
        boxShadow: styles.shadow.lg
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5" style={{ color: colors.primary[400] }} />
        <h2 className="text-xl font-semibold" style={{ color: styles.text.primary }}>
          Your Flashcard Sets
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'transparent' }}
          title="Refresh sets"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: styles.text.secondary }} />
        </button>
      </div>

      {flashcardSets.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full mb-3" style={{ backgroundColor: colors.neutral[50] }}>
            <BookOpen className="w-12 h-12" style={{ color: colors.neutral[400] }} />
          </div>
          <p style={{ color: styles.text.secondary }}>No flashcard sets yet. Create your first one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcardSets.map((set: FlashcardSet) => (
            <button
              key={set.id}
              onClick={() => onOpenSet(set)}
              className="border rounded-xl p-5 text-left transition-all transform hover:scale-[1.02] active:scale-[0.98] group"
              style={{ 
                background: gradients.neutral,
                borderColor: colors.primary[200],
                backgroundColor: colors.primary[50]
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 
                  className="font-bold text-lg transition-colors"
                  style={{ color: styles.text.primary }}
                >
                  {set.title}
                </h3>
                <ChevronRight className="w-5 h-5 transition-colors" style={{ color: colors.neutral[500] }} />
              </div>
              <p className="text-sm mb-3" style={{ color: colors.primary[400] }}>{set.subject}</p>
              {set.description && (
                <p className="text-xs mb-3 line-clamp-2" style={{ color: styles.text.secondary }}>
                  {set.description}
                </p>
              )}
              {!!set.cards?.length && (
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary[200] }}>
                    <span className="text-xs font-medium" style={{ color: colors.primary[700] }}>
                      {set.cards.length} cards
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: styles.text.light }}>
                    {formatTimeAgo(set.createdAt)}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default FlashcardGrid