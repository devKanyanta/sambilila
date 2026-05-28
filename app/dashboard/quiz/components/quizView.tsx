'use client'

import { useState, useEffect } from 'react';
import { Check, Circle, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { Quiz, UserAnswers } from './types';
import Card from '@/app/dashboard/components/Card';

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
  quiz, userAnswers, isSubmitting, onAnswer, onSubmit, onStartNewQuiz, onBack
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
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack}
          className="text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          {isAllAnswered && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">Ready</span>
          )}
        </div>
      </div>

      {/* Question dots progress */}
      <div className="flex items-center gap-1 mb-8">
        {sortedQuestions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentQuestionIndex
                ? 'w-6 bg-primary-500'
                : userAnswers[quiz.questions[index].id]
                  ? 'w-1.5 bg-primary-200'
                  : 'w-1.5 bg-neutral-200'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <Card className="p-5 sm:p-6 mb-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center">
              <Hash size={14} className="text-primary-500" />
            </div>
            <span className="text-xs font-medium text-neutral-500">
              Question {currentQuestionIndex + 1}
            </span>
          </div>
          <h2 className="text-base sm:text-lg leading-relaxed text-neutral-900 font-normal">
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
                  className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-primary-50 border-primary-200'
                      : 'border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    ) : (
                      <Circle size={20} className="text-neutral-200" />
                    )}
                  </div>
                  <span className="text-sm flex-1 text-neutral-900">{option}</span>
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
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? item.value === 'true'
                          ? 'bg-success-50 border-success-200'
                          : 'bg-red-50 border-red-200'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                      {isSelected ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          item.value === 'true' ? 'bg-success-500' : 'bg-red-400'
                        }`}>
                          <Check size={12} className="text-white" />
                        </div>
                      ) : (
                        <Circle size={20} className="text-neutral-200" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isSelected
                        ? item.value === 'true' ? 'text-success-700' : 'text-red-600'
                        : 'text-neutral-700'
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
                className="w-full p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder-neutral-400"
                placeholder="Type your answer..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNextQuestion();
                }}
              />
              <p className="text-xs mt-2 text-neutral-400">Press Enter to save and go to next</p>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentQuestionIndex > 0 && (
            <button onClick={handlePrevQuestion}
              className="p-3 rounded-xl bg-white border border-neutral-200 shadow-sm transition-all active:scale-95 hover:bg-neutral-50 hover:border-neutral-300">
              <ChevronLeft size={20} className="text-neutral-500" />
            </button>
          )}
        </div>

        <div>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button onClick={handleNextQuestion}
              disabled={!userAnswers[currentQuestion.id]}
              className="p-3 rounded-xl bg-white border border-neutral-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-neutral-50 hover:border-neutral-300">
              <ChevronRight size={20} className="text-neutral-500" />
            </button>
          ) : (
            <button onClick={onSubmit}
              disabled={!isAllAnswered || isSubmitting}
              className="px-5 py-2.5 bg-primary-500 text-white rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm hover:bg-primary-600 hover:shadow-md active:scale-95">
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
