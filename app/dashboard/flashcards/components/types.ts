export type Flashcard = {
  id: string
  front: string
  back: string
  order: number
}

export type FlashcardSet = {
  id: string
  title: string
  subject: string
  description?: string
  cards?: Flashcard[]
  createdAt: string
}

export type FlashcardJob = {
  id: string
  title: string
  subject: string
  description: string
  status: 'PENDING' | 'PROCESSING' | 'PENDING_UPLOAD' | 'DONE' | 'FAILED'
  error?: string
  createdAt: string
  flashcardSet?: FlashcardSet
  progress?: number
}

export type JobStatusDisplay = {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  bgColor: string
  progress: number
  pulse: boolean
}
