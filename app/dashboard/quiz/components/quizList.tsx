'use client'

import { Search, FileText, Clock, Hash } from 'lucide-react';
import { QuizListItem } from './types';
import { getThemeStyles, colors } from './constants';
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
  const styles = getThemeStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);
  

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleQuizClick = (quizId: string) => {
    // Set the loading state for this specific quiz
    setLoadingQuizId(quizId);
    
    // Call the original handler
    onSelectQuiz(quizId);
    
    // Optional: Clear loading state after a timeout in case the navigation fails
    setTimeout(() => {
      setLoadingQuizId(null);
    }, 3000); // 3 second timeout
  };

  const filteredQuizzes = quizList.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingQuizzes) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div 
          className="w-8 h-8 border-2 rounded-full animate-spin mb-4"
          style={{ 
            borderColor: colors.primary[400],
            borderTopColor: 'transparent'
          }}
        ></div>
        <p className="text-sm" style={{ color: styles.text.secondary }}>Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search 
          size={18} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
          style={{ color: styles.text.secondary }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-1 focus:border-transparent text-sm transition-all duration-150"
          style={{ 
            backgroundColor: colors.neutral[50],
            borderColor: styles.border.medium,
            color: styles.text.primary
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs"
            style={{ color: styles.text.secondary }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Quizzes Count */}
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: styles.text.secondary }}>
          {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}
        </span>
        <button
          onClick={onRefreshQuizzes}
          className="text-xs hover:underline"
          style={{ color: colors.primary[500] }}
        >
          Refresh
        </button>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-8">
          <div 
            className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-3"
            style={{ 
              backgroundColor: colors.primary[50],
              color: colors.primary[500]
            }}
          >
            <FileText size={24} />
          </div>
          <p className="text-sm mb-4" style={{ color: styles.text.secondary }}>
            {searchQuery ? 'No quizzes found' : 'No quizzes created yet'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateNewQuiz}
              className="text-sm font-medium hover:underline"
              style={{ color: colors.primary[500] }}
            >
              Create your first quiz →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredQuizzes.map((quizItem) => {
            const isLoading = loadingQuizId === quizItem.id;
            
            return (
              <div
                key={quizItem.id}
                onClick={() => !isLoading && handleQuizClick(quizItem.id)}
                className={`group p-3 border rounded-lg cursor-pointer transition-all duration-150 hover:border-blue-300 hover:shadow-sm ${
                  isLoading ? 'opacity-70 cursor-wait' : ''
                }`}
                style={{ 
                  borderColor: isLoading ? colors.primary[300] : styles.border.light,
                  backgroundColor: styles.background.card
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.primary[50] }}
                      >
                        {isLoading ? (
                          <div 
                            className="w-4 h-4 border-2 rounded-full animate-spin"
                            style={{ 
                              borderColor: colors.primary[400],
                              borderTopColor: 'transparent'
                            }}
                          ></div>
                        ) : (
                          <FileText size={14} style={{ color: colors.primary[500] }} />
                        )}
                      </div>
                      <h3 className="font-medium text-sm truncate"
                        style={{ color: styles.text.primary }}
                      >
                        {quizItem.title}
                        {isLoading && (
                          <span className="ml-2 text-xs" style={{ color: colors.primary[500] }}>
                            Opening...
                          </span>
                        )}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs ml-8">
                      <span style={{ color: colors.primary[500] }}>
                        {quizItem.subject}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span style={{ color: styles.text.secondary }}>
                          {quizItem._count.questions} questions
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={12} style={{ color: styles.text.secondary }} />
                        <span style={{ color: styles.text.secondary }}>
                          {new Date(quizItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {isLoading ? (
                      <div 
                        className="w-4 h-4 border-2 rounded-full animate-spin"
                        style={{ 
                          borderColor: colors.primary[400],
                          borderTopColor: 'transparent'
                        }}
                      ></div>
                    ) : (
                      <span className="text-sm group-hover:translate-x-0.5 transition-transform"
                        style={{ color: colors.neutral[500] }}
                      >→</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}