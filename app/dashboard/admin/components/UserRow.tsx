// app/dashboard/admin/components/UserRow.tsx
'use client'

import { motion } from 'framer-motion'
import { Shield, User, GraduationCap } from 'lucide-react'
import type { AdminUser } from '../types/admin'
import UserActions from './UserActions'

interface UserRowProps {
  user: AdminUser
  index: number
  onViewDetails: (userId: string) => void
  onToggleSuspend: (userId: string, suspended: boolean) => void
  onDelete: (userId: string) => void
  onChangeType: (userId: string, type: 'STUDENT' | 'TEACHER') => void
  onCancelSubscription: (userId: string) => void
}

export default function UserRow({
  user,
  index,
  onViewDetails,
  onToggleSuspend,
  onDelete,
  onChangeType,
  onCancelSubscription,
}: UserRowProps) {
  const planName = user.subscription?.planName || 'Free'
  const isPaid = !!user.subscription
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="group hover:bg-neutral-50 transition-colors cursor-pointer"
      onClick={() => onViewDetails(user.id)}
    >
      {/* Name + Avatar */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${
            user.suspended ? 'bg-neutral-300' : 'bg-primary-500'
          }`}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${user.suspended ? 'text-neutral-400' : 'text-neutral-800'}`}>
              {user.name}
            </p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* User Type */}
      <td className="py-3 px-4 hidden md:table-cell">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
          user.userType === 'TEACHER'
            ? 'bg-secondary-50 text-secondary-600'
            : 'bg-primary-50 text-primary-600'
        }`}>
          {user.userType === 'TEACHER' ? (
            <GraduationCap className="w-3 h-3" />
          ) : (
            <User className="w-3 h-3" />
          )}
          {user.userType === 'TEACHER' ? 'Teacher' : 'Student'}
        </span>
      </td>

      {/* Plan */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
          isPaid
            ? 'bg-green-50 text-green-700'
            : 'bg-neutral-100 text-neutral-500'
        }`}>
          {planName}
        </span>
      </td>

      {/* Usage */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>{user.usage.quizzesCreatedThisWeek} quizzes</span>
          <span className="text-neutral-300">·</span>
          <span>{user.usage.flashcardsCreated} cards</span>
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        {user.suspended ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">
            <Shield className="w-3 h-3" />
            Suspended
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Active
          </span>
        )}
      </td>

      {/* Joined */}
      <td className="py-3 px-4 hidden xl:table-cell">
        <span className="text-xs text-neutral-500" title={new Date(user.createdAt).toLocaleDateString()}>
          {formatRelativeDate(user.createdAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        <UserActions
          userId={user.id}
          userName={user.name}
          userEmail={user.email}
          isSuspended={user.suspended}
          userType={user.userType}
          hasSubscription={!!user.subscription}
          onViewDetails={() => onViewDetails(user.id)}
          onToggleSuspend={onToggleSuspend}
          onDelete={onDelete}
          onChangeType={onChangeType}
          onCancelSubscription={onCancelSubscription}
        />
      </td>
    </motion.tr>
  )
}
