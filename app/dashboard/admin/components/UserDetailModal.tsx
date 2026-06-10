// app/dashboard/admin/components/UserDetailModal.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Mail, Calendar, CreditCard, User, Shield,
  CheckCircle, XCircle, Crown, BarChart3, Activity,
  AlertTriangle, ExternalLink,
} from 'lucide-react'
import type { UserDetail } from '../types/admin'
import UsageBreakdown from './UsageBreakdown'

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  detail: UserDetail | null
  isLoading: boolean
  onSuspend: (userId: string, suspended: boolean) => void
  onDelete: (userId: string) => void
  onChangeType: (userId: string, type: 'STUDENT' | 'TEACHER') => void
  onCancelSubscription: (userId: string) => void
  onChangePlan: (userId: string, planSlug: string) => void
  plans: Array<{ id: string; name: string; slug: string; priceUSD: number; period: string }>
}

export default function UserDetailModal({
  isOpen, onClose, detail, isLoading,
  onSuspend, onDelete, onChangeType, onCancelSubscription, onChangePlan, plans,
}: UserDetailModalProps) {
  if (!isOpen) return null

  const user = detail?.user
  const subscription = detail?.currentSubscription

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center pt-16 sm:pt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg max-h-[calc(100vh-4rem)] bg-white shadow-xl overflow-y-auto sm:rounded-2xl sm:mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <h2 className="text-base font-heading font-semibold text-neutral-900">
                {isLoading ? 'Loading...' : user?.name || 'User Details'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : detail && user ? (
            <div className="divide-y divide-neutral-100">
              {/* Profile Info */}
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-400">Profile</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-50">
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </div>
                    <p className="text-xs font-medium text-neutral-700 truncate">{user.email}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50">
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
                      <User className="w-3 h-3" />
                      <span>Type</span>
                    </div>
                    <p className="text-xs font-medium text-neutral-700">{user.userType}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50">
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>Joined</span>
                    </div>
                    <p className="text-xs font-medium text-neutral-700">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50">
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
                      <Shield className="w-3 h-3" />
                      <span>Status</span>
                    </div>
                    <p className={`text-xs font-medium ${user.suspended ? 'text-red-600' : 'text-green-600'}`}>
                      {user.suspended ? 'Suspended' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription */}
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-400">Subscription</h3>
                {subscription ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{subscription.plan.name}</p>
                          <p className="text-[10px] text-neutral-500">
                            ${subscription.plan.priceUSD}/{subscription.plan.period}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        subscription.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {subscription.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                      <span>Provider: {subscription.provider}</span>
                      {subscription.currentPeriodEnd && (
                        <span>Renewal: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                      )}
                    </div>
                    {/* Change plan */}
                    <div className="flex gap-1.5 flex-wrap">
                      {plans.filter(p => p.slug !== 'free').map((plan) => (
                        <button
                          key={plan.slug}
                          onClick={() => onChangePlan(user.id, plan.slug)}
                          disabled={plan.slug === subscription.plan.slug}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                            plan.slug === subscription.plan.slug
                              ? 'bg-primary-100 text-primary-600 cursor-not-allowed'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {plan.name}
                        </button>
                      ))}
                      <button
                        onClick={() => onCancelSubscription(user.id)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-neutral-50 text-center">
                    <p className="text-xs text-neutral-500">No active subscription (Free plan)</p>
                    <div className="flex gap-1.5 mt-2 justify-center flex-wrap">
                      {plans.filter(p => p.slug !== 'free').map((plan) => (
                        <button
                          key={plan.slug}
                          onClick={() => onChangePlan(user.id, plan.slug)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all"
                        >
                          {plan.name} (${plan.priceUSD}/{plan.period})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Usage */}
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-400">Usage</h3>
                {detail.monthlyUsage && detail.monthlyUsage.length > 0 ? (
                  <UsageBreakdown data={detail.monthlyUsage} />
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50">
                    <BarChart3 className="w-4 h-4 text-neutral-400" />
                    <p className="text-xs text-neutral-500">No usage data available</p>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-400">Recent Activity</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {detail.recentActivity.quizResults.slice(0, 5).map((result) => (
                    <div key={result.id} className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50">
                      <div className="w-6 h-6 rounded-md bg-[#ff5252]/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-3 h-3 text-[#ff5252]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-neutral-700 truncate">{result.quiz.title}</p>
                        <p className="text-[10px] text-neutral-400">
                          Score: {result.score}/{result.totalQuestions}
                        </p>
                      </div>
                      <span className="text-[10px] text-neutral-400 flex-shrink-0">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {detail.recentActivity.quizResults.length === 0 && (
                    <p className="text-xs text-neutral-400 text-center py-3">No recent quiz activity</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-400">Admin Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {user.suspended ? (
                    <button
                      onClick={() => onSuspend(user.id, false)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => onSuspend(user.id, true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => onChangeType(user.id, user.userType === 'TEACHER' ? 'STUDENT' : 'TEACHER')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    Make {user.userType === 'TEACHER' ? 'Student' : 'Teacher'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
                        onDelete(user.id)
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">
              Could not load user details
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
