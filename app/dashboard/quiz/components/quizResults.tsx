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
  show, onClose, quizResult, detailedResults, onStartNewQuiz, onReviewAgain
}: QuizResultsModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              quizResult.passed ? 'bg-success-50' : 'bg-red-50'
            }`}>
              <Trophy size={20} className={quizResult.passed ? 'text-success-500' : 'text-red-400'} />
            </div>
            <div>
              <h2 className="text-lg font-heading font-medium text-neutral-900">Quiz Results</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {quizResult.passed ? 'Great work! 🎉' : 'Keep practicing! 💪'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Score Overview */}
          <div className="text-center mb-8">
            <div className={`text-5xl font-heading font-medium mb-2 ${
              quizResult.passed ? 'text-success-600' : 'text-red-400'
            }`}>
              {quizResult.percentage}%
            </div>
            <p className="text-sm text-neutral-400 mb-4">
              {quizResult.correctCount} of {quizResult.totalQuestions} correct
            </p>
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
              quizResult.passed
                ? 'bg-success-50 text-success-700'
                : 'bg-red-50 text-red-500'
            }`}>
              {quizResult.passed ? (
                <><CheckCircle size={16} className="mr-1.5" />Passed</>
              ) : (
                <><AlertCircle size={16} className="mr-1.5" />Needs improvement</>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mt-6">
              <div className="p-3 rounded-xl bg-neutral-50">
                <div className="font-heading font-medium text-lg text-primary-500">{quizResult.correctCount}</div>
                <div className="text-[10px] text-neutral-400">Correct</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50">
                <div className="font-heading font-medium text-lg text-neutral-400">{quizResult.totalQuestions - quizResult.correctCount}</div>
                <div className="text-[10px] text-neutral-400">Wrong</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50">
                <div className="font-heading font-medium text-lg text-neutral-400">{quizResult.totalQuestions}</div>
                <div className="text-[10px] text-neutral-400">Total</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50">
                <div className={`font-heading font-medium text-lg ${
                  quizResult.passed ? 'text-success-600' : 'text-red-400'
                }`}>{quizResult.score}</div>
                <div className="text-[10px] text-neutral-400">Score</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div>
            <h3 className="font-heading font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-primary-500" />
              Review Your Answers
            </h3>
            <div className="space-y-2">
              {detailedResults.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`p-4 rounded-xl border ${
                    result.correct
                      ? 'border-success-100 bg-success-50/50'
                      : 'border-red-100 bg-red-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium ${
                      result.correct
                        ? 'bg-success-100 text-success-700'
                        : 'bg-red-100 text-red-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-2 line-clamp-2 text-neutral-900">{result.question}</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">Your answer:</span>
                          <span className={result.correct ? 'text-success-700 font-medium' : 'text-red-500 font-medium'}>
                            {result.userAnswer || '(No answer)'}
                          </span>
                        </div>
                        {!result.correct && (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-400">Correct:</span>
                            <span className="text-primary-600 font-medium">{result.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      result.correct ? 'bg-success-100 text-success-600' : 'bg-red-100 text-red-400'
                    }`}>
                      {result.correct ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-neutral-100 flex gap-3">
          <button onClick={onReviewAgain}
            className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors font-medium text-sm active:scale-95">
            Review Again
          </button>
          <button onClick={onStartNewQuiz}
            className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 hover:shadow-sm transition-all font-medium text-sm active:scale-95">
            Start New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
