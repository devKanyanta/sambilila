'use client'

import { useEffect, useState } from 'react'

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

      const token = localStorage.getItem("token");

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
  if (!inputText.trim()) return

  try {
    setLoading(true)
    setError(null)

    const token = localStorage.getItem("token");

    const res = await fetch('/api/flashcards', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({
        text: inputText,
        title,
        subject,
        description
      })
    })

    if (!res.ok) throw new Error(`Generation failed (${res.status})`)

    const json = await res.json()

    // Ensure we always get an array of cards
    const newSet = json.data ?? json

    setFlashcardSets(prev => [...prev, newSet])

    // Reset form
    setInputText('')
    setTitle('')
    setSubject('')
    setDescription('')
  } catch (err) {
    console.error('GENERATION ERROR:', err)
    setError('Flashcard generation failed')
  } finally {
    setLoading(false)
  }
}


  if (!mounted) return null

  /* ================= UI ================= */
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-gray-900 min-h-screen text-gray-200">
      <h1 className="text-2xl font-bold">Flashcards</h1>

      {/* ================= CREATE FORM ================= */}
      <div className="space-y-2 border border-gray-700 p-4 rounded-lg bg-gray-800">
        <input
          className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-gray-200"
          placeholder="Set Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-gray-200"
          placeholder="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
        <input
          className="border border-gray-600 p-2 w-full rounded bg-gray-700 text-gray-200"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <textarea
          className="border border-gray-600 p-2 w-full rounded min-h-[140px] bg-gray-700 text-gray-200"
          placeholder="Paste text or PDF content here..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white disabled:opacity-50"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Flashcards'}
        </button>
      </div>

      {/* ================= ERRORS ================= */}
      {error && <p className="text-red-500 font-medium">{error}</p>}

      {/* ================= FLASHCARD SET LIST ================= */}
      <div className="border border-gray-700 p-4 rounded-lg bg-gray-800">
        <h2 className="font-semibold mb-2">Your Flashcard Sets</h2>

        {loading && <p>Loading...</p>}

        {!loading && flashcardSets.length === 0 && (
          <p className="text-gray-400">No flashcard sets found yet.</p>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {Array.isArray(flashcardSets) &&
            flashcardSets.map(set => (
              <div
                key={set.id}
                className="border border-gray-600 p-3 rounded-lg shadow-sm hover:border-blue-500 hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-bold">{set.title}</h3>
                <p className="text-sm text-gray-300">{set.subject}</p>
                {!!set.cards?.length && (
                  <p className="text-xs text-gray-400">{set.cards.length} cards</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
