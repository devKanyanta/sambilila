'use client'

import { Search, FileText, Clock, ChevronRight } from 'lucide-react';
import { QuizListItem } from './types';
import { useState, useEffect } from 'react';

interface QuizListProps {
  quizList: QuizListItem[];
  isLoadingQuizzes: boolean;
  onSelectQuiz: (quizId: string) => void;
  onRefreshQuizzes: () => void;
  onCreateNewQuiz: () => void;
  loadingQuizId?: string | null;
}

export default function QuizList({
  quizList,
  isLoadingQuizzes,
  onSelectQuiz,
  onRefreshQuizzes,
  onCreateNewQuiz,
}: QuizListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleQuizClick = (quizId: string) => {
    setLoadingQuizId(quizId);
    onSelectQuiz(quizId);
    setTimeout(() => setLoadingQuizId(null), 3000);
  };

  const filteredQuizzes = quizList.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingQuizzes) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-secondary">Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-sm text-neutral-800 outline-none transition-all duration-150 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 placeholder-neutral-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quizzes Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">
          {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}
        </span>
        <button
          onClick={onRefreshQuizzes}
          className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary-50 flex items-center justify-center mb-3">
            <FileText size={24} className="text-primary-500" />
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            {searchQuery ? 'No quizzes found' : 'No quizzes created yet'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateNewQuiz}
              className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              Create your first quiz →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuizzes.map((quizItem) => {
            const isLoading = loadingQuizId === quizItem.id;

            return (
              <button
                key={quizItem.id}
                onClick={() => !isLoading && handleQuizClick(quizItem.id)}
                className={`bg-white rounded-xl p-5 text-left shadow-md transition-all group hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                  isLoading ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading font-semibold text-base text-neutral-800 pr-2 transition-colors group-hover:text-primary-500 truncate flex items-center gap-2">
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <FileText size={16} className="text-primary-400 flex-shrink-0" />
                    )}
                    {quizItem.title}
                    {isLoading && <span className="text-xs text-primary-500 font-normal ml-1">Opening...</span>}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-primary-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0 mt-1" />
                </div>

                <span className="inline-block text-xs font-medium mb-3 px-2.5 py-1 rounded-full bg-primary-50 text-primary-500">
                  {quizItem.subject}
                </span>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                    <FileText size={12} className="text-neutral-400" />
                    {quizItem._count.questions} questions
                  </span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(quizItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
