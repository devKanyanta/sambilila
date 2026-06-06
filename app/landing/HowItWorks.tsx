'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const features = [
  {
    title: (
      <>
        Master Your Subjects in <span className="text-[#ff5252]">Seconds</span>, Not Hours
      </>
    ),
    description:
      "Just upload your notes, and AI generates a personalized practice quiz. Test your understanding instantly so you know exactly what to review before the big exam.",
    buttonText: "Try it out",
    buttonHref: "/auth/register",
    // Replace with your actual image/illustration path when ready
    imageSrc: "/quiz.png", 
  },
  {
    title: (
      <>
        Ace Your Finals with Personalized <span className="text-[#ff5252]">Flashcards</span>
      </>
    ),
    description:
      "Stop stressing about what will be on the test. Upload your lecture notes or textbook, and get custom flashcards tailored to your exact course requirements.",
    buttonText: "Get Started",
    buttonHref: "/auth/register",
    // Replace with your actual image/illustration path when ready
    imageSrc: "/flashcard.png", 
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#ececec] py-20 md:py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-24 md:gap-32 lg:gap-40">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 w-full ${
              index % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Media / Image Column */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-xl aspect-[4/3] ${index === 1 ? 'bg-[#fff] p-10' : ''} rounded-2xl overflow-hidden shadow-sm shrink-0 relative flex items-center justify-center`}
            >
              {/* Fallback mockup styling until you add real images */}
              <img
                src={feature.imageSrc}
                alt=""
                className="object-contain w-full h-full"
              />
            </motion.div>

            {/* Copy / Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="w-full max-w-xl"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-fredoka font-bold text-[#2d4a3e] leading-[1.2] tracking-tight">
                {feature.title}
              </h2>
              
              <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed font-medium">
                {feature.description}
              </p>

              <div className="mt-8">
                <Link
                  href={feature.buttonHref}
                  className="inline-flex items-center justify-center px-7 py-3 rounded-full text-base font-semibold text-white bg-[#ff5252] hover:bg-[#eb4b4b] hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {feature.buttonText}
                </Link>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}