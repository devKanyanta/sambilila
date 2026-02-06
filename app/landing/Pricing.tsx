'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiCheck, FiGlobe } from 'react-icons/fi'
import { Check } from 'lucide-react'
import { colors, theme, gradients } from '@/lib/theme'

// Mock currency function
const getPriceInfo = (priceUSD: number, period: string) => {
  const rate = 25 // ZMW to USD rate
  const priceZMW = priceUSD * rate
  return {
    displayPrice: priceUSD === 0 ? 'Free' : `ZMW ${Math.round(priceZMW)}`,
    originalPrice: priceUSD
  }
}

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      priceUSD: 0,
      period: "forever",
      description: "Perfect for getting started with basic learning",
      features: [
        "10 AI flashcard generations per month",
        "5 quiz generations per month",
        "Basic progress tracking",
        "Community support",
        "Mobile app access",
        "1GB storage"
      ],
      buttonText: "Get Started Free",
      highlighted: false
    },
    {
      name: "Pro",
      priceUSD: 4.99,
      period: "per month",
      description: "For serious learners & professionals",
      features: [
        "Unlimited flashcard generations",
        "100 quiz generations/month",
        "Advanced analytics dashboard",
        "Priority email support",
        "Custom study plans",
        "Export to PDF & Anki",
        "5GB storage",
        "Offline access"
      ],
      buttonText: "Start Pro Now",
      highlighted: true
    },
    {
      name: "Team",
      priceUSD: 49.99,
      period: "per year",
      description: "For classrooms and study groups",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Classroom management",
        "Bulk content creation",
        "Custom branding",
        "Dedicated support",
        "Admin dashboard",
        "Unlimited storage",
        "SSO integration"
      ],
      buttonText: "Get Team Access",
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-20">
      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.accent[50]} 100%)`
        }}
      >
        <div className="text-center mb-12 pt-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 border"
            style={{
              backgroundColor: colors.primary[50],
              color: colors.primary[700],
              borderColor: colors.primary[200]
            }}
          >
            Transparent Pricing
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 md:mb-6"
            style={{ color: theme.text.primary }}
          >
            Choose Your Learning Plan
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base md:text-lg lg:text-xl max-w-2xl lg:max-w-3xl mx-auto px-4 mb-6"
            style={{ color: theme.text.secondary }}
          >
            Flexible plans for every learner. Start free, upgrade anytime.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm border"
            style={{
              backgroundColor: colors.accent[50],
              color: colors.accent[700],
              borderColor: colors.accent[200]
            }}
          >
            <FiGlobe className="w-4 h-4 mr-2" />
            Prices shown in Zambian Kwacha (ZMW)
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto pb-12">
          {plans.map((plan, index) => {
            const priceInfo = getPriceInfo(plan.priceUSD, plan.period)
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index * 0.1, 0.2) }}
                whileHover={{ y: -8 }}
                className={`bg-white rounded-2xl p-6 relative ${
                  plan.highlighted ? 'scale-105 z-10' : ''
                }`}
                style={{
                  boxShadow: plan.highlighted ? theme.shadows.xl : theme.shadows.lg,
                  border: plan.highlighted ? `2px solid ${colors.primary[400]}` : `1px solid ${theme.borders.light}`
                }}
              >
                {plan.highlighted && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                  >
                    <span 
                      className="px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg"
                      style={{
                        background: gradients.primary,
                        color: theme.text.inverted,
                        boxShadow: theme.shadows.colored.primary
                      }}
                    >
                      Most Popular
                    </span>
                  </motion.div>
                )}
                
                <div className="mb-6">
                  <h3 
                    className="text-xl md:text-2xl font-bold mb-2"
                    style={{ color: theme.text.primary }}
                  >
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <div className="flex items-baseline">
                      <span 
                        className="text-3xl md:text-4xl lg:text-5xl font-bold"
                        style={{ color: theme.text.primary }}
                      >
                        {priceInfo.displayPrice}
                      </span>
                      {plan.priceUSD > 0 && (
                        <span 
                          className="ml-2 text-sm md:text-base"
                          style={{ color: colors.neutral[600] }}
                        >
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    {plan.priceUSD > 0 && (
                      <div 
                        className="text-xs md:text-sm mt-1"
                        style={{ color: colors.neutral[500] }}
                      >
                        ≈ ${plan.priceUSD} USD
                      </div>
                    )}
                  </div>
                  
                  <p 
                    className="text-sm md:text-base mb-6"
                    style={{ color: theme.text.secondary }}
                  >
                    {plan.description}
                  </p>
                </div>
                
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {plan.features.map((feature, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      className="flex items-start"
                    >
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5 mr-2" style={{ color: colors.primary[500] }} />
                      <span className="text-sm" style={{ color: colors.neutral[700] }}>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href="/auth/register" 
                    className={`w-full block text-center py-3 md:py-4 rounded-lg font-medium transition-all duration-300 ${
                      plan.highlighted ? 'hover:shadow-xl' : 'hover:shadow-lg'
                    }`}
                    style={{
                      background: plan.highlighted 
                        ? gradients.primary
                        : colors.neutral[900],
                      color: theme.text.inverted,
                      boxShadow: plan.highlighted 
                        ? theme.shadows.colored.primary
                        : theme.shadows.md
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = plan.highlighted 
                        ? theme.shadows.xl 
                        : theme.shadows.lg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = plan.highlighted 
                        ? theme.shadows.colored.primary
                        : theme.shadows.md;
                    }}
                  >
                    {plan.buttonText}
                  </Link>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto p-4 md:p-6 rounded-xl mb-12"
          style={{
            backgroundColor: colors.primary[50],
            border: `1px solid ${colors.primary[200]}`
          }}
        >
          <p className="text-sm md:text-base" style={{ color: colors.primary[800] }}>
            <strong>Local Pricing:</strong> Prices are converted from USD to Zambian Kwacha (ZMW) at current exchange rates. 
            All transactions are processed securely in your local currency.
          </p>
        </motion.div>
      </div>
    </section>
  )
}