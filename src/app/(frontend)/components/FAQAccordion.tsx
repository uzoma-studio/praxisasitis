'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { HoverText } from './HoverText'
type FAQItem = { id: string; question: string; answer: string }

export function FAQAccordion({ items, sticky = false }: { items: FAQItem[]; sticky?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const openIndex = items.findIndex((item) => item.id === openId)
  const openItem = openIndex >= 0 ? items[openIndex] : null

  return (
    <section className="py-12">
      <HoverText
        as="h2"
        text="FAQs"
        className="px-6 mb-10 text-2xl font-mono font-bold uppercase tracking-wide"
      />

      <div className="relative border-y divide-y divide-accent border-accent">
        {items.map((item, i) => {
          const isOpen = openId === item.id
          return (
            <div key={item.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className={`relative z-0 flex w-full items-center cursor-pointer gap-4 px-6 py-4 text-left text-xs transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                  isOpen ? 'bg-ink text-paper' : ''
                }`}
              >
                <span className={isOpen ? 'text-white font-mono text-lg' : 'text-black font-mono'}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={
                    isOpen ? 'text-white font-mono text-sm' : 'font-medium text-black font-mono'
                  }
                >
                  {item.question}
                </span>
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
                    <p className="px-6 py-6 pl-14 text-xs leading-relaxed text-paper/80">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {/* md and up: side panel. Homepage (short list) keeps the original
            absolute overlay. Full FAQ page (long list) uses a sticky panel
            with a fixed standard height, via the `sticky` prop. */}
        <AnimatePresence>
          {openItem &&
            (sticky ? (
              <div className="absolute inset-y-8 inset-x-0 z-10 hidden md:block pointer-events-none">
                <motion.div
                  key={openItem.id}
                  initial={{ width: 0 }}
                  animate={{ width: 460 }}
                  exit={{ width: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="sticky top-24 ml-auto h-[calc(100vh-8rem)] overflow-hidden rounded-lg bg-ink pointer-events-auto"
                >
                  <div className="flex h-full w-[440px] flex-col p-8 text-paper">
                    <span className="font-mono text-4xl font-bold opacity-90 shrink-0">
                      {String(openIndex + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 text-base font-mono font-bold leading-tight shrink-0">
                      {openItem.question}
                    </h3>
                    <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
                      <p className="text-sm leading-relaxed text-paper/80">{openItem.answer}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div
                key={openItem.id}
                initial={{ width: 0 }}
                animate={{ width: 460 }}
                exit={{ width: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute -inset-y-8 right-0 z-10 hidden overflow-hidden rounded-lg bg-ink md:block"
              >
                <div className="flex h-full w-[440px] flex-col p-8 text-paper">
                  <span className="font-mono text-4xl font-bold opacity-90 shrink-0">
                    {String(openIndex + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-base font-mono font-bold leading-tight shrink-0">
                    {openItem.question}
                  </h3>
                  <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
                    <p className="text-sm leading-relaxed text-paper/80">{openItem.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
