'use client'

import { Quiz } from './types';
import { UserAnswers } from './types';
import { getThemeStyles, colors, gradients } from './constants';

interface QuizViewProps {
  quiz: Quiz;
  userAnswers: UserAnswers;
  isSubmitting: boolean;
  onAnswer: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function QuizView({
  quiz,
  userAnswers,
  isSubmitting,
  onAnswer,
  onSubmit,
  onBack
}: QuizViewProps) {
  const styles = getThemeStyles();
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="rounded-xl p-5" style={{ backgroundColor: colors.primary[50] }}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium" style={{ color: styles.text.primary }}>Progress</span>
          <span className="text-sm font-bold" style={{ color: colors.primary[600] }}>
            {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: colors.neutral[300] }}>
          <div 
            className="h-2.5 rounded-full transition-all duration-500"
            style={{ 
              background: gradients.primary,
              width: `${(answeredCount / totalQuestions) * 100}%`
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
                            onChange={() => onAnswer(q.id, option)}
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
                            onChange={() => onAnswer(q.id, item.value)}
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
                        onChange={(e) => onAnswer(q.id, e.target.value)}
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
        onClick={onSubmit}
        disabled={answeredCount !== totalQuestions || isSubmitting}
        className="w-full py-4 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
        style={{ 
          background: gradients.primary,
          boxShadow: styles.shadow.sm
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
            <span>Submit Quiz ({answeredCount}/{totalQuestions})</span>
          </>
        )}
      </button>

      {/* Mobile Stats */}
      <div className="lg:hidden rounded-xl p-4" style={{ backgroundColor: colors.primary[50] }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg" style={{ backgroundColor: styles.background.card }}>
            <div className="text-lg font-bold" style={{ color: colors.primary[400] }}>
              {answeredCount}
            </div>
            <div className="text-xs" style={{ color: styles.text.secondary }}>Answered</div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: styles.background.card }}>
            <div className="text-lg font-bold" style={{ color: styles.text.secondary }}>
              {totalQuestions - answeredCount}
            </div>
            <div className="text-xs" style={{ color: styles.text.secondary }}>Remaining</div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: styles.background.card }}>
            <div className="text-lg font-bold" style={{ color: colors.primary[600] }}>
              {totalQuestions}
            </div>
            <div className="text-xs" style={{ color: styles.text.secondary }}>Total</div>
          </div>
        </div>
      </div>

      {/* Back Button (Mobile) */}
      <button
        onClick={onBack}
        className="lg:hidden w-full py-3 rounded-xl transition-colors duration-200 font-medium"
        style={{ 
          backgroundColor: colors.neutral[100],
          color: styles.text.secondary
        }}
      >
        ← Back to Create
      </button>
    </div>
  );
}