'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { Plus, Sparkles, BookOpen, Layers } from 'lucide-react'
import { motion } from 'framer-motion'

// Hooks
import { useFlashcardSets } from './hooks/useFlashcardsSets'
import { useFlashcardJobs } from './hooks/useFlashcardsJobs'
import { useFileUpload } from './hooks/useFileUpload'

// Components
import CreateForm from './components/CreateForm'
import FlashcardGrid from './components/FlashcardGrid'
import FlashcardViewer from './components/FlashcardViewer'
import JobStatusModal from './components/JobStatusModal'
import PageHeader from '../components/PageHeader'
import StatBlock from '../components/StatBlock'

// Types
import { FlashcardSet, FlashcardJob } from './components/types'
import { AnimatedItem } from '../components/AnimatedSection'
import { containerStagger, fadeSlideUp, scaleInBouncy } from '../animations';
import { ShimmerBlock, ShimmerStatBlock, ShimmerHeading } from '../components/Shimmer'

export default function Flashcards(props: { searchParams?: Promise<{ create?: string }> }) {
  const searchParams = props.searchParams ? use(props.searchParams) : undefined
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

  const [retrying, setRetrying] = useState(false)

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
    retryJob,
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
  }, [mounted])

  // Auto-open create form when ?create=true
  useEffect(() => {
    if (mounted && searchParams?.create === 'true') {
      setShowForm(true)
    }
  }, [searchParams, mounted])

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

  const handleRetryJob = useCallback(async (job: FlashcardJob) => {
    setRetrying(true)
    try {
      await retryJob(job.id, loadFlashcardSets)
    } catch {
      // Error is already logged in the hook
    } finally {
      setRetrying(false)
    }
  }, [retryJob, loadFlashcardSets])

  if (!mounted) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading flashcards">
        {/* Header Shimmer */}
        <ShimmerHeading />

        {/* Stats Row Shimmer */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <ShimmerStatBlock key={i} />
          ))}
        </div>

        {/* Grid Shimmer */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShimmerBlock className="w-10 h-10 rounded-xl" />
              <div className="space-y-1">
                <ShimmerBlock className="h-5 w-24" />
                <ShimmerBlock className="h-3 w-16" />
              </div>
            </div>
            <ShimmerBlock className="w-9 h-9 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <ShimmerBlock className="h-5 w-3/4" />
                  <ShimmerBlock className="w-4 h-4 rounded-sm" />
                </div>
                <ShimmerBlock className="h-5 w-20 rounded-full mb-3" />
                <div className="space-y-2 mb-4">
                  <ShimmerBlock className="h-3 w-full" />
                  <ShimmerBlock className="h-3 w-2/3" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <ShimmerBlock className="h-3 w-16" />
                  <ShimmerBlock className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <span className="sr-only">Loading flashcards...</span>
      </div>
    )
  }

  const error = formError || fileError || setsError
  const totalCards = flashcardSets.reduce((acc, set) => acc + (set.cards?.length || 0), 0)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerStagger}
      className="min-h-screen"
    >
      {/* Header */}
      <AnimatedItem variants={fadeSlideUp}>
        <PageHeader
          title="Flashcards"
          subtitle="AI-powered learning tools"
          icon={Layers}
          action={
            !showForm ? (
              <motion.button
                onClick={() => setShowForm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#ff5252] hover:bg-[#fc0b06] transition-all shadow-md"
              >
                <Plus size={18} />
                <span>Generate</span>
              </motion.button>
            ) : undefined
          }
        />
      </AnimatedItem>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200"
        >
          <p className="text-sm font-medium text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatBlock icon={BookOpen} value={flashcardSets.length} label="Flashcard Sets" color="#193827" iconBg="#1938271a" />
        <StatBlock icon={BookOpen} value={totalCards} label="Total Cards" color="#2d6b4d" iconBg="#2d6b4d1a" />
        <StatBlock icon={Sparkles} value={activeJobs.length} label="Active Jobs" color="#ff5252" iconBg="#ff52521a" />
      </div>

      {/* Flashcard Sets Grid */}
      <div>
        <FlashcardGrid
          flashcardSets={flashcardSets}
          onOpenSet={openSet}
          onRefresh={loadFlashcardSets}
          loading={loadingSets}
        />
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setFormError(null);
              setFileError(null);
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
              className="relative w-full max-w-md mx-auto"
            >
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
            </motion.div>
          </div>
        </div>
      )}

      {/* Job Status Modal */}
      <JobStatusModal
        show={showJobModal}
        jobDetails={jobDetails}
        onClose={closeJobModal}
        onViewFlashcards={handleViewFlashcardsFromJob}
        onRetry={handleRetryJob}
        retrying={retrying}
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
    </motion.div>
  )
}
