'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from './landing/Header'
import { Hero } from './landing/Hero'
import { HowItWorks } from './landing/HowItWorks'
import { Pricing } from './landing/Pricing'
import { FAQ } from './landing/FAQ'
import { Footer } from './landing/Footer'
import { FiArrowUp, FiBookOpen, FiZap, FiBarChart2 } from 'react-icons/fi'
import Link from 'next/link'
import { Testimonials } from './landing/Testimonials'

// Mock currency hook
const useCurrency = () => {
  return {
    getPriceInfo: (priceUSD: number, period: string) => {
      const rate = 25
      const priceZMW = priceUSD * rate
      return {
        displayPrice: priceUSD === 0 ? 'Free' : `ZMW ${Math.round(priceZMW)}`,
        originalPrice: priceUSD
      }
    },
    currency: 'ZMW',
    isLoading: false,
    isZambian: true
  }
}

const features = [
  {
    icon: <FiBookOpen className="w-6 h-6" />,
    title: "AI Flashcards",
    description: "Generate flashcards from any content instantly with our AI"
  },
  {
    icon: <FiZap className="w-6 h-6" />,
    title: "Smart Quizzes",
    description: "Create adaptive quizzes that match your learning pace"
  },
  {
    icon: <FiBarChart2 className="w-6 h-6" />,
    title: "Track Progress",
    description: "Monitor your improvement with detailed analytics"
  }
]

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { isLoading, isZambian } = useCurrency()

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#ececec] overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* How It Works */}
      <HowItWorks />

      {/* Features Section */}
      <section id="features" className="bg-[#ececec] py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-neutral-200 text-neutral-600 text-sm font-medium mb-5">
              <FiZap className="w-4 h-4 mr-2 text-[#ff5252]" />
              AI-Powered Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold text-neutral-800 mb-4">
              Smart Learning Tools
            </h2>
            <p className="text-base md:text-lg text-neutral-500 max-w-2xl mx-auto">
              Experience the future of education with our intelligent learning platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200 shadow-sm text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#ff5252]/10 flex items-center justify-center text-[#ff5252] mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-heading font-semibold text-neutral-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA */}
      <section className="bg-[#ececec] py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-neutral-800 mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-base text-neutral-500 mb-8 max-w-lg mx-auto">
              Join Lernopia today and transform the way you learn with AI-powered tools.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/register"
                className="px-8 py-3 rounded-xl text-sm font-semibold text-white bg-[#ff5252] hover:bg-[#fc0b06] hover:shadow-lg transition-all duration-200"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 rounded-xl text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 hover:border-neutral-300 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.5
        }}
        onClick={scrollToTop}
        className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#193827] text-white shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Scroll to top"
      >
        <FiArrowUp className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>
    </div>
  )
}
