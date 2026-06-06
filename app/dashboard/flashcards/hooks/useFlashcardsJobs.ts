import { useState, useCallback, useRef } from 'react'
import { FlashcardJob } from '../components/types'

export function useFlashcardJobs() {
  const [activeJobs, setActiveJobs] = useState<FlashcardJob[]>([])
  const [showJobModal, setShowJobModal] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [jobDetails, setJobDetails] = useState<FlashcardJob | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const pollJobStatus = useCallback(async (jobId: string): Promise<FlashcardJob | null> => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/flashcards/upload?jobId=${jobId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        if (res.status === 404) {
          const mainRes = await fetch(`/api/flashcards?jobId=${jobId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
          
          if (!mainRes.ok) throw new Error(`Failed to poll job (${mainRes.status})`)
          const data = await mainRes.json()
          return data.job || null
        }
        throw new Error(`Failed to poll job (${res.status})`)
      }
      
      const data = await res.json()
      return data.job || null
    } catch (err) {
      console.error('Error polling job:', err)
      return null
    }
  }, [])

  const updateJobInList = useCallback((updatedJob: FlashcardJob) => {
    setActiveJobs(prev => prev.map(job => 
      job.id === updatedJob.id ? { ...job, ...updatedJob } : job
    ))
  }, [])

  /** Shared polling logic extracted so both startJobMonitoring and retryJob can use it */
  const startPolling = useCallback((jobId: string, onJobComplete?: () => void) => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    const pollAndUpdate = async () => {
      const job = await pollJobStatus(jobId)
      if (job) {
        setJobDetails(job)
        updateJobInList(job)
        
        if (job.status === 'DONE' || job.status === 'FAILED') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          if (onJobComplete) onJobComplete()
        }
      }
    }

    // Initial poll
    pollAndUpdate()

    // Set up interval for polling
    const interval = setInterval(pollAndUpdate, 5000)
    pollingIntervalRef.current = interval
  }, [pollJobStatus, updateJobInList])

  const startJobMonitoring = useCallback(async (jobId: string, onJobComplete?: () => void) => {
    setCurrentJobId(jobId)
    setShowJobModal(true)
    startPolling(jobId, onJobComplete)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [startPolling])

  /** Retry a failed job by updating its status to PENDING and restarting polling */
  const retryJob = useCallback(async (jobId: string, onJobComplete?: () => void) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/flashcards/retry`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to retry job")
      }

      const data = await res.json()

      if (data.job) {
        // Immediately update the job to PENDING so the modal reflects the change
        setJobDetails(data.job)
        updateJobInList(data.job)
      }

      // Restart polling for this job (polling was stopped when it hit FAILED)
      startPolling(jobId, onJobComplete)
    } catch (err) {
      console.error('Error retrying job:', err)
      throw err
    }
  }, [startPolling, updateJobInList])

  const closeJobModal = useCallback(() => {
    setShowJobModal(false)
    setCurrentJobId(null)
    setJobDetails(null)
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  const addNewJob = useCallback((job: FlashcardJob) => {
    setActiveJobs(prev => [...prev, job])
  }, [])

  return {
    activeJobs,
    showJobModal,
    currentJobId,
    jobDetails,
    startJobMonitoring,
    retryJob,
    closeJobModal,
    addNewJob,
    updateJobInList
  }
}