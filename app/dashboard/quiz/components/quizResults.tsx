'use client'

import { QuizResult, DetailedResult } from './types';
import { getThemeStyles, colors, gradients } from './constants';

interface QuizResultsProps {
  quizResult: QuizResult;
  detailedResults: DetailedResult[];
  onStartNewQuiz: () => void;
  onReviewAgain: () => void;
}

export default function QuizResults({
  quizResult,
  detailedResults,
  onStartNewQuiz,
  onReviewAgain
}: QuizResultsProps) {
  const styles = getThemeStyles();

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="text-center">
        <div 
          className="text-6xl font-bold mb-4 bg-clip-text text-transparent"
          style={{ 
            background: quizResult.passed ? 
              'linear-gradient(135deg, #58a4b0 0%, #7ab7c0 100%)' :
              'linear-gradient(135deg, #a9bcd0 0%, #737e97 100%)'
          }}
        >
          {quizResult.percentage}
        </div>
        <p className="text-lg mb-4" style={{ color: styles.text.secondary }}>
          You answered <span className="font-bold" style={{ color: styles.text.primary }}>
            {quizResult.correctCount}
          </span> out of{' '}
          <span className="font-bold" style={{ color: styles.text.primary }}>
            {quizResult.totalQuestions}
          </span> questions correctly
        </p>
        <div 
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 border ${
            quizResult.passed ? '' : ''
          }`}
          style={quizResult.passed ? 
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
          {quizResult.passed ? (
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
                result.correct ? '' : ''
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
          onClick={onStartNewQuiz}
          className="flex-1 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          style={{ 
            background: gradients.primary,
            boxShadow: styles.shadow.sm
          }}
        >
          Start New Quiz
        </button>
        <button
          onClick={onReviewAgain}
          className="flex-1 py-3 rounded-xl transition-colors duration-200 font-medium"
          style={{ 
            backgroundColor: colors.neutral[100],
            color: styles.text.secondary
          }}
        >
          Review Quiz Again
        </button>
      </div>
    </div>
  );
}