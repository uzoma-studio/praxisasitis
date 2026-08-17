'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { HiArrowRight } from 'react-icons/hi'

type Post = {
  id: string
  title: string
  slug: string
  excerpt?: string
  authorName?: string
  locationDescription?: string
  media?: { url?: string }[]
  issueTags?: { name: string; color?: string }[]
}

// ── Row geometry (SVG viewBox units) ──────────────────────────────────
const RAMP = 60 // horizontal run of each diagonal
const TAB_W = 280 // width of the flat plateau
const GAP = 44 // baseline distance between adjacent tabs
const EDGE_GAP = 72 // baseline run-in/run-out at the very start and end of a row — wider than GAP
const START_PAD = EDGE_GAP
const ROW_H = 90 // row height
const Y_TOP = 6 // plateau y (small inset so stroke isn't clipped)
const Y_BASE = ROW_H - 6 // baseline y
const HOVER_LIFT = 8 // how much higher the hovered tab's plateau sits, in SVG units
const TOP_BUFFER = 14 // extra headroom above the row so the lifted plateau isn't clipped

function useColumns() {
  const [columns, setColumns] = useState(3)
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setColumns(1)
      else if (window.innerWidth < 1024) setColumns(2)
      else setColumns(3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return columns
}

function tabX(i: number) {
  return START_PAD + i * (TAB_W + RAMP * 2 + GAP)
}

// The plateau height for tab i — raised only if it's the hovered one.
function tabYTop(i: number, hoveredIndex: number) {
  return i === hoveredIndex ? Y_TOP - HOVER_LIFT : Y_TOP
}

// One continuous open path for the whole row — baseline, rising into each
// plateau via an S-curve, flat across the top, falling back to baseline.
// The hovered tab's segment rises higher, but its ramps still meet the
// baseline at the exact same x/y points as every other tab — the line
// never breaks or detaches, it just stretches taller at that one spot.
function buildLinePath(n: number, patternWidth: number, hoveredIndex: number) {
  let d = `M 0 ${Y_BASE}`
  for (let i = 0; i < n; i++) {
    const x0 = tabX(i)
    const rampUpEnd = x0 + RAMP
    const flatEnd = rampUpEnd + TAB_W
    const rampDownEnd = flatEnd + RAMP
    const yTop = tabYTop(i, hoveredIndex)

    d += ` L ${x0} ${Y_BASE}`
    d += ` C ${x0 + RAMP * 0.5} ${Y_BASE}, ${x0 + RAMP * 0.5} ${yTop}, ${rampUpEnd} ${yTop}`
    d += ` L ${flatEnd} ${yTop}`
    d += ` C ${flatEnd + RAMP * 0.5} ${yTop}, ${flatEnd + RAMP * 0.5} ${Y_BASE}, ${rampDownEnd} ${Y_BASE}`
  }
  d += ` L ${patternWidth} ${Y_BASE}`
  return d
}

// Closed, fillable shape for a single tab's plateau — used for the active
// tab's shading and for the closing line under every non-first tab.
function buildTabFill(i: number, hoveredIndex: number) {
  const x0 = tabX(i)
  const rampUpEnd = x0 + RAMP
  const flatEnd = rampUpEnd + TAB_W
  const rampDownEnd = flatEnd + RAMP
  const yTop = tabYTop(i, hoveredIndex)

  return `
    M ${x0} ${Y_BASE}
    C ${x0 + RAMP * 0.5} ${Y_BASE}, ${x0 + RAMP * 0.5} ${yTop}, ${rampUpEnd} ${yTop}
    L ${flatEnd} ${yTop}
    C ${flatEnd + RAMP * 0.5} ${yTop}, ${flatEnd + RAMP * 0.5} ${Y_BASE}, ${rampDownEnd} ${Y_BASE}
    L ${x0} ${Y_BASE}
    Z
  `
}

function TabRow({
  posts,
  activeId,
  onSelect,
  slots,
}: {
  posts: Post[]
  activeId: string | null
  onSelect: (id: string) => void
  slots: number
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const n = posts.length
  // patternWidth is based on `slots` (the fixed column count), not `n` (this
  // row's actual post count), so every row renders at the same scale. It
  // reserves EDGE_GAP at the start, EDGE_GAP at the end, and GAP between
  // each slot in between.
  const patternWidth =
    slots * (TAB_W + 2 * RAMP) + Math.max(slots - 1, 0) * GAP + START_PAD + EDGE_GAP
  const activeIndex = posts.findIndex((p) => p.id === activeId)
  const hoveredIndex = posts.findIndex((p) => p.id === hoveredId)

  return (
    <svg
      viewBox={`0 ${-TOP_BUFFER} ${patternWidth} ${ROW_H + TOP_BUFFER}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: ROW_H + TOP_BUFFER }}
    >
      {/* Shaded plateau for the active tab, drawn beneath the line */}
      {activeIndex !== -1 && (
        <path d={buildTabFill(activeIndex, hoveredIndex)} className="fill-paper" />
      )}

      {/* The single continuous folder line for this whole row — its d
          attribute changes on hover, and the transition below lets the
          browser animate that shape change smoothly. */}
      <path
        d={buildLinePath(n, patternWidth, hoveredIndex)}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        style={{ transition: 'd 200ms ease' }}
      />

      {/* Closing line beneath each box — every tab except the first one in
          the row gets a stroke tracing buildTabFill's outline, which meets
          the ramps at the exact same baseline points the main row line
          already touches (x0 and rampDownEnd), so it reads as one closed
          shape rather than a separate floating segment. Skipped for the
          currently active tab, so its bottom edge doesn't visually seal it
          off from the detail panel opened directly beneath it. The first
          tab is the one exception to "every tab except the first" — it
          gains its closing line as soon as another tab in the row opens,
          and loses it again if it's the one that's open (or nothing is). */}
      {posts.map((post, i) => {
        if (post.id === activeId) return null
        if (i === 0 && activeIndex === -1) return null
        return (
          <path
            key={`close-${post.id}`}
            d={buildTabFill(i, hoveredIndex)}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            style={{ transition: 'd 200ms ease' }}
          />
        )
      })}

      {/* Click targets + labels, one per tab — nudged up along with the
          plateau on hover so the text stays centered in the raised box. */}
      {posts.map((post, i) => {
        const x0 = tabX(i) + RAMP
        const isHovered = post.id === hoveredId
        return (
          <g
            key={post.id}
            style={{
              transform: `translate(0px, ${isHovered ? -HOVER_LIFT : 0}px)`,
              transition: 'transform 200ms ease',
            }}
          >
            <foreignObject x={x0} y={0} width={TAB_W} height={ROW_H}>
              <div
                // @ts-expect-error -- xmlns required for foreignObject content
                xmlns="http://www.w3.org/1999/xhtml"
                onClick={() => onSelect(post.id)}
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex h-full cursor-pointer items-start gap-2 px-4 pt-6"
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: post.issueTags?.[0]?.color ?? '#999' }}
                />
                <span className="font-mono text-xs font-bold leading-snug">{post.title}</span>
              </div>
            </foreignObject>
          </g>
        )
      })}
    </svg>
  )
}

export function RecentPosts({ posts }: { posts: Post[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const columns = useColumns()

  const rows: Post[][] = []
  for (let i = 0; i < posts.length; i += columns) {
    rows.push(posts.slice(i, i + columns))
  }

  const activePost = posts.find((p) => p.id === activeId) ?? null

  return (
    <section className=" border-ink py-20">
      <h2 className="mb-22 pt-4  text-center font-mono text-lg font-bold uppercase tracking-wide">
        Recent Stories
      </h2>

      <div className="w-full">
        {rows.map((row, rowIndex) => {
          const rowContainsActive = row.some((p) => p.id === activeId)

          return (
            <div key={rowIndex}>
              <TabRow
                posts={row}
                activeId={activeId}
                slots={columns}
                onSelect={(id) => setActiveId(id === activeId ? null : id)}
              />

              <AnimatePresence>
                {rowContainsActive && activePost && (
                  <motion.div
                    key={activePost.id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden  lg:p-14 p-6 border-ink"
                  >
                    <div className=" gap-8 bg-paper-dark  rounded-xl p-8  md:items-center">
                      <div className="mb-6 flex  text-black flex-wrap items-center justify-between gap-2 text-[10px] uppercase opacity-70">
                        {activePost.authorName && <span>{activePost.authorName}</span>}
                        {activePost.locationDescription && (
                          <span>{activePost.locationDescription}</span>
                        )}
                        {activePost.issueTags?.[0]?.name && (
                          <span>{activePost.issueTags[0].name}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-8 bg-paper-dark  rounded-xl py-8 md:grid-cols-[1fr_1fr] md:items-center">
                        <div>
                          <h3 className="font-mono text-xl font-bold leading-tight lg:max-w-md md:text-2xl">
                            {activePost.title}
                          </h3>

                          {activePost.excerpt && (
                            <p className="mt-4 mb-6 max-w-md text-sm leading-tight opacity-80">
                              {activePost.excerpt}
                            </p>
                          )}

                          <Link
                            href={`/posts/${activePost.slug}`}
                            className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                          >
                            Explore
                            <HiArrowRight size={14} />
                          </Link>
                        </div>

                        {activePost.media?.[0]?.url && (
                          <div className="relative h-48 w-full overflow-hidden md:h-64">
                            <Image
                              src={activePost.media[0].url}
                              alt={activePost.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
