'use client'

import { useState, useEffect } from 'react'
import { colors, gradients, theme } from '@/lib/theme'

// TypeScript interfaces matching API responses
interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  question: string;
  options: string[];
  correctAnswer: string;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  questions: QuizQuestion[];
  createdAt: string;
}

interface QuizListItem {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  createdAt: string;
  _count: {
    questions: number;
    results: number;
  };
}

interface QuizResult {
  id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  percentage: string;
  passed: boolean;
}

interface DetailedResult {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  correctAnswer: string;
  question: string;
  type: string;
}

export default function QuizGenerator() {
  const [inputText, setInputText] = useState<string>('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [quizList, setQuizList] = useState<QuizListItem[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState<boolean>(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([])
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'create' | 'take'>('create')
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10)
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [questionTypes, setQuestionTypes] = useState<string>('MULTIPLE_CHOICE,TRUE_FALSE')
  const [error, setError] = useState<string>('')

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

  // Fetch quiz list on component mount
  useEffect(() => {
    fetchQuizList()
  }, [])

  const fetchQuizList = async () => {
    setIsLoadingQuizzes(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch('/api/quizzes?limit=10', {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}` 
        },
      })
      if (response.ok) {
        const data = await response.json()
        setQuizList(data.quizzes)
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err)
    } finally {
      setIsLoadingQuizzes(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setError('')
    } else {
      setError('Please select a valid PDF file')
    }
  }

  const generateQuiz = async () => {
    if (!inputText.trim() && !pdfFile) {
      setError('Please provide text or upload a PDF file')
      return
    }
    
    setIsGenerating(true)
    setError('')
    
    try {
      const formData = new FormData()
      const token = localStorage.getItem("token")
      
      if (pdfFile) {
        formData.append('pdf', pdfFile)
      } else {
        formData.append('text', inputText)
      }
      
      formData.append('numberOfQuestions', numberOfQuestions.toString())
      formData.append('difficulty', difficulty)
      formData.append('questionTypes', questionTypes)

      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}` 
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const data = await response.json()
      await loadQuiz(data.quiz.id)
      setActiveTab('take')
      fetchQuizList()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  const loadQuiz = async (quizId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}` 
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to load quiz')
      }

      const data = await response.json()
      setQuiz(data.quiz)
      setUserAnswers({})
      setShowResults(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz')
    }
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const submitQuiz = async () => {
    if (!quiz) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const answers = Object.entries(userAnswers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const data = await response.json()
      setQuizResult(data.result)
      setDetailedResults(data.detailedResults)
      setShowResults(true)
      fetchQuizList()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startNewQuiz = () => {
    setQuiz(null)
    setUserAnswers({})
    setShowResults(false)
    setQuizResult(null)
    setDetailedResults([])
    setInputText('')
    setPdfFile(null)
    setActiveTab('create')
  }

  const selectQuizFromList = async (quizId: string) => {
    await loadQuiz(quizId)
    setActiveTab('take')
  }

  return (
    <div style={{ backgroundColor: styles.background.main, minHeight: '100vh' }} className="p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: styles.text.primary }}>
              QuizMaster AI
            </h1>
            <p className="mt-1" style={{ color: styles.text.secondary }}>
              Generate and take quizzes from your study materials
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: gradients.primary }}
            >
              AI
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 border-l-4 p-4 rounded-r-lg shadow-sm"
            style={{ 
              backgroundColor: colors.secondary[50],
              borderColor: colors.secondary[500]
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"
                  style={{ color: colors.secondary[500] }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: colors.secondary[700] }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6 border p-1 rounded-2xl shadow-sm"
          style={{ 
            backgroundColor: styles.background.card,
            borderColor: styles.border.light
          }}
        >
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'create'
                  ? 'text-white shadow-md'
                  : 'hover:text-gray-900'
              }`}
              style={activeTab === 'create' ? 
                { background: gradients.primary, color: styles.text.inverted } :
                { 
                  color: styles.text.secondary,
                  backgroundColor: 'transparent'
                }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'create') {
                  e.currentTarget.style.backgroundColor = styles.state.hover.light
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'create') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🎨</span>
                <span>Create Quiz</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('take')}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'take'
                  ? 'text-white shadow-md'
                  : 'hover:text-gray-900'
              }`}
              style={activeTab === 'take' ? 
                { background: gradients.primary, color: styles.text.inverted } :
                { 
                  color: styles.text.secondary,
                  backgroundColor: 'transparent'
                }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'take') {
                  e.currentTarget.style.backgroundColor = styles.state.hover.light
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'take') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>📝</span>
                <span>Take Quiz</span>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className={`space-y-6 ${activeTab === 'take' ? 'hidden lg:block' : 'block'}`}>
            {/* Create Quiz Card */}
            <div className="border rounded-2xl shadow-sm overflow-hidden"
              style={{ 
                backgroundColor: styles.background.card,
                borderColor: styles.border.light,
                boxShadow: styles.shadow.sm
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: styles.text.primary }}>
                      Create New Quiz
                    </h2>
                    <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
                      Generate quizzes from text or PDF files
                    </p>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.primary[50] }}
                  >
                    <span style={{ color: colors.primary[400] }}>✨</span>
                  </div>
                </div>

                {/* Input Method Selection */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setPdfFile(null)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !pdfFile 
                        ? 'border-2 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={!pdfFile ? 
                      { 
                        backgroundColor: colors.primary[50],
                        borderColor: colors.primary[400],
                        color: colors.primary[600]
                      } :
                      { 
                        backgroundColor: colors.neutral[100],
                        color: styles.text.secondary,
                        border: '2px solid transparent'
                      }
                    }
                    onMouseEnter={(e) => {
                      if (pdfFile) {
                        e.currentTarget.style.backgroundColor = colors.neutral[200]
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pdfFile) {
                        e.currentTarget.style.backgroundColor = colors.neutral[100]
                      }
                    }}
                  >
                    <span>📝</span>
                    <span>Text Input</span>
                  </button>
                  <button
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      pdfFile 
                        ? 'border-2 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={pdfFile ? 
                      { 
                        backgroundColor: colors.primary[50],
                        borderColor: colors.primary[400],
                        color: colors.primary[600]
                      } :
                      { 
                        backgroundColor: colors.neutral[100],
                        color: styles.text.secondary,
                        border: '2px solid transparent'
                      }
                    }
                    onMouseEnter={(e) => {
                      if (!pdfFile) {
                        e.currentTarget.style.backgroundColor = colors.neutral[200]
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!pdfFile) {
                        e.currentTarget.style.backgroundColor = colors.neutral[100]
                      }
                    }}
                  >
                    <span>📄</span>
                    <span>PDF Upload</span>
                  </button>
                </div>

                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Content Input Area */}
                {!pdfFile ? (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: styles.text.primary }}>
                      Enter your study material
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your study material, textbook content, or enter a topic..."
                      className="w-full h-40 p-4 border rounded-xl resize-none focus:ring-2 transition-all duration-200 text-sm"
                      style={{ 
                        backgroundColor: colors.neutral[50],
                        borderColor: styles.border.medium,
                        color: styles.text.primary,
                        boxShadow: styles.shadow.sm
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className="mb-6 border-2 border-dashed rounded-xl p-5"
                    style={{ 
                      borderColor: colors.primary[300],
                      backgroundColor: colors.primary[50]
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: styles.background.card }}
                        >
                          <span className="text-2xl" style={{ color: colors.primary[400] }}>📄</span>
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-xs" style={{ color: styles.text.primary }}>
                            {pdfFile.name}
                          </p>
                          <p className="text-sm" style={{ color: styles.text.secondary }}>
                            {(pdfFile.size / 1024).toFixed(2)} KB • PDF Document
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPdfFile(null)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        style={{ backgroundColor: 'transparent' }}
                      >
                        <span className="text-sm font-medium" style={{ color: colors.secondary[600] }}>
                          Remove
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quiz Settings */}
                <div className="space-y-6">
                  <div className="rounded-xl p-4" style={{ backgroundColor: colors.neutral[50] }}>
                    <label className="block text-sm font-medium mb-3" style={{ color: styles.text.primary }}>
                      <div className="flex items-center justify-between">
                        <span>
                          Number of Questions: <span className="font-bold" style={{ color: colors.primary[400] }}>
                            {numberOfQuestions}
                          </span>
                        </span>
                        <span className="text-xs" style={{ color: styles.text.secondary }}>5-20 questions</span>
                      </div>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={numberOfQuestions}
                      onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full"
                      style={{ 
                        backgroundColor: colors.neutral[300],
                        '--thumb-bg': gradients.primary
                      } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: styles.text.primary }}>
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            difficulty === level
                              ? 'text-white shadow-md'
                              : 'hover:bg-gray-200'
                          }`}
                          style={difficulty === level ? 
                            { 
                              background: gradients.primary,
                              color: styles.text.inverted
                            } :
                            { 
                              backgroundColor: colors.neutral[100],
                              color: styles.text.secondary
                            }
                          }
                          onMouseEnter={(e) => {
                            if (difficulty !== level) {
                              e.currentTarget.style.backgroundColor = colors.neutral[200]
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (difficulty !== level) {
                              e.currentTarget.style.backgroundColor = colors.neutral[100]
                            }
                          }}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: styles.text.primary }}>
                      Question Types
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: '🔠' },
                        { value: 'TRUE_FALSE', label: 'True/False', icon: '✓✗' },
                        { value: 'SHORT_ANSWER', label: 'Short Answer', icon: '📝' }
                      ].map((type) => (
                        <label key={type.value} className="relative">
                          <input
                            type="checkbox"
                            checked={questionTypes.includes(type.value)}
                            onChange={(e) => {
                              const types = questionTypes.split(',').filter(t => t)
                              if (e.target.checked) {
                                setQuestionTypes([...types, type.value].join(','))
                              } else {
                                setQuestionTypes(types.filter(t => t !== type.value).join(','))
                              }
                            }}
                            className="sr-only"
                          />
                          <div className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-200 border-2 ${
                            questionTypes.includes(type.value)
                              ? 'border-blue-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={questionTypes.includes(type.value) ? 
                            { 
                              borderColor: colors.primary[400],
                              backgroundColor: colors.primary[50]
                            } :
                            { 
                              borderColor: styles.border.medium,
                              backgroundColor: styles.background.card
                            }
                          }>
                            <div className="text-2xl mb-2">{type.icon}</div>
                            <span className="text-sm font-medium" style={{ color: styles.text.primary }}>
                              {type.label}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t"
                  style={{ borderColor: styles.border.light }}
                >
                  <button
                    onClick={() => {
                      setInputText('')
                      setPdfFile(null)
                    }}
                    className="px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                    style={{ 
                      color: styles.text.secondary,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = styles.state.hover.light
                      e.currentTarget.style.color = styles.text.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = styles.text.secondary
                    }}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={generateQuiz}
                    disabled={(!inputText.trim() && !pdfFile) || isGenerating}
                    className="px-6 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
                    style={{ 
                      background: gradients.primary,
                      boxShadow: styles.shadow.sm
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.opacity = '0.9'
                        e.currentTarget.style.boxShadow = styles.shadow.md
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.style.boxShadow = styles.shadow.sm
                      }
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <div 
                          className="w-4 h-4 border-2 rounded-full animate-spin"
                          style={{ 
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            borderTopColor: styles.text.inverted
                          }}
                        ></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Generate Quiz</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Your Quizzes Section */}
            <div className="border rounded-2xl shadow-sm overflow-hidden"
              style={{ 
                backgroundColor: styles.background.card,
                borderColor: styles.border.light,
                boxShadow: styles.shadow.sm
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: styles.text.primary }}>
                      Your Quizzes
                    </h2>
                    <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
                      Recently created quizzes
                    </p>
                  </div>
                  <button
                    onClick={fetchQuizList}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <span style={{ color: styles.text.secondary }}>↻</span>
                  </button>
                </div>

                {isLoadingQuizzes ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div 
                      className="w-8 h-8 border-3 rounded-full animate-spin mb-4"
                      style={{ 
                        borderColor: colors.primary[400],
                        borderTopColor: 'transparent'
                      }}
                    ></div>
                    <p className="text-sm" style={{ color: styles.text.secondary }}>Loading quizzes...</p>
                  </div>
                ) : quizList.length === 0 ? (
                  <div className="text-center py-12">
                    <div 
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: colors.primary[50] }}
                    >
                      <span className="text-2xl">📚</span>
                    </div>
                    <p style={{ color: styles.text.secondary }}>No quizzes yet. Create your first quiz!</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 px-4 py-2 text-sm font-medium"
                      style={{ color: colors.primary[400] }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.primary[500]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.primary[400]
                      }}
                    >
                      Create Quiz →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {quizList.map((quizItem) => (
                      <div
                        key={quizItem.id}
                        onClick={() => selectQuizFromList(quizItem.id)}
                        className="group p-4 border rounded-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
                        style={{ 
                          borderColor: styles.border.light,
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.primary[50]
                          e.currentTarget.style.borderColor = colors.primary[300]
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.borderColor = styles.border.light
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate transition-colors"
                              style={{ color: styles.text.primary }}
                            >
                              {quizItem.title}
                            </h3>
                            <p className="text-xs mt-1" style={{ color: styles.text.secondary }}>
                              {quizItem._count.questions} questions • {quizItem._count.results} attempts
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: colors.primary[100],
                                  color: colors.primary[700]
                                }}
                              >
                                {quizItem.subject}
                              </span>
                              <span className="text-xs" style={{ color: styles.text.light }}>
                                {new Date(quizItem.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="transition-colors duration-200"
                              style={{ color: colors.neutral[500] }}
                            >→</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className={`${activeTab === 'create' ? 'hidden lg:block' : 'block'}`}>
            <div className="border rounded-2xl shadow-sm overflow-hidden h-full"
              style={{ 
                backgroundColor: styles.background.card,
                borderColor: styles.border.light,
                boxShadow: styles.shadow.sm
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.primary[50] }}
                    >
                      <span style={{ color: colors.primary[400] }}>🧠</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: styles.text.primary }}>
                        {quiz ? quiz.title : 'Quiz Preview'}
                      </h2>
                      {quiz && (
                        <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
                          {quiz.subject} • {quiz.questions.length} questions
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="lg:hidden px-4 py-2 text-sm rounded-lg transition-colors duration-200 font-medium"
                    style={{ 
                      color: colors.primary[400],
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary[50]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    ← Back
                  </button>
                </div>
                
                {!quiz ? (
                  <div className="h-[calc(100vh-300px)] flex flex-col items-center justify-center p-8 text-center">
                    <div 
                      className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
                      style={{ backgroundColor: colors.primary[50] }}
                    >
                      <span className="text-4xl">🎯</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: styles.text.primary }}>
                      No Quiz Selected
                    </h3>
                    <p className="text-sm max-w-sm" style={{ color: styles.text.secondary }}>
                      Generate a new quiz from your study materials or select an existing quiz from your list to begin.
                    </p>
                  </div>
                ) : showResults ? (
                  <div className="space-y-8">
                    {/* Results Header */}
                    <div className="text-center">
                      <div 
                        className="text-6xl font-bold mb-4 bg-clip-text text-transparent"
                        style={{ 
                          background: quizResult && quizResult.passed ? 
                            'linear-gradient(135deg, #58a4b0 0%, #7ab7c0 100%)' :
                            'linear-gradient(135deg, #a9bcd0 0%, #737e97 100%)'
                        }}
                      >
                        {quizResult?.percentage}
                      </div>
                      <p className="text-lg mb-4" style={{ color: styles.text.secondary }}>
                        You answered <span className="font-bold" style={{ color: styles.text.primary }}>
                          {quizResult?.correctCount}
                        </span> out of{' '}
                        <span className="font-bold" style={{ color: styles.text.primary }}>
                          {quizResult?.totalQuestions}
                        </span> questions correctly
                      </p>
                      <div 
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 border ${
                          quizResult && quizResult.passed 
                            ? '' 
                            : ''
                        }`}
                        style={quizResult && quizResult.passed ? 
                          { 
                            backgroundColor: colors.primary[50],
                            color: colors.primary[700],
                            borderColor: colors.primary[200]
                          } :
                          { 
                            backgroundColor: colors.secondary[50],
                            color: colors.secondary[700],
                            borderColor: colors.secondary[200]
                          }
                        }
                      >
                        {quizResult && quizResult.passed ? (
                          <>
                            <span className="mr-2">✓</span>
                            <span>Congratulations! You passed!</span>
                          </>
                        ) : (
                          <>
                            <span className="mr-2">✗</span>
                            <span>Keep practicing! You'll do better next time!</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Detailed Results */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center" style={{ color: styles.text.primary }}>
                        <span className="mr-2">📊</span>
                        Review Your Answers
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {detailedResults.map((result, index) => (
                          <div 
                            key={result.questionId} 
                            className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                              result.correct 
                                ? '' 
                                : ''
                            }`}
                            style={result.correct ? 
                              { 
                                borderColor: colors.primary[200],
                                backgroundColor: colors.primary[50]
                              } :
                              { 
                                borderColor: colors.secondary[200],
                                backgroundColor: colors.secondary[50]
                              }
                            }
                          >
                            <div className="flex items-start space-x-3">
                              <div 
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  result.correct ? '' : ''
                                }`}
                                style={result.correct ? 
                                  { 
                                    backgroundColor: colors.primary[100],
                                    color: colors.primary[700]
                                  } :
                                  { 
                                    backgroundColor: colors.secondary[100],
                                    color: colors.secondary[700]
                                  }
                                }
                              >
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium mb-3" style={{ color: styles.text.primary }}>
                                  {result.question}
                                </p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start">
                                    <span className="w-24 flex-shrink-0" style={{ color: styles.text.secondary }}>Your answer:</span>
                                    <span className={`font-medium ${result.correct ? '' : ''}`}
                                      style={result.correct ? 
                                        { color: colors.primary[700] } :
                                        { color: colors.secondary[700] }
                                      }
                                    >
                                      {result.userAnswer || '(No answer provided)'}
                                    </span>
                                  </div>
                                  {!result.correct && (
                                    <div className="flex items-start">
                                      <span className="w-24 flex-shrink-0" style={{ color: styles.text.secondary }}>Correct answer:</span>
                                      <span className="font-medium" style={{ color: colors.primary[700] }}>{result.correctAnswer}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  result.correct ? '' : ''
                                }`}
                                style={result.correct ? 
                                  { 
                                    backgroundColor: colors.primary[100],
                                    color: colors.primary[700]
                                  } :
                                  { 
                                    backgroundColor: colors.secondary[100],
                                    color: colors.secondary[700]
                                  }
                                }
                              >
                                {result.correct ? '✓' : '✗'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t"
                      style={{ borderColor: styles.border.light }}
                    >
                      <button
                        onClick={startNewQuiz}
                        className="flex-1 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                        style={{ 
                          background: gradients.primary,
                          boxShadow: styles.shadow.sm
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9'
                          e.currentTarget.style.boxShadow = styles.shadow.md
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1'
                          e.currentTarget.style.boxShadow = styles.shadow.sm
                        }}
                      >
                        Start New Quiz
                      </button>
                      <button
                        onClick={() => setShowResults(false)}
                        className="flex-1 py-3 rounded-xl transition-colors duration-200 font-medium"
                        style={{ 
                          backgroundColor: colors.neutral[100],
                          color: styles.text.secondary
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.neutral[200]
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.neutral[100]
                        }}
                      >
                        Review Quiz Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Progress Section */}
                    <div className="rounded-xl p-5" style={{ backgroundColor: colors.primary[50] }}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium" style={{ color: styles.text.primary }}>Progress</span>
                        <span className="text-sm font-bold" style={{ color: colors.primary[600] }}>
                          {Object.keys(userAnswers).length}/{quiz.questions.length}
                        </span>
                      </div>
                      <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: colors.neutral[300] }}>
                        <div 
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{ 
                            background: gradients.primary,
                            width: `${(Object.keys(userAnswers).length / quiz.questions.length) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-2" style={{ color: styles.text.secondary }}>
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                      {quiz.questions.sort((a, b) => a.order - b.order).map((q, index) => (
                        <div 
                          key={q.id} 
                          className="border rounded-xl p-5 transition-all duration-200"
                          style={{ 
                            borderColor: styles.border.light,
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.primary[300]
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = styles.border.light
                          }}
                        >
                          <div className="flex items-start space-x-3 mb-4">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: colors.primary[50] }}
                            >
                              <span className="font-medium text-sm" style={{ color: colors.primary[700] }}>
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-sm leading-relaxed" style={{ color: styles.text.primary }}>
                                {q.question}
                              </h3>
                              <div className="mt-3">
                                {q.type === 'MULTIPLE_CHOICE' && (
                                  <div className="space-y-2">
                                    {q.options.map((option, optIndex) => (
                                      <label 
                                        key={`${q.id}-${optIndex}`} 
                                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                          userAnswers[q.id] === option
                                            ? 'border-2'
                                            : 'border hover:bg-gray-100'
                                        }`}
                                        style={userAnswers[q.id] === option ? 
                                          { 
                                            backgroundColor: colors.primary[50],
                                            borderColor: colors.primary[300]
                                          } :
                                          { 
                                            backgroundColor: colors.neutral[50],
                                            borderColor: styles.border.medium
                                          }
                                        }
                                      >
                                        <input
                                          type="radio"
                                          name={`question-${q.id}`}
                                          value={option}
                                          checked={userAnswers[q.id] === option}
                                          onChange={() => handleAnswer(q.id, option)}
                                          className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm" style={{ color: styles.text.primary }}>{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                                
                                {q.type === 'TRUE_FALSE' && (
                                  <div className="grid grid-cols-2 gap-3">
                                    {[
                                      { value: 'true', label: 'True' },
                                      { value: 'false', label: 'False' }
                                    ].map((item) => (
                                      <label 
                                        key={`${q.id}-${item.value}`} 
                                        className={`flex items-center justify-center space-x-2 p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                                          userAnswers[q.id] === item.value
                                            ? 'border-2'
                                            : 'hover:border-gray-300'
                                        }`}
                                        style={userAnswers[q.id] === item.value ? 
                                          { 
                                            backgroundColor: item.value === 'true' ? colors.primary[50] : colors.secondary[50],
                                            borderColor: item.value === 'true' ? colors.primary[300] : colors.secondary[300]
                                          } :
                                          { 
                                            backgroundColor: colors.neutral[50],
                                            borderColor: styles.border.medium
                                          }
                                        }
                                      >
                                        <input
                                          type="radio"
                                          name={`question-${q.id}`}
                                          value={item.value}
                                          checked={userAnswers[q.id] === item.value}
                                          onChange={() => handleAnswer(q.id, item.value)}
                                          className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className={`text-sm font-medium ${
                                          userAnswers[q.id] === item.value
                                            ? item.value === 'true' ? 'text-green-700' : 'text-red-700'
                                            : 'text-gray-700'
                                        }`}
                                        style={userAnswers[q.id] === item.value ? 
                                          { 
                                            color: item.value === 'true' ? colors.primary[700] : colors.secondary[700]
                                          } :
                                          { 
                                            color: styles.text.primary
                                          }
                                        }>
                                          {item.label}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                                
                                {q.type === 'SHORT_ANSWER' && (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={userAnswers[q.id] || ''}
                                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                                      className="w-full p-4 border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200"
                                      placeholder="Type your answer here..."
                                      style={{ 
                                        backgroundColor: colors.neutral[50],
                                        borderColor: styles.border.medium,
                                        color: styles.text.primary
                                      }}
                                    />
                                    {userAnswers[q.id] && (
                                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div 
                                          className="w-2 h-2 rounded-full animate-pulse"
                                          style={{ backgroundColor: colors.primary[400] }}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(userAnswers).length !== quiz.questions.length || isSubmitting}
                      className="w-full py-4 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
                      style={{ 
                        background: gradients.primary,
                        boxShadow: styles.shadow.sm
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.opacity = '0.9'
                          e.currentTarget.style.boxShadow = styles.shadow.md
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.opacity = '1'
                          e.currentTarget.style.boxShadow = styles.shadow.sm
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div 
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                          ></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>📤</span>
                          <span>Submit Quiz ({Object.keys(userAnswers).length}/{quiz.questions.length})</span>
                        </>
                      )}
                    </button>

                    {/* Mobile Stats */}
                    <div className="lg:hidden rounded-xl p-4" style={{ backgroundColor: colors.primary[50] }}>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: styles.background.card }}>
                          <div className="text-lg font-bold" style={{ color: colors.primary[400] }}>
                            {Object.keys(userAnswers).length}
                          </div>
                          <div className="text-xs" style={{ color: styles.text.secondary }}>Answered</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: styles.background.card }}>
                          <div className="text-lg font-bold" style={{ color: styles.text.secondary }}>
                            {quiz.questions.length - Object.keys(userAnswers).length}
                          </div>
                          <div className="text-xs" style={{ color: styles.text.secondary }}>Remaining</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: styles.background.card }}>
                          <div className="text-lg font-bold" style={{ color: colors.primary[600] }}>
                            {quiz.questions.length}
                          </div>
                          <div className="text-xs" style={{ color: styles.text.secondary }}>Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}