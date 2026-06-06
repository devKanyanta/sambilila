'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    text: "Lernopia has helped me a lot with studies and has made studying more interesting. I really recommend it to all students",
    name: "Mapalo Kanyanta",
    avatar: "https://i.pravatar.cc/100?img=11",
    className: "h-auto" 
  },
  {
    text: "Preparing for medical boards felt impossible until I started generating custom quizzes here. The dynamic adjustments catch exactly where my knowledge gaps are before moving forward.",
    name: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/100?img=47",
    className: "md:min-h-[180px] lg:min-h-[200px]" // Replicates the wide middle-top card layout
  },
  {
    text: "Absolute game changer for language learning. I imported my entire French vocabulary list and the platform immediately organized it into optimized daily flashcards.",
    name: "Lucas Mercier",
    avatar: "https://i.pravatar.cc/100?img=33",
    className: "md:min-h-[280px] lg:min-h-[320px]" // Replicates the tall right-side card layout
  },
  {
    text: "The split-second generation keeps my study momentum flowing perfectly. No waiting around, just instant high-quality review material.",
    name: "Alex Rivera",
    avatar: "https://i.pravatar.cc/100?img=12",
    className: "md:min-h-[300px] lg:min-h-[340px]" // Replicates the tall bottom-left layout
  },
  {
    text: "Simple, clean, and direct interface. Exactly what I needed to manage my engineering finals preparation.",
    name: "Chanda Chisamba",
    avatar: "https://i.pravatar.cc/100?img=18",
    className: "md:min-h-[160px] lg:min-h-[180px]" // Replicates the square/medium center-bottom layout
  },
  {
    text: "I went from failing my biochemistry prep quizzes to scoring an A on the midterm. The adaptive retention intervals work like absolute magic over long weekends.",
    name: "Elena Rostova",
    avatar: "https://i.pravatar.cc/100?img=44",
    className: "md:min-h-[260px] lg:min-h-[300px]" // Replicates the tall bottom-right layout
  }
]

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#ececec] py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-fredoka font-bold text-neutral-900 tracking-tight mb-3"
          >
            Don&apos;t take our word for it
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-neutral-600 font-medium"
          >
            See what others had to say about it
          </motion.p>
        </div>

        {/* Masonry Grid Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]"
        >
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className={`break-inside-avoid bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all duration-200 hover:shadow-md ${testimonial.className}`}
            >
              <div>
                <p className="text-[15px] text-neutral-700 leading-relaxed font-normal">
                  {testimonial.text}
                </p>
              </div>

              <div>
                {/* Divider Line precisely matching layout */}
                <div className="my-5 border-t border-neutral-200/80" />

                {/* Profile Wrapper */}
                <div className="flex items-center gap-3.5">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-11 h-11 rounded-full object-cover border border-neutral-100"
                  />
                  <span className="text-[15px] font-semibold text-neutral-800 tracking-tight">
                    {testimonial.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
        
      </div>
    </section>
  )
}