'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X, RotateCw, BookOpen, Plus, Sparkles, Upload, FileText, Trash2 } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Flashcard Studio</h1>
            <p className="text-purple-600 text-sm">AI-powered learning made simple</p>
          </div>
        </div>

        {/* Create Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create New Set</h2>
          </div>
          
          <div className="space-y-3">
            <input
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Set Title (e.g., Biology Chapter 5)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
              <input
                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[120px] resize-none"
              placeholder="Paste your study material here... Our AI will generate flashcards automatically!"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            
            {/* PDF Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload PDF</p>
                    <p className="text-xs text-gray-500 mt-1">PDF files only, max 10MB</p>
                  </div>
                </label>
              ) : (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            <button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              onClick={handleGenerate}
              disabled={loading || (!inputText.trim() && !selectedFile)}
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Flashcard Sets Grid */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Your Flashcard Sets</h2>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <RotateCw className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          )}

          {!loading && flashcardSets.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500">No flashcard sets yet. Create your first one above!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcardSets.map(set => (
              <button
                key={set.id}
                onClick={() => openSet(set)}
                className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5 text-left hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">
                    {set.title}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
                <p className="text-sm text-purple-600 mb-3">{set.subject}</p>
                {set.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{set.description}</p>
                )}
                {!!set.cards?.length && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-200 rounded-full">
                    <span className="text-xs font-medium text-purple-700">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-t-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedSet.title}</h3>
                <p className="text-sm text-purple-600">{selectedSet.subject}</p>
              </div>
              <button
                onClick={closeViewer}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-x border-gray-200 p-8 min-h-[400px] flex items-center justify-center">
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
                      className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <p className="text-xs uppercase tracking-wider text-purple-100 mb-4">Question</p>
                      <p className="text-2xl font-bold text-white text-center">{currentCard.front}</p>
                      <p className="text-sm text-purple-100 mt-8">Click to reveal answer</p>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <p className="text-xs uppercase tracking-wider text-blue-100 mb-4">Answer</p>
                      <p className="text-xl font-medium text-white text-center">{currentCard.back}</p>
                      <p className="text-sm text-blue-100 mt-8">Click to see question</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="bg-white border border-gray-200 rounded-b-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    Card {currentCardIndex + 1} of {totalCards}
                  </p>
                  <div className="flex gap-1">
                    {Array.from({ length: totalCards }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === currentCardIndex
                            ? 'w-8 bg-purple-500'
                            : 'w-1.5 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === totalCards - 1}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}