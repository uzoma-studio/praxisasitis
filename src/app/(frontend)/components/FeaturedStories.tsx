'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import { HiArrowRight } from 'react-icons/hi'
import { HoverText } from './HoverText'

type Post = {
  id: string
  title: string
  slug: string
  whatDidWeDo?: any // Lexical richText JSON from Payload
  dateStart: string
  media?: { url?: string }[]
  issueTags?: { name: string }[]
  locationDescription?: string
}

const SCROLL_AMOUNT = 280
const HOOK_WIDTH = 11

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

// Walks Lexical's JSON tree and pulls out plain text, for a short preview —
// not a full rich-text render, just enough for the "What did we do?" excerpt.
function lexicalToPlainText(content: any): string {
  if (!content?.root?.children) return ''
  let text = ''
  function walk(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'text' && node.text) {
        text += node.text + ' '
      }
      if (node.children) walk(node.children)
    }
  }
  walk(content.root.children)
  return text.trim()
}

export function FeaturedStories({ posts }: { posts: Post[] }) {
  const [current, setCurrent] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [hookLeft, setHookLeft] = useState<number | null>(null)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)

  const active = posts[current]
  const activeExcerpt = active ? lexicalToPlainText(active.whatDidWeDo) : ''

  const updateHookPosition = useCallback(() => {
    const wrapper = wrapperRef.current
    const slider = sliderRef.current
    const card = cardRefs.current[current]
    if (!wrapper || !slider || !card) return
    const wrapperRect = wrapper.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const sliderRect = slider.getBoundingClientRect()

    // If the active card has been scrolled out of the slider's visible
    // viewport (e.g. by dragging the row), don't position the hook —
    // it's an absolutely-positioned overlay that isn't clipped by the
    // slider's own overflow, so a stale position would otherwise float
    // over unrelated content, like the left preview panel.
    const isCardVisible = cardRect.right > sliderRect.left && cardRect.left < sliderRect.right
    if (!isCardVisible) {
      setHookLeft(null)
      return
    }

    setHookLeft(cardRect.left - wrapperRect.left - HOOK_WIDTH)
  }, [current])

  const updateArrows = useCallback(() => {
    const el = sliderRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  const handleScroll = useCallback(() => {
    updateArrows()
    updateHookPosition()
  }, [updateArrows, updateHookPosition])

  useEffect(() => {
    const el = sliderRef.current
    if (!el) return
    updateArrows()
    updateHookPosition()
    el.addEventListener('scroll', handleScroll)
    const ro = new ResizeObserver(handleScroll)
    ro.observe(el)
    window.addEventListener('resize', updateHookPosition)
    return () => {
      el.removeEventListener('scroll', handleScroll)
      ro.disconnect()
      window.removeEventListener('resize', updateHookPosition)
    }
  }, [posts, handleScroll, updateHookPosition, updateArrows])

  useEffect(() => {
    updateHookPosition()
  }, [current, updateHookPosition])

  const onMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    isDragging.current = true
    dragStartX.current = e.pageX
    scrollStartX.current = sliderRef.current.scrollLeft
    sliderRef.current.style.cursor = 'grabbing'
    sliderRef.current.style.userSelect = 'none'
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return
    const delta = e.pageX - dragStartX.current
    sliderRef.current.scrollLeft = scrollStartX.current - delta
  }

  const stopDrag = () => {
    if (!isDragging.current || !sliderRef.current) return
    isDragging.current = false
    sliderRef.current.style.cursor = 'grab'
    sliderRef.current.style.userSelect = ''
  }

  const scrollBy = (dir: number) => {
    sliderRef.current?.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: 'smooth' })
  }

  if (!posts.length) return null

  return (
    <motion.section
      id="featured"
      className="border-b border-ink px-6 py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
    >
      <div className="mb-10 flex items-center justify-between">
        <HoverText
          as="h2"
          text="Featured Stories"
          className="text-lg font-mono font-bold uppercase tracking-wide"
        />
        <div className="hidden gap-2 text-xs md:flex">
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Previous"
            className="flex h-8 w-8 items-center cursor-pointer justify-center border border-ink text-lg transition-opacity disabled:opacity-30"
          >
            ‹
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Next"
            className="flex h-8 w-8 items-center cursor-pointer justify-center border border-ink text-lg transition-opacity disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      <div ref={wrapperRef} className="relative grid grid-cols-1 border border-ink md:grid-cols-3">
        {/* Left: preview panel, synced with the active card — desktop only.
            On mobile the same detail content renders inline under the
            active tab instead (see the map below). */}
        <Link
          href={active ? `/archives/${active.slug}` : '#'}
          className="relative z-20 col-span-1 hidden flex-col border-b border-ink bg-ink/5 md:flex md:h-full md:border-b-0 md:border-r"
        >
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col"
              >
                {active.media?.[0]?.url && (
                  <Image
                    src={active.media[0].url}
                    alt={active.title}
                    width={800}
                    height={500}
                    className="h-64 w-full object-cover md:h-72"
                  />
                )}
                <div className="flex flex-1 flex-col justify-between bg-white p-4">
                  <div>
                    <p className="text-[10px] uppercase text-ink/60">
                      {active.issueTags?.[0]?.name}
                    </p>
                    <HoverText
                      as="h3"
                      text={active.title}
                      className="mt-1 pt-6 pb-2 pr-6 font-mono text-lg font-bold leading-tight"
                    />
                    {activeExcerpt && (
                      <p className="mt-2 pb-8 pr-6 text-sm leading-tight opacity-70">
                        {activeExcerpt.slice(0, 140)}
                        {activeExcerpt.length > 140 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pr-4 flex items-center justify-between text-[10px] uppercase">
                    <span>{new Date(active.dateStart).toLocaleDateString('en-US')}</span>
                    <div className="flex items-center gap-2">
                      <span className="pt-1">Explore</span> <HiArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Right: scrollable row on desktop, stacked accordion list on
            mobile. Each post is wrapped in a `md:contents` div so the
            wrapper itself doesn't affect desktop's flex-row layout — on
            desktop the wrapper disappears from box generation and the
            button (and hidden preview block) behave as direct flex
            children, same as before. */}
        <div
          ref={sliderRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          className="col-span-1 flex flex-col md:col-span-2 md:flex-row md:cursor-grab md:overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {posts.map((post, i) => {
            const isLast = i === posts.length - 1
            return (
              <div key={post.id} className="md:contents">
                <button
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  onClick={() => setCurrent(i)}
                  className={` relative flex cursor-pointer h-30 w-full flex-col items-start justify-between p-4 text-left transition-colors md:h-auto md:min-w-[33.333%] md:w-[33.333%] md:flex-col md:justify-between md:p-6 ${
                    isLast
                      ? 'border-b-0 md:border-b-0 md:border-r-0'
                      : 'border-b border-ink md:border-b-0 md:border-r'
                  } ${
                    i === current
                      ? 'bg-praxisgreen text-white'
                      : 'bg-paper text-ink hover:bg-praxisgreen hover:text-white'
                  }`}
                >
                  <div className="flex flex-col md:contents ">
                    <p className="text-[10px] pt-2 uppercase opacity-70">
                      {post.issueTags?.[0]?.name}
                    </p>
                    <h3 className="text-sm font-mono font-bold leading-tight md:mt-6 md:py-20 mt-1 md:text-sm">
                      {post.title}
                    </h3>
                  </div>
                  <span className="text-[9px] uppercase opacity-60 md:mt-6 md:text-[10px]">
                    {post.locationDescription ?? 'Nigeria'}
                  </span>
                </button>

                {/* Mobile-only inline detail, directly beneath the tab that
                  opened it. Hidden on desktop (md:hidden), where the left
                  panel above handles the preview instead. */}
                <AnimatePresence>
                  {i === current && active && (
                    <motion.div
                      key={active.id}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-b border-ink md:hidden"
                    >
                      <Link href={`/archives/${active.slug}`} className="flex flex-col">
                        {active.media?.[0]?.url && (
                          <Image
                            src={active.media[0].url}
                            alt={active.title}
                            width={800}
                            height={500}
                            className="h-56 w-full object-cover"
                          />
                        )}
                        <div className="flex flex-col justify-between bg-white p-4">
                          <div>
                            <p className="text-[10px] uppercase text-ink/60">
                              {active.issueTags?.[0]?.name}
                            </p>
                            <HoverText
                              as="h3"
                              text={active.title}
                              className="mt-1 pt-6 pb-2 pr-6 font-mono text-lg font-bold leading-tight"
                            />
                            {activeExcerpt && (
                              <p className="mt-2 pb-8 pr-6 text-sm leading-tight opacity-70">
                                {activeExcerpt.slice(0, 140)}
                                {activeExcerpt.length > 140 ? '...' : ''}
                              </p>
                            )}
                          </div>
                          <div className="mt-4 pr-4 flex items-center justify-between text-[10px] uppercase">
                            <span>{new Date(active.dateStart).toLocaleDateString('en-US')}</span>
                            <div className="flex items-center gap-2">
                              <span className="pt-1">Explore</span> <HiArrowRight size={12} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {hookLeft !== null && (
          <motion.span
            animate={{ left: hookLeft }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="pointer-events-none absolute top-1/2 z-10 hidden h-9 w-[11px] -translate-y-1/2 rounded-l bg-black md:block md:h-[52px]"
          />
        )}
      </div>
    </motion.section>
  )
}
