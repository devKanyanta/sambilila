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
        } catch (err: any) {
          console.error("Upload error:", err);
          
          // Cancel the job if upload fails
          try {
            const token = localStorage.getItem("token");
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

      /* ==================================================
         STEP 3 — REGISTER JOB LOCALLY
      ================================================== */

      const newJob: FlashcardJob = {
        id: jobData.jobId,
        title: jobData.job.title || title || "AI Generated Flashcards",
        subject: jobData.job.subject || subject || "General",
        description: jobData.job.description || description || "",
        status: "PENDING",
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
    },
  }

  return (
  <div style={{ backgroundColor: styles.background.main, minHeight: '100vh' }}>
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: styles.text.primary }}>
            Flashcard Generator
          </h1>
          <p className="text-sm" style={{ color: colors.primary[400] }}>
            Learning made simple
          </p>
        </div>
        
        {/* Generate Flashcards Button (only show when form is hidden) */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
            style={{
              background: gradients.primary,
              color: 'white',
            }}
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Generate Flashcards</span>
            <span className="sm:hidden">Generate</span>
          </button>
        )}
      </div>

      {/* Modal Overlay and Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          {/* Blurred Background Overlay */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setShowForm(false);
              setFormError(null);
              setFileError(null);
            }}
          />
          
          {/* Modal Container */}
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
      )}

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
        <FlashcardGrid
          flashcardSets={flashcardSets}
          onOpenSet={openSet}
          onRefresh={loadFlashcardSets}
          loading={loadingSets}
        />
      </div>

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