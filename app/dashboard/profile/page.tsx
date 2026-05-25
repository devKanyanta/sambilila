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
import AnimatedSection from '@/app/dashboard/components/AnimatedSection'

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
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
        <AnimatedSection>
          <ProfileHeader profile={profile} formatDate={formatDate} />
        </AnimatedSection>
        
        {/* Notifications */}
        {error && (
          <AnimatedSection delay={0.1}>
            <Notification
              type="error"
              message={error}
              onClose={() => {}}
            />
          </AnimatedSection>
        )}
        
        {success && (
          <AnimatedSection delay={0.1}>
            <Notification
              type="success"
              message={success}
              onClose={() => {}}
            />
          </AnimatedSection>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <AnimatedSection delay={0.15} className="space-y-6">
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
          </AnimatedSection>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection delay={0.2}>
              <StatsCard
                stats={stats}
                formatStudyTime={formatStudyTime}
              />
            </AnimatedSection>
            <AnimatedSection delay={0.25}>
              <ActivityCard
                recentActivity={profile?.recentActivity}
              />
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
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
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}