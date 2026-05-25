'use client'

import { X, Upload, FileText } from 'lucide-react';
import { useState } from 'react';
import { QUIZ_SETTINGS } from './constants';

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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-neutral-800">Create New Quiz</h2>
            <p className="text-sm mt-1 text-neutral-500">Generate quiz from text or PDF</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter a title for your quiz"
              className={`w-full p-4 rounded-xl border-2 outline-none transition-all duration-150 text-sm bg-neutral-50 ${
                title
                  ? 'border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  : 'border-secondary-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20'
              } text-neutral-800 placeholder-neutral-400`}
              required
            />
            {!title && (
              <p className="text-xs mt-1 text-secondary-600">Title is required</p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-xl bg-secondary-50 border border-secondary-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-secondary-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-secondary-700">{error}</span>
            </div>
          )}

          {/* Input Method Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('text'); onPdfFileChange(null); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'text'
                  ? 'bg-primary-50 border-2 border-primary-400 text-primary-600'
                  : 'bg-neutral-100 text-neutral-500 border-2 border-transparent hover:bg-neutral-200'
              }`}
            >
              <FileText size={16} />
              <span>Text Input</span>
            </button>
            <button
              onClick={() => { setActiveTab('pdf'); document.getElementById('pdf-upload')?.click(); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pdf'
                  ? 'bg-primary-50 border-2 border-primary-400 text-primary-600'
                  : 'bg-neutral-100 text-neutral-500 border-2 border-transparent hover:bg-neutral-200'
              }`}
            >
              <Upload size={16} />
              <span>Upload PDF</span>
            </button>
          </div>

          <input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />

          {/* Content Input Area */}
          {activeTab === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Study Material</label>
              <textarea
                value={inputText}
                onChange={(e) => onInputTextChange(e.target.value)}
                placeholder="Paste text, notes, or enter topic..."
                className="w-full h-48 p-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-sm text-neutral-800 outline-none transition-all resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 placeholder-neutral-400"
              />
            </div>
          ) : pdfFile ? (
            <div className="border-2 border-primary-300 bg-primary-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                    <FileText size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-neutral-800">{pdfFile.name}</p>
                    <p className="text-sm text-neutral-500">{(pdfFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => onPdfFileChange(null)}
                  className="px-3 py-1.5 text-sm font-medium text-secondary-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-neutral-300 bg-neutral-50 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 transition-colors"
              onClick={() => document.getElementById('pdf-upload')?.click()}
            >
              <Upload size={32} className="mx-auto mb-3 text-neutral-400" />
              <p className="text-sm text-neutral-800">Click to upload PDF file</p>
              <p className="text-xs mt-1 text-neutral-500">Supports PDF files up to 10MB</p>
            </div>
          )}

          {/* Quiz Settings */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Questions: <span className="font-bold ml-1 text-primary-400">{numberOfQuestions}</span>
              </label>
              <input
                type="range"
                min={QUIZ_SETTINGS.MIN_QUESTIONS}
                max={QUIZ_SETTINGS.MAX_QUESTIONS}
                value={numberOfQuestions}
                onChange={(e) => onNumberOfQuestionsChange(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs mt-1 text-neutral-500">
                <span>{QUIZ_SETTINGS.MIN_QUESTIONS}</span>
                <span>{QUIZ_SETTINGS.MAX_QUESTIONS}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {QUIZ_SETTINGS.DIFFICULTY_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => onDifficultyChange(level)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      difficulty === level
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Question Types</label>
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
                    <div className={`p-4 rounded-xl text-center cursor-pointer transition-all border-2 ${
                      questionTypes.includes(type.value)
                        ? 'border-primary-400 bg-primary-50 shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}>
                      <div className="text-lg mb-2">{type.icon}</div>
                      <span className="text-sm text-neutral-800">{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={onClearAll}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            Clear
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onGenerateQuiz}
              disabled={(!title.trim() || (!inputText.trim() && !pdfFile)) || isGenerating}
              className="px-6 py-2.5 bg-primary-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
