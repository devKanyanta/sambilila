'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Upload, FileText, Trash2, RotateCw, X, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import Card from '@/app/dashboard/components/Card'

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
  const [currentStep, setCurrentStep] = useState(1)
  const [shakeError, setShakeError] = useState(false)

  const totalSteps = 3

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
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
    <Card className="w-full max-w-lg mx-auto min-h-[500px] overflow-hidden border-0">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50">
              <Sparkles className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-medium text-neutral-900">
                {isMobile ? 'New Set' : 'Create New Set'}
              </h2>
              {!isMobile && <p className="text-xs text-neutral-400 mt-0.5">Step {currentStep} of {totalSteps}</p>}
            </div>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors" aria-label="Close">
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          )}
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

      {/* Form Content */}
      <div className="p-5 sm:p-6 relative overflow-hidden">
        {/* Step 1: Set Details */}
        <div className={`transition-all duration-300 ${
          currentStep === 1 ? 'block' : 'hidden'
        }`}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Set Title <span className="text-red-400">*</span>
              </label>
              <input
                className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-neutral-50 placeholder-neutral-400 outline-none transition-all text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                  shakeError && !title.trim() ? 'border-red-300 animate-shake' : 'border-neutral-200'
                }`}
                placeholder="What's this set about?"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
              />
              {shakeError && !title.trim() && <p className="text-xs text-red-400">Please enter a title</p>}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">Subject Area</label>
                <input
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 placeholder-neutral-400 outline-none transition-all text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="e.g., Biology"
                  value={subject}
                  onChange={(e) => onSubjectChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Description <span className="text-xs text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 placeholder-neutral-400 outline-none transition-all text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
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
          currentStep === 2 ? 'block' : 'hidden'
        }`}>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-heading font-medium text-neutral-900 mb-0.5">Add Content</h3>
              {!isMobile && <p className="text-xs text-neutral-400">Paste text or upload a PDF</p>}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Study Material <span className="text-red-400">*</span>
                </label>
                <textarea
                  className={`w-full px-4 py-3 text-sm min-h-[140px] rounded-xl border bg-neutral-50 placeholder-neutral-400 outline-none transition-all resize-none text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
                    shakeError && !inputText.trim() && !selectedFile ? 'border-red-300' : 'border-neutral-200'
                  }`}
                  placeholder="Paste your notes, textbook content, or study material..."
                  value={inputText}
                  onChange={(e) => onInputTextChange(e.target.value)}
                />
                {shakeError && !inputText.trim() && !selectedFile && (
                  <p className="text-xs text-red-400">Please add content or upload a PDF</p>
                )}
              </div>

              <div className="relative">
                {!isMobile && (
                  <div className="flex items-center justify-center my-3">
                    <div className="h-px flex-1 bg-neutral-100" />
                    <span className="px-3 text-xs text-neutral-400">or</span>
                    <div className="h-px flex-1 bg-neutral-100" />
                  </div>
                )}

                <div className="space-y-2">
                  {!selectedFile ? (
                    <label className="block">
                      <input type="file" accept=".pdf,application/pdf" onChange={onFileChange} className="hidden" />
                      <div
                        className="border-2 border-dashed border-neutral-200 rounded-xl p-5 text-center transition-all cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 active:scale-[0.98]"
                        onDragOver={handleDragOver}
                        onDrop={handleFileDrop}
                      >
                        <div className="p-3 rounded-full mx-auto mb-3 w-12 h-12 flex items-center justify-center bg-neutral-50">
                          <Upload className="w-5 h-5 text-neutral-400" />
                        </div>
                        <p className="text-sm font-medium text-neutral-700 mb-0.5">
                          Upload PDF
                        </p>
                        <p className="text-xs text-neutral-400">Drop file or click to browse</p>
                      </div>
                    </label>
                  ) : (
                    <div className="rounded-xl p-3 flex items-center justify-between bg-neutral-50 border border-neutral-200 transition-all">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-primary-100">
                          <FileText className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-900 truncate">{selectedFile.name}</p>
                          <p className="text-xs text-neutral-400">PDF ready</p>
                        </div>
                      </div>
                      <button onClick={onRemoveFile} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors ml-2">
                        <Trash2 className="w-4 h-4 text-red-400" />
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
          currentStep === 3 ? 'block' : 'hidden'
        }`}>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-heading font-medium text-neutral-900 mb-0.5">Review &amp; Generate</h3>
              <p className="text-xs text-neutral-400">Confirm your details below</p>
            </div>

            <div className="space-y-3">
              <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-neutral-400 mb-0.5">Title</p>
                    <p className="text-sm text-neutral-900">{title || <span className="italic text-neutral-400">Not provided</span>}</p>
                  </div>
                  <button onClick={() => setCurrentStep(1)} className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
                    Edit
                  </button>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs font-medium text-neutral-400 mb-0.5">Subject</p>
                    <p className="text-sm text-neutral-900">{subject || <span className="italic text-neutral-400">Not specified</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-400 mb-0.5">Content</p>
                    <p className="text-sm text-neutral-900">{selectedFile ? 'PDF file' : inputText.trim() ? 'Text' : 'None'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50/50 rounded-xl p-4 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary-100 mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-800">AI-powered generation</p>
                  <p className="text-xs text-primary-600/70 mt-0.5">Your content will be analyzed to create smart flashcards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`rounded-xl p-3 mt-4 text-sm bg-red-50 border border-red-100 ${shakeError ? 'animate-shake' : ''}`}>
            <p className="font-medium text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="p-5 sm:p-6 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl font-medium transition-all bg-neutral-100 text-neutral-600 hover:bg-neutral-200 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < totalSteps ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-5 py-2 text-sm rounded-xl font-medium transition-all bg-primary-500 text-white hover:bg-primary-600 hover:shadow-sm active:scale-95"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerateWithSteps}
                disabled={loading || (!inputText.trim() && !selectedFile)}
                className="flex items-center gap-1.5 px-5 py-2 text-sm rounded-xl font-medium transition-all bg-primary-500 text-white hover:bg-primary-600 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CreateForm
