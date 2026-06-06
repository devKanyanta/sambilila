'use client'

import { X, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { FlashcardJob, JobStatusDisplay } from './types'
import { useEffect, useState } from 'react'
import BottomSheet from '../../components/BottomSheet'

interface JobStatusModalProps {
  show: boolean
  jobDetails: FlashcardJob | null
  onClose: () => void
  onViewFlashcards: (job: FlashcardJob) => void
  onRetry?: (job: FlashcardJob) => void
  retrying?: boolean
}

const JobStatusModal: React.FC<JobStatusModalProps> = ({
  show,
  jobDetails,
  onClose,
  onViewFlashcards,
  onRetry,
  retrying
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!show) return null

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

  const getJobStatusDisplay = (job: FlashcardJob): JobStatusDisplay => {
    switch (job.status) {
      case 'PENDING_UPLOAD':
        return {
          icon: <Clock className="w-6 h-6 text-primary-500" />,
          title: "Waiting for Upload",
          description: "Ready to receive your PDF file. Upload in progress...",
          color: 'text-primary-500',
          bgColor: 'bg-primary-50',
          progress: 5,
          pulse: true
        }
      case 'PENDING':
        return {
          icon: <Clock className="w-6 h-6 text-primary-500" />,
          title: "Job Queued",
          description: "Your flashcard generation job is in the queue and will start processing shortly.",
          color: 'text-primary-500',
          bgColor: 'bg-primary-50',
          progress: 10,
          pulse: true
        }
      case 'PROCESSING':
        return {
          icon: <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />,
          title: "Processing",
          description: "Our AI is analyzing your content and generating flashcards. This may take a minute...",
          color: 'text-primary-500',
          bgColor: 'bg-primary-50',
          progress: 50,
          pulse: true
        }
      case 'DONE':
        return {
          icon: <CheckCircle className="w-6 h-6 text-success-500" />,
          title: "Complete!",
          description: "Your flashcards have been generated successfully!",
          color: 'text-success-500',
          bgColor: 'bg-success-50',
          progress: 100,
          pulse: false
        }
      case 'FAILED':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-secondary-600" />,
          title: "Failed",
          description: job.error || "There was an error generating your flashcards.",
          color: 'text-secondary-600',
          bgColor: 'bg-secondary-50',
          progress: 0,
          pulse: false
        }
      default:
        return {
          icon: <Clock className="w-6 h-6 text-neutral-500" />,
          title: "Processing",
          description: "Checking job status...",
          color: 'text-neutral-500',
          bgColor: 'bg-neutral-50',
          progress: 25,
          pulse: true
        }
    }
  }

  const statusDisplay = jobDetails ? getJobStatusDisplay(jobDetails) : null

  const content = (
    <>
      {jobDetails && statusDisplay ? (
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className={`p-3 rounded-full ${statusDisplay.bgColor}`}
            >
              {statusDisplay.icon}
            </motion.div>
            <div className="flex-1">
              <p className="font-medium text-neutral-800">{jobDetails.title}</p>
              <p className="text-sm text-neutral-500">
                {jobDetails.subject} &bull; {formatTimeAgo(jobDetails.createdAt)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${statusDisplay.color}`}>{statusDisplay.title}</span>
            </div>

            <div className={`text-sm p-3 rounded-xl ${statusDisplay.bgColor} text-neutral-600`}>
              {statusDisplay.description}
            </div>

            {(jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING') && (
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full overflow-hidden bg-neutral-200">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${statusDisplay.progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-primary-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Queued</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                    Processing
                  </span>
                  <span>Done</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              {jobDetails.status === 'DONE' && jobDetails.flashcardSet && (
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onViewFlashcards(jobDetails)}
                    className="w-full py-3 rounded-xl text-white font-medium transition-all bg-primary-500 hover:shadow-md"
                  >
                    View Flashcards
                  </motion.button>
                  <button onClick={onClose} className="w-full py-2.5 rounded-xl font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors text-sm">
                    Close
                  </button>
                </div>
              )}

              {jobDetails.status === 'FAILED' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl text-sm bg-secondary-50 text-secondary-700">
                    <p className="font-medium">Error Details:</p>
                    <p className="mt-1">{jobDetails.error || 'Unknown error'}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onRetry?.(jobDetails)}
                      disabled={retrying}
                      className="flex-1 py-3 rounded-xl text-white font-medium transition-all bg-primary-500 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {retrying ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Retrying...
                        </span>
                      ) : (
                        'Retry'
                      )}
                    </motion.button>
                    <button onClick={onClose} className="px-4 py-3 rounded-xl font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors text-sm">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {(jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING') && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                  <span className="text-xs text-neutral-400">Processing your request</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
          <p className="text-sm text-neutral-500">Connecting to job server...</p>
        </div>
      )}
    </>
  )

  // Use BottomSheet on mobile, modal on desktop
  if (isMobile) {
    return (
      <BottomSheet show={show} onClose={onClose} title="Generating Flashcards">
        {content}
      </BottomSheet>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <h3 className="text-lg font-heading font-medium text-neutral-800">Generating Flashcards</h3>
          {jobDetails?.status !== 'PROCESSING' && jobDetails?.status !== 'PENDING' && (
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          )}
        </div>
        {content}
      </motion.div>
    </div>
  )
}

export default JobStatusModal
