'use client'

import { motion, type Variants } from 'motion/react'

type HoverTextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'

const charVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  hover: {
    scale: 0.85,
    y: 6,
    marginLeft: 6,
    marginRight: 6,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

export function HoverText({
  text,
  className,
  charClassName,
  as = 'span',
}: {
  text: string
  className?: string
  charClassName?: string
  as?: HoverTextTag
}) {
  const Tag = motion[as as keyof typeof motion] as any
  const lines = text.split('\n')

  return (
    <Tag className={className} aria-label={text.replace(/\n/g, ' ')}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden="true">
          {line.split(' ').map((word, wi, arr) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {word.split('').map((char, ci) => (
                <motion.span
                  key={ci}
                  layout
                  className={charClassName ?? 'inline-block'}
                  style={{ transformOrigin: 'center' }}
                  initial="rest"
                  whileHover="hover"
                  variants={charVariants}
                  transition={{ layout: { duration: 0.3, ease: 'easeOut' } }}
                >
                  {char}
                </motion.span>
              ))}
              {wi < arr.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}
