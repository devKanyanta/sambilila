'use client'

import { motion } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'
import { fadeSlideUp, progressBar } from '../animations'

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
  daysActiveLast30: number
}

export default function StreakCard({
  currentStreak,
  longestStreak,
  daysActiveLast30,
}: StreakCardProps) {
  const streakPercent = Math.min((daysActiveLast30 / 30) * 100, 100)

  return (
    <motion.div
      variants={fadeSlideUp}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-start gap-4">
        {/* Fire icon */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-[#ff5252]/10 flex items-center justify-center">
            <Flame className="w-7 h-7 text-orange-500" strokeWidth={2.5} />
          </div>
          {currentStreak > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff5252] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">⚡</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-heading font-semibold text-lg text-neutral-800">
              {currentStreak > 0 ? `${currentStreak}-day Streak` : 'No active streak'}
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mb-3">
            {currentStreak > 0
              ? `You've studied ${currentStreak} days in a row! Keep it up!`
              : 'Start studying to build your streak'}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Active this month</span>
              <span className="font-heading font-semibold text-neutral-800">
                {daysActiveLast30} / 30 days
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={progressBar}
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#ff5252]"
                style={{ transformOrigin: 'left', width: `${streakPercent}%` }}
              />
            </div>
          </div>

          {/* Longest streak */}
          {longestStreak > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span>
                  Best streak:{' '}
                  <span className="font-heading font-semibold text-neutral-800">
                    {longestStreak} days
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
