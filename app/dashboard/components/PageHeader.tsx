'use client'

import { motion } from 'framer-motion'
import { fadeSlideDown } from '../animations'
import { ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  icon?: LucideIcon
}

export default function PageHeader({ title, subtitle, action, icon: Icon }: PageHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeSlideDown}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, mass: 0.6 }}
            className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"
          >
            <Icon className="w-5 h-5 text-primary-600" />
          </motion.div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-neutral-800">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
