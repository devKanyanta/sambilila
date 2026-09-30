'use client'

import { ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  User,
  Home,
  Menu,
  X,
  Heart,
  Shield,
  BarChart3,
  MessageSquareHeart
} from 'lucide-react'
import { useSession } from '@/app/hooks/useSession'
import SupportBar from './components/SupportBar'

const baseNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/flashcards", icon: BookOpen, label: "Flashcards" },
  { href: "/dashboard/quiz", icon: Brain, label: "Quiz Generator" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
]

const baseMobileNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/flashcards", icon: BookOpen, label: "Cards" },
  { href: "/dashboard/quiz", icon: Brain, label: "Quiz" },
  { href: "/dashboard/profile", icon: User, label: "Me" },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isGuest, isBootstrapping } = useSession()

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const res = await fetch('/api/admin/check', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setIsAdmin(data.isAdmin)
      } catch {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [])

  const adminNavItems = [
    { href: "/dashboard/admin", icon: Shield, label: "Admin" },
    { href: "/dashboard/admin/feedback", icon: MessageSquareHeart, label: "Feedback" },
    { href: "/dashboard/admin/analytics", icon: BarChart3, label: "Analytics" },
  ]
  const adminMobileNavItems = [
    { href: "/dashboard/admin", icon: Shield, label: "Admin" },
    { href: "/dashboard/admin/feedback", icon: MessageSquareHeart, label: "Feedback" },
    { href: "/dashboard/admin/analytics", icon: BarChart3, label: "Analytics" },
  ]

  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems
  const mobileNavItems = isAdmin ? [...baseMobileNavItems, ...adminMobileNavItems] : baseMobileNavItems

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200/80">
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
              <div className="w-8 h-8 relative group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Lernopia"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-fredoka font-medium text-lg text-neutral-900">Lernopia</span>
            </Link>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Guest claim nudge */}
              {isGuest && !isBootstrapping && (
                <button
                  onClick={() => router.push('/dashboard/profile?claim=true')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  Save your progress
                </button>
              )}
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                href="/donate"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-all hover:shadow-sm active:scale-95"
              >
                <Heart className="w-4 h-4" />
                Support us
              </Link>
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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-neutral-200/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:top-16 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-200/80">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image
                  src="/logo.png"
                  alt="Lernopia"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-fredoka font-medium text-lg text-neutral-900">Lernopia</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="flex items-center gap-2 px-3 mb-4">
              <div className="w-1 h-4 rounded-full bg-primary-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Menu
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
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
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

          {/* Support card */}
          <div className="mx-4 mb-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">Free for everyone</h4>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Lernopia runs on donations. If you can, support us!
                </p>
                <Link
                  href="/donate"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600 mt-1.5"
                >
                  Donate <Heart className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Support/usage bar */}
      <div className="lg:ml-64 pt-16">
        <SupportBar />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200/80">
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
                  active ? 'text-neutral-900 font-semibold' : 'text-neutral-400'
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
