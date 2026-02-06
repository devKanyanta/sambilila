'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { colors, theme, gradients } from '@/lib/theme'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50"
      style={{ 
        backgroundColor: theme.backgrounds.navbar,
        borderBottom: `1px solid ${theme.borders.light}`,
        boxShadow: theme.shadows.sm
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 relative">
              <Image
                src="/logo.png"
                alt="Lernopia Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <style jsx>{`
              @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
              
              .name {
                font-family: "Fredoka";
                font-optical-sizing: auto;
                font-weight: 700;
                font-size: 1.4rem;
                font-style: normal;
                letter-spacing: 0.055em;
                font-variation-settings: "wdth" 100;
                background: ${gradients.primary};
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
              
              .tagline {
                font-family: 'Fredoka';
                font-weight: 500;
                font-size: 0.75rem;
                letter-spacing: 0.05em;
                margin-top: -0.25rem;
                color: ${colors.primary[600]};
              }
            `}</style>
            <div>
              <div className="font-bold text-xl name">LERNOPIA</div>
              <div className="text-xs tagline">Learn. Share. Create.</div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link 
                href="#features" 
                className="transition-colors"
                style={{
                  color: theme.text.secondary,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.text.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
              >
                Features
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link 
                href="#pricing" 
                className="transition-colors"
                style={{
                  color: theme.text.secondary,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.text.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
              >
                Pricing
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link 
                href="#testimonials" 
                className="transition-colors"
                style={{
                  color: theme.text.secondary,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.text.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
              >
                Testimonials
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link 
                href="#faq" 
                className="transition-colors"
                style={{
                  color: theme.text.secondary,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.text.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
              >
                FAQ
              </Link>
            </motion.div>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              style={{ borderRadius: '0.5rem' }}
            >
              <Link 
                href="/auth/login" 
                className="px-4 py-2 rounded-lg transition-all"
                style={{
                  color: theme.text.secondary,
                  border: `1px solid ${theme.borders.medium}`,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primary[600];
                  e.currentTarget.style.borderColor = colors.primary[400];
                  e.currentTarget.style.backgroundColor = colors.primary[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.secondary;
                  e.currentTarget.style.borderColor = theme.borders.medium;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Login
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/auth/register" 
                className="px-4 py-2 rounded-lg transition-all"
                style={{
                  background: gradients.primary,
                  color: theme.text.inverted,
                  boxShadow: theme.shadows.colored.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadows.lg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadows.colored.primary;
                }}
              >
                Get Started
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: theme.text.secondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primary[600];
              e.currentTarget.style.backgroundColor = colors.primary[50];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.text.secondary;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 pt-4 pb-4"
            style={{ 
              borderTop: `1px solid ${theme.borders.light}`,
              backgroundColor: theme.backgrounds.card
            }}
          >
            <div className="space-y-3">
              <Link 
                href="#features" 
                className="block py-2 px-4 rounded-lg transition-colors"
                style={{ color: theme.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primary[600];
                  e.currentTarget.style.backgroundColor = colors.primary[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.secondary;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Features
              </Link>
              <Link 
                href="#pricing" 
                className="block py-2 px-4 rounded-lg transition-colors"
                style={{ color: theme.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primary[600];
                  e.currentTarget.style.backgroundColor = colors.primary[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.secondary;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Pricing
              </Link>
              <Link 
                href="#testimonials" 
                className="block py-2 px-4 rounded-lg transition-colors"
                style={{ color: theme.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primary[600];
                  e.currentTarget.style.backgroundColor = colors.primary[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.secondary;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Testimonials
              </Link>
              <Link 
                href="#faq" 
                className="block py-2 px-4 rounded-lg transition-colors"
                style={{ color: theme.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primary[600];
                  e.currentTarget.style.backgroundColor = colors.primary[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.secondary;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                FAQ
              </Link>
              <div 
                className="pt-2 space-y-2"
                style={{ borderTop: `1px solid ${theme.borders.light}` }}
              >
                <Link 
                  href="/auth/login" 
                  className="block py-2 px-4 rounded-lg transition-colors"
                  style={{ color: theme.text.secondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.primary[600];
                    e.currentTarget.style.backgroundColor = colors.primary[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.text.secondary;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block py-2 px-4 rounded-lg text-center transition-all"
                  style={{
                    background: gradients.primary,
                    color: theme.text.inverted,
                    boxShadow: theme.shadows.colored.primary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = theme.shadows.md;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = theme.shadows.colored.primary;
                  }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}