'use client'

import { motion, type Variants } from 'framer-motion'
import { ReactNode } from 'react'
import { containerStagger, fadeSlideUp } from '../animations'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  variants?: Variants
  delay?: number
  as?: 'div' | 'section'
  once?: boolean
}

export default function AnimatedSection({
  children,
  className = '',
  variants = containerStagger,
  delay = 0,
  as: Tag = 'div',
  once = true,
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedItem({
  children,
  className = '',
  variants = fadeSlideUp,
}: {
  children: ReactNode
  className?: string
  variants?: Variants
}) {
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  )
}
