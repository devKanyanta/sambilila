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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start space-x-4">
        <div className="relative">
          {profile?.user.avatar ? (
            <img
              src={profile.user.avatar}
              alt={profile.user.name}
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <span className="text-lg font-medium text-gray-600">
                {profile?.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
          >
            <span className="text-xs text-gray-600">⋯</span>
          </button>
          
          {showAvatarMenu && (
            <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
              <label className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
              {profile?.user.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1">
          {editingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                required
              />
              <select
                value={profileForm.userType}
                onChange={(e) => setProfileForm({ ...profileForm, userType: e.target.value as 'STUDENT' | 'TEACHER' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-medium text-gray-900">{profile?.user.name}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  profile?.user.userType === 'TEACHER' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {profile?.user.userType === 'TEACHER' ? 'Teacher' : 'Student'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{profile?.user.email}</p>
              <p className="text-xs text-gray-500 mt-2">
                Joined {profile ? formatDate(profile.user.createdAt) : 'Loading...'}
              </p>
            </>
          )}
        </div>
      </div>

      {!editingProfile && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setEditingProfile(true)}
            className="w-full px-3 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
          >
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full mt-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}