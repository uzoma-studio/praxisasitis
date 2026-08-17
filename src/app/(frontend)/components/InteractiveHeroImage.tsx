'use client'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import Image from 'next/image'

export function InteractiveHeroImage({ src, alt }: { src: string; alt: string }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const scale = useSpring(1, { stiffness: 150, damping: 18 })

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseEnter() {
    // Soft settle on landing — the continuous tilt below carries the
    // "feel" as the cursor moves, this just registers contact gently.
    scale.set(1.02)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
    scale.set(1)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, scale, transformPerspective: 800 }}
      className="w-full max-w-md"
    >
      <Image
        src={src}
        alt={alt}
        width={480}
        height={480}
        className="pointer-events-none select-none"
      />
    </motion.div>
  )
}
