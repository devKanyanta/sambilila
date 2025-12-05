'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X, RotateCw, BookOpen, Plus, Sparkles, Upload, FileText, Trash2 } from 'lucide-react'
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
}

export default function Flashcards() {
  /* =================== STATE =================== */
  const [mounted, setMounted] = useState(false)
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  }, [])

  /* ================= LOAD USER SETS ================= */
  useEffect(() => {
    if (!mounted) return
    loadFlashcardSets()
  }, [mounted])

  async function loadFlashcardSets() {
    try {
      setLoading(true)
      setError(null)

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
    } finally {
      setLoading(false)
    }
  }

  /* ================= CREATE FLASHCARDS ================= */
  async function handleGenerate() {
    if (!inputText.trim() && !selectedFile) {
      setError('Please provide either text or upload a PDF file')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")

      let response

      // If PDF is selected, send as FormData
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('title', title || 'AI Generated Flashcards')
        formData.append('subject', subject || 'General')
        if (description) formData.append('description', description)

        response = await fetch('/api/flashcards', {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        })
      } else {
        // If text is provided, send as JSON
        response = await fetch('/api/flashcards', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            text: inputText,
            title: title || 'AI Generated Flashcards',
            subject: subject || 'General',
            description: description || 'Generated from uploaded content'
          })
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Generation failed (${response.status})`)
      }

      const json = await response.json()
      const newSet = json.data ?? json

      setFlashcardSets(prev => [...prev, newSet])

      // Reset form
      setInputText('')
      setTitle('')
      setSubject('')
      setDescription('')
      setSelectedFile(null)
    } catch (err: any) {
      console.error('GENERATION ERROR:', err)
      setError(err.message || 'Flashcard generation failed')
    } finally {
      setLoading(false)
    }
  }

  /* ================= FILE HANDLING ================= */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setError(null)
    } else if (file) {
      setError('Please select a PDF file')
      e.target.value = ''
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
                  Generating Magic...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate Flashcards
                </span>
              )}
            </button>
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
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <RotateCw className="w-8 h-8 animate-spin" style={{ color: colors.primary[400] }} />
            </div>
          )}

          {!loading && flashcardSets.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full mb-3" style={{ backgroundColor: colors.neutral[50] }}>
                <BookOpen className="w-12 h-12" style={{ color: colors.neutral[400] }} />
              </div>
              <p style={{ color: styles.text.secondary }}>No flashcard sets yet. Create your first one above!</p>
            </div>
          )}

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
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary[200] }}>
                    <span className="text-xs font-medium" style={{ color: colors.primary[700] }}>
                      {set.cards.length} cards
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
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
              {currentCard && (
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