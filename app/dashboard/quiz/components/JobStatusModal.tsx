'use client'

import { X, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { colors, gradients, theme } from '@/lib/theme'
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

  const getJobStatusDisplay = (job: QuizJob): JobStatusDisplay => {
    switch (job.status) {
      case 'PENDING_UPLOAD':
      return {
        icon: <Clock className="w-5 h-5" style={{ color: colors.primary[500] }} />,
        title: "Awaiting Upload",
        description: "Please upload your PDF file to start processing.",
        color: colors.primary[500],
        bgColor: colors.primary[50],
        progress: 5,
        pulse: false
      }
      case 'PENDING':
        return {
          icon: <Clock className="w-5 h-5" style={{ color: colors.primary[500] }} />,
          title: "Job Queued",
          description: "Your Quiz generation job is in the queue and will start processing shortly.",
          color: colors.primary[500],
          bgColor: colors.primary[50],
          progress: 10,
          pulse: true
        }
      case 'PROCESSING':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" style={{ color: colors.primary[500] }} />,
          title: "Processing",
          description: "Our AI is analyzing your content and generating Quiz. This may take a minute...",
          color: colors.primary[500],
          bgColor: colors.primary[50],
          progress: 50,
          pulse: true
        }
      case 'DONE':
        return {
          icon: <CheckCircle className="w-5 h-5" style={{ color: colors.success[500] }} />,
          title: "Complete!",
          description: "Your Quiz have been generated successfully!",
          color: colors.success[500],
          bgColor: colors.success[50],
          progress: 100,
          pulse: false
        }
      case 'FAILED':
        return {
          icon: <AlertTriangle className="w-5 h-5" style={{ color: colors.secondary[600] }} />,
          title: "Failed",
          description: job.error || "There was an error generating your Quiz.",
          color: colors.secondary[600],
          bgColor: colors.secondary[50],
          progress: 0,
          pulse: false
        }
      default:
        return {
          icon: <Clock className="w-5 h-5" style={{ color: colors.neutral[500] }} />,
          title: "Processing",
          description: "Checking job status...",
          color: colors.neutral[500],
          bgColor: colors.neutral[50],
          progress: 25,
          pulse: true
        }
    }
  }

  const statusDisplay = jobDetails ? getJobStatusDisplay(jobDetails) : null

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-3 z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div 
        className="w-full max-w-sm border rounded-lg"
        style={{ 
          backgroundColor: styles.background.card,
          borderColor: styles.border.light,
          boxShadow: styles.shadow.lg
        }}
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold" style={{ color: styles.text.primary }}>
              Generating Quiz
            </h3>
            {jobDetails?.status !== 'PROCESSING' && jobDetails?.status !== 'PENDING' && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                style={{ backgroundColor: 'transparent' }}
              >
                <X className="w-4 h-4" style={{ color: styles.text.secondary }} />
              </button>
            )}
          </div>
          
          {/* Job Info */}
          {jobDetails && statusDisplay && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className={`p-2 rounded-full ${jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING' ? 'animate-pulse' : ''}`}
                  style={{ 
                    backgroundColor: statusDisplay.bgColor 
                  }}
                >
                  {statusDisplay.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: styles.text.primary }}>
                    {jobDetails.title}
                  </p>
                </div>
              </div>
              
              {/* Status Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs font-medium"
                    style={{ color: statusDisplay.color }}
                  >
                    {statusDisplay.title}
                  </span>
                  <span className="text-xs" style={{ color: styles.text.light }}>
                    Polling every 5s
                  </span>
                </div>
                
                <div 
                  className="text-xs p-2 rounded"
                  style={{ 
                    backgroundColor: statusDisplay.bgColor,
                    color: styles.text.secondary
                  }}
                >
                  {statusDisplay.description}
                </div>
                
                {/* Progress Bar */}
                {(jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING') && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: colors.neutral[200] }}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          backgroundColor: statusDisplay.color,
                          width: `${statusDisplay.progress}%`
                        }}
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
                        className="w-full py-2 rounded text-white text-sm font-medium transition-all"
                        style={{ 
                          backgroundColor: colors.primary[500]
                        }}
                      >
                        View Quiz
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full py-1.5 rounded text-xs font-medium transition-colors"
                        style={{ 
                          backgroundColor: colors.neutral[100],
                          color: styles.text.secondary
                        }}
                      >
                        Close
                      </button>
                    </div>
                  )}
                  
                  {jobDetails.status === 'FAILED' && (
                    <div className="space-y-2">
                      <div className="p-2 rounded text-xs" style={{ 
                        backgroundColor: colors.secondary[50],
                        color: colors.secondary[700]
                      }}>
                        <p className="font-medium">Error:</p>
                        <p className="mt-0.5">{jobDetails.error}</p>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-full py-2 rounded text-sm font-medium transition-colors"
                        style={{ 
                          backgroundColor: colors.neutral[100],
                          color: styles.text.secondary
                        }}
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
              <Loader2 className="w-5 h-5 animate-spin mb-2" style={{ color: colors.primary[500] }} />
              <p className="text-xs" style={{ color: styles.text.secondary }}>Connecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobStatusModal