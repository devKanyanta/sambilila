'use client'

import { ProfileResponse } from '../types/profile'

interface ProfileHeaderProps {
  profile: ProfileResponse | null
  formatDate: (dateString: string) => string
}

export default function ProfileHeader({ profile, formatDate }: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-xl font-heading font-medium text-neutral-900">Profile</h1>
      <p className="text-sm text-neutral-400 mt-1">
        Manage your account settings and view your learning statistics
      </p>
    </div>
  )
}
