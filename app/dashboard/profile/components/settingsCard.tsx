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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
      
      <div className="space-y-4">
        {settingOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {option.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {option.description}
              </p>
            </div>
            <button
              onClick={() => onSettingToggle(option.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                settings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings[option.key] ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}

        {changingPassword ? (
          <form onSubmit={onSubmitPassword} className="pt-4 border-t border-gray-200 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => onPasswordFormChange({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Current password"
              required
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => onPasswordFormChange({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="New password"
              required
              minLength={8}
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => onPasswordFormChange({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={onCancelPassword}
                className="flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <button
              onClick={onChangePasswordClick}
              className="w-full px-3 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
            >
              Change Password
            </button>
            <button
              onClick={onDeleteAccount}
              disabled={deletingAccount}
              className="w-full px-3 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingAccount ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}