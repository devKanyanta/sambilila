'use client'

import { useState, useEffect } from 'react'
import { Plus, Sparkles, Upload, FileText, Trash2, RotateCw, X, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { colors, gradients, theme } from '@/lib/theme'

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
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [shakeError, setShakeError] = useState(false)
  
  const totalSteps = 3
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const styles = {
    background: {
      card: theme.backgrounds.card,
      modal: 'rgba(255, 255, 255, 0.97)',
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      light: theme.text.light,
    },
    border: {
      medium: theme.borders.medium,
      light: theme.borders.light,
    },
    shadow: theme.shadows,
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!title.trim()) {
        triggerErrorAnimation()
        return
      }
    } else if (currentStep === 2) {
      // Validate step 2
      if (!inputText.trim() && !selectedFile) {
        triggerErrorAnimation()
        return
      }
    }
    
    setDirection('forward')
    setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  }

  const handlePrevStep = () => {
    setDirection('backward')
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const triggerErrorAnimation = () => {
    setShakeError(true)
    setTimeout(() => setShakeError(false), 500)
  }

  const handleGenerateWithSteps = () => {
    if (!inputText.trim() && !selectedFile) {
      setCurrentStep(2) // Go back to content step
      triggerErrorAnimation()
      return
    }
    onGenerate()
  }

  const steps = [
    { number: 1, title: 'Set Details', description: 'Basic information' },
    { number: 2, title: 'Content', description: 'Add your material' },
    { number: 3, title: 'Review', description: 'Confirm and generate' }
  ]

  const getStepIcon = (stepNumber: number) => {
    if (currentStep > stepNumber) return <Check className="w-4 h-4" />
    return stepNumber
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf') {
        const event = {
          target: { files: [file] }
        } as unknown as React.ChangeEvent<HTMLInputElement>
        onFileChange(event)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div 
      className="animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{ 
        backgroundColor: styles.background.modal,
        backdropFilter: 'blur(20px)',
        border: `1px solid rgba(255, 255, 255, 0.2)`,
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
        borderRadius: '1.5rem',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      {/* Glass effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
        }}
      />
      
      <div className="relative">
        {/* Header with Progress Bar */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full" 
                style={{ 
                  background: gradients.primary,
                  boxShadow: `0 0 20px ${colors.primary[200]}`
                }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: styles.text.primary }}>
                  Create New Set
                </h2>
                <p className="text-sm" style={{ color: styles.text.secondary }}>
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 active:scale-95"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  color: styles.text.secondary
                }}
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${index === steps.length - 1 ? '' : 'mb-2'}`}
                  style={{
                    backgroundColor: currentStep >= step.number ? colors.primary[500] : 'rgba(0, 0, 0, 0.05)',
                    color: currentStep >= step.number ? 'white' : styles.text.secondary,
                    border: currentStep === step.number ? `2px solid ${colors.primary[300]}` : 'none',
                    boxShadow: currentStep === step.number ? `0 0 0 4px ${colors.primary[100]}` : 'none',
                  }}
                >
                  {getStepIcon(step.number)}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className="absolute top-5 left-12 w-16 h-0.5 z-0"
                    style={{ 
                      backgroundColor: currentStep > step.number ? colors.primary[500] : 'rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                )}
                {!isMobile && (
                  <div className={`text-center mt-2 ${currentStep === step.number ? 'block' : 'hidden sm:block'}`}>
                    <p className="text-xs font-medium" style={{ color: styles.text.primary }}>
                      {step.title}
                    </p>
                    <p className="text-xs" style={{ color: styles.text.light }}>
                      {step.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content with Step Transitions */}
        <div className="p-6 relative overflow-hidden">
          {/* Step 1: Set Details */}
          <div 
            className={`transition-all duration-300 ease-out ${
              currentStep === 1 
                ? 'translate-x-0 opacity-100' 
                : currentStep > 1 
                  ? '-translate-x-full opacity-0 absolute inset-0' 
                  : 'translate-x-full opacity-0 absolute inset-0'
            }`}
            style={{ padding: currentStep === 1 ? undefined : '0 24px' }}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: styles.text.primary }}>
                  Set Details
                </h3>
                <p className="text-sm mb-4" style={{ color: styles.text.secondary }}>
                  Start by giving your flashcard set a title and some basic information
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: styles.text.primary }}>
                    Set Title
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 text-sm md:text-base ${
                      shakeError && !title.trim() ? 'animate-shake' : ''
                    }`}
                    style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      border: `1px solid ${shakeError && !title.trim() ? colors.secondary[400] : styles.border.light}`,
                      color: styles.text.primary,
                      boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.05)`
                    }}
                    placeholder="What's this set about?"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
                  />
                  {shakeError && !title.trim() && (
                    <p className="text-xs text-red-500 animate-in fade-in">Please enter a title for your set</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: styles.text.primary }}>
                      Subject Area
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 text-sm md:text-base"
                      style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${styles.border.light}`,
                        color: styles.text.primary,
                        boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.05)`
                      }}
                      placeholder="e.g., Biology, Programming"
                      value={subject}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSubjectChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: styles.text.primary }}>
                      Description
                      <span className="text-xs font-normal ml-1" style={{ color: styles.text.light }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 text-sm md:text-base"
                      style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${styles.border.light}`,
                        color: styles.text.primary,
                        boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.05)`
                      }}
                      placeholder="Brief description"
                      value={description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDescriptionChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl mt-6">
                  <p className="text-sm font-medium flex items-center gap-2" style={{ color: colors.primary[800] }}>
                    <Sparkles className="w-4 h-4" />
                    Tip: Be specific with your title for better organization
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Content */}
          <div 
            className={`transition-all duration-300 ease-out ${
              currentStep === 2 
                ? 'translate-x-0 opacity-100' 
                : currentStep > 2 
                  ? '-translate-x-full opacity-0 absolute inset-0' 
                  : currentStep < 2 
                    ? 'translate-x-full opacity-0 absolute inset-0'
                    : ''
            }`}
            style={{ padding: currentStep === 2 ? undefined : '0 24px' }}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: styles.text.primary }}>
                  Add Your Content
                </h3>
                <p className="text-sm mb-4" style={{ color: styles.text.secondary }}>
                  Paste your text or upload a PDF. Our AI will analyze and create flashcards.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1" style={{ color: styles.text.primary }}>
                    Study Material
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full px-4 py-3 rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 resize-none text-sm md:text-base min-h-[160px] ${
                      shakeError && !inputText.trim() && !selectedFile ? 'animate-shake' : ''
                    }`}
                    style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      border: `1px solid ${
                        shakeError && !inputText.trim() && !selectedFile 
                          ? colors.secondary[400] 
                          : styles.border.light
                      }`,
                      color: styles.text.primary,
                      boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.05)`
                    }}
                    placeholder="Paste your notes, textbook content, or any study material here..."
                    value={inputText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputTextChange(e.target.value)}
                  />
                  {shakeError && !inputText.trim() && !selectedFile && (
                    <p className="text-xs text-red-500 animate-in fade-in">
                      Please add some content or upload a PDF
                    </p>
                  )}
                </div>

                <div className="relative">
                  <div className="flex items-center justify-center my-4">
                    <div className="h-px flex-1" style={{ backgroundColor: styles.border.light }} />
                    <span className="px-3 text-sm" style={{ color: styles.text.secondary }}>or</span>
                    <div className="h-px flex-1" style={{ backgroundColor: styles.border.light }} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium block" style={{ color: styles.text.primary }}>
                      Upload PDF
                    </label>
                    
                    {!selectedFile ? (
                      <label className="block">
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={onFileChange}
                          className="hidden"
                        />
                        <div 
                          className="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-primary-400 active:scale-[0.98] group"
                          style={{ 
                            borderColor: styles.border.light,
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.primary[400]
                            e.currentTarget.style.backgroundColor = colors.primary[50]
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = styles.border.light
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          onDragOver={handleDragOver}
                          onDrop={handleFileDrop}
                        >
                          <div className="p-3 rounded-full mx-auto mb-3 w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: colors.primary[50] }}>
                            <Upload className="w-6 h-6" style={{ color: colors.primary[500] }} />
                          </div>
                          <p className="text-sm font-medium mb-1" style={{ color: styles.text.primary }}>
                            Drop PDF here or click to browse
                          </p>
                          <p className="text-xs" style={{ color: styles.text.light }}>
                            Maximum file size: 10MB
                          </p>
                        </div>
                      </label>
                    ) : (
                      <div 
                        className="rounded-xl p-4 flex items-center justify-between transition-all duration-200 animate-in fade-in"
                        style={{ 
                          backgroundColor: colors.primary[50],
                          border: `1px solid ${colors.primary[200]}`,
                          boxShadow: `0 2px 8px ${colors.primary[100]}`
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: colors.primary[500] }}>
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate" style={{ color: styles.text.primary }}>
                              {selectedFile.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs" style={{ color: styles.text.secondary }}>
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: styles.text.light }} />
                              <p className="text-xs" style={{ color: styles.text.secondary }}>
                                Ready to process
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={onRemoveFile}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200 ml-3 shrink-0"
                          style={{ backgroundColor: 'transparent' }}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: colors.secondary[600] }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Review */}
          <div 
            className={`transition-all duration-300 ease-out ${
              currentStep === 3 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0 absolute inset-0'
            }`}
            style={{ padding: currentStep === 3 ? undefined : '0 24px' }}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: styles.text.primary }}>
                  Review & Generate
                </h3>
                <p className="text-sm mb-6" style={{ color: styles.text.secondary }}>
                  Confirm your details and generate your flashcards
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: styles.text.secondary }}>
                      Set Title
                    </p>
                    <p className="text-sm font-medium" style={{ color: styles.text.primary }}>
                      {title || <span className="italic text-gray-400">Not provided</span>}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: styles.text.secondary }}>
                        Subject
                      </p>
                      <p className="text-sm" style={{ color: styles.text.primary }}>
                        {subject || <span className="italic text-gray-400">Not specified</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: styles.text.secondary }}>
                        Content Type
                      </p>
                      <p className="text-sm" style={{ color: styles.text.primary }}>
                        {selectedFile ? 'PDF Document' : inputText.trim() ? 'Text Content' : 'No content'}
                      </p>
                    </div>
                  </div>

                  {description && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: styles.text.secondary }}>
                        Description
                      </p>
                      <p className="text-sm" style={{ color: styles.text.primary }}>
                        {description}
                      </p>
                    </div>
                  )}

                  {selectedFile && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: styles.text.secondary }}>
                        File
                      </p>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: colors.primary[500] }} />
                        <p className="text-sm truncate" style={{ color: styles.text.primary }}>
                          {selectedFile.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {inputText.trim() && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: styles.text.secondary }}>
                        Text Content Preview
                      </p>
                      <div className="text-sm max-h-24 overflow-y-auto p-2 rounded bg-white">
                        <p className="text-gray-600 line-clamp-3">
                          {inputText.trim().substring(0, 200)}
                          {inputText.trim().length > 200 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm font-medium flex items-center gap-2 mb-2" style={{ color: colors.primary[800] }}>
                    <Sparkles className="w-4 h-4" />
                    What happens next?
                  </p>
                  <ul className="text-xs space-y-1" style={{ color: colors.primary[700] }}>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      AI analyzes your content and identifies key concepts
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Creates question-answer pairs for optimal learning
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Typically takes 30-60 seconds to complete
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div 
              className={`rounded-xl p-4 mt-4 animate-in fade-in duration-200 ${
                shakeError ? 'animate-shake' : ''
              }`}
              style={{ 
                backgroundColor: colors.secondary[50],
                border: `1px solid ${colors.secondary[200]}`
              }}
            >
              <p className="text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.secondary[500] }} />
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="p-6 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-gray-100 active:scale-95"
                  style={{
                    backgroundColor: colors.neutral[50],
                    color: styles.text.secondary,
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {onCancel && currentStep === 1 && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-gray-100 active:scale-95"
                  style={{
                    backgroundColor: colors.neutral[50],
                    color: styles.text.secondary,
                  }}
                >
                  Cancel
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
                  style={{
                    background: gradients.primary,
                    color: 'white',
                  }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleGenerateWithSteps}
                  disabled={loading || (!inputText.trim() && !selectedFile)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: gradients.primary,
                    color: 'white',
                    boxShadow: `0 4px 16px ${colors.primary[300]}`
                  }}
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Flashcards
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateForm