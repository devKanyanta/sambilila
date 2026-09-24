'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiGlobe, FiGithub, FiMail } from 'react-icons/fi'

const footerLinks = [
  { href: '/dashboard', label: 'Start studying' },
  { href: '/donate', label: 'Donate' },
  { href: '/contact', label: 'Contact' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

export function Footer() {
  return (
    <footer className="bg-secondary-900 border-t border-white/5 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-10">
          {/* Brand section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.png"
                  alt="Lernopia"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-fredoka font-semibold text-white">Lernopia</span>
            </div>
            <p className="text-neutral-400 mb-6 max-w-sm text-sm leading-relaxed">
              Free AI-powered learning for everyone. No accounts required, no paywalls —
              just smarter studying, funded by the community.
            </p>
            <div className="flex justify-center md:justify-start gap-2.5">
              <a
                href="https://github.com/devKanyanta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all text-sm"
              >
                <FiGithub className="w-4 h-4" />
                @devKanyanta
              </a>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
              >
                <FiMail className="w-4 h-4" />
                Support us
              </Link>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-x-12 gap-y-3"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-xs text-center md:text-left">
              &copy; 2026 Lernopia AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                Made with care
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <FiGlobe className="w-3 h-3" />
                Available worldwide — local support in Zambia
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
