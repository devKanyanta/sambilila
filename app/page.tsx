'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from './landing/Header'
import { Hero } from './landing/Hero'
import { HowItWorks } from './landing/HowItWorks'
import { Pricing } from './landing/Pricing'
import { FAQ } from './landing/FAQ'
import { Footer } from './landing/Footer'
import { FiArrowUp, FiGlobe } from 'react-icons/fi'

// Mock currency hook - replace with your actual hook
const useCurrency = () => {
  return {
    getPriceInfo: (priceUSD: number, period: string) => {
      const rate = 25 // ZMW to USD rate
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
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-50 to-cyan-50 rounded-full blur-3xl opacity-30" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Currency indicator */}
      {!isLoading && isZambian && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border text-sm bg-white/90 border-gray-200 text-gray-700 md:right-8"
        >
          <FiGlobe className="w-4 h-4" />
          <span>Prices in ZMW</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">
            Zambia
          </span>
        </motion.div>
      )}

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* How It Works */}
      <HowItWorks />

      {/* Features Section - You'll need to create this component too */}
      <section id="features" className="py-12 md:py-16 lg:py-24 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-medium mb-4 border border-emerald-100">
              AI-Powered Features
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              Smart Learning Tools
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl lg:max-w-3xl mx-auto px-4">
              Experience the future of education with our intelligent learning platform
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* Testimonials Section - You'll need to create this component */}
      <section id="testimonials" className="py-12 md:py-16 lg:py-24 px-4 md:px-8 lg:px-12">
        {/* Testimonials content here */}
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA - You'll need to create this component */}
      <section className="relative py-16 md:py-20 lg:py-24 px-4 md:px-8 lg:px-12 overflow-hidden">
        {/* Final CTA content here */}
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
        className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-300"
        aria-label="Scroll to top"
      >
        <FiArrowUp className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>
    </div>
  )
}