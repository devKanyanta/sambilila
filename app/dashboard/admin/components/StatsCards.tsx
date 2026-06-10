// app/dashboard/admin/components/StatsCards.tsx
'use client'

import { motion } from 'framer-motion'
import { Users, CreditCard, DollarSign, AlertTriangle } from 'lucide-react'
import { containerStagger, statCardItem } from '@/app/dashboard/animations'
import type { AdminStats } from '../types/admin'

interface StatsCardsProps {
  stats: AdminStats['summary']
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      icon: Users,
      value: stats.totalUsers.toLocaleString(),
      label: 'Total Users',
      sublabel: `${stats.usersJoinedThisMonth} this month`,
      color: '#193827',
      bg: 'bg-[#193827]/5',
      iconBg: '#1938271a',
    },
    {
      icon: CreditCard,
      value: stats.activeSubscriptions.toLocaleString(),
      label: 'Active Subscriptions',
      sublabel: `${((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}% conversion`,
      color: '#2d6b4d',
      bg: 'bg-[#2d6b4d]/5',
      iconBg: '#2d6b4d1a',
    },
    {
      icon: DollarSign,
      value: `$${stats.mrrUSD.toFixed(2)}`,
      label: 'Monthly Recurring Revenue',
      sublabel: `Total: $${stats.totalRevenueUSD.toFixed(2)}`,
      color: '#ff5252',
      bg: 'bg-[#ff5252]/5',
      iconBg: '#ff52521a',
    },
    {
      icon: AlertTriangle,
      value: stats.suspendedUsers.toLocaleString(),
      label: 'Suspended Users',
      sublabel: `${((stats.suspendedUsers / stats.totalUsers) * 100).toFixed(1)}% of users`,
      color: '#dc2626',
      bg: 'bg-[#dc2626]/5',
      iconBg: '#dc26261a',
    },
  ]

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.label}
            variants={statCardItem}
            className={`${card.bg} rounded-xl p-4 shadow-sm`}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm"
                style={{ backgroundColor: card.iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <span className="text-2xl font-heading font-semibold text-neutral-800">
                {card.value}
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">{card.label}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{card.sublabel}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
