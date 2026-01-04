'use client'

import { useState, useEffect } from 'react';
import { Check, Circle, Hash } from 'lucide-react';
import { Quiz } from './types';
import { UserAnswers } from './types';
import { getThemeStyles, colors } from './constants';

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
  const styles = getThemeStyles();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions.sort((a, b) => a.order - b.order)[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const isAllAnswered = answeredCount === totalQuestions;

  // Scroll to top when component mounts or question changes
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
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-sm font-medium hover:underline flex items-center space-x-1"
          style={{ color: styles.text.secondary }}
        >
          ← Back
        </button>
        <div className="flex items-center space-x-2">
          <div className="text-xs px-2 py-1 rounded"
            style={{ 
              backgroundColor: colors.neutral[100],
              color: styles.text.secondary
            }}
          >
            {currentQuestionIndex + 1}/{totalQuestions}
          </div>
          {isAllAnswered && (
            <div className="text-xs px-2 py-1 rounded"
              style={{ 
                backgroundColor: colors.success[100],
                color: colors.success[700]
              }}
            >
              Ready
            </div>
          )}
        </div>
      </div>

      {/* Current Question */}
      <div className="mb-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: colors.primary[50] }}
            >
              <Hash size={14} style={{ color: colors.primary[500] }} />
            </div>
            <span className="text-sm font-medium" style={{ color: styles.text.primary }}>
              Question {currentQuestionIndex + 1}
            </span>
          </div>
          <h2 className="text-lg leading-relaxed" style={{ color: styles.text.primary }}>
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-2">
          {currentQuestion.type === 'MULTIPLE_CHOICE' && (
            currentQuestion.options.map((option, optIndex) => (
              <div
                key={`${currentQuestion.id}-${optIndex}`}
                onClick={() => handleOptionSelect(option)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-150 ${
                  userAnswers[currentQuestion.id] === option
                    ? 'border'
                    : 'hover:bg-gray-50'
                }`}
                style={userAnswers[currentQuestion.id] === option ? 
                  { 
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[300]
                  } :
                  { 
                    borderColor: styles.border.light
                  }
                }
              >
                <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  {userAnswers[currentQuestion.id] === option ? (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.primary[500] }}
                    >
                      <Check size={12} style={{ color: 'white' }} />
                    </div>
                  ) : (
                    <Circle size={20} style={{ color: styles.border.medium }} />
                  )}
                </div>
                <span className="text-sm flex-1" style={{ color: styles.text.primary }}>
                  {option}
                </span>
              </div>
            ))
          )}

          {currentQuestion.type === 'TRUE_FALSE' && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'true', label: 'True', color: colors.success[500] },
                { value: 'false', label: 'False', color: colors.secondary[500] }
              ].map((item) => (
                <div
                  key={`${currentQuestion.id}-${item.value}`}
                  onClick={() => handleTrueFalseSelect(item.value)}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg cursor-pointer transition-all duration-150 ${
                    userAnswers[currentQuestion.id] === item.value
                      ? 'border'
                      : 'hover:bg-gray-50'
                  }`}
                  style={userAnswers[currentQuestion.id] === item.value ? 
                    { 
                      backgroundColor: item.value === 'true' ? colors.success[50] : colors.secondary[50],
                      borderColor: item.value === 'true' ? colors.success[300] : colors.secondary[300]
                    } :
                    { 
                      borderColor: styles.border.light
                    }
                  }
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                    {userAnswers[currentQuestion.id] === item.value ? (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: item.color }}
                      >
                        <Check size={12} style={{ color: 'white' }} />
                      </div>
                    ) : (
                      <Circle size={20} style={{ color: styles.border.medium }} />
                    )}
                  </div>
                  <span className="text-sm font-medium"
                    style={{ color: userAnswers[currentQuestion.id] === item.value ? item.color : styles.text.primary }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'SHORT_ANSWER' && (
            <div>
              <input
                type="text"
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-1 focus:border-transparent text-sm transition-all duration-150"
                placeholder="Type your answer..."
                style={{ 
                  backgroundColor: colors.neutral[50],
                  borderColor: styles.border.medium,
                  color: styles.text.primary
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNextQuestion();
                  }
                }}
              />
              <div className="text-xs mt-2" style={{ color: styles.text.secondary }}>
                Press Enter to save and go to next
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simple Navigation */}
      <div className="flex justify-between items-center">
        <div>
          {currentQuestionIndex > 0 && (
            <button
              onClick={handlePrevQuestion}
              className="text-sm font-medium hover:underline"
              style={{ color: styles.text.secondary }}
            >
              ← Previous
            </button>
          )}
        </div>

        <div>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNextQuestion}
              disabled={!userAnswers[currentQuestion.id]}
              className="text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: colors.primary[500] }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={!isAllAnswered || isSubmitting}
              className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              style={{ 
                backgroundColor: colors.primary[500]
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Question Dots */}
      <div className="flex justify-center space-x-1 mt-6 pt-6 border-t"
        style={{ borderColor: styles.border.light }}
      >
        {quiz.questions.sort((a, b) => a.order - b.order).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-150 ${
              index === currentQuestionIndex ? 'w-4' : ''
            }`}
            style={index === currentQuestionIndex ? 
              { backgroundColor: colors.primary[500] } :
              userAnswers[quiz.questions[index].id] ?
                { backgroundColor: colors.primary[200] } :
                { backgroundColor: colors.neutral[300] }
            }
            title={`Question ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}