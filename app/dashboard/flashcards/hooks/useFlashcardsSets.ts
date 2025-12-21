import { useState, useCallback } from 'react'
import { FlashcardSet } from '../components/types'

export function useFlashcardSets() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [loadingSets, setLoadingSets] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFlashcardSets = useCallback(async () => {
    try {
      setLoadingSets(true)
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
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to load flashcard sets')
      setFlashcardSets([])
    } finally {
      setLoadingSets(false)
    }
  }, [])

  return {
    flashcardSets,
    setFlashcardSets,
    loadingSets,
    error,
    loadFlashcardSets
  }
}