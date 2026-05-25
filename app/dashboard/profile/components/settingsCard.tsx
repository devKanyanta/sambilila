'use client'

import { PasswordFormData } from '../types/profile'

interface SettingsCardProps {
  settings: {
    emailNotifications: boolean
    darkMode: boolean
    dailyReminders: boolean
  }
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
  settings,
  changingPassword,
  passwordForm,
  deletingAccount,
  onSettingToggle,
  onChangePasswordClick,
  onPasswordFormChange,
  onSubmitPassword,
  onCancelPassword,
  onDeleteAccount
}: SettingsCardProps) {
  const settingOptions = [
    {
      key: 'emailNotifications' as const,
      label: 'Email Notifications',
      description: 'Study reminders and progress updates'
    },
    {
      key: 'dailyReminders' as const,
      label: 'Daily Reminders',
      description: 'Get reminded to study every day'
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-base font-semibold text-neutral-800 mb-4">Account Settings</h3>

      <div className="space-y-1">
        {settingOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-neutral-800">{option.label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{option.description}</p>
            </div>
            <button
              onClick={() => onSettingToggle(option.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[option.key] ? 'bg-[#193827]' : 'bg-neutral-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                settings[option.key] ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>

      {changingPassword ? (
        <form onSubmit={onSubmitPassword} className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
          <h4 className="text-sm font-semibold text-neutral-700">Change Password</h4>
          <input
            type="password" value={passwordForm.currentPassword}
            onChange={(e) => onPasswordFormChange({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 text-sm outline-none focus:border-[#193827] focus:ring-2 focus:ring-[#193827]/20 transition-all"
            placeholder="Current password"
            required
          />
          <input
            type="password" value={passwordForm.newPassword}
            onChange={(e) => onPasswordFormChange({ ...passwordForm, newPassword: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 text-sm outline-none focus:border-[#193827] focus:ring-2 focus:ring-[#193827]/20 transition-all"
            placeholder="New password"
            required minLength={8}
          />
          <input
            type="password" value={passwordForm.confirmPassword}
            onChange={(e) => onPasswordFormChange({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 text-sm outline-none focus:border-[#193827] focus:ring-2 focus:ring-[#193827]/20 transition-all"
            placeholder="Confirm new password"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ backgroundColor: '#193827' }}>
              Update Password
            </button>
            <button type="button" onClick={onCancelPassword}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 border-2 border-neutral-200 hover:bg-neutral-50 transition-all">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
          <button onClick={onChangePasswordClick}
            className="w-full py-2 px-3 rounded-lg text-sm font-medium border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all">
            Change Password
          </button>
          <button onClick={onDeleteAccount} disabled={deletingAccount}
            className="w-full py-2 px-3 rounded-lg text-sm font-medium border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {deletingAccount ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      )}
    </div>
  )
}
