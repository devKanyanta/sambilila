'use client'

import { X, Upload, FileText } from 'lucide-react';
import { useState } from 'react';
import { QUIZ_SETTINGS, getThemeStyles, colors } from './constants';

interface QuizFormModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  inputText: string;
  pdfFile: File | null;
  numberOfQuestions: number;
  difficulty: string;
  questionTypes: string;
  isGenerating: boolean;
  error: string;
  onTitleChange: (title: string) => void;
  onInputTextChange: (text: string) => void;
  onPdfFileChange: (file: File | null) => void;
  onNumberOfQuestionsChange: (count: number) => void;
  onDifficultyChange: (difficulty: string) => void;
  onQuestionTypesChange: (types: string) => void;
  onGenerateQuiz: () => void;
  onClearAll: () => void;
}

export default function QuizFormModal({
  show,
  onClose,
  title,
  inputText,
  pdfFile,
  numberOfQuestions,
  difficulty,
  questionTypes,
  isGenerating,
  error,
  onTitleChange,
  onInputTextChange,
  onPdfFileChange,
  onNumberOfQuestionsChange,
  onDifficultyChange,
  onQuestionTypesChange,
  onGenerateQuiz,
  onClearAll
}: QuizFormModalProps) {
  const styles = getThemeStyles();
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');

  if (!show) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onPdfFileChange(file);
    } else {
      onPdfFileChange(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div 
        className="w-full max-w-2xl border rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ 
          backgroundColor: styles.background.card,
          borderColor: styles.border.light,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: styles.border.light }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: styles.text.primary }}>
              Create New Quiz
            </h2>
            <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
              Generate quiz from text or PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ backgroundColor: 'transparent' }}
          >
            <X size={20} style={{ color: styles.text.secondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Title Input Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: styles.text.primary }}>
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter a title for your quiz"
              className="w-full p-4 border rounded-xl focus:ring-2 transition-all duration-150 text-sm"
              style={{ 
                backgroundColor: colors.neutral[50],
                borderColor: title ? styles.border.medium : colors.secondary[400],
                color: styles.text.primary,
                outline: 'none'
              }}
              required
            />
            {!title && (
              <p className="text-xs mt-1" style={{ color: colors.secondary[600] }}>
                Title is required
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: colors.secondary[50],
                color: colors.secondary[700]
              }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-2">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"
                    style={{ color: colors.secondary[500] }}
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Input Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setActiveTab('text');
                onPdfFileChange(null);
              }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center space-x-2 ${
                activeTab === 'text' 
                  ? 'border' 
                  : 'text-gray-600'
              }`}
              style={activeTab === 'text' ? 
                { 
                  backgroundColor: colors.primary[50],
                  borderColor: colors.primary[400],
                  color: colors.primary[600]
                } :
                { 
                  backgroundColor: colors.neutral[100],
                  color: styles.text.secondary,
                  border: '1px solid transparent'
                }
              }
            >
              <FileText size={16} />
              <span>Text Input</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('pdf');
                document.getElementById('pdf-upload')?.click();
              }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center space-x-2 ${
                activeTab === 'pdf' 
                  ? 'border' 
                  : 'text-gray-600'
              }`}
              style={activeTab === 'pdf' ? 
                { 
                  backgroundColor: colors.primary[50],
                  borderColor: colors.primary[400],
                  color: colors.primary[600]
                } :
                { 
                  backgroundColor: colors.neutral[100],
                  color: styles.text.secondary,
                  border: '1px solid transparent'
                }
              }
            >
              <Upload size={16} />
              <span>Upload PDF</span>
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
          {activeTab === 'text' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: styles.text.primary }}>
                Study Material
              </label>
              <textarea
                value={inputText}
                onChange={(e) => onInputTextChange(e.target.value)}
                placeholder="Paste text, notes, or enter topic..."
                className="w-full h-48 p-4 border rounded-xl resize-none focus:ring-2 transition-all duration-150 text-sm"
                style={{ 
                  backgroundColor: colors.neutral[50],
                  borderColor: styles.border.medium,
                  color: styles.text.primary
                }}
              />
            </div>
          ) : pdfFile ? (
            <div 
              className="mb-6 border rounded-xl p-4"
              style={{ 
                borderColor: colors.primary[300],
                backgroundColor: colors.primary[50]
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: styles.background.card }}
                  >
                    <FileText size={20} style={{ color: colors.primary[400] }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: styles.text.primary }}>
                      {pdfFile.name}
                    </p>
                    <p className="text-sm" style={{ color: styles.text.secondary }}>
                      {(pdfFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onPdfFileChange(null)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <span className="text-sm font-medium" style={{ color: colors.secondary[600] }}>
                    Remove
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="mb-6 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 transition-colors"
              style={{ 
                borderColor: styles.border.medium,
                backgroundColor: colors.neutral[50]
              }}
              onClick={() => document.getElementById('pdf-upload')?.click()}
            >
              <Upload size={32} className="mx-auto mb-3" style={{ color: styles.text.secondary }} />
              <p className="text-sm" style={{ color: styles.text.primary }}>
                Click to upload PDF file
              </p>
              <p className="text-xs mt-1" style={{ color: styles.text.secondary }}>
                Supports PDF files up to 10MB
              </p>
            </div>
          )}

          {/* Quiz Settings */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: styles.text.primary }}>
                Questions: <span className="font-bold ml-1" style={{ color: colors.primary[400] }}>
                  {numberOfQuestions}
                </span>
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
                  '--thumb-bg': colors.primary[500]
                } as React.CSSProperties}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: styles.text.secondary }}>
                <span>{QUIZ_SETTINGS.MIN_QUESTIONS}</span>
                <span>{QUIZ_SETTINGS.MAX_QUESTIONS}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: styles.text.primary }}>
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {QUIZ_SETTINGS.DIFFICULTY_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => onDifficultyChange(level)}
                    className={`py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                      difficulty === level
                        ? 'text-white shadow-sm'
                        : 'hover:bg-gray-200'
                    }`}
                    style={difficulty === level ? 
                      { 
                        backgroundColor: colors.primary[500]
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
              <label className="block text-sm font-medium mb-2" style={{ color: styles.text.primary }}>
                Question Types
              </label>
              <div className="grid grid-cols-3 gap-3">
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
                    <div className={`p-4 rounded-lg text-center cursor-pointer transition-all duration-150 border ${
                      questionTypes.includes(type.value)
                        ? 'border-blue-500 shadow-sm'
                        : 'border-gray-200'
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
                      <div className="text-lg mb-2">{type.icon}</div>
                      <span className="text-sm" style={{ color: styles.text.primary }}>
                        {type.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center"
          style={{ borderColor: styles.border.light }}
        >
          <button
            onClick={onClearAll}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
            style={{ 
              color: styles.text.secondary,
              backgroundColor: colors.neutral[100]
            }}
          >
            Clear
          </button>
          <div className="flex gap-8">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ 
                color: styles.text.secondary,
                backgroundColor: colors.neutral[100]
              }}
            >
              Cancel
            </button>
            <button
              onClick={onGenerateQuiz}
              disabled={(!title.trim() || (!inputText.trim() && !pdfFile)) || isGenerating}
              className="px-6 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-medium text-sm flex items-center space-x-2 shadow-sm"
              style={{ 
                backgroundColor: colors.primary[500]
              }}
            >
              {isGenerating ? (
                <>
                  <div 
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ 
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderTopColor: 'white'
                    }}
                  ></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}