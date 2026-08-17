'use client'

import { Fragment, useRef } from 'react'
import { motion, useTransform, useScroll } from 'motion/react'
import { HiArrowRight } from 'react-icons/hi'
import { InteractiveHeroImage } from './InteractiveHeroImage'

export function Hero({
  tagline,
  introText,
  illustrationUrl,
}: {
  tagline?: string
  introText?: string
  illustrationUrl?: string
}) {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 120])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-ink px-6 pl:pb-16 pt-28 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* Left: text content */}
        <div className="relative z-10 max-w-xl">
          <h1 className="font-mono text-4xl font-bold uppercase leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            {(tagline ?? '').split('\n').map((line, i) => (
              <Fragment key={i}>
                {line}
                <br />
              </Fragment>
            ))}
          </h1>

          {introText && (
            <p className="mt-6 max-w-md text-sm leading-relaxed opacity-80">{introText}</p>
          )}

          <div className="mt-8 flex items-center gap-6">
            <a
              href="/posts/new"
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
        </div>

        {/* Right: illustration — desktop only */}
        {illustrationUrl && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
            className="pointer-events-auto relative z-10 hidden justify-self-center md:flex md:w-[380px] lg:w-[420px]"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              whileHover={{ y: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <InteractiveHeroImage src={illustrationUrl} alt="" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Second folder — tilted right (toppling), shifted left, desktop only */}
      {illustrationUrl && (
        <motion.div
          style={{ y: parallaxY }}
          initial={{ opacity: 0, scale: 0.9, rotate: 8 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 18 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.25 }}
          className="pointer-events-auto absolute left-[40%] top-[62%] hidden w-[380px] -translate-x-1/2 md:block lg:w-[420px]"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            whileHover={{ y: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          >
            <InteractiveHeroImage src={illustrationUrl} alt="" />
          </motion.div>
        </motion.div>
      )}

      {/* Mobile-only folder — single, centered */}
      {illustrationUrl && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileTap={{ scale: 0.92, rotate: -3 }}
          transition={{ type: 'spring', stiffness: 190, damping: 14, delay: 0.2 }}
          className="pointer-events-auto relative z-10 mx-auto mt-0 w-[300px] md:hidden"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            <InteractiveHeroImage src={illustrationUrl!} alt="" />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
