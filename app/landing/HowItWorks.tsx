'use client'

import { motion } from 'framer-motion'
import { FiUpload, FiCpu, FiTarget, FiEye } from 'react-icons/fi'
import { colors, theme, gradients } from '@/lib/theme'

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Content",
      description: "Paste notes, upload documents, or import from your favorite apps",
      icon: <FiUpload className="w-6 h-6 md:w-8 md:h-8" />,
      color: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[400]} 100%)`
    },
    {
      number: "02",
      title: "AI Generates Materials",
      description: "Our AI creates optimized flashcards and quizzes instantly",
      icon: <FiCpu className="w-6 h-6 md:w-8 md:h-8" />,
      color: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[400]} 100%)`
    },
    {
      number: "03",
      title: "Smart Study Sessions",
      description: "Learn with adaptive algorithms that optimize for retention",
      icon: <FiTarget className="w-6 h-6 md:w-8 md:h-8" />,
      color: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[400]} 100%)`
    },
    {
      number: "04",
      title: "Track & Improve",
      description: "Monitor progress and get personalized recommendations",
      icon: <FiEye className="w-6 h-6 md:w-8 md:h-8" />,
      color: `linear-gradient(135deg, ${colors.warning[500]} 0%, ${colors.warning[400]} 100%)`
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 border"
            style={{
              backgroundColor: colors.accent[50],
              color: colors.accent[700],
              borderColor: colors.accent[200]
            }}
          >
            <FiUpload className="w-4 h-4 mr-2" />
            Simple Process
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 md:mb-6"
            style={{ color: theme.text.primary }}
          >
            Start Learning in Minutes
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base md:text-lg lg:text-xl max-w-2xl lg:max-w-3xl mx-auto px-4"
            style={{ color: theme.text.secondary }}
          >
            Four simple steps to transform your learning experience
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">
          {/* Connecting lines for desktop */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="hidden lg:block absolute top-12 md:top-24 left-1/4 right-1/4 h-0.5 -translate-y-1/2 origin-left"
            style={{ background: `linear-gradient(to right, ${colors.accent[200]} 0%, ${colors.primary[200]} 50%, ${colors.secondary[200]} 100%)` }}
          />
          
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.1, 0.3) }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="relative inline-block mb-4 md:mb-6"
                >
                  <div className="absolute inset-0 rounded-xl md:rounded-2xl blur-lg opacity-50" style={{ background: step.color }} />
                  <div 
                    className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl text-white flex items-center justify-center text-lg md:text-xl lg:text-2xl font-bold"
                    style={{ background: step.color }}
                  >
                    {step.icon}
                  </div>
                </motion.div>
                <div 
                  className="text-xs md:text-sm font-semibold mb-2"
                  style={{ color: colors.neutral[500] }}
                >
                  STEP {step.number}
                </div>
                <h3 
                  className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4"
                  style={{ color: theme.text.primary }}
                >
                  {step.title}
                </h3>
                <p 
                  className="text-sm md:text-base px-2"
                  style={{ color: theme.text.secondary }}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300"
            style={{
              background: gradients.primary,
              boxShadow: theme.shadows.colored.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme.shadows.xl;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = theme.shadows.colored.primary;
            }}
          >
            Explore Now!
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}