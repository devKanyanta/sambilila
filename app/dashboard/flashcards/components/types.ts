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
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
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

// Theme styles interface
export interface ThemeStyles {
  background: {
    main: string
    card: string
    sidebar: string
    navbar: string
    overlay: string
  }
  text: {
    primary: string
    secondary: string
    light: string
    inverted: string
    accent: string
    dark: string
  }
  border: {
    light: string
    medium: string
    dark: string
    accent: string
  }
  state: {
    hover: {
      light: string
      primary: string
    }
    active: {
      light: string
      primary: string
    }
    disabled: string
  }
  shadow: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}