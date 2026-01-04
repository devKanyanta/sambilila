'use client'

interface NotificationProps {
  type: 'success' | 'error' | 'info'
  message: string
  onClose: () => void
}

export default function Notification({ type, message, onClose }: NotificationProps) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  return (
    <div className={`mb-6 border rounded-md p-4 ${styles[type]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-sm opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  )
}