'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'

type Post = {
  id: string
  title: string
  slug: string
  excerpt?: string
  dateStart: string
  media?: { url?: string }[]
  issueTags?: { name: string }[]
  location?: string
}

const SCROLL_AMOUNT = 280
const HOOK_WIDTH = 11 // matches your ArchiveRolodex $hook-width

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

  const updateHookPosition = useCallback(() => {
    const wrapper = wrapperRef.current
    const card = cardRefs.current[current]
    if (!wrapper || !card) return
    const wrapperRect = wrapper.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
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
    <section id="featured" className="border-b border-ink px-6 py-12">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-lg font-mono font-bold uppercase tracking-wide">Featured Stories</h2>
        <div className="hidden md:flex gap-2 text-xs">
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Previous"
            className="flex h-8 w-8 items-center justify-center border border-ink text-lg transition-opacity disabled:opacity-30"
          >
            ‹
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Next"
            className="flex h-8 w-8 items-center justify-center border border-ink text-lg transition-opacity disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      {/* Outer wrapper: relative positioning context for the hook, which now
          lives OUTSIDE the scrollable row so it's never clipped by overflow. */}
      <div ref={wrapperRef} className="relative grid grid-cols-1 border border-ink md:grid-cols-3">
        {/* Left: preview panel, synced with the active card */}
        <Link
          href={active ? `/archive/${active.slug}` : '#'}
          className="relative col-span-1 block border-b border-ink bg-ink/5 md:border-b-0 md:border-r"
        >
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
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
                <div className="bg-paper p-4">
                  <p className="text-[10px] uppercase text-ink/60">{active.issueTags?.[0]?.name}</p>
                  <h3 className="mt-1 text-lg font-mono pr-6 font-bold leading-tight">
                    {active.title}
                  </h3>
                  {active.excerpt && (
                    <p className="mt-2 text-xs leading-relaxed opacity-70">
                      {active.excerpt.slice(0, 140)}...
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-[10px] uppercase">
                    <span>{new Date(active.dateStart).toLocaleDateString()}</span>
                    <span>Explore →</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Right: scrollable card row */}
        <div
          ref={sliderRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          className="col-span-1 flex cursor-grab overflow-x-auto md:col-span-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {posts.map((post, i) => (
            <button
              key={post.id}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              onClick={() => setCurrent(i)}
              className={`relative flex min-w-full w-full flex-col cursor-pointer justify-between border-r border-ink p-6 text-left transition-colors last:border-r-0 md:min-w-[33.333%] md:w-[33.333%] ${
                i === current
                  ? 'bg-praxisgreen text-white'
                  : ' text-ink hover:bg-praxisgreen hover:text-white'
              }`}
            >
              <p className="text-[10px] uppercase opacity-70">{post.issueTags?.[0]?.name}</p>
              <h3 className="mt-6 text-sm py-20 font-mono font-bold leading-tight">{post.title}</h3>
              <span className="mt-6 text-[10px] uppercase opacity-60">
                {post.location ?? 'Nigeria'}
              </span>
            </button>
          ))}
        </div>

        {/* The hook itself — a sibling of the panel and row, positioned via
            measured pixel coordinates, so it's never subject to the scroll
            container's clipping and always sits exactly on the true seam. */}
        {hookLeft !== null && (
          <motion.span
            animate={{ left: hookLeft }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="pointer-events-none absolute top-1/2 z-10 h-9 w-[11px] -translate-y-1/2 rounded-l bg-black md:h-[52px]"
          />
        )}
      </div>
    </section>
  )
}
