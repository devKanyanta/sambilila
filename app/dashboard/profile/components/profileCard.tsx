'use client'

import { useState } from 'react'
import { ProfileResponse, ProfileFormData } from '../types/profile'

interface ProfileCardProps {
  profile: ProfileResponse | null
  editingProfile: boolean
  setEditingProfile: (value: boolean) => void
  profileForm: ProfileFormData
  setProfileForm: (form: ProfileFormData) => void
  uploadingAvatar: boolean
  handleUpdateProfile: (e: React.FormEvent) => Promise<void>
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleRemoveAvatar: () => Promise<void>
  handleLogout: () => void
  formatDate: (dateString: string) => string
}

export default function ProfileCard({
  profile,
  editingProfile,
  setEditingProfile,
  profileForm,
  setProfileForm,
  uploadingAvatar,
  handleUpdateProfile,
  handleAvatarUpload,
  handleRemoveAvatar,
  handleLogout,
  formatDate
}: ProfileCardProps) {
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {profile?.user.avatar ? (
            <img
              src={profile.user.avatar}
              alt={profile.user.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-neutral-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#193827]/10 flex items-center justify-center border-2 border-neutral-100">
              <span className="text-xl font-bold text-[#193827]">
                {profile?.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <span className="text-xs text-neutral-500">⋯</span>
          </button>

          {showAvatarMenu && (
            <div className="absolute z-10 mt-1 w-36 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
              <label className="block px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors">
                Change Photo
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
              </label>
              {profile?.user.avatar && (
                <button onClick={handleRemoveAvatar} className="block w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {editingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <input
                type="text" value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 text-sm outline-none focus:border-[#193827] focus:ring-2 focus:ring-[#193827]/20 transition-all"
                placeholder="Your name"
                required
              />
              <select
                value={profileForm.userType}
                onChange={(e) => setProfileForm({ ...profileForm, userType: e.target.value as 'STUDENT' | 'TEACHER' })}
                className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 text-sm outline-none focus:border-[#193827] focus:ring-2 focus:ring-[#193827]/20 transition-all"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: '#193827' }}>
                  Save
                </button>
                <button type="button" onClick={() => setEditingProfile(false)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 border-2 border-neutral-200 hover:bg-neutral-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-neutral-800">{profile?.user.name}</h2>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  profile?.user.userType === 'TEACHER'
                    ? 'bg-[#ff5252]/10 text-[#ff5252]'
                    : 'bg-[#193827]/10 text-[#193827]'
                }`}>
                  {profile?.user.userType === 'TEACHER' ? 'Teacher' : 'Student'}
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-0.5">{profile?.user.email}</p>
              <p className="text-xs text-neutral-400 mt-2">
                Joined {profile ? formatDate(profile.user.createdAt) : 'Loading...'}
              </p>
            </>
          )}
        </div>
      </div>

      {!editingProfile && (
        <div className="mt-5 pt-4 border-t border-neutral-100 space-y-2">
          <button onClick={() => setEditingProfile(true)}
            className="w-full py-2 px-3 rounded-lg text-sm font-medium border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:shadow-sm transition-all">
            Edit Profile
          </button>
          <button onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg text-sm font-medium border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
