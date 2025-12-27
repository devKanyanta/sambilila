'use client'

import { ReactNode, useState } from "react"
import Link from "next/link"
import { colors, gradients, theme } from '@/lib/theme'

// Themed SVG Icons Component
const Icon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  const icons = {
    menu: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    close: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    dashboard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    flashcard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    quiz: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    profile: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    home: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    upgrade: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    book: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    lightbulb: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  }
  return icons[name as keyof typeof icons] || null
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/dashboard/flashcards", icon: "flashcard", label: "Flashcards" },
    { href: "/dashboard/quiz", icon: "quiz", label: "Quiz Generator" },
    { href: "/dashboard/profile", icon: "profile", label: "Profile" },
  ]

  const mobileNavItems = [
    { href: "/dashboard", icon: "dashboard", label: "Home" },
    { href: "/dashboard/flashcards", icon: "flashcard", label: "Cards" },
    { href: "/dashboard/quiz", icon: "quiz", label: "Quiz" },
    { href: "/dashboard/profile", icon: "profile", label: "Me" },
  ]

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.backgrounds.main }}
    >
      {/* Navbar */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm"
        style={{ 
          backgroundColor: theme.backgrounds.navbar + 'f5',
          borderColor: theme.borders.light,
          boxShadow: theme.shadows.sm
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ color: theme.text.primary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.states.hover.light}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Icon name="menu" className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 font-bold text-xl group"
              style={{ color: theme.text.primary }}
            >
              <div 
                className="p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110"
                style={{ background: gradients.primary }}
              >
                <Icon name="book" className="w-5 h-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: gradients.primary }}>
                Sambilila
              </span>
            </Link>

            {/* Desktop nav items */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium group"
                style={{ color: theme.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.states.hover.light
                  e.currentTarget.style.color = theme.text.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.text.secondary
                }}
              >
                <Icon name="home" className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Home</span>
              </Link>
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:scale-105 active:scale-95 shadow-md"
                style={{ 
                  color: theme.text.inverted,
                  background: gradients.primary
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Icon name="upgrade" className="w-4 h-4" />
                <span>Upgrade</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
          style={{ backgroundColor: theme.backgrounds.overlay }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 lg:translate-x-0 lg:top-16 border-r ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          backgroundColor: theme.backgrounds.sidebar,
          borderColor: theme.borders.light
        }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div 
            className="lg:hidden flex items-center justify-between p-4 border-b" 
            style={{ borderColor: theme.borders.light }}
          >
            <div className="flex items-center space-x-2">
              <div 
                className="p-1.5 rounded-lg"
                style={{ background: gradients.primary }}
              >
                <Icon name="menu" className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg" style={{ color: theme.text.primary }}>
                Menu
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ color: theme.text.primary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.states.hover.light}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <h3 
              className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider flex items-center space-x-2"
              style={{ color: theme.text.secondary }}
            >
              <div className="w-1 h-4 rounded-full" style={{ background: gradients.primary }} />
              <span>Main Menu</span>
            </h3>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden"
                style={{ color: theme.text.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.states.hover.light
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <div 
                  className="p-1.5 rounded-md group-hover:scale-110 transition-all duration-200"
                  style={{ backgroundColor: theme.backgrounds.card }}
                >
                  <Icon name={item.icon} className="w-4 h-4" />
                </div>
                <span className="font-medium">{item.label}</span>
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: gradients.primary }}
                />
              </Link>
            ))}
          </nav>

          {/* Study tip card */}
          <div 
            className="m-4 p-4 rounded-xl border relative overflow-hidden"
            style={{ 
              backgroundColor: theme.backgrounds.card,
              borderColor: theme.borders.accent,
              boxShadow: theme.shadows.md
            }}
          >
            <div 
              className="absolute top-0 right-0 w-24 h-24 opacity-10 blur-2xl rounded-full"
              style={{ background: gradients.primary }}
            />
            <div className="flex items-start space-x-3 relative z-10">
              <div 
                className="p-2 rounded-lg flex-shrink-0"
                style={{ background: gradients.primary }}
              >
                <Icon name="lightbulb" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold mb-1" style={{ color: theme.text.primary }}>
                  Study Tip
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: theme.text.secondary }}>
                  Use spaced repetition for better retention!
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 pb-16 lg:pb-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}