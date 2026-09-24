'use client'

import { FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi'

interface NotificationProps {
  type: 'success' | 'error' | 'info'
  message: string
  onClose: () => void
}

export default function Notification({ type, message, onClose }: NotificationProps) {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: FiCheck,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: FiAlertCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
    },
    info: {
      bg: 'bg-primary-50',
      border: 'border-primary-100',
      text: 'text-primary-600',
      icon: FiInfo,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
    }
  }

  const s = styles[type]
  const Icon = s.icon

  return (
    <div className={`mb-4 rounded-xl border p-4 ${s.bg} ${s.border}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${s.iconColor}`} />
        </div>
        <p className={`text-sm flex-1 ${s.text}`}>{message}</p>
        <button onClick={onClose} className={`text-sm opacity-50 hover:opacity-100 transition-opacity ${s.text}`}>
          ✕
        </button>
      </div>
    </div>
  )
}
