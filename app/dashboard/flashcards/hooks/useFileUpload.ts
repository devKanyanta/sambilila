import { useState, useCallback } from 'react'

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file')
        e.target.value = ''
        return
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError('File size must be less than 10MB')
        e.target.value = ''
        return
      }

      setSelectedFile(file)
      setError(null)
    }
  }, [])

  const removeFile = useCallback(() => {
    setSelectedFile(null)
  }, [])

  return {
    selectedFile,
    error,
    handleFileChange,
    removeFile,
    setError
  }
}