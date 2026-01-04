'use client'

import { useProfile } from './hooks/useProfile'
import ProfileHeader from './components/profileHeader'
import ProfileCard from './components/profileCard'
import StatsCard from './components/statsCard'
import SettingsCard from './components/settingsCard'
import ActivityCard from './components/activityCard'
import LoadingState from './components/loadingState'
import ErrorState from './components/errorState'
import Notification from './components/ui/notification'

export default function Profile() {
  const {
    token,
    profile,
    stats,
    loading,
    error,
    success,
    editingProfile,
    setEditingProfile,
    profileForm,
    setProfileForm,
    changingPassword,
    setChangingPassword,
    passwordForm,
    setPasswordForm,
    uploadingAvatar,
    deletingAccount,
    settings,
    fetchProfileData,
    handleUpdateProfile,
    handleAvatarUpload,
    handleRemoveAvatar,
    handleChangePassword,
    handleDeleteAccount,
    handleLogout,
    handleSettingToggle,
    formatDate,
    formatStudyTime
  } = useProfile()

  if (loading) {
    return <LoadingState />
  }

  if (!token) {
    return <ErrorState message="Please login to view your profile" />
  }

  if (error && !profile) {
    return <ErrorState message={error} onRetry={fetchProfileData} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
        <ProfileHeader profile={profile} formatDate={formatDate} />
        
        {/* Notifications */}
        {error && (
          <Notification
            type="error"
            message={error}
            onClose={() => {}}
          />
        )}
        
        {success && (
          <Notification
            type="success"
            message={success}
            onClose={() => {}}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ProfileCard
              profile={profile}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              uploadingAvatar={uploadingAvatar}
              handleUpdateProfile={handleUpdateProfile}
              handleAvatarUpload={handleAvatarUpload}
              handleRemoveAvatar={handleRemoveAvatar}
              handleLogout={handleLogout}
              formatDate={formatDate}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <StatsCard
              stats={stats}
              formatStudyTime={formatStudyTime}
            />
            <ActivityCard
              recentActivity={profile?.recentActivity}
            />
            <SettingsCard
              settings={settings}
              changingPassword={changingPassword}
              passwordForm={passwordForm}
              deletingAccount={deletingAccount}
              onSettingToggle={handleSettingToggle}
              onChangePasswordClick={() => setChangingPassword(true)}
              onPasswordFormChange={setPasswordForm}
              onSubmitPassword={handleChangePassword}
              onCancelPassword={() => setChangingPassword(false)}
              onDeleteAccount={handleDeleteAccount}
            />
          </div>
        </div>
      </div>
    </div>
  )
}