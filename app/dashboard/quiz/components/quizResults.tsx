'use client'

import { X, Trophy, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { QuizResult, DetailedResult } from './types';
import { getThemeStyles, colors } from './constants';

interface QuizResultsModalProps {
  show: boolean;
  onClose: () => void;
  quizResult: QuizResult;
  detailedResults: DetailedResult[];
  onStartNewQuiz: () => void;
  onReviewAgain: () => void;
}

export default function QuizResultsModal({
  show,
  onClose,
  quizResult,
  detailedResults,
  onStartNewQuiz,
  onReviewAgain
}: QuizResultsModalProps) {
  const styles = getThemeStyles();

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div 
        className="w-full max-w-4xl border rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ 
          backgroundColor: styles.background.card,
          borderColor: styles.border.light,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: styles.border.light }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: quizResult.passed ? colors.success[50] : colors.secondary[50]
              }}
            >
              <Trophy size={20} style={{ 
                color: quizResult.passed ? colors.success[500] : colors.secondary[500]
              }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: styles.text.primary }}>
                Quiz Results
              </h2>
              <p className="text-sm mt-0.5" style={{ color: styles.text.secondary }}>
                {quizResult.passed ? 'Congratulations! 🎉' : 'Keep practicing! 💪'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ backgroundColor: 'transparent' }}
          >
            <X size={20} style={{ color: styles.text.secondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Score Overview */}
          <div className="text-center mb-8">
            <div 
              className="text-5xl font-bold mb-3"
              style={{ color: quizResult.passed ? colors.success[600] : colors.secondary[600] }}
            >
              {quizResult.percentage}
            </div>
            <div className="mb-4">
              <p className="text-sm mb-3" style={{ color: styles.text.secondary }}>
                {quizResult.correctCount} of {quizResult.totalQuestions} correct answers
              </p>
              <div 
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  quizResult.passed ? '' : ''
                }`}
                style={quizResult.passed ? 
                  { 
                    backgroundColor: colors.success[50],
                    color: colors.success[700]
                  } :
                  { 
                    backgroundColor: colors.secondary[50],
                    color: colors.secondary[700]
                  }
                }
              >
                {quizResult.passed ? (
                  <>
                    <CheckCircle size={16} className="mr-1.5" />
                    <span>Passed! Well done!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="mr-1.5" />
                    <span>Keep practicing!</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-md mx-auto mt-6">
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.neutral[50] }}>
                <div className="font-bold text-lg" style={{ color: colors.primary[500] }}>
                  {quizResult.correctCount}
                </div>
                <div className="text-xs" style={{ color: styles.text.secondary }}>Correct</div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.neutral[50] }}>
                <div className="font-bold text-lg" style={{ color: styles.text.secondary }}>
                  {quizResult.totalQuestions - quizResult.correctCount}
                </div>
                <div className="text-xs" style={{ color: styles.text.secondary }}>Incorrect</div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.neutral[50] }}>
                <div className="font-bold text-lg" style={{ color: styles.text.secondary }}>
                  {quizResult.totalQuestions}
                </div>
                <div className="text-xs" style={{ color: styles.text.secondary }}>Total</div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.neutral[50] }}>
                <div className="font-bold text-lg" style={{ color: quizResult.passed ? colors.success[600] : colors.secondary[600] }}>
                  {quizResult.score}
                </div>
                <div className="text-xs" style={{ color: styles.text.secondary }}>Score</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center" style={{ color: styles.text.primary }}>
              <span className="mr-2">📊</span>
              Review Your Answers
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {detailedResults.map((result, index) => (
                <div 
                  key={result.questionId} 
                  className={`p-4 rounded-xl border ${
                    result.correct ? '' : ''
                  }`}
                  style={result.correct ? 
                    { 
                      borderColor: colors.success[200],
                      backgroundColor: colors.success[50]
                    } :
                    { 
                      borderColor: colors.secondary[200],
                      backgroundColor: colors.secondary[50]
                    }
                  }
                >
                  <div className="flex items-start">
                    <div 
                      className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mr-3 mt-0.5 ${
                        result.correct ? '' : ''
                      }`}
                      style={result.correct ? 
                        { 
                          backgroundColor: colors.success[100],
                          color: colors.success[700]
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
                      <p className="text-sm font-medium mb-2 line-clamp-2" style={{ color: styles.text.primary }}>
                        {result.question}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium" style={{ color: styles.text.secondary }}>Your answer:</span>
                          <div className={`mt-1 p-2 rounded ${
                            result.correct ? '' : ''
                          }`}
                          style={result.correct ? 
                            { 
                              backgroundColor: colors.success[100],
                              color: colors.success[800]
                            } :
                            { 
                              backgroundColor: colors.secondary[100],
                              color: colors.secondary[800]
                            }
                          }>
                            {result.userAnswer || '(No answer)'}
                          </div>
                        </div>
                        {!result.correct && (
                          <div>
                            <span className="font-medium" style={{ color: styles.text.secondary }}>Correct answer:</span>
                            <div className="mt-1 p-2 rounded" style={{ 
                              backgroundColor: colors.primary[100],
                              color: colors.primary[800]
                            }}>
                              {result.correctAnswer}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${
                        result.correct ? '' : ''
                      }`}
                      style={result.correct ? 
                        { 
                          backgroundColor: colors.success[100],
                          color: colors.success[700]
                        } :
                        { 
                          backgroundColor: colors.secondary[100],
                          color: colors.secondary[700]
                        }
                      }
                    >
                      {result.correct ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex flex-col sm:flex-row gap-3"
          style={{ borderColor: styles.border.light }}
        >
          <button
            onClick={onReviewAgain}
            className="flex-1 py-3 rounded-lg transition-colors duration-150 font-medium text-sm"
            style={{ 
              backgroundColor: colors.neutral[100],
              color: styles.text.secondary
            }}
          >
            Review Again
          </button>
          <button
            onClick={onStartNewQuiz}
            className="flex-1 py-3 text-white rounded-lg transition-all duration-150 font-medium text-sm"
            style={{ 
              backgroundColor: colors.primary[500]
            }}
          >
            Start New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}