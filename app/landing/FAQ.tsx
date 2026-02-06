'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { colors, theme, gradients } from '@/lib/theme'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "How does the AI generate learning materials?",
      answer: "Our AI analyzes your content, identifies key concepts and relationships, and creates optimized learning materials using natural language processing and educational best practices."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
    },
    {
      question: "Do you offer student discounts?",
      answer: "Yes! We offer special pricing for students. Contact our support team with your student ID for a discount."
    },
    {
      question: "What payment methods do you accept in Zambia?",
      answer: "We accept all major credit cards, mobile money (MTN, Airtel Money), and bank transfers for Zambian users."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! You can start with our free Starter plan which includes basic features, or try Pro features with a 14-day free trial."
    }
  ]

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div 
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 border"
          style={{
            backgroundColor: colors.warning[50],
            color: colors.warning[700],
            borderColor: colors.warning[200]
          }}
        >
          Questions & Answers
        </div>
        <h2 
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{ color: theme.text.primary }}
        >
          Frequently Asked Questions
        </h2>
        <p 
          className="max-w-2xl mx-auto"
          style={{ color: theme.text.secondary }}
        >
          Get answers to common questions about Lernopia
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="space-y-3"
      >
        {faqs.map((faq, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg overflow-hidden border"
            style={{
              background: `linear-gradient(135deg, ${colors.neutral[50]} 0%, ${colors.neutral[100]} 100%)`,
              borderColor: theme.borders.light
            }}
          >
            <motion.button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex justify-between items-center transition-all duration-300"
              style={{
                color: theme.text.primary,
                backgroundColor: 'transparent'
              }}
              whileHover={{ x: 5 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.accent[50]} 100%)`;
                e.currentTarget.style.color = colors.primary[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.text.primary;
              }}
            >
              <span className="font-medium text-left">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 45 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Plus className="w-5 h-5" style={{ color: colors.primary[600] }} />
              </motion.div>
            </motion.button>
            {openIndex === index && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-4"
                style={{ color: theme.text.secondary }}
              >
                <p>{faq.answer}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <p 
          className="mb-4"
          style={{ color: colors.neutral[600] }}
        >
          Still have questions? Contact our support team
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          style={{
            background: gradients.primary,
            boxShadow: theme.shadows.colored.primary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = theme.shadows.lg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = theme.shadows.colored.primary;
          }}
        >
          Contact Support
        </motion.button>
      </motion.div>
    </section>
  )
}