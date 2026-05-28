'use client'

import { useState } from 'react'
import { ProfileResponse, ProfileFormData } from '../types/profile'
import { User, Mail, Calendar, Edit3, LogOut, MoreVertical, Camera } from 'lucide-react'
import Card from '@/app/dashboard/components/Card'

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
  profile, editingProfile, setEditingProfile, profileForm, setProfileForm,
  uploadingAvatar, handleUpdateProfile, handleAvatarUpload, handleRemoveAvatar,
  handleLogout, formatDate
}: ProfileCardProps) {
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)

  return (
    <Card className="p-5 overflow-visible">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4">
          {profile?.user.avatar ? (
            <img src={profile.user.avatar} alt={profile.user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-neutral-100" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center border-2 border-neutral-100">
              <span className="text-2xl font-medium text-primary-500">
                {profile?.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button onClick={() => setShowAvatarMenu(!showAvatarMenu)}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm">
            <Camera size={12} className="text-neutral-400" />
          </button>

          {showAvatarMenu && (
            <div className="absolute z-10 mt-2 w-40 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden left-1/2 -translate-x-1/2">
              <label className="flex items-center gap-2 px-3 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors">
                <Camera size={14} />
                Change Photo
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
              </label>
              {profile?.user.avatar && (
                <button onClick={handleRemoveAvatar}
                  className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-xs text-red-400 hover:bg-red-50 transition-colors">
                  <Camera size={14} />
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        {editingProfile ? (
          <form onSubmit={handleUpdateProfile} className="w-full space-y-3">
            <input type="text" value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50 outline-none text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-center"
              placeholder="Your name" required />
            <select value={profileForm.userType}
              onChange={(e) => setProfileForm({ ...profileForm, userType: e.target.value as 'STUDENT' | 'TEACHER' })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 bg-neutral-50 outline-none text-neutral-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-center">
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={uploadingAvatar}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-all active:scale-95">
                Save
              </button>
              <button type="button" onClick={() => setEditingProfile(false)}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-all active:scale-95">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-lg font-heading font-medium text-neutral-900">{profile?.user.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 text-[10px] font-medium rounded-full ${
                profile?.user.userType === 'TEACHER'
                  ? 'bg-accent-50 text-accent-600'
                  : 'bg-primary-50 text-primary-600'
              }`}>
                {profile?.user.userType === 'TEACHER' ? 'Teacher' : 'Student'}
              </span>
            </div>
            <p className="text-sm text-neutral-400 mt-2 flex items-center justify-center gap-1.5">
              <Mail size={14} /> {profile?.user.email}
            </p>
            <p className="text-xs text-neutral-400 mt-1.5 flex items-center justify-center gap-1.5">
              <Calendar size={12} /> Joined {profile ? formatDate(profile.user.createdAt) : 'Loading...'}
            </p>
          </>
        )}
      </div>

      {!editingProfile && (
        <div className="mt-5 pt-4 border-t border-neutral-100 space-y-2">
          <button onClick={() => setEditingProfile(true)}
            className="w-full py-2.5 px-3 rounded-xl text-sm font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Edit3 size={14} /> Edit Profile
          </button>
          <button onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl text-sm font-medium border border-red-100 text-red-400 hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2">
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </Card>
  )
}
