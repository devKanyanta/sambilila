'use client'

import Link from "next/link"
import { colors, gradients, theme } from '@/lib/theme'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiChevronRight, 
  FiCheck, 
  FiStar, 
  FiMenu, 
  FiX,
  FiArrowUp,
  FiSmartphone,
  FiTrendingUp,
  FiGlobe
} from 'react-icons/fi'
import { useCurrency } from './hooks/useCurrency'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { getPriceInfo, currency, isLoading, isZambian } = useCurrency()

  // Theme-based styles
  const styles = {
    background: {
      main: theme.backgrounds.main,
      card: theme.backgrounds.card,
      sidebar: theme.backgrounds.sidebar,
      navbar: theme.backgrounds.navbar,
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      light: theme.text.light,
      inverted: theme.text.inverted,
      accent: theme.text.accent,
      dark: theme.text.light,
    },
    border: {
      light: theme.borders.light,
      medium: theme.borders.medium,
      dark: theme.borders.dark,
      accent: theme.borders.accent,
    },
    shadow: theme.shadows,
  }

  // Mouse move effect for background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  // Pricing plans data with USD base prices
  const pricingPlans = [
    {
      name: "Free",
      priceUSD: 0,
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "10 flashcard generations",
        "10 quiz generations",
        "Basic progress tracking",
        "Community support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      priceUSD: 4.99,
      period: "per month",
      description: "Most popular for serious learners",
      features: [
        "500 flashcards",
        "500 quiz generations",
        "Advanced analytics",
        "Priority support",
        "Custom study plans"
      ],
      cta: "Start Pro Now",
      popular: true
    },
    {
      name: "Premium",
      priceUSD: 49.99,
      period: "per year",
      description: "For classrooms and study groups",
      features: [
        "Unlimited flashcards",
        "Unlimited quiz generations",
        "Advanced analytics",
        "Priority support",
        "Export capabilities",
        "Custom study plans"
      ],
      cta: "Start Yearly Now",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: styles.background.main }}>
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, ${colors.primary[50]}15, transparent 80%)`
          }}
        />
      </div>

      {/* Currency indicator */}
      {!isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border text-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: styles.border.light,
            color: styles.text.primary
          }}
        >
          <FiGlobe className="w-4 h-4" />
          <span>Prices in {currency}</span>
          {isZambian && (
            <span className="px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: colors.primary[50],
                color: colors.primary[700]
              }}
            >
              Zambia
            </span>
          )}
        </motion.div>
      )}

      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.5
        }}
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
        style={{
          background: gradients.primary,
          color: styles.text.inverted
        }}
      >
        <FiArrowUp className="w-5 h-5" />
      </motion.button>

      {/* Navigation - Same as before */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-16 flex items-center justify-between px-4 md:px-6 border-b sticky top-0 z-40 backdrop-blur-md"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: styles.border.light,
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ 
              backgroundColor: colors.primary[400],
              color: styles.text.inverted
            }}
          >
            <span className="font-bold text-sm">S</span>
          </motion.div>
          <span className="text-xl font-bold hidden sm:block"
            style={{ 
              background: gradients.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Sambilila
          </span>
        </div>
        
        {/* Mobile menu button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg"
          style={{ color: styles.text.primary }}
        >
          {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link 
            href="/auth/login" 
            className="px-4 py-2 transition-all duration-300 rounded-lg"
            style={{ color: styles.text.secondary }}
          >
            Sign In
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/auth/register" 
              className="px-6 py-2 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
              style={{ 
                background: gradients.primary,
                boxShadow: styles.shadow.sm
              }}
            >
              Get Started
              <FiChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile Navigation Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? 'auto' : 0
          }}
          className="absolute top-16 left-0 right-0 md:hidden overflow-hidden"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${styles.border.light}`
          }}
        >
          <div className="p-4 space-y-4">
            <Link 
              href="/auth/login" 
              className="block py-3 px-4 rounded-lg transition-colors text-center"
              style={{ 
                color: styles.text.primary,
                border: `1px solid ${styles.border.light}`
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="block py-3 px-4 rounded-lg text-white text-center transition-all"
              style={{ 
                background: gradients.primary,
                boxShadow: styles.shadow.sm
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero Section - Same as before */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse"
            style={{ 
              backgroundColor: colors.primary[50],
              color: colors.primary[700],
              border: `1px solid ${colors.primary[200]}`
            }}
          >
            <FiTrendingUp className="w-4 h-4 mr-2" />
            Trusted by 10,000+ students worldwide
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ color: styles.text.primary }}
          >
            Master Any Subject with
            <span className="block mt-2" 
              style={{ 
                background: gradients.primary,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Sambilila
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto px-4"
            style={{ color: styles.text.secondary }}
          >
            Transform your study sessions with intelligent flashcards, personalized quizzes, 
            and progress tracking. Study smarter, not harder with our AI-driven platform.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link 
                href="/auth/register" 
                className="px-8 py-4 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 text-lg flex items-center justify-center gap-2 w-full"
                style={{ 
                  background: gradients.primary,
                  boxShadow: styles.shadow.md
                }}
              >
                Start Learning Free
                <FiChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats - Improved for mobile */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8 max-w-3xl mx-auto px-4"
          >
            {[
              { number: "50K+", label: "Flashcards Created", icon: "🎴" },
              { number: "15K+", label: "Quizzes Generated", icon: "🧩" },
              { number: "95%", label: "User Satisfaction", icon: "⭐" },
              { number: "2.5x", label: "Faster Learning", icon: "⚡" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-xl backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  border: `1px solid ${styles.border.light}`
                }}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: styles.text.primary }}>
                  {stat.number}
                </div>
                <div className="text-sm md:text-base" style={{ color: styles.text.secondary }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Same as before */}
      <section style={{ backgroundColor: styles.background.card }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: styles.text.primary }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto px-4" style={{ color: styles.text.secondary }}>
              Powerful AI tools designed to accelerate your learning and boost retention
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🎴",
                title: "AI Flashcard Generator",
                description: "Convert notes, textbooks, or any content into optimized flashcards instantly.",
                features: ["Smart content parsing", "Spaced repetition", "Multi-format support"]
              },
              {
                icon: "🧩",
                title: "Smart Quiz Generator",
                description: "Generate custom quizzes with multiple question types for exam preparation.",
                features: ["Multiple choice", "True/False questions", "Short answer format"]
              },
              {
                icon: "📊",
                title: "Progress Analytics",
                description: "Track your learning journey with detailed insights and recommendations.",
                features: ["Performance metrics", "Study patterns", "Weakness identification"]
              },
              {
                icon: "⏱️",
                title: "Study Sessions",
                description: "Timed study sessions with focus mode to maximize concentration.",
                features: ["Pomodoro timer", "Focus mode", "Session history"]
              },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  boxShadow: `0 20px 40px ${colors.primary[100]}40`
                }}
                className="rounded-2xl p-6 transition-all duration-300 border group cursor-pointer"
                style={{ 
                  backgroundColor: colors.neutral[50],
                  borderColor: styles.border.light,
                  boxShadow: styles.shadow.sm
                }}
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: styles.text.primary }}>
                  {feature.title}
                </h3>
                <p className="mb-4 text-sm md:text-base" style={{ color: styles.text.secondary }}>
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center text-sm md:text-base"
                      style={{ color: styles.text.secondary }}
                    >
                      <FiCheck className="w-4 h-4 mr-2 flex-shrink-0" 
                        style={{ color: colors.primary[400] }}
                      />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Same as before */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-20 text-white relative overflow-hidden"
        style={{ background: gradients.primary }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Sambilila Works</h2>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Get started in minutes and transform your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up & Choose Plan",
                description: "Create your account and select the perfect plan"
              },
              {
                step: "02",
                title: "Upload Your Materials",
                description: "Paste notes or upload documents to study"
              },
              {
                step: "03",
                title: "AI Generates Content",
                description: "AI creates flashcards and quizzes instantly"
              },
              {
                step: "04",
                title: "Study & Track Progress",
                description: "Learn with smart tools and monitor improvement"
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center relative"
              >
                <div className="relative inline-block mb-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold relative z-10"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    {step.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 left-full w-8 h-0.5 transform -translate-y-1/2"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                    />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="opacity-90 text-sm md:text-base">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section - UPDATED for Zambian Kwacha */}
      <section style={{ backgroundColor: styles.background.card }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: styles.text.primary }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: styles.text.secondary }}>
              Choose the plan that works best for you
              {!isLoading && isZambian && (
                <span className="block text-sm mt-2 px-3 py-1 rounded-full inline-block"
                  style={{
                    backgroundColor: colors.primary[50],
                    color: colors.primary[700]
                  }}
                >
                  Prices displayed in Zambian Kwacha
                </span>
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => {
              const priceInfo = getPriceInfo(plan.priceUSD, plan.period)
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`rounded-2xl p-6 md:p-8 border-2 relative ${
                    plan.popular ? 'lg:scale-105 lg:z-10' : ''
                  }`}
                  style={plan.popular ? 
                    { 
                      borderColor: colors.primary[400],
                      backgroundColor: colors.primary[50],
                      boxShadow: styles.shadow.lg
                    } :
                    { 
                      borderColor: styles.border.light,
                      backgroundColor: styles.background.card,
                      boxShadow: styles.shadow.sm
                    }
                  }
                >
                  {plan.popular && (
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    >
                      <span 
                        className="px-4 py-1 rounded-full text-sm font-medium text-white shadow-lg"
                        style={{ background: gradients.primary }}
                      >
                        Most Popular
                      </span>
                    </motion.div>
                  )}
                  <h3 className="text-2xl font-bold mb-2" style={{ color: styles.text.primary }}>
                    {plan.name}
                  </h3>
                  <div className="mb-4 flex items-baseline">
                    <span className="text-4xl font-bold" style={{ color: styles.text.primary }}>
                      {priceInfo.displayPrice}
                    </span>
                    <span className="ml-2" style={{ color: styles.text.secondary }}>
                      {plan.period}
                    </span>
                  </div>
                  {/* {isZambian && plan.priceUSD > 0 && (
                    <div className="mb-2 text-sm" style={{ color: styles.text.secondary }}>
                      <span>Approx. ${plan.priceUSD}</span>
                    </div>
                  )} */}
                  <p className="mb-6 text-sm md:text-base" style={{ color: styles.text.secondary }}>
                    {plan.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center text-sm md:text-base"
                        style={{ color: styles.text.primary }}
                      >
                        <FiCheck className="w-5 h-5 mr-3 flex-shrink-0" 
                          style={{ color: colors.primary[400] }}
                        />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      href="/auth/register" 
                      className={`w-full block text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        plan.popular ? 'hover:shadow-lg' : ''
                      }`}
                      style={plan.popular ? 
                        { 
                          background: gradients.primary,
                          color: styles.text.inverted,
                          boxShadow: styles.shadow.md
                        } :
                        { 
                          backgroundColor: colors.neutral[800],
                          color: styles.text.inverted,
                          boxShadow: styles.shadow.sm
                        }
                      }
                    >
                      {plan.cta}
                    </Link>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
          
          {/* Currency note */}
          {!isLoading && isZambian && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center text-sm p-4 rounded-lg max-w-2xl mx-auto"
              style={{
                backgroundColor: colors.primary[50],
                color: colors.primary[700],
                border: `1px solid ${colors.primary[200]}`
              }}
            >
              <p>
                💡 <strong>Note for Zambian users:</strong> Prices are converted from USD to Zambian Kwacha (ZMW) at current exchange rates. 
                All transactions are processed securely in your local currency.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials - Same as before */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ backgroundColor: colors.neutral[50] }} 
        className="py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: styles.text.primary }}>
              Loved by Students & Teachers
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: styles.text.secondary }}>
              See what our community has to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Chipo Mulenga",
                role: "Medical Student, University of Zambia",
                text: "Sambilila cut my study time in half. The AI-generated flashcards save me hours of manual work.",
                rating: 5
              },
              {
                name: "Dr. Patrick Mwale",
                role: "University Lecturer, Copperbelt University",
                text: "Perfect for creating practice quizzes for my students. The platform understands complex concepts remarkably well.",
                rating: 5
              },
              {
                name: "Brian Tembo",
                role: "Language Learner, Lusaka",
                text: "The spaced repetition and quiz features greatly improved my vocabulary retention, especially while learning French and Bemba.",
                rating: 5
              }

            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-xl p-6 shadow-sm border"
                style={{ 
                  backgroundColor: styles.background.card,
                  borderColor: styles.border.light,
                  boxShadow: styles.shadow.sm
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 shadow-md"
                    style={{ background: gradients.primary }}
                  >
                    <span className="text-white">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: styles.text.primary }}>
                      {testimonial.name}
                    </h4>
                    <p className="text-sm" style={{ color: styles.text.secondary }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 fill-current mr-1" 
                      style={{ color: colors.primary[400] }}
                    />
                  ))}
                </div>
                <p className="italic text-sm md:text-base" style={{ color: styles.text.secondary }}>
                  "{testimonial.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section - Same as before */}
      <section style={{ backgroundColor: styles.background.card }} className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: styles.text.primary }}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg md:text-xl" style={{ color: styles.text.secondary }}>
              Everything you need to know about Sambilila
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How does the AI generate flashcards and quizzes?",
                answer: "Our AI analyzes your input text, identifies key concepts and relationships, and creates optimized learning materials using natural language processing and educational best practices."
              },
              {
                question: "Can I use Sambilila for any subject?",
                answer: "Absolutely! Sambilila works with any academic subject, professional certification, language learning, or personal interest topic."
              },
              {
                question: "Is my data secure and private?",
                answer: "Yes, we take data privacy seriously. All your study materials are encrypted and we never share your personal information."
              },
              {
                question: "What payment methods do you accept in Zambia?",
                answer: "We accept local Zambian payment methods including mobile money (MTN, Airtel, Zamtel), bank transfers, and major credit/debit cards."
              },
            ].map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-xl p-6 transition-all duration-300"
                style={{ 
                  borderColor: styles.border.light,
                  backgroundColor: 'transparent'
                }}
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center justify-between cursor-pointer"
                  style={{ color: styles.text.primary }}
                >
                  <span>{faq.question}</span>
                  <FiChevronRight className="w-5 h-5 transform transition-transform" />
                </h3>
                <p className="text-sm md:text-base" style={{ color: styles.text.secondary }}>
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: gradients.primary }}
      >
        <div className="absolute inset-0 bg-black/5" />
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: colors.neutral[200] }}>
            Join thousands of students and teachers already accelerating their learning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/auth/register" 
                className="px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 text-lg block"
                style={{ 
                  backgroundColor: styles.background.card,
                  color: colors.primary[400],
                  boxShadow: styles.shadow.md
                }}
              >
                Start Free Today
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer - Same as before */}
      <footer className="py-12" style={{ backgroundColor: colors.primary[900] }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: colors.primary[400],
                    color: styles.text.inverted
                  }}
                >
                  <span className="font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-white">Sambilila</span>
              </div>
              <p className="text-sm md:text-base" style={{ color: colors.neutral[400] }}>
                AI-powered learning platform helping students and teachers achieve more.
              </p>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="border-t mt-8 pt-8 text-center"
            style={{ borderColor: colors.primary[600] }}
          >
            <p className="text-sm md:text-base" style={{ color: colors.neutral[400] }}>
              &copy; 2025 Sambilila. All rights reserved.
            </p>
            <p className="text-sm mt-2" style={{ color: colors.neutral[500] }}>
              Available worldwide • Local pricing for Zambian users
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}