'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      {/* Top bar */}
      <div className="px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-800 hover:border-neutral-300 transition-all text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 relative">
                <Image
                  src="/logo.png"
                  alt="Lernopia"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-heading font-semibold text-xl text-neutral-800">Lernopia</span>
            </Link>
          </motion.div>

          {/* Auth card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm"
          >
            {children}
          </motion.div>

          {/* Footer */}
          <p className="text-center text-xs text-neutral-400 mt-6">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-neutral-600 hover:text-[#ff5252] transition-colors">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-neutral-600 hover:text-[#ff5252] transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
