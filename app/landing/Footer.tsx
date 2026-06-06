'use client'

import { motion } from 'framer-motion'
import { FiBookOpen, FiGlobe, FiGithub } from 'react-icons/fi'
import { X, Youtube, Linkedin } from 'lucide-react'

const socialLinks = [
  { icon: <X className="w-4 h-4" />, label: "X" },
  { icon: <Youtube className="w-4 h-4" />, label: "YouTube" },
  { icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn" },
  { icon: <FiGithub className="w-4 h-4" />, label: "GitHub" }
]

export function Footer() {
  return (
    <footer className="bg-[#0f2a1f] border-t border-white/10 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          {/* Brand section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#123424] flex items-center justify-center">
                <FiBookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-fredoka font-semibold text-white">Lernopia</span>
            </div>
            <p className="text-slate-300 mb-6 max-w-sm text-sm leading-relaxed">
              AI-powered learning platform transforming education through intelligent technology. 
              Helping students, professionals, and lifelong learners achieve their goals faster.
            </p>
            <div className="flex justify-center md:justify-start gap-3">
              {socialLinks.map((social, index) => (
                <motion.a 
                  key={index}
                  href="#" 
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs text-center md:text-left">
              &copy; 2026 Lernopia AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                Made with Love
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FiGlobe className="w-3 h-3" />
                Available worldwide &mdash; Local support in Zambia
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
