'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, Hash, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
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
  const [direction, setDirection] = useState<number>(1);

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
      setDirection(1);
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleOptionSelect = (option: string) => {
    onAnswer(currentQuestion.id, option);
  };

  const handleTrueFalseSelect = (value: string) => {
    onAnswer(currentQuestion.id, value);
  };


  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back + Progress header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack}
          className="text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1.5 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          {isAllAnswered && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs px-2 py-0.5 rounded-full bg-success-50 text-success-700 font-medium"
            >
              Ready
            </motion.span>
          )}
        </div>
      </div>

      {/* Animated Progress Dots */}
      <div className="flex items-center gap-1.5 mb-8 justify-center">
        {sortedQuestions.map((q, index) => {
          const isActive = index === currentQuestionIndex;
          const isAnswered = !!userAnswers[q.id];
          return (
            <motion.button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className="relative"
              layout
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={`h-2 rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary-500'
                    : isAnswered
                      ? 'bg-primary-300'
                      : 'bg-neutral-200'
                }`}
                animate={{
                  width: isActive ? 24 : 8,
                  scale: isActive ? 1 : 0.85,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              {isAnswered && !isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-400 border-2 border-white"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Question Card with AnimatePresence */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQuestionIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 280, damping: 25, mass: 0.8 }}
        >
          <Card className="p-5 sm:p-6 mb-4">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-7 h-7 rounded-xl bg-primary-50 flex items-center justify-center"
                >
                  <Hash size={14} className="text-primary-500" />
                </motion.div>
                <span className="text-xs font-medium text-neutral-500">
                  Question {currentQuestionIndex + 1}
                </span>
              </div>
              <h2 className="text-base sm:text-lg leading-relaxed text-neutral-900 font-medium">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                currentQuestion.options.map((option, optIndex) => {
                  const isSelected = userAnswers[currentQuestion.id] === option;

                  return (
                    <motion.div
                      key={`${currentQuestion.id}-${optIndex}`}
                      onClick={() => handleOptionSelect(option)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
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
                      <span className={`text-sm flex-1 ${
                        isSelected ? 'text-primary-700' : 'text-neutral-900'
                      }`}>
                        {option}
                      </span>
                    </motion.div>
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
                      <motion.div
                        key={`${currentQuestion.id}-${item.value}`}
                        onClick={() => handleTrueFalseSelect(item.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-primary-50 border-primary-200'
                            : 'border-neutral-200 hover:bg-neutral-50'
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
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-primary-700' : 'text-neutral-700'
                        }`}>
                          {item.label}
                        </span>
                      </motion.div>
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
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentQuestionIndex > 0 && (
            <motion.button
              onClick={handlePrevQuestion}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-white border border-neutral-200 shadow-sm transition-all hover:bg-neutral-50 hover:border-neutral-300"
            >
              <ChevronLeft size={20} className="text-neutral-500" />
            </motion.button>
          )}
        </div>

        <div>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <motion.button
              onClick={handleNextQuestion}
              disabled={!userAnswers[currentQuestion.id]}
              whileHover={userAnswers[currentQuestion.id] ? { scale: 1.05 } : undefined}
              whileTap={userAnswers[currentQuestion.id] ? { scale: 0.95 } : undefined}
              className="p-3 rounded-xl bg-white border border-neutral-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-neutral-50 hover:border-neutral-300"
            >
              <ChevronRight size={20} className="text-neutral-500" />
            </motion.button>
          ) : (
            <motion.button
              onClick={onSubmit}
              disabled={!isAllAnswered || isSubmitting}
              whileHover={isAllAnswered ? { scale: 1.02 } : undefined}
              whileTap={isAllAnswered ? { scale: 0.97 } : undefined}
              className="px-6 py-2.5 bg-primary-500 text-white rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm hover:bg-primary-600 hover:shadow-md"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Quiz'
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
