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
  const [isVerySmall, setIsVerySmall] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
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
      if (!title.trim()) {
        triggerErrorAnimation()
        return
      }
    } else if (currentStep === 2) {
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
        boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
        borderRadius: '1rem',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        maxWidth: isVerySmall ? '100%' : '500px',
        margin: '0 auto',
        minHeight: isVerySmall ? 'auto' : '500px',
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
        }}
      />
      
      <div className="relative">
        {/* Header - Simplified for mobile */}
        <div className={isVerySmall ? "p-4 border-b" : "p-5 border-b"} style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={isVerySmall ? "p-1.5 rounded-full" : "p-2 rounded-full"} 
                style={{ 
                  background: gradients.primary,
                  boxShadow: `0 0 15px ${colors.primary[200]}`
                }}>
                <Sparkles className={isVerySmall ? "w-4 h-4 text-white" : "w-5 h-5 text-white"} />
              </div>
              <div>
                <h2 className={isVerySmall ? "text-base font-bold" : "text-lg font-bold"} style={{ color: styles.text.primary }}>
                  {isVerySmall ? 'New Set' : 'Create New Set'}
                </h2>
                {!isVerySmall && (
                  <p className="text-xs" style={{ color: styles.text.secondary }}>
                    Step {currentStep} of {totalSteps}
                  </p>
                )}
              </div>
            </div>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className={isVerySmall ? "p-1.5 rounded-full" : "p-2 rounded-full"}
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  color: styles.text.secondary
                }}
                aria-label="Close"
              >
                <X className={isVerySmall ? "w-4 h-4" : "w-5 h-5"} />
              </button>
            )}
          </div>

          {/* Simplified Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center relative">
                <div 
                  className={isVerySmall ? "w-8 h-8 rounded-full flex items-center justify-center" : "w-10 h-10 rounded-full flex items-center justify-center"}
                  style={{
                    backgroundColor: currentStep >= step ? colors.primary[500] : 'rgba(0, 0, 0, 0.05)',
                    color: currentStep >= step ? 'white' : styles.text.secondary,
                    border: currentStep === step ? `2px solid ${colors.primary[300]}` : 'none',
                    boxShadow: currentStep === step ? `0 0 0 3px ${colors.primary[100]}` : 'none',
                    fontSize: isVerySmall ? '0.75rem' : '0.875rem',
                  }}
                >
                  {currentStep > step ? <Check className="w-3 h-3" /> : step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className={isVerySmall ? "p-4 relative overflow-hidden" : "p-5 relative overflow-hidden"}>
          {/* Step 1: Set Details */}
          <div 
            className={`transition-all duration-300 ease-out ${
              currentStep === 1 
                ? 'translate-x-0 opacity-100' 
                : currentStep > 1 
                  ? '-translate-x-full opacity-0 absolute inset-0' 
                  : 'translate-x-full opacity-0 absolute inset-0'
            }`}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <label className={isVerySmall ? "text-xs font-medium" : "text-sm font-medium"} style={{ color: styles.text.primary }}>
                  Set Title <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full ${isVerySmall ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} rounded-lg placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                    shakeError && !title.trim() ? 'animate-shake' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    border: `1px solid ${shakeError && !title.trim() ? colors.secondary[400] : styles.border.light}`,
                    color: styles.text.primary,
                  }}
                  placeholder="What's this set about?"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
                />
                {shakeError && !title.trim() && (
                  <p className="text-xs text-red-500 animate-in fade-in">Please enter a title</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <label className={isVerySmall ? "text-xs font-medium" : "text-sm font-medium"} style={{ color: styles.text.primary }}>
                    Subject Area
                  </label>
                  <input
                    className={`w-full ${isVerySmall ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} rounded-lg placeholder-gray-400 focus:outline-none transition-all duration-200`}
                    style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      border: `1px solid ${styles.border.light}`,
                      color: styles.text.primary,
                    }}
                    placeholder="e.g., Biology"
                    value={subject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSubjectChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className={isVerySmall ? "text-xs font-medium" : "text-sm font-medium"} style={{ color: styles.text.primary }}>
                    Description <span className="text-xs font-normal" style={{ color: styles.text.light }}>(optional)</span>
                  </label>
                  <input
                    className={`w-full ${isVerySmall ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} rounded-lg placeholder-gray-400 focus:outline-none transition-all duration-200`}
                    style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      border: `1px solid ${styles.border.light}`,
                      color: styles.text.primary,
                    }}
                    placeholder="Brief description"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDescriptionChange(e.target.value)}
                  />
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
          >
            <div className="space-y-3">
              <div>
                <h3 className={isVerySmall ? "text-base font-semibold mb-1" : "text-lg font-semibold mb-2"} style={{ color: styles.text.primary }}>
                  Add Content
                </h3>
                {!isVerySmall && (
                  <p className="text-xs mb-3" style={{ color: styles.text.secondary }}>
                    Paste text or upload a PDF
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className={isVerySmall ? "text-xs font-medium" : "text-sm font-medium"} style={{ color: styles.text.primary }}>
                    Study Material <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full ${isVerySmall ? 'px-3 py-2 text-xs min-h-[120px]' : 'px-4 py-3 text-sm min-h-[140px]'} rounded-lg placeholder-gray-400 focus:outline-none transition-all duration-200 resize-none ${
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
                    }}
                    placeholder="Paste your notes, textbook content, or study material..."
                    value={inputText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputTextChange(e.target.value)}
                  />
                  {shakeError && !inputText.trim() && !selectedFile && (
                    <p className="text-xs text-red-500 animate-in fade-in">
                      Please add content or upload a PDF
                    </p>
                  )}
                </div>

                <div className="relative">
                  {!isVerySmall && (
                    <div className="flex items-center justify-center my-2">
                      <div className="h-px flex-1" style={{ backgroundColor: styles.border.light }} />
                      <span className="px-2 text-xs" style={{ color: styles.text.secondary }}>or</span>
                      <div className="h-px flex-1" style={{ backgroundColor: styles.border.light }} />
                    </div>
                  )}

                  <div className="space-y-2">
                    {!isVerySmall && (
                      <label className="text-xs font-medium block" style={{ color: styles.text.primary }}>
                        Upload PDF
                      </label>
                    )}
                    
                    {!selectedFile ? (
                      <label className="block">
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={onFileChange}
                          className="hidden"
                        />
                        <div 
                          className="border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer hover:border-primary-400 active:scale-[0.98]"
                          style={{ 
                            borderColor: styles.border.light,
                            backgroundColor: 'transparent',
                          }}
                          onDragOver={handleDragOver}
                          onDrop={handleFileDrop}
                        >
                          <div className="p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center"
                            style={{ backgroundColor: colors.primary[50] }}>
                            <Upload className="w-4 h-4" style={{ color: colors.primary[500] }} />
                          </div>
                          <p className="text-xs font-medium mb-0.5" style={{ color: styles.text.primary }}>
                            {isVerySmall ? 'Upload PDF' : 'Drop PDF or click to browse'}
                          </p>
                          {!isVerySmall && (
                            <p className="text-xs" style={{ color: styles.text.light }}>
                              Max 10MB
                            </p>
                          )}
                        </div>
                      </label>
                    ) : (
                      <div 
                        className="rounded-lg p-3 flex items-center justify-between transition-all duration-200 animate-in fade-in"
                        style={{ 
                          backgroundColor: colors.primary[50],
                          border: `1px solid ${colors.primary[200]}`,
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="p-1.5 rounded" style={{ backgroundColor: colors.primary[500] }}>
                            <FileText className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate" style={{ color: styles.text.primary }}>
                              {selectedFile.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={onRemoveFile}
                          className="p-1 hover:bg-red-100 rounded transition-colors duration-200 ml-2"
                          style={{ backgroundColor: 'transparent' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ color: colors.secondary[600] }} />
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
          >
            <div className="space-y-3">
              <div>
                <h3 className={isVerySmall ? "text-base font-semibold mb-1" : "text-lg font-semibold mb-2"} style={{ color: styles.text.primary }}>
                  Review
                </h3>
                {!isVerySmall && (
                  <p className="text-xs mb-4" style={{ color: styles.text.secondary }}>
                    Confirm details and generate
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                  <div>
                    <p className="font-medium mb-0.5" style={{ color: styles.text.secondary }}>
                      Title
                    </p>
                    <p style={{ color: styles.text.primary }}>
                      {title || <span className="italic text-gray-400">Not provided</span>}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-medium mb-0.5" style={{ color: styles.text.secondary }}>
                        Subject
                      </p>
                      <p style={{ color: styles.text.primary }}>
                        {subject || <span className="italic text-gray-400">Not specified</span>}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-0.5" style={{ color: styles.text.secondary }}>
                        Content
                      </p>
                      <p style={{ color: styles.text.primary }}>
                        {selectedFile ? 'PDF' : inputText.trim() ? 'Text' : 'None'}
                      </p>
                    </div>
                  </div>

                  {inputText.trim() && !isVerySmall && (
                    <div>
                      <p className="font-medium mb-0.5" style={{ color: styles.text.secondary }}>
                        Preview
                      </p>
                      <div className="max-h-20 overflow-y-auto p-2 rounded bg-white">
                        <p className="text-gray-600 line-clamp-2 text-xs">
                          {inputText.trim().substring(0, 150)}
                          {inputText.trim().length > 150 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {!isVerySmall && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-medium flex items-center gap-1 mb-1" style={{ color: colors.primary[800] }}>
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
            <div 
              className={`rounded-lg p-3 mt-3 animate-in fade-in duration-200 text-xs ${
                shakeError ? 'animate-shake' : ''
              }`}
              style={{ 
                backgroundColor: colors.secondary[50],
                border: `1px solid ${colors.secondary[200]}`
              }}
            >
              <p className="font-medium">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className={isVerySmall ? "p-4 border-t" : "p-5 border-t"} style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className={`flex items-center gap-1 ${isVerySmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-lg font-medium transition-all duration-200 hover:bg-gray-100 active:scale-95`}
                  style={{
                    backgroundColor: colors.neutral[50],
                    color: styles.text.secondary,
                  }}
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
                  className="px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 hover:bg-gray-100 active:scale-95"
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
                  className={`flex items-center gap-1 ${isVerySmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-lg font-medium transition-all duration-200 hover:shadow-lg active:scale-95`}
                  style={{
                    background: gradients.primary,
                    color: 'white',
                  }}
                >
                  Continue
                  <ArrowRight className={isVerySmall ? "w-3 h-3" : "w-4 h-4"} />
                </button>
              ) : (
                <button
                  onClick={handleGenerateWithSteps}
                  disabled={loading || (!inputText.trim() && !selectedFile)}
                  className={`flex items-center gap-1 ${isVerySmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-lg font-medium transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{
                    background: gradients.primary,
                    color: 'white',
                  }}
                >
                  {loading ? (
                    <>
                      <RotateCw className={isVerySmall ? "w-3 h-3 animate-spin" : "w-4 h-4 animate-spin"} />
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
    </div>
  )
}

export default CreateForm