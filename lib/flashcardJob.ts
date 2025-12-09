// lib/flashcardJob.ts
export async function checkJobStatus(jobId: string): Promise<{
  status: string;
  flashcardSet: any | null;
  error?: string;
}> {
  const response = await fetch(`/api/flashcards?jobId=${jobId}`)
  
  if (!response.ok) {
    throw new Error('Failed to check job status')
  }
  
  const data = await response.json()
  return {
    status: data.job?.status || 'UNKNOWN',
    flashcardSet: data.flashcardSet,
    error: data.job?.error
  }
}

export async function pollJobCompletion(jobId: string, options = {
  interval: 2000,
  timeout: 300000 // 5 minutes
}): Promise<any> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const poll = async () => {
      try {
        const { status, flashcardSet, error } = await checkJobStatus(jobId)
        
        if (status === 'DONE') {
          resolve(flashcardSet)
        } else if (status === 'FAILED') {
          reject(new Error(error || 'Job failed'))
        } else if (Date.now() - startTime > options.timeout) {
          reject(new Error('Job timeout'))
        } else {
          // Still processing, poll again
          setTimeout(poll, options.interval)
        }
      } catch (error) {
        reject(error)
      }
    }
    
    // Start polling
    poll()
  })
}