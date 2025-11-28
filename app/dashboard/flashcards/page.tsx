'use client'

import { useState } from 'react'

// Define TypeScript interfaces
interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardSet {
  id: number;
  title: string;
  subject: string;
  cardCount: number;
  createdAt: string;
  cards: Flashcard[];
}

// Dummy flashcard sets
const dummyFlashcardSets: FlashcardSet[] = [
  {
    id: 1,
    title: 'Biology Basics',
    subject: 'Science',
    cardCount: 12,
    createdAt: '2024-01-15',
    cards: [
      { front: 'What is photosynthesis?', back: 'The process by which plants convert light energy into chemical energy' },
      { front: 'What is a cell?', back: 'The basic structural and functional unit of all living organisms' },
      { front: 'Define DNA', back: 'Deoxyribonucleic acid, the molecule that carries genetic information' },
      { front: 'What is mitosis?', back: 'The process of cell division that results in two identical daughter cells' },
      { front: 'What are enzymes?', back: 'Proteins that act as biological catalysts to speed up chemical reactions' },
      { front: 'Define homeostasis', back: 'The ability of an organism to maintain stable internal conditions' }
    ]
  },
  {
    id: 2,
    title: 'World War II Key Events',
    subject: 'History',
    cardCount: 8,
    createdAt: '2024-01-10',
    cards: [
      { front: 'When did WWII begin?', back: 'September 1, 1939' },
      { front: 'What event brought the US into WWII?', back: 'Attack on Pearl Harbor, December 7, 1941' },
      { front: 'D-Day invasion date', back: 'June 6, 1944' },
      { front: 'When did Germany surrender?', back: 'May 7, 1945 (V-E Day)' },
      { front: 'Atomic bombs were dropped on which cities?', back: 'Hiroshima and Nagasaki' }
    ]
  },
  {
    id: 3,
    title: 'JavaScript Fundamentals',
    subject: 'Programming',
    cardCount: 15,
    createdAt: '2024-01-20',
    cards: [
      { front: 'What is a variable?', back: 'A container for storing data values' },
      { front: 'Difference between let and const', back: 'let allows reassignment, const creates constants' },
      { front: 'What is a function?', back: 'A block of code designed to perform a particular task' },
      { front: 'Define array', back: 'A special variable that can hold more than one value' },
      { front: 'What is an object?', back: 'A collection of key-value pairs' }
    ]
  }
]

// Pre-defined topics for quick generation
const quickTopics = [
  { name: 'Photosynthesis', emoji: '🌿' },
  { name: 'Python', emoji: '🐍' },
  { name: 'French', emoji: '🇫🇷' },
  { name: 'Chemistry', emoji: '⚗️' },
  { name: 'Algebra', emoji: '📐' },
  { name: 'Anatomy', emoji: '🦴' }
]

export default function Flashcards() {
  const [inputText, setInputText] = useState<string>('')
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null)
  const [currentCard, setCurrentCard] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>(dummyFlashcardSets)
  const [activeTab, setActiveTab] = useState<'create' | 'study'>('create')

  const generateFlashcards = async (): Promise<void> => {
    if (!inputText.trim()) return
    
    setIsGenerating(true)
    // Simulate AI generation with different topics
    setTimeout(() => {
      const topic = inputText.toLowerCase()
      let newCards: Flashcard[] = []
      
      if (topic.includes('photo') || topic.includes('plant')) {
        newCards = [
          { front: 'What is the chemical equation for photosynthesis?', back: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂' },
          { front: 'What are the two main stages of photosynthesis?', back: 'Light-dependent reactions and Calvin cycle' },
          { front: 'Which organelle performs photosynthesis?', back: 'Chloroplast' },
          { front: 'What is the role of chlorophyll?', back: 'To absorb light energy from the sun' }
        ]
      } else if (topic.includes('python') || topic.includes('program')) {
        newCards = [
          { front: 'How to create a list in Python?', back: 'my_list = [1, 2, 3] or my_list = list()' },
          { front: 'What is a Python dictionary?', back: 'An unordered collection of key-value pairs' },
          { front: 'How to define a function?', back: 'def function_name(parameters):' },
          { front: 'What are Python decorators?', back: 'Functions that modify the behavior of other functions' }
        ]
      } else {
        // Generic cards for any topic
        newCards = [
          { front: `What is the main concept of ${inputText}?`, back: 'The fundamental principle that governs this topic' },
          { front: `Key terminology in ${inputText}`, back: 'Important terms and their definitions' },
          { front: `Applications of ${inputText}`, back: 'Real-world uses and practical implementations' },
          { front: `Historical development of ${inputText}`, back: 'How this field evolved over time' }
        ]
      }
      
      const newSet: FlashcardSet = {
        id: flashcardSets.length + 1,
        title: inputText,
        subject: 'General',
        cardCount: newCards.length,
        createdAt: new Date().toISOString().split('T')[0],
        cards: newCards
      }
      
      setFlashcardSets(prev => [newSet, ...prev])
      setSelectedSet(newSet)
      setActiveTab('study')
      setIsGenerating(false)
      setInputText('')
    }, 1500)
  }

  const quickGenerate = (topic: string): void => {
    setInputText(topic)
  }

  const nextCard = (): void => {
    if (!selectedSet) return
    setIsFlipped(false)
    setCurrentCard((prev) => (prev + 1) % selectedSet.cards.length)
  }

  const prevCard = (): void => {
    if (!selectedSet) return
    setIsFlipped(false)
    setCurrentCard((prev) => (prev - 1 + selectedSet.cards.length) % selectedSet.cards.length)
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
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Cards
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'study'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Study
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Section - Hidden on mobile when studying */}
        <div className={`space-y-4 sm:space-y-6 ${activeTab === 'study' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Create New Flashcards</h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your notes here or enter a topic..."
              className="w-full h-28 sm:h-32 p-3 sm:p-4 border text-gray-600 border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            
            {/* Quick Topics */}
            <div className="mt-3 sm:mt-4">
              <p className="text-sm text-gray-600 mb-2 sm:mb-3">Quick topics:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {quickTopics.map((topic) => (
                  <button
                    key={topic.name}
                    onClick={() => quickGenerate(topic.name)}
                    className="flex items-center space-x-2 p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-sm">{topic.emoji}</span>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">{topic.name}</span>
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
                onClick={generateFlashcards}
                disabled={!inputText.trim() || isGenerating}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Flashcard Sets List */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Flashcard Sets</h2>
            <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-none overflow-y-auto">
              {flashcardSets.map((set) => (
                <div
                  key={set.id}
                  onClick={() => {
                    setSelectedSet(set)
                    setCurrentCard(0)
                    setIsFlipped(false)
                    setActiveTab('study')
                  }}
                  className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedSet?.id === set.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{set.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{set.subject} • {set.cardCount} cards</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{set.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flashcard Preview - Full width on mobile when studying */}
        <div className={`${activeTab === 'create' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedSet ? selectedSet.title : 'Flashcard Preview'}
              </h2>
              <button
                onClick={() => setActiveTab('create')}
                className="lg:hidden px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Back
              </button>
            </div>
            
            {!selectedSet ? (
              <div className="h-64 sm:h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-4xl mb-4">🎴</div>
                <p className="text-gray-500 text-center text-sm sm:text-base">
                  Select a flashcard set or generate new ones to start studying
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Flashcard */}
                <div className="relative h-48 sm:h-64 perspective">
                  <div 
                    className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    {/* Front of card */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 sm:p-6 flex items-center justify-center backface-hidden">
                      <p className="text-base sm:text-xl font-medium text-center text-gray-900 px-2">
                        {selectedSet.cards[currentCard]?.front}
                      </p>
                      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-blue-600 text-xs sm:text-sm">
                        Tap to flip
                      </div>
                    </div>
                    
                    {/* Back of card */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 sm:p-6 flex items-center justify-center backface-hidden rotate-y-180">
                      <p className="text-sm sm:text-lg text-center text-gray-900 px-2">
                        {selectedSet.cards[currentCard]?.back}
                      </p>
                      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-green-600 text-xs sm:text-sm">
                        Tap to flip back
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={prevCard}
                    disabled={currentCard === 0}
                    className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-600 px-2">
                    {currentCard + 1} / {selectedSet.cards.length}
                  </span>
                  
                  <button
                    onClick={nextCard}
                    disabled={currentCard === selectedSet.cards.length - 1}
                    className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>

                {/* Progress */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCard + 1) / selectedSet.cards.length) * 100}%` }}
                  ></div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button className="py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base">
                    Save Progress
                  </button>
                  <button className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                    Export Set
                  </button>
                </div>

                {/* Mobile Quick Actions */}
                <div className="lg:hidden bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setActiveTab('create')}
                      className="py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      New Set
                    </button>
                    <button className="py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                      Share
                    </button>
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