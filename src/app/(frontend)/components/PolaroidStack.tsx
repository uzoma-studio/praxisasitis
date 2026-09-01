'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import Image from 'next/image'

// Inline fractal-noise SVG — no extra asset to host, tileable, cheap to render.
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

export function PolaroidStack({ src, alt }: { src: string; alt: string }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const scale = useSpring(1, { stiffness: 120, damping: 22 })

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 120,
    damping: 22,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 120,
    damping: 22,
  })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseEnter() {
    scale.set(1.02)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
    scale.set(1)
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Ghost polaroid — back card */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 translate-x-6 translate-y-5 rotate-[14deg] rounded-sm border border-ink/10 bg-paper shadow-md"
      >
        <Grain />
      </div>
      {/* Ghost polaroid — middle card */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 -translate-x-4 translate-y-3 -rotate-[9deg] rounded-sm border border-ink/10 bg-paper shadow-md"
      >
        <Grain />
      </div>

      {/* Untransformed hit-test wrapper — bounding box never moves,
          so mousemove math stays stable while the card inside tilts */}
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {/* Front polaroid — the real photo, interactive tilt */}
        <motion.div
          style={{ rotateX, rotateY, scale, transformPerspective: 800 }}
          className="relative rounded-sm bg-paper p-[4%] pb-[14%] shadow-xl"
        >
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={src}
              alt={alt}
              width={600}
              height={600}
              className="pointer-events-none h-full w-full select-none object-cover"
            />
            {/* Grain over the photo itself — matches faded-film look */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.28] mix-blend-overlay"
              style={{ backgroundImage: NOISE_BG, backgroundSize: '120px 120px' }}
            />
          </div>
          {/* Grain over the paper border/frame */}
          <Grain className="rounded-sm" />
        </motion.div>
      </div>
    </div>
  )
}
