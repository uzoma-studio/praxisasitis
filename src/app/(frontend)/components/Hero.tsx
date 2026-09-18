'use client'

import { useRef } from 'react'
import { motion, useTransform, useScroll } from 'motion/react'
import { HiArrowRight } from 'react-icons/hi'
import { PolaroidStack } from './PolaroidStack'
import { HoverText } from './HoverText'

export function Hero({
  tagline,
  introText,
  images,
}: {
  tagline?: string
  introText?: string
  images?: string[]
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const hasImages = images && images.length > 0

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-ink px-6 pl:pb-16 pt-28 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 max-w-xl"
        >
          <HoverText
            as="h1"
            text={tagline ?? ''}
            className="font-mono text-4xl font-bold uppercase leading-[1.05] tracking-tight md:text-5xl lg:text-6xl"
          />
          {introText && (
            <p className="mt-6 max-w-md text-sm leading-relaxed opacity-80">{introText}</p>
          )}
          <div className="mt-8 flex items-center gap-6">
            <a
              href="/add-post"
              className="rounded-md bg-ink px-5 py-3 text-xs font-bold uppercase tracking-wide text-paper transition-opacity hover:opacity-80"
            >
              Add a Post
            </a>
            <a
              href="/about"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
            >
              Learn more
              <HiArrowRight size={14} />
            </a>
          </div>
        </motion.div>

        {hasImages && (
          <motion.div
            style={{ y: parallaxY }}
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
            className="pointer-events-auto relative z-10 hidden justify-self-center md:flex md:w-[380px] lg:w-[420px]"
          >
            <PolaroidStack images={images!} alt="" />
          </motion.div>
        )}
      </div>

      {hasImages && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 190, damping: 14, delay: 0.2 }}
          className="pointer-events-auto relative z-10 mx-auto mt-10 py-10 mb-10 w-[280px] md:hidden"
        >
          <PolaroidStack images={images!} alt="" />
        </motion.div>
      )}
    </section>
  )
}
