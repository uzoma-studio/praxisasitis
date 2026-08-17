'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Quote } from '../about/about-content'

type Section = { title: string; body: string[]; quote?: Quote }

function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={i > 0 ? 'mt-4' : undefined}>
          {p}
        </p>
      ))}
    </>
  )
}

// Quote sits after the first paragraph, then the rest of the body follows
// — matches the order shown in the reference screenshot rather than
// leading with the quote.
function SectionContent({ item }: { item: Section }) {
  const [first, ...rest] = item.body
  return (
    <>
      {first && <p>{first}</p>}
      {item.quote && (
        <blockquote className="my-4 border-l-2 border-paper/40 pl-4 font-semibold not-italic">
          &ldquo;{item.quote.text}&rdquo;
          <cite className="mt-2 block text-xs font-semibold not-italic">
            — {item.quote.attribution}
          </cite>
        </blockquote>
      )}
      {rest.length > 0 && <Paragraphs paragraphs={rest} />}
    </>
  )
}

export function CollapsibleSections({ items }: { items: Section[] }) {
  const [openTitle, setOpenTitle] = useState<string | null>(null)
  const openIndex = items.findIndex((item) => item.title === openTitle)
  const openItem = openIndex >= 0 ? items[openIndex] : null

  if (items.length === 0) return null

  return (
    <section className="py-12">
      <div className="relative border-y divide-y divide-accent border-accent">
        {items.map((item) => {
          const isOpen = item.title === openTitle
          return (
            <div key={item.title}>
              <button
                onClick={() => setOpenTitle(isOpen ? null : item.title)}
                className={`relative z-0 flex w-full cursor-pointer items-center px-6 py-8 text-left font-mono text-sm font-bold uppercase tracking-wide transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                  isOpen ? 'bg-ink text-paper' : ''
                }`}
              >
                {item.title}
              </button>

              {/* Small screens: inline collapse, pushes content below it down. */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden bg-ink text-paper md:hidden"
                  >
                    <div className="px-6 py-6 text-sm leading-relaxed text-paper/80">
                      <SectionContent item={item} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {/* md and up: sliding side panel, unaffected by document flow. It
            overhangs the row container's top and bottom edges slightly
            rather than sitting flush with them. */}
        <AnimatePresence>
          {openItem && (
            <motion.div
              key={openItem.title}
              initial={{ width: 0 }}
              animate={{ width: 640 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute -top-10 -bottom-10 right-0 z-10  pb-4 hidden overflow-hidden rounded-lg bg-ink md:block"
            >
              <div className="h-full w-[640px] overflow-y-auto p-8 text-sm leading-tight text-white">
                <SectionContent item={openItem} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
