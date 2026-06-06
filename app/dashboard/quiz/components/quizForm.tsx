'use client'

import { X, Upload, FileText, Sparkles, ArrowLeft, ArrowRight, Check, List, CheckCheck, PenLine } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QUIZ_SETTINGS } from './constants';

interface QuizFormModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  inputText: string;
  pdfFile: File | null;
  numberOfQuestions: number;
  maxQuestions: number;
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
}

export default function QuizFormModal({
  show, onClose, title, inputText, pdfFile, numberOfQuestions, maxQuestions, difficulty,
  questionTypes, isGenerating, error, onTitleChange, onInputTextChange,
  onPdfFileChange, onNumberOfQuestionsChange, onDifficultyChange,
  onQuestionTypesChange, onGenerateQuiz
}: QuizFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');

  useEffect(() => { setCurrentStep(1); }, [show]);

  if (!show) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onPdfFileChange(file);
    } else {
      onPdfFileChange(null);
    }
  };

  const totalSteps = 3;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header with steps */}
        <div className="p-5 sm:p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-50">
                <Sparkles className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-medium text-neutral-900">Create New Quiz</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
              <X size={20} className="text-neutral-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between px-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-400'
                  } ${currentStep === step ? 'ring-2 ring-primary-100' : ''}`}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Step 1: Title */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Quiz Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Enter a title for your quiz"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 placeholder-neutral-400 outline-none transition-all text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  required
                />
                {!title && <p className="text-xs text-neutral-400">Title is required</p>}
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-heading font-medium text-neutral-900">Add Content</h3>

              <div className="flex gap-2">
                <button
                  onClick={() => { setActiveTab('text'); onPdfFileChange(null); }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'text'
                      ? 'bg-primary-50 border border-primary-200 text-primary-600'
                      : 'bg-neutral-50 border border-neutral-200 text-neutral-500 hover:border-neutral-300'
                  }`}
                >
                  <FileText size={16} className="inline mr-1.5" />Text
                </button>
                <button
                  onClick={() => { setActiveTab('pdf'); document.getElementById('quiz-pdf-upload')?.click(); }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'pdf'
                      ? 'bg-primary-50 border border-primary-200 text-primary-600'
                      : 'bg-neutral-50 border border-neutral-200 text-neutral-500 hover:border-neutral-300'
                  }`}
                >
                  <Upload size={16} className="inline mr-1.5" />PDF
                </button>
              </div>

              <input id="quiz-pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />

              {activeTab === 'text' ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Study Material</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => onInputTextChange(e.target.value)}
                    placeholder="Paste text, notes, or enter topic..."
                    className="w-full h-44 p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 outline-none transition-all resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder-neutral-400"
                  />
                </div>
              ) : pdfFile ? (
                <div className="border border-primary-200 bg-primary-50/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-primary-100">
                        <FileText size={20} className="text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{pdfFile.name}</p>
                        <p className="text-xs text-neutral-400">{(pdfFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button onClick={() => onPdfFileChange(null)} className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-neutral-200 bg-neutral-50 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                  onClick={() => document.getElementById('quiz-pdf-upload')?.click()}
                >
                  <Upload size={28} className="mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm text-neutral-700">Click to upload PDF</p>
                  <p className="text-xs mt-1 text-neutral-400">Supports PDF files up to 10MB</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h3 className="text-base font-heading font-medium text-neutral-900">Quiz Settings</h3>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">Number of Questions: <span className="text-primary-500 ml-1">{numberOfQuestions}</span></label>
                <input
                  type="range"
                  min={QUIZ_SETTINGS.MIN_QUESTIONS}
                  max={maxQuestions}
                  value={numberOfQuestions}
                  onChange={(e) => onNumberOfQuestionsChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>{QUIZ_SETTINGS.MIN_QUESTIONS}</span>
                  <span>{maxQuestions}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUIZ_SETTINGS.DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => onDifficultyChange(level)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        difficulty === level
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">Question Types</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUIZ_SETTINGS.QUESTION_TYPES.map((type) => {
                    const typeIcons: Record<string, React.ReactNode> = {
                      'list': <List className="w-5 h-5 mx-auto mb-1" />,
                      'check': <CheckCheck className="w-5 h-5 mx-auto mb-1" />,
                      'pen': <PenLine className="w-5 h-5 mx-auto mb-1" />,
                    }
                    return (
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
                        <div className={`p-3 rounded-xl text-center cursor-pointer transition-all border ${
                          questionTypes.includes(type.value)
                            ? 'border-primary-200 bg-primary-50 shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}>
                          <div className="mb-1 flex justify-center">
                            {typeIcons[type.icon]}
                          </div>
                          <span className="text-xs text-neutral-700">{type.label}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2">
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-neutral-100 flex items-center justify-between">
          <button
            onClick={currentStep > 1 ? () => setCurrentStep(prev => prev - 1) : onClose}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl font-medium transition-all bg-neutral-100 text-neutral-600 hover:bg-neutral-200 active:scale-95"
          >
            {currentStep > 1 ? <><ArrowLeft className="w-4 h-4" /> Back</> : 'Cancel'}
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={() => {
                if (currentStep === 1 && !title.trim()) return;
                if (currentStep === 2 && !inputText.trim() && !pdfFile) return;
                setCurrentStep(prev => prev + 1);
              }}
              disabled={(currentStep === 1 && !title.trim()) || (currentStep === 2 && !inputText.trim() && !pdfFile)}
              className="flex items-center gap-1.5 px-5 py-2 text-sm rounded-xl font-medium transition-all bg-primary-500 text-white hover:bg-primary-600 hover:shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onGenerateQuiz}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-5 py-2 text-sm rounded-xl font-medium transition-all bg-primary-500 text-white hover:bg-primary-600 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Create Quiz</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
