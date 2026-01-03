'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { colors, gradients, theme } from '@/lib/theme'

// Hooks
import { useFlashcardSets } from './hooks/useFlashcardsSets'
import { useFlashcardJobs } from './hooks/useFlashcardsJobs'
import { useFileUpload } from './hooks/useFileUpload'

// Components
import CreateForm from './components/CreateForm'
import FlashcardGrid from './components/FlashcardGrid'
import FlashcardViewer from './components/FlashcardViewer'
import JobStatusModal from './components/JobStatusModal'

// Types
import { FlashcardSet, FlashcardJob } from './components/types'

export default function Flashcards() {
  /* =================== STATE =================== */
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  // Form state
  const [inputText, setInputText] = useState('')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  
  // Viewer state
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Custom hooks
  const { 
    flashcardSets, 
    loadingSets, 
    error: setsError, 
    loadFlashcardSets 
  } = useFlashcardSets()
  
  const {
    activeJobs,
    showJobModal,
    currentJobId,
    jobDetails,
    startJobMonitoring,
    closeJobModal,
    addNewJob,
    updateJobInList
  } = useFlashcardJobs()
  
  const {
    selectedFile,
    error: fileError,
    handleFileChange,
    removeFile,
    setError: setFileError
  } = useFileUpload()

  /* =================== MOUNT FIX =================== */
  useEffect(() => {
    setMounted(true)
  }, [])

  /* ================= LOAD USER SETS ================= */
  useEffect(() => {
    if (!mounted) return
    loadFlashcardSets()
  }, [mounted, loadFlashcardSets])

  /* ================= CREATE FLASHCARDS ================= */
  const handleGenerate = useCallback(async () => {
    if (!inputText.trim() && !selectedFile) {
      setFormError("Please provide either text or upload a PDF file");
      return;
    }

    try {
      setLoading(true);
      setFormError(null);
      setFileError(null);

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

      let uploadFailed = false;
      if (selectedFile && jobData.signedUrl) {
        console.log("📤 Uploading file to R2 using PUT…");

        try {
          const r2Res = await fetch(jobData.signedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": selectedFile.type || "application/pdf",
            },
            body: selectedFile,
          });

          if (!r2Res.ok) {
            console.error("R2 PUT Upload failed:", {
              status: r2Res.status,
              statusText: r2Res.statusText,
            });
            
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
          
          /* ==================================================
            STEP 2b — CONFIRM UPLOAD COMPLETE
          ================================================== */
          try {
            const confirmRes = await fetch(`/api/flashcards/upload?jobId=${jobData.jobId}`, {
              method: "PATCH",
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            });
            
            if (!confirmRes.ok) {
              const error = await confirmRes.json();
              console.error("Failed to confirm upload:", error);
              // We'll still proceed, but log the error
            }
          } catch (confirmErr) {
            console.error("Error confirming upload:", confirmErr);
            // Non-critical error, continue anyway
          }
          
        } catch (err: any) {
          console.error("Upload error:", err);
          uploadFailed = true;
          
          // Cancel the job if upload fails
          try {
            await fetch(`/api/flashcards/upload?jobId=${jobData.jobId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (cancelErr) {
            console.error("Failed to cancel job after upload error:", cancelErr);
          }
          
          throw err;
        }
      }

      // If no file upload needed (text-only) or upload succeeded
      if (!uploadFailed) {
        /* ==================================================
          STEP 3 — REGISTER JOB LOCALLY
        ================================================== */

        const newJob: FlashcardJob = {
          id: jobData.jobId,
          title: jobData.job.title || title || "AI Generated Flashcards",
          subject: jobData.job.subject || subject || "General",
          description: jobData.job.description || description || "",
          status: selectedFile ? "PENDING_UPLOAD" : "PENDING", // Use correct initial status
          createdAt: new Date().toISOString(),
          progress: 0,
        };

        addNewJob(newJob);

        /* ==================================================
          STEP 4 — START MONITORING THE JOB
        ================================================== */
        startJobMonitoring(jobData.jobId, loadFlashcardSets);

        /* ==================================================
          STEP 5 — RESET FORM
        ================================================== */

        setInputText("");
        setTitle("");
        setSubject("");
        setDescription("");
        removeFile();
      }
    } catch (err: any) {
      console.error("GENERATION ERROR:", err);
      setFormError(err.message || "Flashcard generation failed");
    } finally {
      setLoading(false);
    }
  }, [
    inputText, 
    selectedFile, 
    title, 
    subject, 
    description, 
    startJobMonitoring, 
    addNewJob, 
    loadFlashcardSets,
    setFileError
  ])

  /* ================= VIEWER FUNCTIONS ================= */
  const openSet = useCallback((set: FlashcardSet) => {
    setSelectedSet(set)
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }, [])

  const closeViewer = useCallback(() => {
    setSelectedSet(null)
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }, [])

  const nextCard = useCallback(() => {
    if (!selectedSet?.cards) return
    if (currentCardIndex < selectedSet.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }, [selectedSet, currentCardIndex])

  const prevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }, [currentCardIndex])

  const toggleFlip = useCallback(() => {
    setIsFlipped(prev => !prev)
  }, [])

  const handleViewFlashcardsFromJob = useCallback((job: FlashcardJob) => {
    if (job.flashcardSet) {
      openSet(job.flashcardSet)
      closeJobModal()
    }
  }, [openSet, closeJobModal])

  if (!mounted) return null

  const error = formError || fileError || setsError
  const styles = {
    background: {
      main: theme.backgrounds.main,
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
    },
  }

  // ... (previous imports and code remain the same until main content area)

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: styles.background.main,
      }}
    >
      {/* Main Content Container */}
      <div className="w-full mx-auto">
        {/* Header - Minimal */}
        <div 
          className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm"
          style={{ 
            borderColor: 'rgba(0, 0, 0, 0.08)',
          }}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-medium tracking-tight" style={{ color: styles.text.primary }}>
                  Flashcards
                </h1>
                <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
                  AI-powered learning tools
                </p>
              </div>
              
              {/* Generate Flashcards Button */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    backgroundColor: colors.primary[600],
                    color: 'white',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)',
                  }}
                >
                  <Plus size={18} />
                  <span>Generate</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          {/* Error Message - Minimal */}
          {error && (
            <div 
              className="mb-8 rounded-lg p-4 animate-in fade-in duration-200 border"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.04)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
              }}
            >
              <p className="text-sm font-medium" style={{ color: colors.secondary[600] }}>
                {error}
              </p>
            </div>
          )}

          {/* Stats & Info Bar - Minimal Grid */}
          <div className="mb-10">
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              <div 
                className="rounded-xl p-5 border"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                }}
              >
                <p className="text-3xl font-light mb-1" style={{ color: styles.text.primary }}>
                  {flashcardSets.length}
                </p>
                <p className="text-sm" style={{ color: styles.text.secondary }}>
                  Flashcard Sets
                </p>
              </div>
              
              <div 
                className="rounded-xl p-5 border"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                }}
              >
                <p className="text-3xl font-light mb-1" style={{ color: styles.text.primary }}>
                  {flashcardSets.reduce((acc, set) => acc + (set.cards?.length || 0), 0)}
                </p>
                <p className="text-sm" style={{ color: styles.text.secondary }}>
                  Total Cards
                </p>
              </div>
              
              <div 
                className="rounded-xl p-5 border"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={18} style={{ color: colors.primary[400] }} />
                  <p className="text-3xl font-light" style={{ color: styles.text.primary }}>
                    {activeJobs.length}
                  </p>
                </div>
                <p className="text-sm" style={{ color: styles.text.secondary }}>
                  Active Jobs
                </p>
              </div>
            </div>
          </div>

          {/* Flashcard Sets Grid */}
          <FlashcardGrid
            flashcardSets={flashcardSets}
            onOpenSet={openSet}
            onRefresh={loadFlashcardSets}
            loading={loadingSets}
          />
        </main>
      </div>

      {/* Modal Overlay and Form - Minimal */}
      {showForm && (
        <div className="fixed inset-0 z-50">
          {/* Minimal Overlay */}
          <div 
            className="absolute inset-0 bg-black/15 backdrop-blur-[1px] transition-opacity duration-300"
            onClick={() => {
              setShowForm(false);
              setFormError(null);
              setFileError(null);
            }}
          />
          
          {/* Form Container */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl mx-auto">
              <CreateForm
                title={title}
                subject={subject}
                description={description}
                inputText={inputText}
                selectedFile={selectedFile}
                loading={loading}
                error={formError}
                onTitleChange={setTitle}
                onSubjectChange={setSubject}
                onDescriptionChange={setDescription}
                onInputTextChange={setInputText}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
                onGenerate={handleGenerate}
                onCancel={() => {
                  setShowForm(false);
                  setFormError(null);
                  setFileError(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Job Status Modal */}
      <JobStatusModal
        show={showJobModal}
        jobDetails={jobDetails}
        onClose={closeJobModal}
        onViewFlashcards={handleViewFlashcardsFromJob}
      />

      {/* Flashcard Viewer Modal */}
      {selectedSet && (
        <FlashcardViewer
          selectedSet={selectedSet}
          currentCardIndex={currentCardIndex}
          isFlipped={isFlipped}
          onClose={closeViewer}
          onNextCard={nextCard}
          onPrevCard={prevCard}
          onToggleFlip={toggleFlip}
        />
      )}
    </div>
  )
}