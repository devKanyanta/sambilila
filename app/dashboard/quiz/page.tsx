'use client'

import { useState } from 'react'

// Define TypeScript interfaces
interface QuizQuestion {
  id: number;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: number | boolean | string;
}

interface Quiz {
  title: string;
  subject: string;
  questions: QuizQuestion[];
}

interface QuizTemplate {
  id: number;
  title: string;
  subject: string;
  questionCount: number;
  duration: string;
  difficulty: string;
  emoji: string;
}

interface QuizResult {
  id: number;
  title: string;
  score: number;
  date: string;
  totalQuestions: number;
}

interface QuickTopic {
  name: string;
  emoji: string;
  questions: number;
}

// Dummy quiz templates
const dummyQuizTemplates: QuizTemplate[] = [
  {
    id: 1,
    title: 'Biology Fundamentals',
    subject: 'Science',
    questionCount: 5,
    duration: '10 min',
    difficulty: 'Beginner',
    emoji: '🧬'
  },
  {
    id: 2,
    title: 'World History',
    subject: 'History',
    questionCount: 8,
    duration: '15 min',
    difficulty: 'Intermediate',
    emoji: '🌍'
  },
  {
    id: 3,
    title: 'JavaScript Basics',
    subject: 'Programming',
    questionCount: 6,
    duration: '12 min',
    difficulty: 'Beginner',
    emoji: '💻'
  },
  {
    id: 4,
    title: 'Chemistry Elements',
    subject: 'Science',
    questionCount: 7,
    duration: '15 min',
    difficulty: 'Intermediate',
    emoji: '⚗️'
  }
]

// Pre-defined quiz topics
const quickQuizTopics: QuickTopic[] = [
  { name: 'Photosynthesis', emoji: '🌿', questions: 5 },
  { name: 'French Revolution', emoji: '🇫🇷', questions: 6 },
  { name: 'Python Programming', emoji: '🐍', questions: 7 },
  { name: 'Human Anatomy', emoji: '🦴', questions: 8 }
]

export default function QuizGenerator() {
  const [inputText, setInputText] = useState<string>('')
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<number, number | boolean | string>>({})
  const [showResults, setShowResults] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([])
  const [activeTab, setActiveTab] = useState<'create' | 'take'>('create')

  // Dummy quiz data generator
  const generateQuizData = (topic: string): Quiz => {
    const topicLower = topic.toLowerCase()
    
    if (topicLower.includes('photo') || topicLower.includes('bio') || topicLower.includes('science')) {
      return {
        title: 'Biology Fundamentals Quiz',
        subject: 'Science',
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            question: 'What is the primary purpose of photosynthesis?',
            options: [
              'To produce oxygen for animals',
              'To convert light energy into chemical energy',
              'To absorb carbon dioxide from the atmosphere',
              'To create chlorophyll in plants'
            ],
            correctAnswer: 1
          },
          {
            id: 2,
            type: 'true_false',
            question: 'Photosynthesis occurs only during the day.',
            correctAnswer: true
          },
          {
            id: 3,
            type: 'short_answer',
            question: 'Name two products of photosynthesis.',
            correctAnswer: 'glucose and oxygen'
          },
          {
            id: 4,
            type: 'multiple_choice',
            question: 'Which organelle is responsible for photosynthesis?',
            options: [
              'Mitochondria',
              'Nucleus',
              'Chloroplast',
              'Ribosome'
            ],
            correctAnswer: 2
          }
        ]
      }
    } else if (topicLower.includes('history') || topicLower.includes('war') || topicLower.includes('revolution')) {
      return {
        title: 'World History Quiz',
        subject: 'History',
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            question: 'When did World War II begin?',
            options: [
              '1937',
              '1939',
              '1941',
              '1943'
            ],
            correctAnswer: 1
          },
          {
            id: 2,
            type: 'true_false',
            question: 'The French Revolution began in 1789.',
            correctAnswer: true
          },
          {
            id: 3,
            type: 'short_answer',
            question: 'Who was the first president of the United States?',
            correctAnswer: 'george washington'
          }
        ]
      }
    } else if (topicLower.includes('python') || topicLower.includes('program') || topicLower.includes('code')) {
      return {
        title: 'Python Programming Quiz',
        subject: 'Programming',
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            question: 'How do you create a list in Python?',
            options: [
              'list = ()',
              'list = []',
              'list = {}',
              'list = <>'
            ],
            correctAnswer: 1
          },
          {
            id: 2,
            type: 'true_false',
            question: 'Python is a compiled language.',
            correctAnswer: false
          },
          {
            id: 3,
            type: 'short_answer',
            question: 'What function is used to get the length of a list?',
            correctAnswer: 'len'
          }
        ]
      }
    } else {
      // Generic quiz for any topic
      return {
        title: `${topic} Quiz`,
        subject: 'General',
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            question: `What is the main concept of ${topic}?`,
            options: [
              'Option A',
              'Option B',
              'Option C',
              'Option D'
            ],
            correctAnswer: 1
          },
          {
            id: 2,
            type: 'true_false',
            question: `Is ${topic} considered a fundamental subject?`,
            correctAnswer: true
          },
          {
            id: 3,
            type: 'short_answer',
            question: `Name one key principle in ${topic}.`,
            correctAnswer: 'fundamental principle'
          }
        ]
      }
    }
  }

  const generateQuiz = async (): Promise<void> => {
    if (!inputText.trim()) return
    
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      const generatedQuiz = generateQuizData(inputText)
      setQuiz(generatedQuiz)
      setUserAnswers({})
      setShowResults(false)
      setIsGenerating(false)
      setActiveTab('take')
    }, 2000)
  }

  const quickGenerate = (topic: string): void => {
    setInputText(topic)
  }

  const handleAnswer = (questionId: number, answer: number | boolean | string): void => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const calculateScore = (): number => {
    if (!quiz) return 0
    let correct = 0
    quiz.questions.forEach(question => {
      const userAnswer = userAnswers[question.id]
      const correctAnswer = question.correctAnswer
      
      if (question.type === 'short_answer') {
        if (userAnswer && typeof userAnswer === 'string' && userAnswer.toLowerCase().trim() === (correctAnswer as string).toLowerCase()) {
          correct++
        }
      } else if (userAnswer === correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / quiz.questions.length) * 100)
  }

  const submitQuiz = (): void => {
    if (!quiz) return
    const score = calculateScore()
    const newQuizResult: QuizResult = {
      id: quizHistory.length + 1,
      title: quiz.title,
      score: score,
      date: new Date().toLocaleDateString(),
      totalQuestions: quiz.questions.length
    }
    setQuizHistory(prev => [newQuizResult, ...prev])
    setShowResults(true)
  }

  const startNewQuiz = (): void => {
    setQuiz(null)
    setUserAnswers({})
    setShowResults(false)
    setInputText('')
    setActiveTab('create')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile Tabs */}
      <div className="lg:hidden bg-white rounded-xl shadow-sm border p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Quiz
          </button>
          <button
            onClick={() => setActiveTab('take')}
            className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'take'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Take Quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Section - Hidden on mobile when taking quiz */}
        <div className={`space-y-4 sm:space-y-6 ${activeTab === 'take' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Generate New Quiz</h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your study material or enter a topic..."
              className="w-full h-28 sm:h-32 p-3 sm:p-4 text-gray-600 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
            />
            
            {/* Quick Topics */}
            <div className="mt-3 sm:mt-4">
              <p className="text-sm text-gray-600 mb-2 sm:mb-3">Quick topics:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuizTopics.map((topic) => (
                  <button
                    key={topic.name}
                    onClick={() => quickGenerate(topic.name)}
                    className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{topic.emoji}</span>
                      <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">{topic.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 hidden sm:block">{topic.questions} Qs</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 sm:mt-4">
              <button
                onClick={() => setInputText('')}
                className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Clear
              </button>
              <button
                onClick={generateQuiz}
                disabled={!inputText.trim() || isGenerating}
                className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {isGenerating ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>
          </div>

          {/* Quiz Templates */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quiz Templates</h2>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {dummyQuizTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => {
                    setInputText(template.title)
                  }}
                  className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <span className="text-xl sm:text-2xl">{template.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{template.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {template.questionCount} Qs • {template.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz History */}
          {quizHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Results</h2>
              <div className="space-y-2 sm:space-y-3">
                {quizHistory.slice(0, 3).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{result.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{result.date}</p>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ml-2 ${
                      result.score >= 80 ? 'bg-green-100 text-green-800' :
                      result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quiz Section - Full width on mobile when taking quiz */}
        <div className={`${activeTab === 'create' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {quiz ? quiz.title : 'Quiz Preview'}
              </h2>
              <button
                onClick={() => setActiveTab('create')}
                className="lg:hidden px-3 py-1 text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                Back
              </button>
            </div>
            
            {!quiz ? (
              <div className="h-64 sm:h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-4xl mb-4">🧩</div>
                <p className="text-gray-500 text-center text-sm sm:text-base">
                  Enter a topic or select a template to generate your quiz
                </p>
              </div>
            ) : showResults ? (
              <div className="text-center py-6 sm:py-8">
                <div className={`text-4xl sm:text-6xl font-bold mb-3 sm:mb-4 ${
                  calculateScore() >= 80 ? 'text-green-600' :
                  calculateScore() >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {calculateScore()}%
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  You answered {Object.keys(userAnswers).filter(qId => {
                    const questionId = parseInt(qId)
                    const question = quiz.questions.find(q => q.id === questionId)
                    if (!question) return false
                    if (question.type === 'short_answer') {
                      return userAnswers[questionId] && 
                             typeof userAnswers[questionId] === 'string' && 
                             (userAnswers[questionId] as string).toLowerCase().trim() === (question.correctAnswer as string).toLowerCase()
                    }
                    return userAnswers[questionId] === question.correctAnswer
                  }).length} out of {quiz.questions.length} questions correctly
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mt-4 sm:mt-6">
                  <button
                    onClick={startNewQuiz}
                    className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    New Quiz
                  </button>
                  <button
                    onClick={() => setShowResults(false)}
                    className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                  >
                    Review Answers
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Progress Bar */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span>Progress</span>
                    <span>{Object.keys(userAnswers).length}/{quiz.questions.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(Object.keys(userAnswers).length / quiz.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4 sm:space-y-6 max-h-96 sm:max-h-none overflow-y-auto">
                  {quiz.questions.map((q, index) => (
                    <div key={q.id} className="border-b pb-4 sm:pb-6 last:border-b-0">
                      <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        {index + 1}. {q.question}
                      </h3>
                      
                      {q.type === 'multiple_choice' && (
                        <div className="space-y-1 sm:space-y-2">
                          {q.options?.map((option, optIndex) => (
                            <label key={`${q.id}-${optIndex}`} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value={optIndex}
                                checked={userAnswers[q.id] === optIndex}
                                onChange={() => handleAnswer(q.id, optIndex)}
                                className="text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm sm:text-base">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {q.type === 'true_false' && (
                        <div className="grid grid-cols-2 gap-2">
                          {[true, false].map((value) => (
                            <label key={`${q.id}-${value}`} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200">
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value={value.toString()}
                                checked={userAnswers[q.id] === value}
                                onChange={() => handleAnswer(q.id, value)}
                                className="text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm sm:text-base">{value ? 'True' : 'False'}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {q.type === 'short_answer' && (
                        <input
                          type="text"
                          value={(userAnswers[q.id] as string) || ''}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="Type your answer here..."
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(userAnswers).length !== quiz.questions.length}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                >
                  Submit Quiz
                </button>

                {/* Mobile Quick Stats */}
                <div className="lg:hidden bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{Object.keys(userAnswers).length}</div>
                      <div className="text-xs text-gray-600">Answered</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-600">{quiz.questions.length - Object.keys(userAnswers).length}</div>
                      <div className="text-xs text-gray-600">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}