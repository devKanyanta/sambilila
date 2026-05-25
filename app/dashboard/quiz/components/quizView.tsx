'use client'

import { useState, useEffect } from 'react';
import { Check, Circle, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { Quiz, UserAnswers } from './types';

interface QuizViewProps {
  quiz: Quiz;
  userAnswers: UserAnswers;
  isSubmitting: boolean;
  onAnswer: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  onStartNewQuiz: () => void;
  onBack: () => void;
}

export default function QuizView({
  quiz,
  userAnswers,
  isSubmitting,
  onAnswer,
  onSubmit,
  onStartNewQuiz,
  onBack
}: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const totalQuestions = quiz.questions.length;
  const sortedQuestions = [...quiz.questions].sort((a, b) => a.order - b.order);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const isAllAnswered = answeredCount === totalQuestions;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleOptionSelect = (option: string) => {
    onAnswer(currentQuestion.id, option);
  };

  const handleTrueFalseSelect = (value: string) => {
    onAnswer(currentQuestion.id, value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <div className="text-xs px-2 py-1 rounded-lg bg-neutral-100 text-neutral-500 font-medium">
            {currentQuestionIndex + 1}/{totalQuestions}
          </div>
          {isAllAnswered && (
            <div className="text-xs px-2 py-1 rounded-lg bg-success-50 text-success-700 font-medium">
              Ready
            </div>
          )}
        </div>
      </div>

      {/* Current Question */}
      <div className="mb-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center">
              <Hash size={14} className="text-primary-500" />
            </div>
            <span className="text-sm font-medium text-neutral-800">
              Question {currentQuestionIndex + 1}
            </span>
          </div>
          <h2 className="text-lg leading-relaxed text-neutral-800 font-normal">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-2">
          {currentQuestion.type === 'MULTIPLE_CHOICE' && (
            currentQuestion.options.map((option, optIndex) => {
              const isSelected = userAnswers[currentQuestion.id] === option;
              return (
                <div
                  key={`${currentQuestion.id}-${optIndex}`}
                  onClick={() => handleOptionSelect(option)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'bg-primary-50 border-primary-300'
                      : 'border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    ) : (
                      <Circle size={20} className="text-neutral-300" />
                    )}
                  </div>
                  <span className="text-sm flex-1 text-neutral-800">{option}</span>
                </div>
              );
            })
          )}

          {currentQuestion.type === 'TRUE_FALSE' && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
              ].map((item) => {
                const isSelected = userAnswers[currentQuestion.id] === item.value;
                return (
                  <div
                    key={`${currentQuestion.id}-${item.value}`}
                    onClick={() => handleTrueFalseSelect(item.value)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      isSelected
                        ? item.value === 'true'
                          ? 'bg-success-50 border-success-300'
                          : 'bg-secondary-50 border-secondary-300'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                      {isSelected ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          item.value === 'true' ? 'bg-success-500' : 'bg-secondary-500'
                        }`}>
                          <Check size={12} className="text-white" />
                        </div>
                      ) : (
                        <Circle size={20} className="text-neutral-300" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isSelected
                        ? item.value === 'true' ? 'text-success-600' : 'text-secondary-600'
                        : 'text-neutral-800'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'SHORT_ANSWER' && (
            <div>
              <input
                type="text"
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-sm text-neutral-800 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 placeholder-neutral-400"
                placeholder="Type your answer..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNextQuestion();
                }}
              />
              <div className="text-xs mt-2 text-neutral-500">
                Press Enter to save and go to next
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentQuestionIndex > 0 && (
            <button
              onClick={handlePrevQuestion}
              className="p-2.5 rounded-xl bg-white border-2 border-neutral-200 shadow-sm transition-all active:scale-95 hover:bg-neutral-50 hover:border-neutral-300"
            >
              <ChevronLeft size={20} className="text-neutral-600" />
            </button>
          )}
        </div>

        <div>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNextQuestion}
              disabled={!userAnswers[currentQuestion.id]}
              className="p-2.5 rounded-xl bg-white border-2 border-neutral-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-neutral-50 hover:border-neutral-300"
            >
              <ChevronRight size={20} className="text-neutral-600" />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={!isAllAnswered || isSubmitting}
              className="px-5 py-2.5 bg-primary-500 text-white rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm hover:shadow-md active:scale-95"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>

      {/* Question Dots */}
      <div className="flex justify-center gap-1 mt-6 pt-6 border-t border-neutral-200">
        {sortedQuestions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`h-2 rounded-full transition-all duration-150 ${
              index === currentQuestionIndex
                ? 'w-4 bg-primary-500'
                : userAnswers[quiz.questions[index].id]
                  ? 'w-2 bg-primary-200'
                  : 'w-2 bg-neutral-300'
            }`}
            title={`Question ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
