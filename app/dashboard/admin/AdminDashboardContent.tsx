// app/dashboard/admin/AdminDashboardContent.tsx
'use client'

import { motion } from 'framer-motion'
import { Shield, RefreshCw } from 'lucide-react'
import PageHeader from '@/app/dashboard/components/PageHeader'
import AnimatedSection from '@/app/dashboard/components/AnimatedSection'
import { containerStaggerSlow, fadeSlideDown, fadeSlideUp } from '@/app/dashboard/animations'
import { useAdminDashboard } from './hooks/useAdminDashboard'
import StatsCards from './components/StatsCards'
import RevenueChart from './components/RevenueChart'
import UserGrowthChart from './components/UserGrowthChart'
import PlanDistributionPie from './components/PlanDistributionPie'
import UsersTable from './components/UsersTable'
import UserDetailModal from './components/UserDetailModal'

export default function AdminDashboardContent() {
  const {
    stats, users, pagination, summary, loading, error, filters,
    plans, selectedUserId, userDetail, userDetailLoading,
    handleSearch, handleFilterChange, handleSort, handlePageChange,
    loadUserDetail, closeUserDetail,
    suspendUser, changeUserType, deleteUser, changeUserPlan, cancelUserSubscription,
    refresh,
  } = useAdminDashboard()

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerStaggerSlow}
      className="space-y-6"
    >
      {/* Header */}
      <AnimatedSection>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage users, subscriptions & usage"
          icon={Shield}
          action={
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-neutral-500 bg-white border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          }
        />
      </AnimatedSection>

      {/* Stats Cards */}
      {stats && (
        <AnimatedSection delay={0.05}>
          <StatsCards stats={stats.summary} />
        </AnimatedSection>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedSection delay={0.1}>
          <UserGrowthChart
            data={stats?.userGrowth || []}
            isLoading={!stats}
          />
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <PlanDistributionPie
            data={stats?.planDistribution || {}}
            isLoading={!stats}
          />
        </AnimatedSection>
      </div>

      {/* Full-width Revenue Chart */}
      <AnimatedSection delay={0.2}>
        <RevenueChart
          data={stats?.revenueOverTime || []}
          isLoading={!stats}
        />
      </AnimatedSection>

      {/* Users Table */}
      <AnimatedSection delay={0.25}>
        <UsersTable
          users={users}
          pagination={pagination}
          summary={summary}
          loading={loading}
          search={filters.search}
          onSearch={handleSearch}
          filters={{ plan: filters.plan, status: filters.status, userType: filters.userType }}
          onFilterChange={(key: string, value: string) => handleFilterChange(key, value)}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onViewDetails={loadUserDetail}
          onToggleSuspend={suspendUser}
          onDelete={deleteUser}
          onChangeType={changeUserType}
          onCancelSubscription={cancelUserSubscription}
        />
      </AnimatedSection>

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={!!selectedUserId && !!userDetail}
        onClose={closeUserDetail}
        detail={userDetail}
        isLoading={userDetailLoading}
        onSuspend={suspendUser}
        onDelete={deleteUser}
        onChangeType={changeUserType}
        onCancelSubscription={cancelUserSubscription}
        onChangePlan={changeUserPlan}
        plans={plans}
      />
    </motion.div>
  )
}
