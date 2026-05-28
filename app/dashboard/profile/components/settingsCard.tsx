'use client'

import { PasswordFormData } from '../types/profile'
import { Lock, Trash2, Bell, Sun, Clock } from 'lucide-react'
import Card from '@/app/dashboard/components/Card'
import { useState } from 'react'

interface SettingsCardProps {
  settings: { emailNotifications: boolean; darkMode: boolean; dailyReminders: boolean }
  changingPassword: boolean
  passwordForm: PasswordFormData
  deletingAccount: boolean
  onSettingToggle: (setting: 'emailNotifications' | 'darkMode' | 'dailyReminders') => void
  onChangePasswordClick: () => void
  onPasswordFormChange: (form: PasswordFormData) => void
  onSubmitPassword: (e: React.FormEvent) => Promise<void>
  onCancelPassword: () => void
  onDeleteAccount: () => Promise<void>
}

export default function SettingsCard({
  settings, changingPassword, passwordForm, deletingAccount,
  onSettingToggle, onChangePasswordClick, onPasswordFormChange,
  onSubmitPassword, onCancelPassword, onDeleteAccount
}: SettingsCardProps) {
  const settingOptions = [
    { key: 'emailNotifications' as const, label: 'Email Notifications', description: 'Study reminders and progress updates', icon: Bell },
    { key: 'dailyReminders' as const, label: 'Daily Reminders', description: 'Get reminded to study every day', icon: Clock },
  ]

  return (
    <Card className="p-5">
      <h3 className="text-sm font-medium text-neutral-900 mb-4">Account Settings</h3>

      <div className="divide-y divide-neutral-100">
        {settingOptions.map((option) => {
          const Icon = option.icon
          return (
            <div key={option.key} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-50 flex items-center justify-center">
                  <Icon size={16} className="text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{option.label}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{option.description}</p>
                </div>
              </div>
              <button onClick={() => onSettingToggle(option.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[option.key] ? 'bg-primary-500' : 'bg-neutral-200'
                }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  settings[option.key] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          )
        })}
      </div>

      {changingPassword ? (
        <form onSubmit={onSubmitPassword} className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
          <h4 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
            <Lock size={14} /> Change Password
          </h4>
          <input type="password" value={passwordForm.currentPassword}
            onChange={(e) => onPasswordFormChange({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50 outline-none text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            placeholder="Current password" required />
          <input type="password" value={passwordForm.newPassword}
            onChange={(e) => onPasswordFormChange({ ...passwordForm, newPassword: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50 outline-none text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            placeholder="New password" required minLength={8} />
          <input type="password" value={passwordForm.confirmPassword}
            onChange={(e) => onPasswordFormChange({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50 outline-none text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            placeholder="Confirm new password" required />
          <div className="flex gap-2">
            <button type="submit"
              className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-all active:scale-95">
              Update
            </button>
            <button type="button" onClick={onCancelPassword}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-all active:scale-95">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
          <button onClick={onChangePasswordClick}
            className="w-full py-2.5 px-3 rounded-xl text-sm font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Lock size={14} /> Change Password
          </button>
          <button onClick={onDeleteAccount} disabled={deletingAccount}
            className="w-full py-2.5 px-3 rounded-xl text-sm font-medium border border-red-100 text-red-400 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Trash2 size={14} /> {deletingAccount ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      )}
    </Card>
  )
}
