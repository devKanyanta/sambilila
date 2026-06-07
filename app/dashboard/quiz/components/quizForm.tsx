'use client'

import { motion, AnimatePresence } from 'framer-motion';
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

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function QuizFormModal({
  show, onClose, title, inputText, pdfFile, numberOfQuestions, maxQuestions, difficulty,
  questionTypes, isGenerating, error, onTitleChange, onInputTextChange,
  onPdfFileChange, onNumberOfQuestionsChange, onDifficultyChange,
  onQuestionTypesChange, onGenerateQuiz
}: QuizFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [stepDir, setStepDir] = useState(1);

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

  const goNext = () => {
    setStepDir(1);
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
  };

  const goBack = () => {
    setStepDir(-1);
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        className="w-full max-w-xl bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
      >
        {/* Header with steps */}
        <div className="p-5 sm:p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -30, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="p-2.5 rounded-xl bg-primary-50"
              >
                <Sparkles className="w-5 h-5 text-primary-500" />
              </motion.div>
              <div>
                <h2 className="text-lg font-heading font-medium text-neutral-900">Create New Quiz</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-neutral-400" />
            </motion.button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between px-2">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className="flex flex-col items-center"
                animate={currentStep === step ? { scale: 1.05 } : { scale: 1 }}
              >
                <motion.div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                    currentStep >= step
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                  animate={currentStep === step ? {
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                  } : currentStep > step ? {
                    scale: [1, 1.15, 1],
                  } : {}}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <AnimatePresence mode="wait" custom={stepDir}>
            <motion.div
              key={currentStep}
              custom={stepDir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              className="space-y-5"
            >
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
                      autoFocus
                    />
                    <div className="flex justify-between text-xs">
                      {!title && <span className="text-neutral-400">Title is required</span>}
                      {title && <span className="text-success-600">Looks good!</span>}
                      <span className="text-neutral-400">{title.length}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Content */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-heading font-medium text-neutral-900">Add Content</h3>

                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => { setActiveTab('text'); onPdfFileChange(null); }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'text'
                          ? 'bg-primary-50 border border-primary-200 text-primary-600 shadow-sm'
                          : 'bg-neutral-50 border border-neutral-200 text-neutral-500 hover:border-neutral-300'
                      }`}
                    >
                      <FileText size={16} className="inline mr-1.5" />Text
                    </motion.button>
                    <motion.button
                      onClick={() => { setActiveTab('pdf'); document.getElementById('quiz-pdf-upload')?.click(); }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'pdf'
                          ? 'bg-primary-50 border border-primary-200 text-primary-600 shadow-sm'
                          : 'bg-neutral-50 border border-neutral-200 text-neutral-500 hover:border-neutral-300'
                      }`}
                    >
                      <Upload size={16} className="inline mr-1.5" />PDF
                    </motion.button>
                  </div>

                  <input id="quiz-pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />

                  <AnimatePresence mode="wait">
                    {activeTab === 'text' ? (
                      <motion.div
                        key="text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-1.5"
                      >
                        <label className="text-sm font-medium text-neutral-700">Study Material</label>
                        <textarea
                          value={inputText}
                          onChange={(e) => onInputTextChange(e.target.value)}
                          placeholder="Paste text, notes, or enter topic..."
                          className="w-full h-44 p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 outline-none transition-all resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder-neutral-400"
                        />
                      </motion.div>
                    ) : pdfFile ? (
                      <motion.div
                        key="file"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border border-primary-200 bg-primary-50/50 rounded-xl p-4"
                      >
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
                          <motion.button
                            onClick={() => onPdfFileChange(null)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Remove
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-2 border-dashed border-neutral-200 bg-neutral-50 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                        onClick={() => document.getElementById('quiz-pdf-upload')?.click()}
                      >
                        <Upload size={28} className="mx-auto mb-3 text-neutral-300" />
                        <p className="text-sm text-neutral-700">Click to upload PDF</p>
                        <p className="text-xs mt-1 text-neutral-400">Supports PDF files up to 10MB</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Step 3: Settings */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <h3 className="text-base font-heading font-medium text-neutral-900">Quiz Settings</h3>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">
                      Number of Questions: <motion.span
                        key={numberOfQuestions}
                        initial={{ scale: 1.3, color: '#2d6b4d' }}
                        animate={{ scale: 1, color: '#2d6b4d' }}
                        className="ml-1 font-semibold"
                      >{numberOfQuestions}</motion.span>
                    </label>
                    <input
                      type="range"
                      min={QUIZ_SETTINGS.MIN_QUESTIONS}
                      max={maxQuestions}
                      value={numberOfQuestions}
                      onChange={(e) => onNumberOfQuestionsChange(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
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
                        <motion.button
                          key={level}
                          onClick={() => onDifficultyChange(level)}
                          whileTap={{ scale: 0.95 }}
                          className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                            difficulty === level
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </motion.button>
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
                        const isSelected = questionTypes.includes(type.value);
                        return (
                          <motion.label
                            key={type.value}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
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
                              isSelected
                                ? 'border-primary-200 bg-primary-50 shadow-sm'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}>
                              <div className="mb-1 flex justify-center">
                                {typeIcons[type.icon]}
                              </div>
                              <span className="text-xs text-neutral-700">{type.label}</span>
                            </div>
                          </motion.label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2"
            >
              <span className="text-sm text-red-600">{error}</span>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-neutral-100 flex items-center justify-between">
          <motion.button
            onClick={currentStep > 1 ? goBack : onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl font-medium transition-all bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          >
            {currentStep > 1 ? <><ArrowLeft className="w-4 h-4" /> Back</> : 'Cancel'}
          </motion.button>

          {currentStep < totalSteps ? (
            <motion.button
              onClick={goNext}
              disabled={(currentStep === 1 && !title.trim()) || (currentStep === 2 && !inputText.trim() && !pdfFile)}
              whileHover={((currentStep === 1 && title.trim()) || (currentStep === 2 && (inputText.trim() || pdfFile))) ? { scale: 1.02 } : undefined}
              whileTap={((currentStep === 1 && title.trim()) || (currentStep === 2 && (inputText.trim() || pdfFile))) ? { scale: 0.97 } : undefined}
              className="flex items-center gap-1.5 px-5 py-2 text-sm rounded-xl font-medium transition-all bg-primary-500 text-white hover:bg-primary-600 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={onGenerateQuiz}
              disabled={isGenerating}
              whileHover={!isGenerating ? { scale: 1.02 } : undefined}
              whileTap={!isGenerating ? { scale: 0.97 } : undefined}
              className="flex items-center gap-1.5 px-5 py-2 text-sm rounded-xl font-medium transition-all bg-primary-500 text-white hover:bg-primary-600 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Create Quiz</>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
