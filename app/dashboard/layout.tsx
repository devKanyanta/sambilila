'use client'

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  User, 
  Home,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  GraduationCap
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-medium text-lg text-neutral-900">Lernopia</span>
            </Link>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-all hover:shadow-sm active:scale-95">
                <Sparkles className="w-4 h-4" />
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 lg:hidden bg-black/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-neutral-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:top-16 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-100">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-medium text-lg text-neutral-900">Lernopia</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="flex items-center gap-2 px-3 mb-4">
              <div className="w-1 h-4 rounded-full bg-primary-400" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
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
                      ? 'bg-primary-50 text-primary-600 font-medium' 
                      : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all ${
                    active ? 'bg-primary-100' : 'bg-transparent'
                  }`}>
                    <item.icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-500'}`} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Study tip card */}
          <div className="mx-4 mb-4 p-4 rounded-xl bg-primary-50/50 border border-primary-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Study Tip</h4>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100">
        <div className="flex items-center justify-around px-2 py-1">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 px-3 py-2 min-w-[60px]"
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-colors ${
                    active ? 'text-primary-500' : 'text-neutral-400'
                  }`} />
                  {active && (
                    <motion.div
                      layoutId="mobileNavDot"
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary-500"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] transition-colors ${
                  active ? 'text-neutral-900 font-medium' : 'text-neutral-400'
                }`}>
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="lg:hidden h-16" />
    </div>
  )
}
