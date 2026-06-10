// app/dashboard/admin/components/UserActions.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Eye, Ban, CheckCircle, Trash2, UserCog, XCircle } from 'lucide-react'

interface UserActionsProps {
  userId: string
  userName: string
  userEmail: string
  isSuspended: boolean
  userType: 'STUDENT' | 'TEACHER'
  hasSubscription: boolean
  onViewDetails: () => void
  onToggleSuspend: (userId: string, suspended: boolean) => void
  onDelete: (userId: string) => void
  onChangeType: (userId: string, type: 'STUDENT' | 'TEACHER') => void
  onCancelSubscription: (userId: string) => void
}

export default function UserActions({
  userId,
  userName,
  userEmail,
  isSuspended,
  userType,
  hasSubscription,
  onViewDetails,
  onToggleSuspend,
  onDelete,
  onChangeType,
  onCancelSubscription,
}: UserActionsProps) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirming(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAction = (action: string) => {
    if (confirming === action) {
      switch (action) {
        case 'suspend':
          onToggleSuspend(userId, true)
          break
        case 'activate':
          onToggleSuspend(userId, false)
          break
        case 'delete':
          onDelete(userId)
          break
        case 'make-teacher':
          onChangeType(userId, 'TEACHER')
          break
        case 'make-student':
          onChangeType(userId, 'STUDENT')
          break
        case 'cancel-sub':
          onCancelSubscription(userId)
          break
      }
      setOpen(false)
      setConfirming(null)
    } else {
      setConfirming(action)
    }
  }

  const actions = [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => { onViewDetails(); setOpen(false); setConfirming(null); },
      color: 'text-neutral-600',
      needsConfirm: false,
    },
    ...(isSuspended
      ? [{ id: 'activate', label: 'Activate Account', icon: CheckCircle, color: 'text-green-600', needsConfirm: true }]
      : [{ id: 'suspend', label: 'Suspend Account', icon: Ban, color: 'text-amber-600', needsConfirm: true }]),
    {
      id: userType === 'TEACHER' ? 'make-student' : 'make-teacher',
      label: userType === 'TEACHER' ? 'Change to Student' : 'Change to Teacher',
      icon: UserCog,
      color: 'text-blue-600',
      needsConfirm: true,
    },
    ...(hasSubscription
      ? [{ id: 'cancel-sub', label: 'Cancel Subscription', icon: XCircle, color: 'text-red-500', needsConfirm: true }]
      : []),
    {
      id: 'delete',
      label: 'Delete User',
      icon: Trash2,
      color: 'text-red-600',
      needsConfirm: true,
    },
  ]

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
        aria-label="User actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 z-50"
          >
            {actions.map((action) => {
              const Icon = action.icon
              const isConfirming = confirming === action.id
              return (
                <div key={action.id}>
                  {action.needsConfirm && isConfirming ? (
                    <div className="px-3 py-2 space-y-1">
                      <p className="text-[10px] text-neutral-500 leading-relaxed">
                        {action.id === 'delete'
                          ? `Delete ${userName}? This is irreversible.`
                          : action.id === 'suspend'
                          ? `Suspend ${userName}? They won't be able to log in.`
                          : action.id === 'activate'
                          ? `Reactivate ${userName}?`
                          : action.id === 'cancel-sub'
                          ? `Cancel ${userName}'s subscription?`
                          : `Change ${userName}'s type?`}
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAction(action.id)}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-medium text-white ${
                            action.id === 'delete' || action.id === 'suspend' || action.id === 'cancel-sub'
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-primary-500 hover:bg-primary-600'
                          } transition-colors`}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirming(null)}
                          className="flex-1 py-1 rounded-lg text-[10px] font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => action.onClick ? action.onClick() : handleAction(action.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="p-1 rounded-md bg-neutral-100">
                        <Icon className={`w-3.5 h-3.5 ${action.color}`} />
                      </div>
                      <span>{action.label}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
