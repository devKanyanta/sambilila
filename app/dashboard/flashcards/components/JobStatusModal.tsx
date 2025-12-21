'use client'

import { X, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { colors, gradients, theme } from '@/lib/theme'
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

  const getJobStatusDisplay = (job: FlashcardJob): JobStatusDisplay => {
    switch (job.status) {
      case 'PENDING':
        return {
          icon: <Clock className="w-6 h-6" style={{ color: colors.primary[500] }} />,
          title: "Job Queued",
          description: "Your flashcard generation job is in the queue and will start processing shortly.",
          color: colors.primary[500],
          bgColor: colors.primary[50],
          progress: 10,
          pulse: true
        }
      case 'PROCESSING':
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.primary[500] }} />,
          title: "Processing",
          description: "Our AI is analyzing your content and generating flashcards. This may take a minute...",
          color: colors.primary[500],
          bgColor: colors.primary[50],
          progress: 50,
          pulse: true
        }
      case 'DONE':
        return {
          icon: <CheckCircle className="w-6 h-6" style={{ color: colors.success[500] }} />,
          title: "Complete!",
          description: "Your flashcards have been generated successfully!",
          color: colors.success[500],
          bgColor: colors.success[50],
          progress: 100,
          pulse: false
        }
      case 'FAILED':
        return {
          icon: <AlertTriangle className="w-6 h-6" style={{ color: colors.secondary[600] }} />,
          title: "Failed",
          description: job.error || "There was an error generating your flashcards.",
          color: colors.secondary[600],
          bgColor: colors.secondary[50],
          progress: 0,
          pulse: false
        }
      default:
        return {
          icon: <Clock className="w-6 h-6" style={{ color: colors.neutral[500] }} />,
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

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '0.9'
    e.currentTarget.style.boxShadow = styles.shadow.lg
  }

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '1'
    e.currentTarget.style.boxShadow = styles.shadow.md
  }

  const handleDismissButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = colors.neutral[200]
  }

  const handleDismissButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = colors.neutral[100]
  }

  return (
    <div 
      className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="w-full max-w-md border rounded-2xl shadow-2xl transform transition-all duration-300 animate-in zoom-in-95"
        style={{ 
          backgroundColor: styles.background.card,
          borderColor: styles.border.light,
          boxShadow: styles.shadow.xl
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: styles.text.primary }}>
              Generating Flashcards
            </h3>
            {jobDetails?.status !== 'PROCESSING' && jobDetails?.status !== 'PENDING' && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
              >
                <X className="w-5 h-5" style={{ color: styles.text.secondary }} />
              </button>
            )}
          </div>
          
          {/* Job Info */}
          {jobDetails && statusDisplay && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className={`p-3 rounded-full ${jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING' ? 'animate-pulse' : ''}`}
                  style={{ 
                    backgroundColor: statusDisplay.bgColor 
                  }}
                >
                  {statusDisplay.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: styles.text.primary }}>
                    {jobDetails.title}
                  </p>
                  <p className="text-sm" style={{ color: styles.text.secondary }}>
                    {jobDetails.subject} • {formatTimeAgo(jobDetails.createdAt)}
                  </p>
                </div>
              </div>
              
              {/* Status Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: statusDisplay.color }}
                  >
                    {statusDisplay.title}
                  </span>
                  <span className="text-xs" style={{ color: styles.text.light }}>
                    Polling every 5s
                  </span>
                </div>
                
                <div 
                  className="text-sm p-3 rounded-lg"
                  style={{ 
                    backgroundColor: statusDisplay.bgColor,
                    color: styles.text.secondary
                  }}
                >
                  {statusDisplay.description}
                </div>
                
                {/* Progress Bar */}
                {(jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING') && (
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: colors.neutral[200] }}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          backgroundColor: statusDisplay.color,
                          width: `${statusDisplay.progress}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: styles.text.light }}>
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
                        onClick={() => {
                          onViewFlashcards(jobDetails)
                        }}
                        className="w-full py-3 rounded-xl text-white font-medium transition-all"
                        style={{ 
                          background: gradients.primary,
                          boxShadow: styles.shadow.md
                        }}
                        onMouseEnter={handleButtonMouseEnter}
                        onMouseLeave={handleButtonMouseLeave}
                      >
                        View Flashcards
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl font-medium transition-colors"
                        style={{ 
                          backgroundColor: colors.neutral[100],
                          color: styles.text.secondary
                        }}
                        onMouseEnter={handleDismissButtonMouseEnter}
                        onMouseLeave={handleDismissButtonMouseLeave}
                      >
                        Close
                      </button>
                    </div>
                  )}
                  
                  {jobDetails.status === 'FAILED' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg text-sm" style={{ 
                        backgroundColor: colors.secondary[50],
                        color: colors.secondary[700],
                        border: `1px solid ${colors.secondary[200]}`
                      }}>
                        <p className="font-medium">Error Details:</p>
                        <p className="mt-1">{jobDetails.error}</p>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-medium transition-colors"
                        style={{ 
                          backgroundColor: colors.neutral[100],
                          color: styles.text.secondary
                        }}
                        onMouseEnter={handleDismissButtonMouseEnter}
                        onMouseLeave={handleDismissButtonMouseLeave}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  
                  {(jobDetails.status === 'PENDING' || jobDetails.status === 'PROCESSING') && (
                    <div className="pt-2">
                      <p className="text-xs text-center" style={{ color: styles.text.light }}>
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
              <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: colors.primary[500] }} />
              <p style={{ color: styles.text.secondary }}>Connecting to job server...</p>
            </div>
          )}
        </div>
        
        {/* Processing Animation */}
        {(jobDetails?.status === 'PENDING' || jobDetails?.status === 'PROCESSING') && (
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary[500] }}></div>
                <div className="w-2 h-2 rounded-full animate-pulse delay-75" style={{ backgroundColor: colors.primary[500] }}></div>
                <div className="w-2 h-2 rounded-full animate-pulse delay-150" style={{ backgroundColor: colors.primary[500] }}></div>
              </div>
              <span className="text-xs" style={{ color: styles.text.light }}>Processing your request</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobStatusModal