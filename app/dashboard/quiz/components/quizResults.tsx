'use client'

import { motion } from 'framer-motion';
import { Trophy, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { QuizResult, DetailedResult } from './types';

interface QuizResultsProps {
  quizResult: QuizResult;
  detailedResults: DetailedResult[];
  onStartNewQuiz: () => void;
  onReviewAgain: () => void;
}

function CountUp({ value, duration = 1.5 }: { value: number; duration?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {value}
      </motion.span>
    </motion.span>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.4 },
  },
};

export default function QuizResults({
  quizResult, detailedResults, onStartNewQuiz, onReviewAgain
}: QuizResultsProps) {
  const wrongCount = quizResult.totalQuestions - quizResult.correctCount;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center mb-10"
      >
        {/* Trophy with bounce */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="relative inline-block mb-6"
        >
          {/* Confetti particles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  i % 2 === 0 ? 'bg-primary-400' : 'bg-secondary-400'
                }`}
                initial={{ x: 20, y: 0, opacity: 1 }}
                animate={{
                  x: [20, 20 + (i - 3) * 30],
                  y: [0, -40 - Math.random() * 30],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 1.2, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
            quizResult.passed ? 'bg-success-50' : 'bg-red-50'
          }`}>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <Trophy size={40} className={quizResult.passed ? 'text-success-500' : 'text-red-400'} />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-2xl font-heading font-semibold text-neutral-900 mb-2"
        >
          Quiz Complete!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-neutral-500"
        >
          {quizResult.passed
            ? 'Great work! You really know your stuff.'
            : 'Keep practicing — you\'ll get there!'}
        </motion.p>
      </motion.div>

      {/* Score Overview */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-10"
      >
        <motion.div variants={staggerItem} className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
            className={`text-6xl font-heading font-bold mb-2 ${
              quizResult.passed ? 'text-success-600' : 'text-red-400'
            }`}
          >
            <CountUp value={parseInt(quizResult.percentage)} />
            <span className="text-3xl">%</span>
          </motion.div>
          <p className="text-sm text-neutral-400 mb-3">
            {quizResult.correctCount} of {quizResult.totalQuestions} correct
          </p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.55, type: 'spring', stiffness: 200, damping: 15 }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${
              quizResult.passed
                ? 'bg-success-50 text-success-700'
                : 'bg-red-50 text-red-500'
            }`}
          >
            {quizResult.passed ? (
              <><CheckCircle size={16} />Passed</>
            ) : (
              <><AlertCircle size={16} />Needs improvement</>
            )}
          </motion.div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div variants={staggerItem} className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
          {[
            { label: 'Correct', value: quizResult.correctCount, color: 'text-success-600' },
            { label: 'Wrong', value: wrongCount, color: 'text-red-400' },
            { label: 'Total', value: quizResult.totalQuestions, color: 'text-neutral-400' },
            { label: 'Score', value: quizResult.score, color: quizResult.passed ? 'text-success-600' : 'text-red-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
              className="p-3 rounded-xl bg-white border border-neutral-100 text-center shadow-sm"
            >
              <div className={`font-heading font-semibold text-lg ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Detailed Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <h3 className="font-heading font-medium text-neutral-900 mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-primary-500" />
          Review Your Answers
        </h3>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {detailedResults.map((result, index) => (
            <motion.div
              key={result.questionId}
              variants={staggerItem}
              className={`p-4 rounded-xl border ${
                result.correct
                  ? 'border-success-100 bg-success-50/40'
                  : 'border-red-100 bg-red-50/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                  result.correct
                    ? 'bg-success-100 text-success-700'
                    : 'bg-red-100 text-red-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-2 line-clamp-2 text-neutral-900">{result.question}</p>
                  <div className="space-y-1 text-xs">
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
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  result.correct ? 'bg-success-100 text-success-600' : 'bg-red-100 text-red-400'
                }`}>
                  {result.correct ? <CheckCircle size={14} /> : <XCircle size={14} />}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Footer Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex gap-3 pb-8"
      >
        <motion.button
          onClick={onReviewAgain}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-3 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors font-medium text-sm"
        >
          Review Again
        </motion.button>
        <motion.button
          onClick={onStartNewQuiz}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 hover:shadow-sm transition-all font-medium text-sm"
        >
          Start New Quiz
        </motion.button>
      </motion.div>
    </div>
  );
}
