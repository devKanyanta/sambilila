'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Clock, Share2, Check, BarChart3 } from 'lucide-react';
import { QuizListItem } from './types';
import { useState, useEffect } from 'react';
import Card from '@/app/dashboard/components/Card';
import { ShimmerBlock } from '@/app/dashboard/components/Shimmer';

interface QuizListProps {
  quizList: QuizListItem[];
  isLoadingQuizzes: boolean;
  onSelectQuiz: (quizId: string) => void;
  onRefreshQuizzes: () => void;
  onCreateNewQuiz: () => void;
  loadingQuizId?: string | null;
}

const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export default function QuizList({
  quizList, isLoadingQuizzes, onSelectQuiz, onRefreshQuizzes, onCreateNewQuiz,
}: QuizListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShare = async (quizId: string) => {
    setSharingId(quizId);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/quizzes/${quizId}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to share quiz');

      const data = await res.json();
      await navigator.clipboard.writeText(data.shareUrl);

      setCopiedId(quizId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error sharing quiz:', err);
    } finally {
      setSharingId(null);
    }
  };

  const filteredQuizzes = quizList.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingQuizzes) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading quizzes">
        <ShimmerBlock className="h-[42px] w-full" />
        <div className="flex items-center justify-between">
          <ShimmerBlock className="h-4 w-24" />
          <ShimmerBlock className="h-4 w-14" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <ShimmerBlock className="h-4 w-36" />
                  <ShimmerBlock className="h-3 w-20" />
                </div>
                <ShimmerBlock className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading quizzes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text" value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder-neutral-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600">
            Clear
          </button>
        )}
      </motion.div>

      {/* Quizzes Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-center justify-between text-sm"
      >
        <span className="text-neutral-400">{filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}</span>
        <button onClick={onRefreshQuizzes}
          className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
          Refresh
        </button>
      </motion.div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-50 flex items-center justify-center mb-4">
            <BarChart3 size={28} className="text-neutral-300" />
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            {searchQuery ? 'No quizzes found' : 'No quizzes created yet'}
          </p>
          {!searchQuery && (
            <button onClick={onCreateNewQuiz}
              className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
              Create your first quiz &rarr;
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {filteredQuizzes.map((quizItem) => (
              <motion.div
                key={quizItem.id}
                variants={listItem}
                layout
                exit={{ opacity: 0, x: -20 }}
              >
                <Card
                  onClick={() => onSelectQuiz(quizItem.id)}
                  className="p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText size={16} className="text-primary-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-neutral-900 truncate">
                          {quizItem.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
                            {quizItem.subject}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <FileText size={12} />
                        {quizItem._count.questions}q
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(quizItem.id);
                        }}
                        disabled={sharingId === quizItem.id}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
                        title="Share quiz"
                      >
                        {copiedId === quizItem.id ? (
                          <Check size={14} className="text-success-500" />
                        ) : (
                          <Share2 size={14} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
                        )}
                      </button>
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock size={12} />{new Date(quizItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
