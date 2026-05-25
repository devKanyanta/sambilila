'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Plus } from 'lucide-react'

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

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-[#f5f5f5] py-16 md:py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-neutral-200 text-neutral-600 text-sm font-medium mb-5">
            Questions & Answers
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-neutral-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-neutral-500 max-w-xl mx-auto">
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
              className="rounded-xl overflow-hidden border border-neutral-200 bg-white"
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex justify-between items-center text-left gap-4"
              >
                <span className="font-medium text-neutral-800 text-sm md:text-base">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <Plus className="w-5 h-5 text-[#ff5252]" />
                </motion.div>
              </motion.button>
              {openIndex === index && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-6 pb-4"
                >
                  <p className="text-sm text-neutral-500 leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-sm text-neutral-500 mb-4">
            Still have questions? Contact our support team
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#ff5252] hover:bg-[#fc0b06] hover:shadow-lg transition-all duration-200"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
