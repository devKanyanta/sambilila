'use client'

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, LayoutGroup } from "framer-motion"
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  User, 
  Home,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react'

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/flashcards", icon: BookOpen, label: "Flashcards" },
  { href: "/dashboard/quiz", icon: Brain, label: "Quiz Generator" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
]

const mobileNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/flashcards", icon: BookOpen, label: "Cards" },
  { href: "/dashboard/quiz", icon: Brain, label: "Quiz" },
  { href: "/dashboard/profile", icon: User, label: "Me" },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-[#ececec]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#193827] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-heading font-semibold text-sm">L</span>
              </div>
              <span className="font-heading font-semibold text-lg text-neutral-800">Lernopia</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#ff5252] hover:bg-[#fc0b06] transition-all hover:shadow-md active:scale-95">
                <Sparkles className="w-4 h-4" />
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 lg:hidden bg-black/30 backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 lg:translate-x-0 lg:top-16 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#193827] flex items-center justify-center">
                <span className="text-white font-heading font-semibold text-sm">L</span>
              </div>
              <span className="font-heading font-semibold text-lg text-neutral-800">Lernopia</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            <div className="px-3 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[#ff5252]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Main Menu
              </span>
            </div>
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    active 
                      ? 'bg-[#ff5252]/10 text-[#ff5252] font-semibold' 
                      : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all ${
                    active ? 'bg-[#ff5252]/15' : 'bg-transparent'
                  }`}>
                    <item.icon className={`w-4 h-4 ${active ? 'text-[#ff5252]' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ff5252]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Study tip card */}
          <div className="mx-3 mb-3 p-4 rounded-xl bg-[#193827]/8">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#193827] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-neutral-800">Study Tip</h4>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Use spaced repetition for better retention!
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <LayoutGroup>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200">
          <div className="flex items-center justify-around px-2 py-1">
            {mobileNavItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[60px]"
                >
                  <motion.div
                    animate={{
                      scale: active ? 1.1 : 1,
                      color: active ? '#ff5252' : '#8a8a8a',
                    }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative"
                  >
                    <item.icon className="w-5 h-5" />
                    {active && (
                      <motion.div
                        layoutId="mobileNavDot"
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ff5252]"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                  </motion.div>
                  <motion.span
                    animate={{
                      color: active ? '#2c2c2c' : '#8a8a8a',
                      fontWeight: active ? 600 : 500,
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px]"
                  >
                    {item.label}
                  </motion.span>
                  {active && (
                    <motion.div
                      layoutId="mobileNavIndicator"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#ff5252]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </LayoutGroup>

      {/* Bottom padding for mobile nav */}
      <div className="lg:hidden h-16" />
    </div>
  )
}
