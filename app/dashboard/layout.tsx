'use client'

import { ReactNode, useState } from "react"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Enhanced Navbar */}
      <nav className="w-full h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <Link href="/dashboard" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            StudySaaS
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link 
            href="/" 
            className="hidden sm:block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            Home
          </Link>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
      </nav>

      <div className="flex flex-1 relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Enhanced Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 border-r bg-white shadow-sm p-4 sm:p-6
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Close button for mobile */}
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 hidden lg:block">
              Main Menu
            </h2>
            <ul className="space-y-1 sm:space-y-2">
              {[
                { href: "/dashboard", icon: "📊", label: "Dashboard" },
                { href: "/dashboard/flashcards", icon: "🎴", label: "Flashcards" },
                { href: "/dashboard/quiz", icon: "🧩", label: "Quiz Generator" },
                { href: "/dashboard/profile", icon: "👤", label: "Profile" },
              ].map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-sm sm:text-base">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile bottom navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { href: "/dashboard", icon: "📊", label: "Home" },
                { href: "/dashboard/flashcards", icon: "🎴", label: "Cards" },
                { href: "/dashboard/quiz", icon: "🧩", label: "Quiz" },
                { href: "/dashboard/profile", icon: "👤", label: "Me" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 lg:mt-auto p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hidden lg:block">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm">Study Tip</h3>
            <p className="text-xs text-gray-600">Use spaced repetition for better retention!</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 bg-gray-50 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}