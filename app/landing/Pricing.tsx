'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "month",
    description: "Best for students trying out the app",
    features: [
      "Create up to 3 quizzes per week",
      "Create up to 50 flashcards total",
      "Max 10 questions per quiz"
    ],
    buttonText: "Get Started",
    buttonClass: "bg-[#2d4a3e] hover:bg-[#223930] text-white",
    highlighted: false
  },
  {
    name: "Weekly",
    price: "$0.99",
    period: "week",
    description: "Best for short term studying during exams",
    features: [
      "Create unlimited quizzes",
      "Create up to 500 flashcards total",
      "Max 50 questions per quiz",
      "Access full quiz history"
    ],
    buttonText: "Start with weekly",
    buttonClass: "bg-[#ff5252] hover:bg-[#eb4b4b] text-white",
    highlighted: true
  },
  {
    name: "Monthly",
    price: "$3.99",
    period: "month",
    description: "Best for committed students & exam preparation",
    features: [
      "Create unlimited quizzes",
      "Create unlimited flashcards",
      "Progress tracking",
      "Performance stats",
      "Priority processing"
    ],
    buttonText: "Start with weekly",
    buttonClass: "bg-[#2d4a3e] hover:bg-[#223930] text-white",
    highlighted: false
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="bg-[#ececec] py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4"
          >
            Pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-neutral-600 font-medium"
          >
            Affordable and adaptable pricing to suit your goals
          </motion.p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-2xl flex flex-col justify-between overflow-hidden relative shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${
                plan.highlighted 
                  ? 'border-2 border-[#2d4a3e] transform lg:scale-[1.03] z-10' 
                  : 'border border-neutral-100'
              }`}
            >
              {/* Highlighted Ribbon Header */}
              {plan.highlighted && (
                <div className="bg-[#2d4a3e] text-white text-center py-2.5 text-sm font-medium tracking-wide w-full">
                  Recommended for you
                </div>
              )}

              {/* Card Body Content */}
              <div className={`p-8 flex-grow flex flex-col ${plan.highlighted ? 'pt-6' : 'pt-8'}`}>
                {/* Title and Description */}
                <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-neutral-500 font-medium leading-snug min-h-[40px] mb-4">
                  {plan.description}
                </p>

                {/* Pricing Structure */}
                <div className="flex items-baseline mb-5">
                  <span className="text-4xl font-bold text-neutral-900 tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-neutral-500 font-medium text-base ml-0.5">
                    /{plan.period}
                  </span>
                </div>

                {/* Subtle Divider Line */}
                <div className="border-t border-neutral-200/80 w-full mb-5" />

                {/* Features Checklist Header */}
                <p className="text-sm font-bold text-neutral-900 mb-4">
                  What&apos;s included:
                </p>

                {/* Features List */}
                <ul className="space-y-3.5 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-neutral-800 stroke-[2.5]" />
                      <span className="text-sm text-neutral-600 font-medium leading-tight">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button Container */}
              <div className="px-8 pb-8 pt-2">
                <Link 
                  href="/auth/register" 
                  className={`w-full block text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${plan.buttonClass}`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}