'use client'

import { motion } from 'framer-motion'
import { FiBookOpen, FiGlobe, FiTwitter, FiYoutube, FiLinkedin, FiGithub } from 'react-icons/fi'
import { Twitter, Youtube, Linkedin, X } from 'lucide-react'

export function Footer() {
  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "Pricing"]
    },
    {
      title: "Company",
      links: ["About", "Contact"]
    },
    {
      title: "Resources",
      links: ["Help Center","Tutorialss", "Privacy"]
    }
  ]

  const socialLinks = [
    { icon: <X className="w-4 h-4 text-gray-900" />, label: "X", bg: "bg-white" },
    { icon: <Youtube className="w-4 h-4 text-gray-900" />, label: "YouTube", bg: "bg-white" },
    { icon: <Linkedin className="w-4 h-4 text-gray-900" />, label: "LinkedIn", bg: "bg-white" },
    { icon: <FiGithub className="w-4 h-4 text-gray-900" />, label: "GitHub", bg: "bg-white" }
  ]

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-8">
          {/* Brand section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-6">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center"
              >
                <FiBookOpen className="w-6 h-6" />
              </motion.div>
              <span className="text-2xl font-bold">Lernopia</span>
            </div>
            <p className="text-gray-400 mb-6 md:mb-8 max-w-md text-sm md:text-base">
              AI-powered learning platform transforming education through intelligent technology. 
              Helping students, professionals, and lifelong learners achieve their goals faster.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a 
                  key={index}
                  href="#" 
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${social.bg} flex items-center justify-center hover:bg-gray-200 transition-colors group`}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div whileHover={{ scale: 1.2 }}>
                    {social.icon}
                  </motion.div>
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {/* Links sections */}
          {footerLinks.map((column, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="font-semibold text-base md:text-lg mb-4 md:mb-6">{column.title}</h4>
              <ul className="space-y-2 md:space-y-3">
                {column.links.map((link, linkIndex) => (
                  <motion.li 
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm md:text-base">
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs md:text-sm text-center md:text-left">
              &copy; 2026 Lernopia AI. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-3 rounded bg-gradient-to-r from-emerald-500 to-teal-500"
                />
                <span className="text-xs md:text-sm text-gray-400">Made with Love</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-xs md:text-sm text-gray-500"
              >
                <FiGlobe className="w-3 h-3 md:w-4 md:h-4" />
                Available worldwide • Local support in Zambia
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}