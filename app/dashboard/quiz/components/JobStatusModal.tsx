'use client'

import { X, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { QuizJob, JobStatusDisplay } from './types'

interface JobStatusModalProps {
  show: boolean
  jobDetails: QuizJob | null
  onClose: () => void
  onViewQuiz: (job: QuizJob) => void
}

const JobStatusModal: React.FC<JobStatusModalProps> = ({
  show,
  jobDetails,
  onClose,
  onViewQuiz
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

  const getJobStatusDisplay = (job: QuizJob): JobStatusDisplay => {
    switch (job.status) {
      case 'PENDING_UPLOAD':
        return {
          icon: <Clock className="w-5 h-5 text-primary-500" />,
          title: "Awaiting Upload",
          description: "Please upload your PDF file to start processing.",
          color: 'text-primary-500',
          bgColor: 'bg-primary-50',
          progress: 5,
          pulse: false
        }
      case 'PENDING':
        return {
          icon: <Clock className="w-5 h-5 text-primary-500" />,
          title: "Job Queued",
          description: "Your Quiz generation job is in the queue and will start processing shortly.",
          color: 'text-primary-500',
          bgColor: 'bg-primary-50',
          progress: 10,
          pulse: true
        }
      case 'PROCESSING':
        return {
          icon: <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />,
          title: "Processing",
          description: "Our AI is analyzing your content and generating Quiz. This may take a minute...",
          color: 'text-primary-500',
          bgColor: 'bg-primary-50',
          progress: 50,
          pulse: true
        }
      case 'DONE':
        return {
          icon: <CheckCircle className="w-5 h-5 text-success-500" />,
          title: "Complete!",
          description: "Your Quiz have been generated successfully!",
          color: 'text-success-500',
          bgColor: 'bg-success-50',
          progress: 100,
          pulse: false
        }
      case 'FAILED':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-secondary-600" />,
          title: "Failed",
          description: job.error || "There was an error generating your Quiz.",
          color: 'text-secondary-600',
          bgColor: 'bg-secondary-50',
          progress: 0,
          pulse: false
        }
      default:
        return {
          icon: <Clock className="w-5 h-5 text-neutral-500" />,
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-3 z-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-heading font-semibold text-neutral-800">Generating Quiz</h3>
            {jobDetails?.status !== 'PROCESSING' && jobDetails?.status !== 'PENDING' && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            )}
          </div>

          {/* Job Info */}
          {jobDetails && statusDisplay && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING' ? 'animate-pulse' : ''} ${statusDisplay.bgColor}`}>
                  {statusDisplay.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-neutral-800">{jobDetails.title}</p>
                </div>
              </div>

              {/* Status Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${statusDisplay.color}`}>
                    {statusDisplay.title}
                  </span>
                  <span className="text-xs text-neutral-400">Polling every 5s</span>
                </div>

                <div className={`text-xs p-2 rounded ${statusDisplay.bgColor} text-neutral-600`}>
                  {statusDisplay.description}
                </div>

                {/* Progress Bar */}
                {(jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING') && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full overflow-hidden bg-neutral-200">
                      <div className="h-full rounded-full transition-all duration-500 bg-primary-500"
                        style={{ width: `${statusDisplay.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3">
                  {jobDetails.status === 'DONE' && jobDetails.quiz && (
                    <div className="space-y-2">
                      <button
                        onClick={() => onViewQuiz(jobDetails)}
                        className="w-full py-2 rounded-xl text-white text-sm font-medium transition-all bg-primary-500 hover:shadow-md"
                      >
                        View Quiz
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full py-1.5 rounded-xl text-xs font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {jobDetails.status === 'FAILED' && (
                    <div className="space-y-2">
                      <div className="p-2 rounded-xl text-xs bg-secondary-50 text-secondary-700">
                        <p className="font-medium">Error:</p>
                        <p className="mt-0.5">{jobDetails.error}</p>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-full py-2 rounded-xl text-sm font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!jobDetails && (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin mb-2" />
              <p className="text-xs text-neutral-500">Connecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobStatusModal
