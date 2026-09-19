'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react'

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='2.2' intercept='-0.3'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

function Grain({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 rounded-sm opacity-[0.45] mix-blend-multiply ${className}`}
      style={{ backgroundImage: NOISE_BG, backgroundSize: '120px 120px' }}
    />
  )
}

const SLOT = {
  0: { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 30 },
  1: { x: -16, y: 12, rotate: -9, scale: 0.96, zIndex: 20 },
  2: { x: 24, y: 20, rotate: 14, scale: 0.92, zIndex: 10 },
} as const

export function PolaroidStack({
  images,
  alt = '',
  intervalMs = 4500,
}: {
  images: string[]
  alt?: string
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 120,
    damping: 22,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 120,
    damping: 22,
  })

  const goNext = useCallback(() => {
    if (images.length < 2) return
    setIndex((i) => (i + 1) % images.length)
  }, [images.length])

  // Paused entirely while hovered; restarts at the full intervalMs once
  // the mouse leaves.
  useEffect(() => {
    if (images.length < 2 || isHovered) return
    timerRef.current = setInterval(goNext, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [goNext, intervalMs, images.length, isHovered])

  useEffect(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [index, mouseX, mouseY])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  if (!images.length) return null

  const len = images.length
  const visible = images
    .map((img, i) => ({ img, i, pos: (i - index + len) % len }))
    .filter(({ pos }) => pos <= 2)

  return (
    // The whole stack floats as one unit — a single motion.div wrapping
    // everything, with its own simple looping `y` animation. Nothing
    // inside touches `y`, so there's nothing for this to compete with.
    <motion.div
      className="relative aspect-square w-full max-w-md cursor-pointer"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      onClick={goNext}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        mouseX.set(0)
        mouseY.set(0)
      }}
    >
      <AnimatePresence initial={false}>
        {visible.map(({ img, i, pos }) => {
          const isFront = pos === 0
          const slot = SLOT[pos as 0 | 1 | 2]
          // Scale is driven entirely from here — one target, animated by
          // the single spring transition below. Previously the hover
          // grow-effect used a second, separately-bound spring on the
          // same element, and control silently swapped between the two
          // depending on which card was front, causing the size pop.
          const targetScale = isFront ? (isHovered ? 1.02 : 1) : slot.scale
          return (
            <motion.div
              key={i}
              initial={{ ...SLOT[2], opacity: 0 }}
              animate={{ ...slot, scale: targetScale, opacity: 1 }}
              exit={{ x: -60, y: -20, rotate: -18, scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              style={{
                zIndex: slot.zIndex,
                rotateX: isFront ? rotateX : 0,
                rotateY: isFront ? rotateY : 0,
                transformPerspective: 800,
              }}
              className={`absolute inset-0 rounded-sm border border-ink/10 bg-paper p-[4%] pb-[14%] ${
                isFront ? ' shadow-xl' : 'shadow-md'
              }`}
            >
              {/* Fills all the space left inside the card's own padding
                  (p-[4%] top/left/right, pb-[14%] bottom) — that padding
                  alone is what creates the polaroid strip, so the image
                  itself just fills its box with object-cover. */}
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={img}
                  alt={isFront ? alt : ''}
                  className="pointer-events-none h-full w-full select-none object-cover"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.28] mix-blend-overlay"
                  style={{ backgroundImage: NOISE_BG, backgroundSize: '120px 120px' }}
                />
              </div>
              <Grain className="rounded-sm" />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
