'use client'

import { useState } from 'react';
import { QUIZ_SETTINGS, getThemeStyles, colors, gradients } from './constants';

interface QuizFormProps {
  inputText: string;
  pdfFile: File | null;
  numberOfQuestions: number;
  difficulty: string;
  questionTypes: string;
  isGenerating: boolean;
  error: string;
  onInputTextChange: (text: string) => void;
  onPdfFileChange: (file: File | null) => void;
  onNumberOfQuestionsChange: (count: number) => void;
  onDifficultyChange: (difficulty: string) => void;
  onQuestionTypesChange: (types: string) => void;
  onGenerateQuiz: () => void;
  onClearAll: () => void;
}

export default function QuizForm({
  inputText,
  pdfFile,
  numberOfQuestions,
  difficulty,
  questionTypes,
  isGenerating,
  error,
  onInputTextChange,
  onPdfFileChange,
  onNumberOfQuestionsChange,
  onDifficultyChange,
  onQuestionTypesChange,
  onGenerateQuiz,
  onClearAll
}: QuizFormProps) {
  const styles = getThemeStyles();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onPdfFileChange(file);
    } else {
      onPdfFileChange(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="mb-6 border-l-4 p-4 rounded-r-lg shadow-sm"
          style={{ 
            backgroundColor: colors.secondary[50],
            borderColor: colors.secondary[500]
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"
                style={{ color: colors.secondary[500] }}
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm" style={{ color: colors.secondary[700] }}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Method Selection */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => onPdfFileChange(null)}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            !pdfFile 
              ? 'border-2 text-blue-700' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={!pdfFile ? 
            { 
              backgroundColor: colors.primary[50],
              borderColor: colors.primary[400],
              color: colors.primary[600]
            } :
            { 
              backgroundColor: colors.neutral[100],
              color: styles.text.secondary,
              border: '2px solid transparent'
            }
          }
        >
          <span>📝</span>
          <span>Text Input</span>
        </button>
        <button
          onClick={() => document.getElementById('pdf-upload')?.click()}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            pdfFile 
              ? 'border-2 text-blue-700' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={pdfFile ? 
            { 
              backgroundColor: colors.primary[50],
              borderColor: colors.primary[400],
              color: colors.primary[600]
            } :
            { 
              backgroundColor: colors.neutral[100],
              color: styles.text.secondary,
              border: '2px solid transparent'
            }
          }
        >
          <span>📄</span>
          <span>PDF Upload</span>
        </button>
      </div>

      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Content Input Area */}
      {!pdfFile ? (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: styles.text.primary }}>
            Enter your study material
          </label>
          <textarea
            value={inputText}
            onChange={(e) => onInputTextChange(e.target.value)}
            placeholder="Paste your study material, textbook content, or enter a topic..."
            className="w-full h-40 p-4 border rounded-xl resize-none focus:ring-2 transition-all duration-200 text-sm"
            style={{ 
              backgroundColor: colors.neutral[50],
              borderColor: styles.border.medium,
              color: styles.text.primary,
              boxShadow: styles.shadow.sm
            }}
          />
        </div>
      ) : (
        <div 
          className="mb-6 border-2 border-dashed rounded-xl p-5"
          style={{ 
            borderColor: colors.primary[300],
            backgroundColor: colors.primary[50]
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
                style={{ backgroundColor: styles.background.card }}
              >
                <span className="text-2xl" style={{ color: colors.primary[400] }}>📄</span>
              </div>
              <div>
                <p className="font-medium truncate max-w-xs" style={{ color: styles.text.primary }}>
                  {pdfFile.name}
                </p>
                <p className="text-sm" style={{ color: styles.text.secondary }}>
                  {(pdfFile.size / 1024).toFixed(2)} KB • PDF Document
                </p>
              </div>
            </div>
            <button
              onClick={() => onPdfFileChange(null)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: 'transparent' }}
            >
              <span className="text-sm font-medium" style={{ color: colors.secondary[600] }}>
                Remove
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Quiz Settings */}
      <div className="space-y-6">
        <div className="rounded-xl p-4" style={{ backgroundColor: colors.neutral[50] }}>
          <label className="block text-sm font-medium mb-3" style={{ color: styles.text.primary }}>
            <div className="flex items-center justify-between">
              <span>
                Number of Questions: <span className="font-bold" style={{ color: colors.primary[400] }}>
                  {numberOfQuestions}
                </span>
              </span>
              <span className="text-xs" style={{ color: styles.text.secondary }}>
                {QUIZ_SETTINGS.MIN_QUESTIONS}-{QUIZ_SETTINGS.MAX_QUESTIONS} questions
              </span>
            </div>
          </label>
          <input
            type="range"
            min={QUIZ_SETTINGS.MIN_QUESTIONS}
            max={QUIZ_SETTINGS.MAX_QUESTIONS}
            value={numberOfQuestions}
            onChange={(e) => onNumberOfQuestionsChange(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full"
            style={{ 
              backgroundColor: colors.neutral[300],
              '--thumb-bg': gradients.primary
            } as React.CSSProperties}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: styles.text.primary }}>
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {QUIZ_SETTINGS.DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => onDifficultyChange(level)}
                className={`py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  difficulty === level
                    ? 'text-white shadow-md'
                    : 'hover:bg-gray-200'
                }`}
                style={difficulty === level ? 
                  { 
                    background: gradients.primary,
                    color: styles.text.inverted
                  } :
                  { 
                    backgroundColor: colors.neutral[100],
                    color: styles.text.secondary
                  }
                }
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: styles.text.primary }}>
            Question Types
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUIZ_SETTINGS.QUESTION_TYPES.map((type) => (
              <label key={type.value} className="relative">
                <input
                  type="checkbox"
                  checked={questionTypes.includes(type.value)}
                  onChange={(e) => {
                    const types = questionTypes.split(',').filter(t => t);
                    if (e.target.checked) {
                      onQuestionTypesChange([...types, type.value].join(','));
                    } else {
                      onQuestionTypesChange(types.filter(t => t !== type.value).join(','));
                    }
                  }}
                  className="sr-only"
                />
                <div className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-200 border-2 ${
                  questionTypes.includes(type.value)
                    ? 'border-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={questionTypes.includes(type.value) ? 
                  { 
                    borderColor: colors.primary[400],
                    backgroundColor: colors.primary[50]
                  } :
                  { 
                    borderColor: styles.border.medium,
                    backgroundColor: styles.background.card
                  }
                }>
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <span className="text-sm font-medium" style={{ color: styles.text.primary }}>
                    {type.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t"
        style={{ borderColor: styles.border.light }}
      >
        <button
          onClick={onClearAll}
          className="px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
          style={{ 
            color: styles.text.secondary,
            backgroundColor: 'transparent'
          }}
        >
          Clear All
        </button>
        <button
          onClick={onGenerateQuiz}
          disabled={(!inputText.trim() && !pdfFile) || isGenerating}
          className="px-6 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
          style={{ 
            background: gradients.primary,
            boxShadow: styles.shadow.sm
          }}
        >
          {isGenerating ? (
            <>
              <div 
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderTopColor: styles.text.inverted
                }}
              ></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Quiz</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}