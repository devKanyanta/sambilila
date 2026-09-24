'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from './landing/Header'
import { Hero } from './landing/Hero'
import { HowItWorks } from './landing/HowItWorks'
import { Support } from './landing/Support'
import { FAQ } from './landing/FAQ'
import { Footer } from './landing/Footer'
import { FiArrowUp, FiBookOpen, FiZap, FiBarChart2 } from 'react-icons/fi'
import Link from 'next/link'
import { Testimonials } from './landing/Testimonials'

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
    <div className="min-h-screen bg-white overflow-x-hidden landing-page">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* How It Works */}
      <HowItWorks />

      {/* Features Section */}
      <section id="features" className="bg-white py-16 md:py-24 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-semibold mb-5">
              <FiZap className="w-4 h-4 mr-2" />
              AI-Powered Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-fredoka font-bold text-neutral-900 tracking-tight mb-4">
              Smart learning tools
            </h2>
            <p className="text-base md:text-lg text-neutral-500 max-w-2xl mx-auto">
              Everything you need to study effectively — free, no sign-up required
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
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-500 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-fredoka font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support (replaces Pricing) */}
      <Support />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA */}
      <section className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-secondary-800 rounded-3xl px-6 py-14 sm:px-12 shadow-xl"
          >
            <h2 className="text-3xl sm:text-4xl font-fredoka font-bold text-white mb-4">
              Ready to start learning?
            </h2>
            <p className="text-base text-neutral-300 mb-8 max-w-lg mx-auto">
              Jump straight in — your first quiz is 60 seconds away.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-secondary-900 bg-white hover:bg-neutral-100 transition-all duration-200"
              >
                Start studying free
              </Link>
              <Link
                href="/donate"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all duration-200"
              >
                Support the project
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
        className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary-800 text-white shadow-lg flex items-center justify-center hover:bg-secondary-700 hover:shadow-xl transition-all duration-200"
        aria-label="Scroll to top"
      >
        <FiArrowUp className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>
    </div>
  )
}
