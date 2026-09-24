'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Check, Globe, Smartphone, ShieldCheck } from 'lucide-react'

const points = [
  {
    icon: Check,
    title: 'Everything stays free',
    description: 'No paywalled features, no locked content. Every tool is available to every learner.',
  },
  {
    icon: Globe,
    title: 'Access for everyone',
    description: 'Donations fund server and AI costs so students anywhere can study without barriers.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero pressure',
    description: 'Giving is entirely optional. If you can\'t donate, studying is still 100% free.',
  },
]

export function Support() {
  return (
    <section id="support" className="bg-white py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-semibold mb-6">
              <Heart className="w-3.5 h-3.5" />
              Community-powered
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-fredoka font-bold text-neutral-900 tracking-tight leading-tight">
              Free for everyone,{' '}
              <span className="text-primary-500">funded by kindness</span>
            </h2>

            <p className="mt-5 text-lg text-neutral-500 leading-relaxed">
              Lernopia has no subscriptions or paywalls. Instead, it&apos;s supported
              by optional donations from people who believe education should be
              accessible to all.
            </p>

            <div className="mt-8 space-y-5">
              {points.map((point) => {
                const Icon = point.icon
                return (
                  <div key={point.title} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary-500" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">{point.title}</h3>
                      <p className="text-sm text-neutral-500 mt-0.5 leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/donate" className="btn-primary px-7 py-3.5 text-base rounded-xl">
                <Heart className="w-4 h-4" />
                Make a donation
              </Link>
              <Link href="/dashboard" className="btn-outline px-7 py-3.5 text-base rounded-xl">
                Just want to study?
              </Link>
            </div>
          </motion.div>

          {/* Visual card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="bg-secondary-800 rounded-3xl p-8 sm:p-10 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Support Lernopia</p>
                    <p className="text-white/50 text-xs">Keep learning free</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                  Optional
                </span>
              </div>

              {/* Amount chips */}
              <div className="grid grid-cols-4 gap-2.5 mb-6">
                {[2, 5, 10, 20].map((amount, i) => (
                  <div
                    key={amount}
                    className={`rounded-xl py-3 text-center text-sm font-semibold border ${
                      i === 2
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/70'
                    }`}
                  >
                    ${amount}
                  </div>
                ))}
              </div>

              {/* Fake CTA */}
              <div className="h-12 rounded-xl bg-white flex items-center justify-center gap-2 text-sm font-semibold text-neutral-900 mb-6">
                <Smartphone className="w-4 h-4 text-primary-500" />
                Mobile money or PayPal
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white font-fredoka">100%</p>
                  <p className="text-xs text-white/50">Free to use</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-fredoka">0</p>
                  <p className="text-xs text-white/50">Paywalls</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-fredoka">∞</p>
                  <p className="text-xs text-white/50">Learning</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
