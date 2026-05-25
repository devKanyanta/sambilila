'use client'

import { useState, useEffect } from 'react'
import { Plus, Sparkles, Upload, FileText, Trash2, RotateCw, X, ArrowLeft, ArrowRight, Check } from 'lucide-react'

interface CreateFormProps {
  title: string
  subject: string
  description: string
  inputText: string
  selectedFile: File | null
  loading: boolean
  error: string | null
  onTitleChange: (value: string) => void
  onSubjectChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onInputTextChange: (value: string) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: () => void
  onGenerate: () => void
  onCancel?: () => void
}

const CreateForm: React.FC<CreateFormProps> = ({
  title,
  subject,
  description,
  inputText,
  selectedFile,
  loading,
  error,
  onTitleChange,
  onSubjectChange,
  onDescriptionChange,
  onInputTextChange,
  onFileChange,
  onRemoveFile,
  onGenerate,
  onCancel
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isVerySmall, setIsVerySmall] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [shakeError, setShakeError] = useState(false)

  const totalSteps = 3

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setIsVerySmall(window.innerWidth < 480)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!title.trim()) { triggerErrorAnimation(); return }
    } else if (currentStep === 2) {
      if (!inputText.trim() && !selectedFile) { triggerErrorAnimation(); return }
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  }

  const handlePrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const triggerErrorAnimation = () => {
    setShakeError(true)
    setTimeout(() => setShakeError(false), 500)
  }

  const handleGenerateWithSteps = () => {
    if (!inputText.trim() && !selectedFile) {
      setCurrentStep(2)
      triggerErrorAnimation()
      return
    }
    onGenerate()
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf') {
        const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
        onFileChange(event)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-lg w-full max-w-md mx-auto min-h-[500px]">
      {/* Header */}
      <div className={isVerySmall ? "p-4 border-b border-neutral-200" : "p-5 border-b border-neutral-200"}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-primary-500 shadow-md`}>
              <Sparkles className={isVerySmall ? "w-4 h-4 text-white" : "w-5 h-5 text-white"} />
            </div>
            <div>
              <h2 className={isVerySmall ? "text-base font-heading font-semibold text-neutral-800" : "text-lg font-heading font-semibold text-neutral-800"}>
                {isVerySmall ? 'New Set' : 'Create New Set'}
              </h2>
              {!isVerySmall && <p className="text-xs text-neutral-500">Step {currentStep} of {totalSteps}</p>}
            </div>
          </div>
          {onCancel && (
            <button onClick={onCancel} className={`p-2 rounded-full hover:bg-neutral-100 transition-colors`} aria-label="Close">
              <X className={isVerySmall ? "w-4 h-4 text-neutral-500" : "w-5 h-5 text-neutral-500"} />
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`${isVerySmall ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"} rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-500'
                } ${currentStep === step ? 'ring-2 ring-primary-200' : ''}`}
              >
                {currentStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className={`${isVerySmall ? "p-4" : "p-5"} relative overflow-hidden`}>
        {/* Step 1: Set Details */}
        <div className={`transition-all duration-300 ${
          currentStep === 1 ? 'translate-x-0 opacity-100' : 'hidden'
        }`}>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className={`${isVerySmall ? "text-xs" : "text-sm"} font-medium text-neutral-700`}>
                Set Title <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full ${isVerySmall ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} rounded-xl border-2 bg-neutral-50 placeholder-neutral-400 outline-none transition-all text-neutral-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                  shakeError && !title.trim() ? 'border-secondary-400 animate-shake' : 'border-neutral-200'
                }`}
                placeholder="What's this set about?"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
              />
              {shakeError && !title.trim() && <p className="text-xs text-red-500">Please enter a title</p>}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <label className={`${isVerySmall ? "text-xs" : "text-sm"} font-medium text-neutral-700`}>Subject Area</label>
                <input
                  className={`w-full ${isVerySmall ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} rounded-xl border-2 border-neutral-200 bg-neutral-50 placeholder-neutral-400 outline-none transition-all text-neutral-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`}
                  placeholder="e.g., Biology"
                  value={subject}
                  onChange={(e) => onSubjectChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className={`${isVerySmall ? "text-xs" : "text-sm"} font-medium text-neutral-700`}>
                  Description <span className="text-xs text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  className={`w-full ${isVerySmall ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} rounded-xl border-2 border-neutral-200 bg-neutral-50 placeholder-neutral-400 outline-none transition-all text-neutral-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`}
                  placeholder="Brief description"
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Content */}
        <div className={`transition-all duration-300 ${
          currentStep === 2 ? 'translate-x-0 opacity-100' : 'hidden'
        }`}>
          <div className="space-y-3">
            <div>
              <h3 className={`${isVerySmall ? "text-base" : "text-lg"} font-heading font-semibold text-neutral-800 mb-1`}>Add Content</h3>
              {!isVerySmall && <p className="text-xs text-neutral-500 mb-3">Paste text or upload a PDF</p>}
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className={`${isVerySmall ? "text-xs" : "text-sm"} font-medium text-neutral-700`}>
                  Study Material <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full ${isVerySmall ? 'px-3 py-2 text-xs min-h-[120px]' : 'px-4 py-3 text-sm min-h-[140px]'} rounded-xl border-2 bg-neutral-50 placeholder-neutral-400 outline-none transition-all resize-none text-neutral-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    shakeError && !inputText.trim() && !selectedFile ? 'border-secondary-400' : 'border-neutral-200'
                  }`}
                  placeholder="Paste your notes, textbook content, or study material..."
                  value={inputText}
                  onChange={(e) => onInputTextChange(e.target.value)}
                />
                {shakeError && !inputText.trim() && !selectedFile && (
                  <p className="text-xs text-red-500">Please add content or upload a PDF</p>
                )}
              </div>

              <div className="relative">
                {!isVerySmall && (
                  <div className="flex items-center justify-center my-2">
                    <div className="h-px flex-1 bg-neutral-200" />
                    <span className="px-2 text-xs text-neutral-500">or</span>
                    <div className="h-px flex-1 bg-neutral-200" />
                  </div>
                )}

                <div className="space-y-2">
                  {!selectedFile ? (
                    <label className="block">
                      <input type="file" accept=".pdf,application/pdf" onChange={onFileChange} className="hidden" />
                      <div
                        className="border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center transition-all cursor-pointer hover:border-primary-400 active:scale-[0.98]"
                        onDragOver={handleDragOver}
                        onDrop={handleFileDrop}
                      >
                        <div className="p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center bg-primary-50">
                          <Upload className="w-4 h-4 text-primary-500" />
                        </div>
                        <p className="text-xs font-medium text-neutral-800 mb-0.5">
                          {isVerySmall ? 'Upload PDF' : 'Drop PDF or click to browse'}
                        </p>
                        {!isVerySmall && <p className="text-xs text-neutral-400">Max 10MB</p>}
                      </div>
                    </label>
                  ) : (
                    <div className="rounded-xl p-3 flex items-center justify-between bg-primary-50 border border-primary-200 transition-all">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1.5 rounded bg-primary-500">
                          <FileText className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-neutral-800 truncate">{selectedFile.name}</p>
                        </div>
                      </div>
                      <button onClick={onRemoveFile} className="p-1 hover:bg-red-100 rounded transition-colors ml-2">
                        <Trash2 className="w-3.5 h-3.5 text-secondary-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Review */}
        <div className={`transition-all duration-300 ${
          currentStep === 3 ? 'translate-x-0 opacity-100' : 'hidden'
        }`}>
          <div className="space-y-3">
            <div>
              <h3 className={`${isVerySmall ? "text-base" : "text-lg"} font-heading font-semibold text-neutral-800 mb-1`}>Review</h3>
              {!isVerySmall && <p className="text-xs text-neutral-500 mb-4">Confirm details and generate</p>}
            </div>

            <div className="space-y-3">
              <div className="bg-neutral-50 rounded-xl p-3 space-y-2 text-xs">
                <div>
                  <p className="font-medium text-neutral-500 mb-0.5">Title</p>
                  <p className="text-neutral-800">{title || <span className="italic text-neutral-400">Not provided</span>}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium text-neutral-500 mb-0.5">Subject</p>
                    <p className="text-neutral-800">{subject || <span className="italic text-neutral-400">Not specified</span>}</p>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-500 mb-0.5">Content</p>
                    <p className="text-neutral-800">{selectedFile ? 'PDF' : inputText.trim() ? 'Text' : 'None'}</p>
                  </div>
                </div>
                {inputText.trim() && !isVerySmall && (
                  <div>
                    <p className="font-medium text-neutral-500 mb-0.5">Preview</p>
                    <div className="max-h-20 overflow-y-auto p-2 rounded bg-white">
                      <p className="text-neutral-600 line-clamp-2 text-xs">
                        {inputText.trim().substring(0, 150)}{inputText.trim().length > 150 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {!isVerySmall && (
                <div className="bg-primary-50 p-3 rounded-xl">
                  <p className="text-xs font-medium flex items-center gap-1 text-primary-800">
                    <Sparkles className="w-3 h-3" />
                    AI will analyze and create flashcards
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`rounded-xl p-3 mt-3 text-xs bg-secondary-50 border border-secondary-200 ${shakeError ? 'animate-shake' : ''}`}>
            <p className="font-medium text-secondary-700">{error}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className={`${isVerySmall ? "p-4" : "p-5"} border-t border-neutral-200`}>
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className={`flex items-center gap-1 ${isVerySmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-xl font-medium transition-all bg-neutral-100 text-neutral-500 hover:bg-neutral-200 active:scale-95`}
              >
                <ArrowLeft className={isVerySmall ? "w-3 h-3" : "w-4 h-4"} />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCancel && currentStep === 1 && !isVerySmall && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded-xl font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 active:scale-95 transition-all"
              >
                Cancel
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNextStep}
                className={`flex items-center gap-1 ${isVerySmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-xl font-medium transition-all bg-primary-500 text-white hover:shadow-md active:scale-95`}
              >
                Continue
                <ArrowRight className={isVerySmall ? "w-3 h-3" : "w-4 h-4"} />
              </button>
            ) : (
              <button
                onClick={handleGenerateWithSteps}
                disabled={loading || (!inputText.trim() && !selectedFile)}
                className={`flex items-center gap-1 ${isVerySmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-xl font-medium transition-all bg-primary-500 text-white hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <RotateCw className={`${isVerySmall ? "w-3 h-3" : "w-4 h-4"} animate-spin`} />
                    {isVerySmall ? 'Processing...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className={isVerySmall ? "w-3 h-3" : "w-4 h-4"} />
                    {isVerySmall ? 'Generate' : 'Generate Flashcards'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateForm
