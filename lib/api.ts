const API_BASE = '/api'

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // In a real app, you'd get the token from a secure storage
  // For now, we'll check localStorage (client-side only)
  let token = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token')
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)
  
  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error')
    throw new Error(`API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

// Auth functions
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (userData: any) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest('/auth/profile'),
}

// Flashcards functions
export const flashcardsApi = {
  getSets: () => apiRequest('/flashcards'),
  
  getSet: (id: string) => apiRequest(`/flashcards/${id}`),
  
  createSet: (setData: any) =>
    apiRequest('/flashcards', {
      method: 'POST',
      body: JSON.stringify(setData),
    }),

  updateSet: (id: string, setData: any) =>
    apiRequest(`/flashcards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(setData),
    }),

  deleteSet: (id: string) =>
    apiRequest(`/flashcards/${id}`, {
      method: 'DELETE',
    }),
}

// Quizzes functions
export const quizzesApi = {
  getQuizzes: () => apiRequest('/quizzes'),
  
  getQuiz: (id: string) => apiRequest(`/quizzes/${id}`),
  
  createQuiz: (quizData: any) =>
    apiRequest('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    }),

  updateQuiz: (id: string, quizData: any) =>
    apiRequest(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    }),

  deleteQuiz: (id: string) =>
    apiRequest(`/quizzes/${id}`, {
      method: 'DELETE',
    }),

  // AI Quiz Generation
  generateQuiz: (topic: string, options?: any) =>
    apiRequest('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, ...options }),
    }),
}

// Study Sessions functions
export const studySessionsApi = {
  getSessions: (params?: { limit?: number; type?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)
    
    return apiRequest(`/study-sessions?${queryParams}`)
  },
  
  createSession: (sessionData: any) =>
    apiRequest('/study-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  getStats: (period?: string) =>
    apiRequest(`/study-sessions/stats?period=${period || 'all'}`),
}

// Quiz Results functions
export const quizResultsApi = {
  getResults: (params?: { limit?: number; quizId?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.quizId) queryParams.append('quizId', params.quizId)
    
    return apiRequest(`/quiz-results?${queryParams}`)
  },
  
  submitResult: (resultData: any) =>
    apiRequest('/quiz-results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    }),

  getStats: (period?: string) =>
    apiRequest(`/quiz-results/stats?period=${period || 'all'}`),
}

// Dashboard statistics
export const dashboardApi = {
  getStats: () => apiRequest('/dashboard/stats'),
}

// Helper function to handle API errors
export function handleApiError(error: any): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}