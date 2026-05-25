'use client'

import { BookOpen, RotateCw, ChevronRight } from 'lucide-react'
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50">
            <BookOpen className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-neutral-800">Your Sets</h2>
            <p className="text-sm text-neutral-500">
              {flashcardSets.length} {flashcardSets.length === 1 ? 'set' : 'sets'}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-xl transition-all bg-neutral-50 shadow-sm hover:bg-neutral-100 disabled:opacity-50"
          title="Refresh sets"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} text-neutral-500`} />
        </button>
      </div>

      {flashcardSets.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-neutral-100">
            <BookOpen className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 mb-2">No flashcard sets yet</p>
          <p className="text-sm text-neutral-400">Create your first set above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {flashcardSets.map((set: FlashcardSet) => (
            <button
              key={set.id}
              onClick={() => onOpenSet(set)}
              className="bg-white rounded-xl p-5 text-left shadow-md transition-all group hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-heading font-semibold text-base text-neutral-800 pr-2 transition-colors group-hover:text-primary-500 truncate">
                  {set.title}
                </h3>
                <ChevronRight className="w-4 h-4 text-primary-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0" />
              </div>

              {/* Subject badge */}
              <span className="inline-block text-xs font-medium mb-3 px-2.5 py-1 rounded-full bg-primary-50 text-primary-500">
                {set.subject}
              </span>

              {/* Description */}
              {set.description && (
                <p className="text-sm mb-4 line-clamp-2 text-neutral-500">{set.description}</p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <span className="text-xs font-medium text-neutral-400">{set.cards?.length || 0} cards</span>
                <span className="text-xs text-neutral-400">{formatTimeAgo(set.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default FlashcardGrid
