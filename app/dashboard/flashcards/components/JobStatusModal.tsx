'use client'

import { X, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { FlashcardJob, JobStatusDisplay } from './types'

interface JobStatusModalProps {
  show: boolean
  jobDetails: FlashcardJob | null
  onClose: () => void
  onViewFlashcards: (job: FlashcardJob) => void
}

const JobStatusModal: React.FC<JobStatusModalProps> = ({
  show,
  jobDetails,
  onClose,
  onViewFlashcards
}) => {
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

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl transition-all">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading font-semibold text-neutral-800">Generating Flashcards</h3>
            {jobDetails?.status !== 'PROCESSING' && jobDetails?.status !== 'PENDING' && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            )}
          </div>

          {/* Job Info */}
          {jobDetails && statusDisplay && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING' ? 'animate-pulse' : ''} ${statusDisplay.bgColor}`}>
                  {statusDisplay.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-800">{jobDetails.title}</p>
                  <p className="text-sm text-neutral-500">
                    {jobDetails.subject} &bull; {formatTimeAgo(jobDetails.createdAt)}
                  </p>
                </div>
              </div>

              {/* Status Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${statusDisplay.color}`}>{statusDisplay.title}</span>
                  <span className="text-xs text-neutral-400">Polling every 5s</span>
                </div>

                <div className={`text-sm p-3 rounded-xl ${statusDisplay.bgColor} text-neutral-600`}>
                  {statusDisplay.description}
                </div>

                {/* Progress Bar */}
                {(jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING') && (
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full overflow-hidden bg-neutral-200">
                      <div className="h-full rounded-full transition-all duration-500 bg-primary-500"
                        style={{ width: `${statusDisplay.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Starting...</span>
                      <span>Processing...</span>
                      <span>Complete</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4">
                  {jobDetails.status === 'DONE' && jobDetails.flashcardSet && (
                    <div className="space-y-3">
                      <button
                        onClick={() => onViewFlashcards(jobDetails)}
                        className="w-full py-3 rounded-xl text-white font-medium transition-all bg-primary-500 hover:shadow-md active:scale-[0.98]"
                      >
                        View Flashcards
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {jobDetails.status === 'FAILED' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl text-sm bg-secondary-50 text-secondary-700 border border-secondary-200">
                        <p className="font-medium">Error Details:</p>
                        <p className="mt-1">{jobDetails.error}</p>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {(jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING') && (
                    <div className="pt-2">
                      <p className="text-xs text-center text-neutral-400">
                        You can continue using the app while we process your request
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!jobDetails && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
              <p className="text-neutral-500">Connecting to job server...</p>
            </div>
          )}
        </div>

        {/* Processing Animation */}
        {(jobDetails?.status === 'PENDING' || jobDetails?.status === 'PROCESSING') && (
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              <span className="text-xs text-neutral-400">Processing your request</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobStatusModal
