'use client'

import { X, Trophy, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { QuizResult, DetailedResult } from './types';

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
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              quizResult.passed ? 'bg-success-50' : 'bg-secondary-50'
            }`}>
              <Trophy size={20} className={quizResult.passed ? 'text-success-500' : 'text-secondary-500'} />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-neutral-800">Quiz Results</h2>
              <p className="text-sm mt-0.5 text-neutral-500">
                {quizResult.passed ? 'Congratulations! 🎉' : 'Keep practicing! 💪'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Score Overview */}
          <div className="text-center mb-8">
            <div className={`text-5xl font-heading font-semibold mb-3 ${
              quizResult.passed ? 'text-success-600' : 'text-secondary-600'
            }`}>
              {quizResult.percentage}
            </div>
            <div className="mb-4">
              <p className="text-sm text-neutral-500 mb-3">
                {quizResult.correctCount} of {quizResult.totalQuestions} correct answers
              </p>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                quizResult.passed
                  ? 'bg-success-50 text-success-700'
                  : 'bg-secondary-50 text-secondary-700'
              }`}>
                {quizResult.passed ? (
                  <><CheckCircle size={16} className="mr-1.5" /><span>Passed! Well done!</span></>
                ) : (
                  <><AlertCircle size={16} className="mr-1.5" /><span>Keep practicing!</span></>
                )}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-md mx-auto mt-6">
              <div className="p-3 rounded-xl bg-neutral-50">
                <div className="font-heading font-semibold text-lg text-primary-500">{quizResult.correctCount}</div>
                <div className="text-xs text-neutral-500">Correct</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50">
                <div className="font-heading font-semibold text-lg text-neutral-500">{quizResult.totalQuestions - quizResult.correctCount}</div>
                <div className="text-xs text-neutral-500">Incorrect</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50">
                <div className="font-heading font-semibold text-lg text-neutral-500">{quizResult.totalQuestions}</div>
                <div className="text-xs text-neutral-500">Total</div>
              </div>
              <div className={`p-3 rounded-xl bg-neutral-50`}>
                <div className={`font-heading font-semibold text-lg ${
                  quizResult.passed ? 'text-success-600' : 'text-secondary-600'
                }`}>{quizResult.score}</div>
                <div className="text-xs text-neutral-500">Score</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center text-neutral-800">
              <span className="mr-2">📊</span>Review Your Answers
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {detailedResults.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`p-4 rounded-xl border-2 ${
                    result.correct
                      ? 'border-success-200 bg-success-50'
                      : 'border-secondary-200 bg-secondary-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 mt-0.5 text-xs font-bold ${
                      result.correct
                        ? 'bg-success-100 text-success-700'
                        : 'bg-secondary-100 text-secondary-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2 line-clamp-2 text-neutral-800">
                        {result.question}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-neutral-500">Your answer:</span>
                          <div className={`mt-1 p-2 rounded ${
                            result.correct
                              ? 'bg-success-100 text-success-800'
                              : 'bg-secondary-100 text-secondary-800'
                          }`}>
                            {result.userAnswer || '(No answer)'}
                          </div>
                        </div>
                        {!result.correct && (
                          <div>
                            <span className="font-medium text-neutral-500">Correct answer:</span>
                            <div className="mt-1 p-2 rounded bg-primary-100 text-primary-800">
                              {result.correctAnswer}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${
                      result.correct
                        ? 'bg-success-100 text-success-700'
                        : 'bg-secondary-100 text-secondary-700'
                    }`}>
                      {result.correct ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReviewAgain}
            className="flex-1 py-3 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors font-medium text-sm"
          >
            Review Again
          </button>
          <button
            onClick={onStartNewQuiz}
            className="flex-1 py-3 bg-primary-500 text-white rounded-xl hover:shadow-md transition-all font-medium text-sm"
          >
            Start New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
