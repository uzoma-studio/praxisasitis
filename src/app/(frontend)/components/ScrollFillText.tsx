'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'

// Renders one word whose opacity is tied to how far the paragraph has
// scrolled through the reveal window — dim grey until its turn, ink black
// once scroll has passed its position.
function Word({
  children,
  progress,
  range,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.35, 1])
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  )
}

/**
 * Drop-in replacement for <Paragraphs /> that fills each word from grey to
 * black as the block scrolls through the viewport, instead of rendering
 * static <p> tags. Multiple paragraphs share one continuous scroll range so
 * the fill reads as one motion across the whole block.
 */
export function ScrollFillText({
  paragraphs,
  className,
}: {
  paragraphs: string[]
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Reveal starts once the block is 90% up the viewport and finishes once
  // its top has scrolled to 35% down — tune these two stops to taste.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'start 0.35'],
  })

  const paragraphWords = paragraphs.map((p) => p.split(' ').filter(Boolean))
  const totalWords = paragraphWords.reduce((sum, words) => sum + words.length, 0)

  let wordIndex = 0

  return (
    <div ref={containerRef} className={className}>
      {paragraphWords.map((words, pi) => (
        <p key={pi} className={pi > 0 ? 'mt-4' : undefined}>
          {words.map((word, wi) => {
            const start = wordIndex / totalWords
            const end = (wordIndex + 1) / totalWords
            wordIndex += 1
            return (
              <Word key={wi} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            )
          })}
        </p>
      ))}
    </div>
  )
}
