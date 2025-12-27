import { useState, useCallback, useRef } from 'react'
import { QuizJob } from '../components/types'

export function useQuizJobs() {
  const [activeJobs, setActiveJobs] = useState<QuizJob[]>([])
  const [showJobModal, setShowJobModal] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [jobDetails, setJobDetails] = useState<QuizJob | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const pollJobStatus = useCallback(async (jobId: string): Promise<QuizJob | null> => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/quizzes/upload?jobId=${jobId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        if (res.status === 404) {
          const mainRes = await fetch(`/api/quizzes?jobId=${jobId}`, {
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

  const updateJobInList = useCallback((updatedJob: QuizJob) => {
    setActiveJobs(prev => prev.map(job => 
      job.id === updatedJob.id ? { ...job, ...updatedJob } : job
    ))
  }, [])

  const startJobMonitoring = useCallback(async (jobId: string, onJobComplete?: () => void) => {
    setCurrentJobId(jobId)
    setShowJobModal(true)
    
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
    await pollAndUpdate()

    // Set up interval for polling
    const interval = setInterval(pollAndUpdate, 5000)
    pollingIntervalRef.current = interval

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pollJobStatus, updateJobInList])

  const closeJobModal = useCallback(() => {
    setShowJobModal(false)
    setCurrentJobId(null)
    setJobDetails(null)
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  const addNewJob = useCallback((job: QuizJob) => {
    setActiveJobs(prev => [...prev, job])
  }, [])

  return {
    activeJobs,
    showJobModal,
    currentJobId,
    jobDetails,
    startJobMonitoring,
    closeJobModal,
    addNewJob,
    updateJobInList
  }
}