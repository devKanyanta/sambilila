import { useState } from 'react'
import { FlashcardSet } from '../components/types'

export function useFlashcardSets() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [loadingSets, setLoadingSets] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFlashcardSets = async () => {
    try {
      setLoadingSets(true)
      setError(null)
      
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      
      if (!token) {
        throw new Error("No authentication token found")
      }

      const res = await fetch('/api/flashcards', { 
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to load sets (${res.status})`)
      }

      const json = await res.json()
      
      // Handle different response formats
      let sets: FlashcardSet[] = []
      if (Array.isArray(json)) {
        sets = json
      } else if (json?.data && Array.isArray(json.data)) {
        sets = json.data
      } else if (Array.isArray(json)) {
        sets = json
      } else {
        sets = []
      }
      
      setFlashcardSets(sets)
    } catch (err) {
      console.error('Error loading flashcard sets:', err)
      setError(err instanceof Error ? err.message : 'Failed to load flashcard sets')
      setFlashcardSets([])
    } finally {
      setLoadingSets(false)
    }
  }

  return {
    flashcardSets,
    setFlashcardSets,
    loadingSets,
    error,
    loadFlashcardSets
  }
}