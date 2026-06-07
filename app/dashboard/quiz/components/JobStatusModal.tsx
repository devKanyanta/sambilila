'use client'

import { X, Loader2, CheckCircle, AlertTriangle, Clock, Sparkles } from 'lucide-react'
import { QuizJob, JobStatusDisplay } from './types'

interface JobStatusModalProps {
  show: boolean
  jobDetails: QuizJob | null
  onClose: () => void
  onViewQuiz: (job: QuizJob) => void
  onRetry?: (job: QuizJob) => void
  retrying?: boolean
}

const JobStatusModal: React.FC<JobStatusModalProps> = ({ show, jobDetails, onClose, onViewQuiz, onRetry, retrying }) => {
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

  const getJobStatusDisplay = (job: QuizJob): JobStatusDisplay => {
    switch (job.status) {
      case 'PENDING_UPLOAD':
        return { icon: <Clock className="w-5 h-5 text-primary-500" />, title: "Awaiting Upload", description: "Please upload your PDF file to start processing.", color: 'text-primary-500', bgColor: 'bg-primary-50', progress: 5, pulse: false }
      case 'PENDING':
        return { icon: <Clock className="w-5 h-5 text-primary-500" />, title: "Queued", description: "Your quiz generation job is in the queue.", color: 'text-primary-500', bgColor: 'bg-primary-50', progress: 10, pulse: true }
      case 'PROCESSING':
        return { icon: <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />, title: "Generating", description: "AI is analyzing your content and creating your quiz...", color: 'text-primary-500', bgColor: 'bg-primary-50', progress: 50, pulse: true }
      case 'DONE':
        return { icon: <CheckCircle className="w-5 h-5 text-success-500" />, title: "Complete!", description: "Your quiz has been generated!", color: 'text-success-500', bgColor: 'bg-success-50', progress: 100, pulse: false }
      case 'FAILED':
        return { icon: <AlertTriangle className="w-5 h-5 text-red-400" />, title: "Failed", description: job.error || "There was an error generating your quiz.", color: 'text-red-400', bgColor: 'bg-red-50', progress: 0, pulse: false }
      default:
        return { icon: <Clock className="w-5 h-5 text-neutral-400" />, title: "Processing", description: "Checking job status...", color: 'text-neutral-400', bgColor: 'bg-neutral-50', progress: 25, pulse: true }
    }
  }

  const statusDisplay = jobDetails ? getJobStatusDisplay(jobDetails) : null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary-50">
              <Sparkles className="w-4 h-4 text-primary-500" />
            </div>
            <h3 className="text-base font-heading font-medium text-neutral-900 flex-1">Generating Quiz</h3>
            {jobDetails?.status !== 'PROCESSING' && jobDetails?.status !== 'PENDING' && (
              <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            )}
          </div>

          {jobDetails && statusDisplay && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${statusDisplay.bgColor}`}>
                  {statusDisplay.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{jobDetails.title}</p>
                  <p className={`text-xs mt-0.5 ${statusDisplay.color}`}>{statusDisplay.title}</p>
                </div>
              </div>

              <div className={`text-xs p-3 rounded-xl ${statusDisplay.bgColor} text-neutral-600 leading-relaxed`}>
                {statusDisplay.description}
              </div>

              {/* Progress Bar */}
              {(jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING') && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full overflow-hidden bg-neutral-100">
                    <div className="h-full rounded-full transition-all duration-700 bg-primary-400"
                      style={{ width: `${statusDisplay.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 text-right">Checking every 5s</p>
                </div>
              )}

              {/* Action Buttons */}
              {jobDetails.status === 'DONE' && jobDetails.quiz && (
                <div className="space-y-2 pt-2">
                  <button onClick={() => onViewQuiz(jobDetails)}
                    className="w-full py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 hover:shadow-sm transition-all active:scale-95">
                    View Quiz
                  </button>
                  <button onClick={onClose}
                    className="w-full py-2 rounded-xl text-xs font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors">
                    Close
                  </button>
                </div>
              )}

              {jobDetails.status === 'FAILED' && (
                <div className="space-y-2 pt-2">
                  <div className="p-3 rounded-xl text-xs bg-red-50 text-red-600 border border-red-100">
                    <p className="font-medium mb-0.5">Error:</p>
                    <p>{jobDetails.error}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRetry?.(jobDetails)}
                      disabled={retrying}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 hover:shadow-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {retrying ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Retrying...
                        </span>
                      ) : (
                        'Retry'
                      )}
                    </button>
                    <button onClick={onClose}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!jobDetails && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin mb-3" />
              <p className="text-xs text-neutral-400">Connecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobStatusModal
