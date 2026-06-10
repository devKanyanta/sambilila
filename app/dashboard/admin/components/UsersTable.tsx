// app/dashboard/admin/components/UsersTable.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Users, Filter, ArrowUpDown, X,
} from 'lucide-react'
import type { AdminUser } from '../types/admin'
import UserRow from './UserRow'

interface UsersTableProps {
  users: AdminUser[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  summary: { totalUsers: number; activeSubscriptions: number; suspendedUsers: number; totalRevenue: number }
  loading: boolean
  search: string
  onSearch: (value: string) => void
  filters: { plan: string; status: string; userType: string }
  onFilterChange: (key: string, value: string) => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  onPageChange: (page: number) => void
  onViewDetails: (userId: string) => void
  onToggleSuspend: (userId: string, suspended: boolean) => void
  onDelete: (userId: string) => void
  onChangeType: (userId: string, type: 'STUDENT' | 'TEACHER') => void
  onCancelSubscription: (userId: string) => void
}

export default function UsersTable({
  users, pagination, summary, loading, search, onSearch,
  filters, onFilterChange, sortBy, sortOrder, onSort,
  onPageChange, onViewDetails,
  onToggleSuspend, onDelete, onChangeType, onCancelSubscription,
}: UsersTableProps) {
  const [showFilters, setShowFilters] = useState(false)

  const SortHeader = ({ column, label }: { column: string; label: string }) => (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
    >
      {label}
      {sortBy === column ? (
        sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
      )}
    </button>
  )

  const activeFilters = [filters.plan, filters.status, filters.userType].filter(Boolean).length

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Table header with search and filters */}
      <div className="p-4 border-b border-neutral-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            />
            {search && (
              <button
                onClick={() => onSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeFilters > 0
                ? 'bg-primary-50 text-primary-600 border border-primary-200'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilters > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filter chips */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap gap-2"
          >
            <select
              value={filters.plan}
              onChange={(e) => onFilterChange('plan', e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-neutral-200 bg-white outline-none focus:border-primary-400"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-neutral-200 bg-white outline-none focus:border-primary-400"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={filters.userType}
              onChange={(e) => onFilterChange('userType', e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-neutral-200 bg-white outline-none focus:border-primary-400"
            >
              <option value="">All Types</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
            {activeFilters > 0 && (
              <button
                onClick={() => {
                  onFilterChange('plan', '')
                  onFilterChange('status', '')
                  onFilterChange('userType', '')
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
              >
                Clear all
              </button>
            )}
          </motion.div>
        )}

        {/* Summary */}
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="font-medium text-neutral-600">{pagination.total} users</span>
          <span className="text-neutral-300">·</span>
          <span className="text-green-600">{summary.activeSubscriptions} subscribed</span>
          {summary.suspendedUsers > 0 && (
            <>
              <span className="text-neutral-300">·</span>
              <span className="text-red-500">{summary.suspendedUsers} suspended</span>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="py-3 px-4 text-left group">
                <SortHeader column="name" label="User" />
              </th>
              <th className="py-3 px-4 text-left hidden md:table-cell group">
                <SortHeader column="userType" label="Type" />
              </th>
              <th className="py-3 px-4 text-left hidden lg:table-cell group">
                <SortHeader column="plan" label="Plan" />
              </th>
              <th className="py-3 px-4 text-left hidden lg:table-cell group">
                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Usage</span>
              </th>
              <th className="py-3 px-4 text-left">
                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Status</span>
              </th>
              <th className="py-3 px-4 text-left hidden xl:table-cell group">
                <SortHeader column="createdAt" label="Joined" />
              </th>
              <th className="py-3 px-4 text-right">
                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-200 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-32 bg-neutral-200 rounded animate-pulse" />
                        <div className="h-2.5 w-48 bg-neutral-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-500">No users found</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Try adjusting your search or filters</p>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={index}
                  onViewDetails={onViewDetails}
                  onToggleSuspend={onToggleSuspend}
                  onDelete={onDelete}
                  onChangeType={onChangeType}
                  onCancelSubscription={onCancelSubscription}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              let pageNum: number
              if (pagination.totalPages <= 5) {
                pageNum = i + 1
              } else if (pagination.page <= 3) {
                pageNum = i + 1
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i
              } else {
                pageNum = pagination.page - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    pageNum === pagination.page
                      ? 'bg-primary-500 text-white'
                      : 'text-neutral-500 hover:bg-neutral-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
