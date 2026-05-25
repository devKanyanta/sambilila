'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Sparkles } from 'lucide-react'

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

      let uploadFailed = false;
      if (selectedFile && jobData.signedUrl) {
        try {
          const r2Res = await fetch(jobData.signedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": selectedFile.type || "application/pdf",
            },
            body: selectedFile,
          });

          if (!r2Res.ok) {
            if (r2Res.status === 403) {
              throw new Error("Upload denied. The signed URL may have expired.");
            }
            throw new Error(`Upload failed: ${r2Res.status} ${r2Res.statusText}`);
          }

          try {
            await fetch(`/api/flashcards/upload?jobId=${jobData.jobId}`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            });
          } catch (confirmErr) {
            console.error("Error confirming upload:", confirmErr);
          }

        } catch (err: any) {
          console.error("Upload error:", err);
          uploadFailed = true;
          try {
            await fetch(`/api/flashcards/upload?jobId=${jobData.jobId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (cancelErr) {
            console.error("Failed to cancel job:", cancelErr);
          }
          throw err;
        }
      }

      if (!uploadFailed) {
        const newJob: FlashcardJob = {
          id: jobData.jobId,
          title: jobData.job.title || title || "AI Generated Flashcards",
          subject: jobData.job.subject || subject || "General",
          description: jobData.job.description || description || "",
          status: selectedFile ? "PENDING_UPLOAD" : "PENDING",
          createdAt: new Date().toISOString(),
          progress: 0,
        };

        addNewJob(newJob);
        startJobMonitoring(jobData.jobId, loadFlashcardSets);

        setInputText("");
        setTitle("");
        setSubject("");
        setDescription("");
        removeFile();
        setShowForm(false);
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

  return (
    <div className="min-h-screen">
      {/* Header - Minimal */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-heading font-semibold text-neutral-800">
              Flashcards
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              AI-powered learning tools
            </p>
          </div>

          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-md active:scale-[0.98]"
              style={{ backgroundColor: '#ff5252' }}>
              <Plus size={18} />
              <span>Generate</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-2xl font-bold text-neutral-800 mb-1">
            {flashcardSets.length}
          </p>
          <p className="text-xs text-neutral-500">Flashcard Sets</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-2xl font-bold text-neutral-800 mb-1">
            {flashcardSets.reduce((acc, set) => acc + (set.cards?.length || 0), 0)}
          </p>
          <p className="text-xs text-neutral-500">Total Cards</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#ff5252]" />
            <p className="text-2xl font-bold text-neutral-800">{activeJobs.length}</p>
          </div>
          <p className="text-xs text-neutral-500">Active Jobs</p>
        </div>
      </div>

      {/* Flashcard Sets Grid */}
      <FlashcardGrid
        flashcardSets={flashcardSets}
        onOpenSet={openSet}
        onRefresh={loadFlashcardSets}
        loading={loadingSets}
      />

      {/* Modal Overlay and Form */}
      {showForm && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setFormError(null);
              setFileError(null);
            }}
          />
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
