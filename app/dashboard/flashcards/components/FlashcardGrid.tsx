'use client'

import { BookOpen, RotateCw, ChevronRight, FileText, Share2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FlashcardSet } from './types'
import { containerStagger, fadeSlideUp } from '../../animations'
import AnimatedSection, { AnimatedItem } from '../../components/AnimatedSection'
import { ShimmerBlock, ShimmerCard } from '../../components/Shimmer'

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
  const [sharingId, setSharingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleShare = async (setId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSharingId(setId)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(`/api/flashcards/${setId}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to share flashcard set')

      const data = await res.json()
      await navigator.clipboard.writeText(data.shareUrl)

      setCopiedId(setId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Error sharing flashcard set:', err)
    } finally {
      setSharingId(null)
    }
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
    <div>
      {/* Header */}
      <AnimatedItem variants={fadeSlideUp}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {loading ? (
              <>
                <ShimmerBlock className="w-10 h-10 rounded-xl" />
                <div className="space-y-1">
                  <ShimmerBlock className="h-5 w-24" />
                  <ShimmerBlock className="h-3 w-16" />
                </div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="p-2 rounded-xl bg-primary-50"
                >
                  <BookOpen className="w-5 h-5 text-primary-500" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-heading font-medium text-neutral-800">Your Sets</h2>
                  <p className="text-xs text-neutral-500">
                    {flashcardSets.length} {flashcardSets.length === 1 ? 'set' : 'sets'}
                  </p>
                </div>
              </>
            )}
          </div>
          <motion.button
            onClick={onRefresh}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl transition-all bg-white shadow-md hover:shadow-lg disabled:opacity-50"
            title="Refresh sets"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} text-neutral-500`} />
          </motion.button>
        </div>
      </AnimatedItem>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
      ) : flashcardSets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-neutral-100">
            <BookOpen className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-sm font-heading font-medium text-neutral-600 mb-1">No flashcard sets yet</p>
          <p className="text-xs text-neutral-400">Create your first set to get started</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {flashcardSets.map((set: FlashcardSet, idx) => (
            <motion.div
              key={set.id}
              variants={fadeSlideUp}
              custom={idx}
            >
              <button
                onClick={() => onOpenSet(set)}
                className="w-full bg-white rounded-xl p-5 text-left shadow-md transition-all group hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading font-medium text-base text-neutral-800 pr-2 transition-colors group-hover:text-primary-500 line-clamp-1">
                    {set.title}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-primary-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0 mt-0.5" />
                </div>

                <span className="inline-block text-xs font-medium mb-3 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600">
                  {set.subject}
                </span>

                {set.description && (
                  <p className="text-sm mb-4 line-clamp-2 text-neutral-500">{set.description}</p>
                )}                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                    <FileText size={12} />
                    {set.cards?.length || 0} cards
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleShare(set.id, e)}
                      disabled={sharingId === set.id}
                      className="p-1 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
                      title="Share flashcard set"
                    >
                      {copiedId === set.id ? (
                        <Check size={13} className="text-success-500" />
                      ) : (
                        <Share2 size={13} className="text-neutral-400 hover:text-primary-500" />
                      )}
                    </button>
                    <span className="text-xs text-neutral-400">{formatTimeAgo(set.createdAt)}</span>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default FlashcardGrid
