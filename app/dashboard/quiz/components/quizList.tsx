'use client'

import { QuizListItem } from './types';
import { getThemeStyles, colors } from './constants';

interface QuizListProps {
  quizList: QuizListItem[];
  isLoadingQuizzes: boolean;
  onSelectQuiz: (quizId: string) => void;
  onRefreshQuizzes: () => void;
  onCreateNewQuiz: () => void;
}

export default function QuizList({
  quizList,
  isLoadingQuizzes,
  onSelectQuiz,
  onRefreshQuizzes,
  onCreateNewQuiz
}: QuizListProps) {
  const styles = getThemeStyles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: styles.text.primary }}>
            Your Quizzes
          </h2>
          <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
            Recently created quizzes
          </p>
        </div>
        <button
          onClick={onRefreshQuizzes}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          style={{ backgroundColor: 'transparent' }}
        >
          <span style={{ color: styles.text.secondary }}>↻</span>
        </button>
      </div>

      {isLoadingQuizzes ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div 
            className="w-8 h-8 border-3 rounded-full animate-spin mb-4"
            style={{ 
              borderColor: colors.primary[400],
              borderTopColor: 'transparent'
            }}
          ></div>
          <p className="text-sm" style={{ color: styles.text.secondary }}>Loading quizzes...</p>
        </div>
      ) : quizList.length === 0 ? (
        <div className="text-center py-12">
          <div 
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary[50] }}
          >
            <span className="text-2xl">📚</span>
          </div>
          <p style={{ color: styles.text.secondary }}>No quizzes yet. Create your first quiz!</p>
          <button
            onClick={onCreateNewQuiz}
            className="mt-4 px-4 py-2 text-sm font-medium"
            style={{ color: colors.primary[400] }}
          >
            Create Quiz →
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {quizList.map((quizItem) => (
            <div
              key={quizItem.id}
              onClick={() => onSelectQuiz(quizItem.id)}
              className="group p-4 border rounded-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
              style={{ 
                borderColor: styles.border.light,
                backgroundColor: 'transparent'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate transition-colors"
                    style={{ color: styles.text.primary }}
                  >
                    {quizItem.title}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: styles.text.secondary }}>
                    {quizItem._count.questions} questions • {quizItem._count.results} attempts
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: colors.primary[100],
                        color: colors.primary[700]
                      }}
                    >
                      {quizItem.subject}
                    </span>
                    <span className="text-xs" style={{ color: styles.text.light }}>
                      {new Date(quizItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className="transition-colors duration-200"
                    style={{ color: colors.neutral[500] }}
                  >→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}