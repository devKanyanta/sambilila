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

  return (
    <div 
      className="border rounded-2xl p-6"
      style={{ 
        backgroundColor: styles.background.card,
        borderColor: styles.border.light,
        borderWidth: '1px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
            <BookOpen className="w-5 h-5" style={{ color: colors.primary[500] }} />
          </div>
          <div>
            <h2 className="text-xl font-medium" style={{ color: styles.text.primary }}>
              Your Sets
            </h2>
            <p className="text-sm" style={{ color: styles.text.secondary }}>
              {flashcardSets.length} {flashcardSets.length === 1 ? 'set' : 'sets'}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-lg transition-all hover:bg-gray-50 disabled:opacity-50"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
          title="Refresh sets"
        >
          <RotateCw 
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
            style={{ color: styles.text.secondary }} 
          />
        </button>
      </div>

      {flashcardSets.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
            <BookOpen className="w-8 h-8" style={{ color: colors.neutral[400] }} />
          </div>
          <p style={{ color: styles.text.secondary }} className="mb-2">
            No flashcard sets yet
          </p>
          <p className="text-sm" style={{ color: styles.text.light }}>
            Create your first set above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {flashcardSets.map((set: FlashcardSet) => (
            <button
              key={set.id}
              onClick={() => onOpenSet(set)}
              className="border rounded-xl p-5 text-left transition-all group hover:border-primary/20 hover:-translate-y-0.5 active:translate-y-0"
              style={{ 
                backgroundColor: 'white',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 
                  className="font-medium text-base pr-2 transition-colors group-hover:text-primary"
                  style={{ color: styles.text.primary }}
                >
                  {set.title}
                </h3>
                <ChevronRight 
                  className="w-4 h-4 transition-all opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0" 
                  style={{ color: colors.primary[400] }} 
                />
              </div>
              
              {/* Subject */}
              <p className="text-xs font-medium mb-3 px-2.5 py-1 rounded-full inline-block" 
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  color: colors.primary[500],
                }}>
                {set.subject}
              </p>
              
              {/* Description */}
              {set.description && (
                <p className="text-sm mb-4 line-clamp-2" style={{ color: styles.text.secondary }}>
                  {set.description}
                </p>
              )}
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t" 
                style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium" style={{ color: styles.text.light }}>
                    {set.cards?.length || 0} cards
                  </span>
                </div>
                <span className="text-xs" style={{ color: styles.text.light }}>
                  {formatTimeAgo(set.createdAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default FlashcardGrid