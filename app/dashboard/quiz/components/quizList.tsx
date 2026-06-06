'use client'

import { Search, FileText, Clock, ChevronRight, Share2, Check } from 'lucide-react';
import { QuizListItem } from './types';
import { useState, useEffect } from 'react';
import Card from '@/app/dashboard/components/Card';
import { ShimmerBlock, ShimmerCard } from '@/app/dashboard/components/Shimmer';

interface QuizListProps {
  quizList: QuizListItem[];
  isLoadingQuizzes: boolean;
  onSelectQuiz: (quizId: string) => void;
  onRefreshQuizzes: () => void;
  onCreateNewQuiz: () => void;
  loadingQuizId?: string | null;
}

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
        {/* Search Bar Shimmer */}
        <ShimmerBlock className="h-[42px] w-full" />

        {/* Count Row Shimmer */}
        <div className="flex items-center justify-between">
          <ShimmerBlock className="h-4 w-24" />
          <ShimmerBlock className="h-4 w-14" />
        </div>

        {/* Cards Grid Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <ShimmerCard key={i} />
          ))}
        </div>

        <span className="sr-only">Loading quizzes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
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
      </div>

      {/* Quizzes Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">{filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}</span>
        <button onClick={onRefreshQuizzes}
          className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
          Refresh
        </button>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 mx-auto rounded-xl bg-neutral-50 flex items-center justify-center mb-4">
            <FileText size={24} className="text-neutral-300" />
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuizzes.map((quizItem) => (
            <Card
              key={quizItem.id}
              onClick={() => onSelectQuiz(quizItem.id)}
              className="p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-heading font-medium text-neutral-900 pr-2 truncate flex items-center gap-2">
                  <FileText size={14} className="text-primary-400 flex-shrink-0" />
                  {quizItem.title}
                </h3>
                <ChevronRight className="w-4 h-4 text-primary-300 flex-shrink-0 mt-0.5" />
              </div>

              <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-600 mb-3">
                {quizItem.subject}
              </span>              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <FileText size={12} />{quizItem._count.questions} questions
                        </span>
                        <div className="flex items-center gap-2">
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
                              <Share2 size={14} className="text-neutral-400 hover:text-primary-500" />
                            )}
                          </button>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Clock size={12} />{new Date(quizItem.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
