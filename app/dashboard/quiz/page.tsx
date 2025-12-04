'use client'

import { useState, useEffect } from 'react'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">QuizMaster AI</h1>
            <p className="text-gray-600 mt-1">Generate and take quizzes from your study materials</p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
              AI
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
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
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Create New Quiz</h2>
                    <p className="text-gray-600 text-sm mt-1">Generate quizzes from text or PDF files</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-blue-600">✨</span>
                  </div>
                </div>

                {/* Input Method Selection */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setPdfFile(null)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !pdfFile 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 text-blue-700' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <span>📝</span>
                    <span>Text Input</span>
                  </button>
                  <button
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      pdfFile 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 text-blue-700' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                    }`}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your study material
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your study material, textbook content, or enter a topic..."
                      className="w-full h-40 p-4 text-gray-700 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-gray-50"
                    />
                  </div>
                ) : (
                  <div className="mb-6 border-2 border-dashed border-blue-300 rounded-xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <span className="text-2xl text-blue-600">📄</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-xs">{pdfFile.name}</p>
                          <p className="text-sm text-gray-600">{(pdfFile.size / 1024).toFixed(2)} KB • PDF Document</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPdfFile(null)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <span className="text-red-600 text-sm font-medium">Remove</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quiz Settings */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <div className="flex items-center justify-between">
                        <span>Number of Questions: <span className="text-blue-600 font-bold">{numberOfQuestions}</span></span>
                        <span className="text-xs text-gray-500">5-20 questions</span>
                      </div>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={numberOfQuestions}
                      onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            difficulty === level
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Question Types</label>
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
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}>
                            <div className="text-2xl mb-2">{type.icon}</div>
                            <span className="text-sm font-medium text-gray-700">{type.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setInputText('')
                      setPdfFile(null)
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={generateQuiz}
                    disabled={(!inputText.trim() && !pdfFile) || isGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Your Quizzes</h2>
                    <p className="text-gray-600 text-sm mt-1">Recently created quizzes</p>
                  </div>
                  <button
                    onClick={fetchQuizList}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <span className="text-gray-600">↻</span>
                  </button>
                </div>

                {isLoadingQuizzes ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading quizzes...</p>
                  </div>
                ) : quizList.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">📚</span>
                    </div>
                    <p className="text-gray-500">No quizzes yet. Create your first quiz!</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
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
                        className="group p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700">
                              {quizItem.title}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {quizItem._count.questions} questions • {quizItem._count.results} attempts
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                                {quizItem.subject}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(quizItem.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200">→</span>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                      <span className="text-blue-600">🧠</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {quiz ? quiz.title : 'Quiz Preview'}
                      </h2>
                      {quiz && (
                        <p className="text-sm text-gray-600 mt-1">
                          {quiz.subject} • {quiz.questions.length} questions
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="lg:hidden px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
                  >
                    ← Back
                  </button>
                </div>
                
                {!quiz ? (
                  <div className="h-[calc(100vh-300px)] flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                      <span className="text-4xl">🎯</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Quiz Selected</h3>
                    <p className="text-gray-500 text-sm max-w-sm">
                      Generate a new quiz from your study materials or select an existing quiz from your list to begin.
                    </p>
                  </div>
                ) : showResults ? (
                  <div className="space-y-8">
                    {/* Results Header */}
                    <div className="text-center">
                      <div className={`text-6xl font-bold mb-4 bg-gradient-to-r ${
                        quizResult && quizResult.passed 
                          ? 'from-green-500 to-emerald-500' 
                          : 'from-red-500 to-pink-500'
                      } bg-clip-text text-transparent`}>
                        {quizResult?.percentage}
                      </div>
                      <p className="text-gray-600 text-lg mb-4">
                        You answered <span className="font-bold">{quizResult?.correctCount}</span> out of{' '}
                        <span className="font-bold">{quizResult?.totalQuestions}</span> questions correctly
                      </p>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                        quizResult && quizResult.passed 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
                          : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200'
                      }`}>
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
                      <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center">
                        <span className="mr-2">📊</span>
                        Review Your Answers
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {detailedResults.map((result, index) => (
                          <div 
                            key={result.questionId} 
                            className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                              result.correct 
                                ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                                : 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                result.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 mb-3">
                                  {result.question}
                                </p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start">
                                    <span className="text-gray-600 w-24 flex-shrink-0">Your answer:</span>
                                    <span className={`font-medium ${result.correct ? 'text-green-700' : 'text-red-700'}`}>
                                      {result.userAnswer || '(No answer provided)'}
                                    </span>
                                  </div>
                                  {!result.correct && (
                                    <div className="flex items-start">
                                      <span className="text-gray-600 w-24 flex-shrink-0">Correct answer:</span>
                                      <span className="font-medium text-green-700">{result.correctAnswer}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                result.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {result.correct ? '✓' : '✗'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                      <button
                        onClick={startNewQuiz}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                      >
                        Start New Quiz
                      </button>
                      <button
                        onClick={() => setShowResults(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                      >
                        Review Quiz Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Progress Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-blue-700">
                          {Object.keys(userAnswers).length}/{quiz.questions.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${(Object.keys(userAnswers).length / quiz.questions.length) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                      {quiz.questions.sort((a, b) => a.order - b.order).map((q, index) => (
                        <div key={q.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all duration-200">
                          <div className="flex items-start space-x-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-700 font-medium text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800 text-sm leading-relaxed">
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
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300'
                                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`question-${q.id}`}
                                          value={option}
                                          checked={userAnswers[q.id] === option}
                                          onChange={() => handleAnswer(q.id, option)}
                                          className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                                
                                {q.type === 'TRUE_FALSE' && (
                                  <div className="grid grid-cols-2 gap-3">
                                    {[
                                      { value: 'true', label: 'True', color: 'from-green-50 to-emerald-50' },
                                      { value: 'false', label: 'False', color: 'from-red-50 to-pink-50' }
                                    ].map((item) => (
                                      <label 
                                        key={`${q.id}-${item.value}`} 
                                        className={`flex items-center justify-center space-x-2 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                          userAnswers[q.id] === item.value
                                            ? `bg-gradient-to-r ${item.color} border-2 ${item.value === 'true' ? 'border-green-300' : 'border-red-300'}`
                                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                        }`}
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
                                        }`}>
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
                                      className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                                      placeholder="Type your answer here..."
                                    />
                                    {userAnswers[q.id] && (
                                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                    <div className="lg:hidden bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-white rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{Object.keys(userAnswers).length}</div>
                          <div className="text-xs text-gray-600">Answered</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <div className="text-lg font-bold text-gray-600">{quiz.questions.length - Object.keys(userAnswers).length}</div>
                          <div className="text-xs text-gray-600">Remaining</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <div className="text-lg font-bold text-indigo-600">{quiz.questions.length}</div>
                          <div className="text-xs text-gray-600">Total</div>
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