'use client'

import { useState } from 'react'
import { Plus, Sparkles, Upload, FileText, Trash2, RotateCw } from 'lucide-react'
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
  onGenerate
}) => {
  const styles = {
    background: {
      card: theme.backgrounds.card,
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      light: theme.text.light,
    },
    border: {
      medium: theme.borders.medium,
    },
    shadow: theme.shadows,
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = colors.primary[400]
    e.currentTarget.style.backgroundColor = colors.primary[50]
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = styles.border.medium
    e.currentTarget.style.backgroundColor = 'transparent'
  }

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '0.9'
    e.currentTarget.style.boxShadow = styles.shadow.xl
  }

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '1'
    e.currentTarget.style.boxShadow = styles.shadow.lg
  }

  return (
    <div 
      className="border rounded-2xl p-6 shadow-lg"
      style={{ 
        backgroundColor: styles.background.card,
        borderColor: theme.borders.light,
        boxShadow: styles.shadow.lg
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-5 h-5" style={{ color: colors.primary[400] }} />
        <h2 className="text-xl font-semibold" style={{ color: styles.text.primary }}>
          Create New Set
        </h2>
      </div>
      
      <div className="space-y-3">
        <input
          className="w-full px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
          style={{ 
            backgroundColor: colors.neutral[50],
            border: `1px solid ${styles.border.medium}`,
            color: styles.text.primary,
            boxShadow: styles.shadow.sm
          }}
          placeholder="Set Title (e.g., Biology Chapter 5)"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
            style={{ 
              backgroundColor: colors.neutral[50],
              border: `1px solid ${styles.border.medium}`,
              color: styles.text.primary,
              boxShadow: styles.shadow.sm
            }}
            placeholder="Subject"
            value={subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSubjectChange(e.target.value)}
          />
          <input
            className="px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
            style={{ 
              backgroundColor: colors.neutral[50],
              border: `1px solid ${styles.border.medium}`,
              color: styles.text.primary,
              boxShadow: styles.shadow.sm
            }}
            placeholder="Description (optional)"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDescriptionChange(e.target.value)}
          />
        </div>
        <textarea
          className="w-full px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all min-h-[120px] resize-none"
          style={{ 
            backgroundColor: colors.neutral[50],
            border: `1px solid ${styles.border.medium}`,
            color: styles.text.primary,
            boxShadow: styles.shadow.sm
          }}
          placeholder="Paste your study material here... Our AI will generate flashcards automatically!"
          value={inputText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputTextChange(e.target.value)}
        />
        
        {/* PDF Upload Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: styles.text.secondary }}>
            <FileText className="w-4 h-4" />
            <span>Or upload a PDF file</span>
          </div>
          
          {!selectedFile ? (
            <label className="block">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={onFileChange}
                className="hidden"
              />
              <div 
                className="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
                style={{ 
                  borderColor: styles.border.medium,
                  backgroundColor: 'transparent',
                  borderStyle: 'dashed'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: colors.neutral[500] }} />
                <p className="text-sm font-medium" style={{ color: styles.text.secondary }}>Click to upload PDF</p>
                <p className="text-xs mt-1" style={{ color: styles.text.light }}>PDF files only, max 10MB</p>
              </div>
            </label>
          ) : (
            <div 
              className="rounded-xl p-4 flex items-center justify-between"
              style={{ 
                backgroundColor: colors.primary[50],
                border: `1px solid ${colors.primary[200]}`
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary[400] }}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: styles.text.primary }}>
                    {selectedFile.name}
                  </p>
                  <p className="text-xs" style={{ color: styles.text.secondary }}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={onRemoveFile}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
              >
                <Trash2 className="w-4 h-4" style={{ color: colors.secondary[600] }} />
              </button>
            </div>
          )}
        </div>

        <button
          className="w-full px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          onClick={onGenerate}
          disabled={loading || (!inputText.trim() && !selectedFile)}
          style={{ 
            background: gradients.primary,
            boxShadow: styles.shadow.lg
          }}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin" />
              Creating Job...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Flashcards
            </span>
          )}
        </button>
        
        {/* Info note */}
        <p className="text-xs text-center" style={{ color: styles.text.light }}>
          Note: Processing may take a few moments. You can continue using the app while your flashcards are being generated.
        </p>
      </div>
    </div>
  )
}

export default CreateForm