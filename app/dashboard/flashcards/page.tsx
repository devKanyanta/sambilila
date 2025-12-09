'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, RotateCw, BookOpen, Plus, Sparkles, Upload, FileText, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { colors, gradients, theme } from '@/lib/theme'

type Flashcard = {
  id: string
  front: string
  back: string
  order: number
}

type FlashcardSet = {
  id: string
  title: string
  subject: string
  description?: string
  cards?: Flashcard[]
  createdAt: string
}

type FlashcardJob = {
  id: string
  title: string
  subject: string
  description: string
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  error?: string
  createdAt: string
  flashcardSet?: FlashcardSet
}

export default function Flashcards() {
  /* =================== STATE =================== */
  const [mounted, setMounted] = useState(false)
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [activeJobs, setActiveJobs] = useState<FlashcardJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const [inputText, setInputText] = useState('')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Viewer state
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Theme-based styles
  const styles = {
    background: {
      main: theme.backgrounds.main,
      card: theme.backgrounds.card,
      sidebar: theme.backgrounds.sidebar,
      navbar: theme.backgrounds.navbar,
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      light: theme.text.light,
      inverted: theme.text.inverted,
      accent: theme.text.accent,
      dark: theme.text.light,
    },
    border: {
      light: theme.borders.light,
      medium: theme.borders.medium,
      dark: theme.borders.dark,
      accent: theme.borders.accent,
    },
    state: {
      hover: {
        light: theme.states.hover.light,
        primary: theme.states.hover.primary,
      },
      active: {
        light: theme.states.active.light,
        primary: theme.states.active.primary,
      },
      disabled: theme.states.disabled,
    },
    shadow: theme.shadows,
  }

  /* =================== MOUNT FIX =================== */
  useEffect(() => {
    setMounted(true)
    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [])

  /* ================= LOAD USER SETS ================= */
  useEffect(() => {
    if (!mounted) return
    loadFlashcardSets()
  }, [mounted])

  async function loadFlashcardSets() {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch('/api/flashcards', { 
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      })
      if (!res.ok) throw new Error(`Failed to load sets (${res.status})`)

      const json = await res.json()
      const sets = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []
      setFlashcardSets(sets)
    } catch (err) {
      console.error(err)
      setError('Failed to load flashcard sets')
      setFlashcardSets([])
    }
  }

  /* ================= POLL JOB STATUS ================= */
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const token = localStorage.getItem("token")
      // Poll the upload endpoint for job status
      const res = await fetch(`/api/flashcards/upload?jobId=${jobId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        // If job not found in upload endpoint, try main endpoint
        if (res.status === 404) {
          const mainRes = await fetch(`/api/flashcards?jobId=${jobId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
          
          if (!mainRes.ok) throw new Error(`Failed to poll job (${mainRes.status})`)
          return await mainRes.json()
        }
        throw new Error(`Failed to poll job (${res.status})`)
      }
      
      return await res.json()
    } catch (err) {
      console.error('Error polling job:', err)
      return null
    }
  }, [])

  const startPollingJobs = useCallback((jobIds: string[]) => {
    if (pollingInterval) clearInterval(pollingInterval)
    
    const interval = setInterval(async () => {
      const updatedJobs = await Promise.all(
        activeJobs.map(async (job) => {
          if (job.status === 'PENDING' || job.status === 'PROCESSING') {
            const data = await pollJobStatus(job.id)
            if (data?.job) {
              return {
                ...job,
                status: data.job.status,
                error: data.job.error,
                flashcardSet: data.flashcardSet
              }
            }
          }
          return job
        })
      )
      
      setActiveJobs(updatedJobs)
      
      // Remove completed jobs from active list after 10 seconds
      const completedJobs = updatedJobs.filter(job => 
        job.status === 'DONE' || job.status === 'FAILED'
      )
      
      if (completedJobs.length > 0) {
        setTimeout(() => {
          setActiveJobs(prev => prev.filter(job => 
            !completedJobs.some(completed => completed.id === job.id)
          ))
          // Refresh flashcard sets when jobs complete
          loadFlashcardSets()
        }, 10000)
      }
      
      // If all jobs are done, clear interval
      if (updatedJobs.every(job => job.status === 'DONE' || job.status === 'FAILED')) {
        clearInterval(interval)
      }
    }, 3000) // Poll every 3 seconds
    
    setPollingInterval(interval)
  }, [activeJobs, pollJobStatus])

  /* ================= CREATE FLASHCARDS ================= */
  // ... (Your imports and state declarations remain the same) ...

  /* ================= CREATE FLASHCARDS ================= */
async function handleGenerate() {
  if (!inputText.trim() && !selectedFile) {
    setError("Please provide either text or upload a PDF file");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    /* ==================================================
       STEP 1 — CREATE JOB + REQUEST SIGNED UPLOAD DATA
    ================================================== */

    const metadataForm = new FormData();

    if (inputText.trim()) {
      metadataForm.append("text", inputText.trim());
    }

    if (selectedFile) {
      metadataForm.append("fileName", selectedFile.name);
      metadataForm.append("contentType", selectedFile.type);
    }

    metadataForm.append("title", title || "AI Generated Flashcards");
    metadataForm.append("subject", subject || "General");

    if (description) {
      metadataForm.append("description", description);
    }

    const jobRes = await fetch("/api/flashcards/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: metadataForm,
    });

    const jobData = await jobRes.json();

    if (!jobRes.ok) {
      throw new Error(jobData?.error || "Failed to create flashcard job");
    }

    /* ==================================================
       STEP 2 — UPLOAD FILE TO R2 (PDF ONLY)
    ================================================== */

    /* ==================================================
   STEP 2 — UPLOAD FILE TO R2 USING PUT METHOD
================================================== */

if (selectedFile && jobData.signedUrl) {
  console.log("📤 Uploading file to R2 using PUT…");

  try {
    // For PUT method, we just need to send the file directly
    const r2Res = await fetch(jobData.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": selectedFile.type || "application/pdf",
        // You might need to add other headers based on your R2 setup
        // "x-amz-meta-filename": selectedFile.name,
      },
      body: selectedFile,
    });

    if (!r2Res.ok) {
      console.error("R2 PUT Upload failed:", {
        status: r2Res.status,
        statusText: r2Res.statusText,
      });
      
      // Try to get error details
      let errorDetails = "";
      try {
        errorDetails = await r2Res.text();
        console.error("Error details:", errorDetails);
      } catch (e) {
        // Ignore if we can't read response
      }
      
      if (r2Res.status === 403) {
        throw new Error("Upload denied. The signed URL may have expired.");
      }
      
      throw new Error(`Upload failed: ${r2Res.status} ${r2Res.statusText}`);
    }

    console.log("✅ R2 PUT upload complete:", jobData.fileKey);
  } catch (err: any) {
    console.error("Upload error:", err);
    
    // Optionally: Cancel the job if upload fails
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/flashcards/upload?jobId=${jobData.jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (cancelErr) {
      console.error("Failed to cancel job after upload error:", cancelErr);
    }
    
    throw err; // Re-throw to be caught by the outer try-catch
  }
}
    /* ==================================================
       STEP 3 — REGISTER JOB LOCALLY & START POLLING
    ================================================== */

    const newJob: FlashcardJob = {
      id: jobData.jobId,
      title: jobData.job.title,
      subject: jobData.job.subject,
      description: jobData.job.description,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setActiveJobs((prev) => [...prev, newJob]);

    startPollingJobs([
      ...activeJobs.map((j) => j.id),
      jobData.jobId,
    ]);

    /* ==================================================
       STEP 4 — RESET FORM
    ================================================== */

    setInputText("");
    setTitle("");
    setSubject("");
    setDescription("");
    setSelectedFile(null);
  } catch (err: any) {
    console.error("GENERATION ERROR:", err);
    setError(err.message || "Flashcard generation failed");
  } finally {
    setLoading(false);
  }
}

// ... (The rest of your component functions remain the same) ...

  // NOTE: You must also ensure your cancelJob function is robust, 
  // as it may be called if the R2 upload fails.
  /* ================= FILE HANDLING ================= */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file')
        e.target.value = ''
        return
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError('File size must be less than 10MB')
        e.target.value = ''
        return
      }

      setSelectedFile(file)
      setError(null)
    }
  }

  function removeFile() {
    setSelectedFile(null)
  }

  /* ================= VIEWER FUNCTIONS ================= */
  function openSet(set: FlashcardSet) {
    setSelectedSet(set)
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  function closeViewer() {
    setSelectedSet(null)
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  function nextCard() {
    if (!selectedSet?.cards) return
    if (currentCardIndex < selectedSet.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }

  function prevCard() {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }

  function toggleFlip() {
    setIsFlipped(prev => !prev)
  }

  /* ================= HELPER FUNCTIONS ================= */
  function getJobStatusIcon(status: string) {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" style={{ color: colors.primary[500] }} />
      case 'PROCESSING':
        return <RotateCw className="w-4 h-4 animate-spin" style={{ color: colors.primary[500] }} />
      case 'DONE':
        return <CheckCircle className="w-4 h-4" style={{ color: colors.success[500] }} />
      case 'FAILED':
        return <AlertCircle className="w-4 h-4" style={{ color: colors.secondary[600] }} />
      default:
        return <Clock className="w-4 h-4" style={{ color: colors.neutral[500] }} />
    }
  }

  function getJobStatusText(status: string) {
    switch (status) {
      case 'PENDING':
        return 'Queued'
      case 'PROCESSING':
        return 'Generating...'
      case 'DONE':
        return 'Completed'
      case 'FAILED':
        return 'Failed'
      default:
        return status
    }
  }

  function formatTimeAgo(dateString: string) {
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

  /* ================= HANDLE JOB CANCELLATION ================= */
  async function cancelJob(jobId: string) {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/flashcards/upload?jobId=${jobId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to cancel job')
      }
      
      // Remove job from active list
      setActiveJobs(prev => prev.filter(job => job.id !== jobId))
    } catch (err) {
      console.error('Error cancelling job:', err)
      setError('Failed to cancel job')
    }
  }

  if (!mounted) return null

  const currentCard = selectedSet?.cards?.[currentCardIndex]
  const totalCards = selectedSet?.cards?.length || 0

  /* ================= UI ================= */
  return (
    <div style={{ backgroundColor: styles.background.main, minHeight: '100vh' }}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: styles.text.primary }}>
              Flashcard Studio
            </h1>
            <p className="text-sm" style={{ color: colors.primary[400] }}>
              AI-powered learning made simple
            </p>
          </div>
        </div>

        {/* Active Jobs Section */}
        {activeJobs.length > 0 && (
          <div 
            className="border rounded-2xl p-6 shadow-lg"
            style={{ 
              backgroundColor: styles.background.card,
              borderColor: styles.border.light,
              boxShadow: styles.shadow.lg
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" style={{ color: colors.primary[400] }} />
              <h2 className="text-xl font-semibold" style={{ color: styles.text.primary }}>
                Active Processes
              </h2>
              <span 
                className="ml-2 px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: colors.primary[100],
                  color: colors.primary[700]
                }}
              >
                {activeJobs.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {activeJobs.map(job => (
                <div 
                  key={job.id}
                  className="border rounded-xl p-4"
                  style={{ 
                    backgroundColor: colors.neutral[50],
                    borderColor: styles.border.medium
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getJobStatusIcon(job.status)}
                      <div>
                        <p className="font-medium" style={{ color: styles.text.primary }}>
                          {job.title}
                        </p>
                        <p className="text-sm" style={{ color: styles.text.secondary }}>
                          {job.subject} • {formatTimeAgo(job.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium" style={{ 
                        color: job.status === 'DONE' ? colors.success[600] : 
                               job.status === 'FAILED' ? colors.secondary[600] : 
                               colors.primary[600]
                      }}>
                        {getJobStatusText(job.status)}
                      </span>
                      
                      {job.status === 'PENDING' && (
                        <button
                          onClick={() => cancelJob(job.id)}
                          className="px-3 py-1 text-sm rounded-lg transition-colors"
                          style={{ 
                            backgroundColor: colors.secondary[100],
                            color: colors.secondary[700]
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.secondary[200]
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colors.secondary[100]
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      
                      {job.status === 'DONE' && job.flashcardSet && (
                        <button
                          onClick={() => openSet(job.flashcardSet!)}
                          className="px-3 py-1 text-sm rounded-lg transition-colors"
                          style={{ 
                            backgroundColor: colors.primary[100],
                            color: colors.primary[700]
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.primary[200]
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colors.primary[100]
                          }}
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {job.status === 'FAILED' && job.error && (
                    <div className="mt-2 p-2 rounded text-sm" style={{ 
                      backgroundColor: colors.secondary[50],
                      color: colors.secondary[700]
                    }}>
                      {job.error}
                    </div>
                  )}
                  
                  {job.status === 'PROCESSING' && (
                    <div className="mt-2">
                      <div className="h-1 w-full rounded-full overflow-hidden" style={{ backgroundColor: colors.neutral[200] }}>
                        <div 
                          className="h-full rounded-full animate-pulse"
                          style={{ 
                            backgroundColor: colors.primary[500],
                            width: '50%'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Form */}
        <div 
          className="border rounded-2xl p-6 shadow-lg"
          style={{ 
            backgroundColor: styles.background.card,
            borderColor: styles.border.light,
            boxShadow: styles.shadow.lg
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5" style={{ color: colors.primary[400] }} />
            <h2 className="text-xl font-semibold" style={{ color: styles.text.primary }}>
              Create New Set
            </h2>
          </div>
          
          <div className="space-y-3">
            <input
              className="w-full px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                backgroundColor: colors.neutral[50],
                border: `1px solid ${styles.border.medium}`,
                color: styles.text.primary,
                boxShadow: styles.shadow.sm
              }}
              placeholder="Set Title (e.g., Biology Chapter 5)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: colors.neutral[50],
                  border: `1px solid ${styles.border.medium}`,
                  color: styles.text.primary,
                  boxShadow: styles.shadow.sm
                }}
                placeholder="Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
              <input
                className="px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: colors.neutral[50],
                  border: `1px solid ${styles.border.medium}`,
                  color: styles.text.primary,
                  boxShadow: styles.shadow.sm
                }}
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <textarea
              className="w-full px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all min-h-[120px] resize-none"
              style={{ 
                backgroundColor: colors.neutral[50],
                border: `1px solid ${styles.border.medium}`,
                color: styles.text.primary,
                boxShadow: styles.shadow.sm
              }}
              placeholder="Paste your study material here... Our AI will generate flashcards automatically!"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            
            {/* PDF Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: styles.text.secondary }}>
                <FileText className="w-4 h-4" />
                <span>Or upload a PDF file</span>
              </div>
              
              {!selectedFile ? (
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div 
                    className="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
                    style={{ 
                      borderColor: styles.border.medium,
                      backgroundColor: 'transparent',
                      borderStyle: 'dashed'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.primary[400]
                      e.currentTarget.style.backgroundColor = colors.primary[50]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = styles.border.medium
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: colors.neutral[500] }} />
                    <p className="text-sm font-medium" style={{ color: styles.text.secondary }}>Click to upload PDF</p>
                    <p className="text-xs mt-1" style={{ color: styles.text.light }}>PDF files only, max 10MB</p>
                  </div>
                </label>
              ) : (
                <div 
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ 
                    backgroundColor: colors.primary[50],
                    border: `1px solid ${colors.primary[200]}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary[400] }}>
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: styles.text.primary }}>
                        {selectedFile.name}
                      </p>
                      <p className="text-xs" style={{ color: styles.text.secondary }}>
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: colors.secondary[600] }} />
                  </button>
                </div>
              )}
            </div>

            <button
              className="w-full px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              onClick={handleGenerate}
              disabled={loading || (!inputText.trim() && !selectedFile)}
              style={{ 
                background: gradients.primary,
                boxShadow: styles.shadow.lg
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.boxShadow = styles.shadow.xl
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.boxShadow = styles.shadow.lg
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Creating Job...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate Flashcards
                </span>
              )}
            </button>
            
            {/* Info note */}
            <p className="text-xs text-center" style={{ color: styles.text.light }}>
              Note: Processing may take a few moments. You can continue using the app while your flashcards are being generated.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="rounded-xl p-4"
            style={{ 
              backgroundColor: colors.secondary[50],
              border: `1px solid ${colors.secondary[200]}`
            }}
          >
            <p className="font-medium" style={{ color: colors.secondary[600] }}>{error}</p>
          </div>
        )}

        {/* Flashcard Sets Grid */}
        <div 
          className="border rounded-2xl p-6 shadow-lg"
          style={{ 
            backgroundColor: styles.background.card,
            borderColor: styles.border.light,
            boxShadow: styles.shadow.lg
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" style={{ color: colors.primary[400] }} />
            <h2 className="text-xl font-semibold" style={{ color: styles.text.primary }}>
              Your Flashcard Sets
            </h2>
            <button
              onClick={loadFlashcardSets}
              className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ backgroundColor: 'transparent' }}
              title="Refresh sets"
            >
              <RotateCw className="w-4 h-4" style={{ color: styles.text.secondary }} />
            </button>
          </div>

          {flashcardSets.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full mb-3" style={{ backgroundColor: colors.neutral[50] }}>
                <BookOpen className="w-12 h-12" style={{ color: colors.neutral[400] }} />
              </div>
              <p style={{ color: styles.text.secondary }}>No flashcard sets yet. Create your first one above!</p>
              {activeJobs.length > 0 && (
                <p className="text-sm mt-2" style={{ color: styles.text.light }}>
                  You have {activeJobs.length} active job{activeJobs.length !== 1 ? 's' : ''} being processed.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcardSets.map(set => (
                <button
                  key={set.id}
                  onClick={() => openSet(set)}
                  className="border rounded-xl p-5 text-left transition-all transform hover:scale-[1.02] active:scale-[0.98] group"
                  style={{ 
                    background: gradients.neutral,
                    borderColor: colors.primary[200],
                    backgroundColor: colors.primary[50]
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary[100]
                    e.currentTarget.style.borderColor = colors.primary[300]
                    e.currentTarget.style.boxShadow = styles.shadow.md
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary[50]
                    e.currentTarget.style.borderColor = colors.primary[200]
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className="font-bold text-lg transition-colors"
                      style={{ color: styles.text.primary }}
                    >
                      {set.title}
                    </h3>
                    <ChevronRight className="w-5 h-5 transition-colors" style={{ color: colors.neutral[500] }} />
                  </div>
                  <p className="text-sm mb-3" style={{ color: colors.primary[400] }}>{set.subject}</p>
                  {set.description && (
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: styles.text.secondary }}>
                      {set.description}
                    </p>
                  )}
                  {!!set.cards?.length && (
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary[200] }}>
                        <span className="text-xs font-medium" style={{ color: colors.primary[700] }}>
                          {set.cards.length} cards
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: styles.text.light }}>
                        {formatTimeAgo(set.createdAt)}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flashcard Viewer Modal */}
      {selectedSet && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          style={{ backgroundColor: theme.backgrounds.overlay }}
        >
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div 
              className="border rounded-t-2xl p-4 flex items-center justify-between shadow-lg"
              style={{ 
                backgroundColor: styles.background.card,
                borderColor: styles.border.light,
                boxShadow: styles.shadow.lg
              }}
            >
              <div>
                <h3 className="font-bold text-lg" style={{ color: styles.text.primary }}>
                  {selectedSet.title}
                </h3>
                <p className="text-sm" style={{ color: colors.primary[400] }}>
                  {selectedSet.subject}
                </p>
              </div>
              <button
                onClick={closeViewer}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
              >
                <X className="w-6 h-6" style={{ color: styles.text.secondary }} />
              </button>
            </div>

            {/* Card */}
            <div 
              className="border-x p-8 min-h-[400px] flex items-center justify-center"
              style={{ 
                backgroundColor: colors.neutral[50],
                borderColor: styles.border.light
              }}
            >
              {currentCard ? (
                <div
                  onClick={toggleFlip}
                  className="w-full h-[320px] cursor-pointer perspective-1000"
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        background: gradients.primary,
                        boxShadow: styles.shadow.xl
                      }}
                    >
                      <p className="text-xs uppercase tracking-wider mb-4" style={{ color: colors.neutral[200] }}>
                        Question
                      </p>
                      <p className="text-2xl font-bold text-center" style={{ color: styles.text.inverted }}>
                        {currentCard.front}
                      </p>
                      <p className="text-sm mt-8" style={{ color: colors.neutral[200] }}>
                        Click to reveal answer
                      </p>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: 'linear-gradient(135deg, #58a4b0 0%, #373f51 100%)',
                        boxShadow: styles.shadow.xl
                      }}
                    >
                      <p className="text-xs uppercase tracking-wider mb-4" style={{ color: colors.neutral[200] }}>
                        Answer
                      </p>
                      <p className="text-xl font-medium text-center" style={{ color: styles.text.inverted }}>
                        {currentCard.back}
                      </p>
                      <p className="text-sm mt-8" style={{ color: colors.neutral[200] }}>
                        Click to see question
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: styles.text.secondary }}>No cards in this set</p>
              )}
            </div>

            {/* Footer Controls */}
            <div 
              className="border rounded-b-2xl p-4 shadow-lg"
              style={{ 
                backgroundColor: styles.background.card,
                borderColor: styles.border.light,
                boxShadow: styles.shadow.lg
              }}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="p-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: colors.neutral[100] }}
                  onMouseEnter={(e) => {
                    if (currentCardIndex !== 0) {
                      e.currentTarget.style.backgroundColor = colors.neutral[200]
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentCardIndex !== 0) {
                      e.currentTarget.style.backgroundColor = colors.neutral[100]
                    }
                  }}
                >
                  <ChevronLeft className="w-6 h-6" style={{ color: styles.text.secondary }} />
                </button>

                <div className="text-center">
                  <p className="text-sm mb-1" style={{ color: styles.text.secondary }}>
                    Card {currentCardIndex + 1} of {totalCards}
                  </p>
                  <div className="flex gap-1">
                    {Array.from({ length: totalCards }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full transition-all"
                        style={{ 
                          width: i === currentCardIndex ? '2rem' : '0.375rem',
                          backgroundColor: i === currentCardIndex ? colors.primary[400] : colors.neutral[300]
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === totalCards - 1}
                  className="p-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: colors.neutral[100] }}
                  onMouseEnter={(e) => {
                    if (currentCardIndex !== totalCards - 1) {
                      e.currentTarget.style.backgroundColor = colors.neutral[200]
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentCardIndex !== totalCards - 1) {
                      e.currentTarget.style.backgroundColor = colors.neutral[100]
                    }
                  }}
                >
                  <ChevronRight className="w-6 h-6" style={{ color: styles.text.secondary }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}