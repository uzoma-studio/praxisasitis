'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { HiArrowRight } from 'react-icons/hi'
import {
  MAP_CENTER,
  DEFAULT_ZOOM,
  DEFAULT_ACCENT,
  TILE_URL,
  TILE_ATTRIBUTION,
  markerIcon,
  clusterIcon,
} from '@/lib/map-shared'

type IssueTag = { id: string; name: string; color?: string }

// Scale field per the posts spec — adjust the keys to match your Payload
// select field's actual stored values.
type Scale = 'small_group' | 'neighbourhood' | 'city_wide' | 'multi_city'

const SCALE_LABELS: Record<Scale, string> = {
  small_group: 'Small group (≤10)',
  neighbourhood: 'Neighbourhood',
  city_wide: 'City-wide',
  multi_city: 'Multi-city',
}

const DAY_MS = 24 * 60 * 60 * 1000

type Post = {
  id: string
  title: string
  slug: string
  author?: string
  locationDescription?: string
  excerpt?: string
  dateStart?: string // ISO date string — drives the time-range filter
  dateEnd?: string
  scale?: Scale
  // Payload's `point` field returns [longitude, latitude]
  coordinates?: [number, number]
  media?: { url?: string }[]
  issueTags?: { name: string; color?: string }[]
}

type MovementMapProps = {
  tags: IssueTag[]
  posts: Post[]
  /**
   * 'snapshot' — compact homepage teaser: fixed-height map, tag pills only,
   *   link out to /map. This is the default.
   * 'full' — the dedicated /map page: full-height layout, filter rail with
   *   search/scale/date-range, and CSV/GeoJSON export.
   */
  variant?: 'snapshot' | 'full'
}

// Local helper, not exported — a single-track, two-handle range slider
// built on Pointer Events (covers mouse + touch in one code path). No
// dependency — two overlapping native <input type="range"> elements fight
// each other for drag priority, which is why this is a from-scratch
// track/thumb implementation instead.
function DualRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingThumb = useRef<'start' | 'end' | null>(null)

  const percent = (v: number) => ((v - min) / (max - min || 1)) * 100

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return min
      const rect = track.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const raw = min + ratio * (max - min)
      return Math.round(raw / step) * step
    },
    [min, max, step],
  )

  function startDrag(thumb: 'start' | 'end') {
    draggingThumb.current = thumb

    function onMove(e: PointerEvent) {
      const next = valueFromClientX(e.clientX)
      if (draggingThumb.current === 'start') {
        onChange([Math.min(next, value[1]), value[1]])
      } else {
        onChange([value[0], Math.max(next, value[0])])
      }
    }

    function onUp() {
      draggingThumb.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function handleTrackClick(e: React.MouseEvent) {
    const next = valueFromClientX(e.clientX)
    const distStart = Math.abs(next - value[0])
    const distEnd = Math.abs(next - value[1])
    if (distStart <= distEnd) {
      onChange([Math.min(next, value[1]), value[1]])
    } else {
      onChange([value[0], Math.max(next, value[0])])
    }
  }

  function handleKeyDown(thumb: 'start' | 'end') {
    return (e: React.KeyboardEvent) => {
      const delta =
        e.key === 'ArrowRight' || e.key === 'ArrowUp'
          ? step
          : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
            ? -step
            : 0
      if (!delta) return
      e.preventDefault()
      if (thumb === 'start') {
        onChange([Math.min(Math.max(min, value[0] + delta), value[1]), value[1]])
      } else {
        onChange([value[0], Math.max(Math.min(max, value[1] + delta), value[0])])
      }
    }
  }

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      className="relative h-1.5 w-full cursor-pointer rounded-full bg-ink/15"
    >
      <div
        className="absolute h-1.5 rounded-full bg-ink"
        style={{
          left: `${percent(value[0])}%`,
          width: `${percent(value[1]) - percent(value[0])}%`,
        }}
      />
      {(['start', 'end'] as const).map((thumb) => (
        <div
          key={thumb}
          role="slider"
          tabIndex={0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={thumb === 'start' ? value[0] : value[1]}
          onPointerDown={(e) => {
            e.stopPropagation()
            startDrag(thumb)
          }}
          onKeyDown={handleKeyDown(thumb)}
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-ink bg-paper shadow active:cursor-grabbing"
          style={{ left: `${percent(thumb === 'start' ? value[0] : value[1])}%` }}
        />
      ))}
    </div>
  )
}

export function MovementMap({ tags, posts, variant = 'snapshot' }: MovementMapProps) {
  const isFull = variant === 'full'

  const [activeTags, setActiveTags] = useState<string[]>([])
  const [activeScales, setActiveScales] = useState<Scale[]>([])
  const [search, setSearch] = useState('')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const withDates = useMemo(() => posts.filter((p) => p.dateStart), [posts])
  const dateBounds = useMemo(() => {
    const times = withDates.map((p) => new Date(p.dateStart!).getTime())
    return times.length ? { min: Math.min(...times), max: Math.max(...times) } : { min: 0, max: 0 }
  }, [withDates])
  const [dateRange, setDateRange] = useState<[number, number]>([dateBounds.min, dateBounds.max])

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return posts.filter((post) => {
      if (!post.coordinates) return false

      if (activeTags.length > 0) {
        const postTagNames = post.issueTags?.map((t) => t.name) ?? []
        if (!activeTags.some((t) => postTagNames.includes(t))) return false
      }

      if (activeScales.length > 0 && (!post.scale || !activeScales.includes(post.scale)))
        return false

      if (post.dateStart) {
        const t = new Date(post.dateStart).getTime()
        if (t < dateRange[0] || t > dateRange[1]) return false
      }

      if (q) {
        const haystack = [post.title, post.author, post.locationDescription, post.excerpt]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [posts, activeTags, activeScales, dateRange, search])

  const selectedColor = selectedPost?.issueTags?.[0]?.color ?? DEFAULT_ACCENT

  function toggleTag(name: string) {
    // Snapshot mode keeps single-select (only one pill active at a time,
    // matching the old behaviour); full mode allows multi-select.
    setActiveTags((prev) => {
      if (!isFull) return prev.includes(name) ? [] : [name]
      return prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    })
  }

  function toggleScale(scale: Scale) {
    setActiveScales((prev) =>
      prev.includes(scale) ? prev.filter((s) => s !== scale) : [...prev, scale],
    )
  }

  function applyDatePreset(days: number | 'all') {
    if (days === 'all') {
      setDateRange([dateBounds.min, dateBounds.max])
      return
    }
    const end = dateBounds.max
    const start = Math.max(dateBounds.min, end - days * DAY_MS)
    setDateRange([start, end])
  }

  function downloadBlob(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportCSV() {
    const header = ['title', 'author', 'location', 'scale', 'dateStart', 'longitude', 'latitude']
    const rows = filteredPosts.map((p) => [
      p.title,
      p.author ?? '',
      p.locationDescription ?? '',
      p.scale ?? '',
      p.dateStart ?? '',
      p.coordinates?.[0] ?? '',
      p.coordinates?.[1] ?? '',
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    downloadBlob(csv, 'praxisasitis-map-export.csv', 'text/csv')
  }

  function exportGeoJSON() {
    const geojson = {
      type: 'FeatureCollection',
      features: filteredPosts.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: p.coordinates },
        properties: {
          title: p.title,
          author: p.author ?? null,
          location: p.locationDescription ?? null,
          scale: p.scale ?? null,
          dateStart: p.dateStart ?? null,
          slug: p.slug,
        },
      })),
    }
    downloadBlob(
      JSON.stringify(geojson, null, 2),
      'praxisasitis-map-export.geojson',
      'application/geo+json',
    )
  }

  const mapEl = (
    <div
      className={
        isFull
          ? 'relative isolate flex-1'
          : 'relative isolate h-[470px] overflow-hidden rounded-lg border border-ink'
      }
    >
      <MapContainer
        center={MAP_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={isFull}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
        <ZoomControl position="topright" />

        <MarkerClusterGroup chunkedLoading iconCreateFunction={clusterIcon}>
          {filteredPosts.map((post) => {
            const [lng, lat] = post.coordinates!
            const color = post.issueTags?.[0]?.color ?? DEFAULT_ACCENT
            return (
              <Marker
                key={post.id}
                position={[lat, lng]}
                icon={markerIcon(color)}
                eventHandlers={{ click: () => setSelectedPost(post) }}
              />
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {selectedPost && (
        <div
          className="absolute bottom-4 left-4 top-4 z-[1000] flex w-74 flex-col border border-ink rounded-xl p-4 text-white shadow-lg"
          style={{ backgroundColor: `${selectedColor}e6` }}
        >
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute right-3 top-4 text-base cursor-pointer opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            ✕
          </button>

          {selectedPost.locationDescription && (
            <p className="pr-12 text-[10px] uppercase font-semibold leading-tight opacity-80 mt-4">
              {selectedPost.locationDescription}
            </p>
          )}

          {selectedPost.media?.[0]?.url && (
            <div className="relative mb-2 mt-2 h-32 w-full overflow-hidden rounded mt-4">
              <Image
                src={selectedPost.media[0].url}
                alt={selectedPost.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <h3 className="text-base mt-4 font-mono font-bold leading-none">{selectedPost.title}</h3>

          {selectedPost.excerpt && (
            <p className="mt-2 text-sm leading-snug opacity-80">
              {selectedPost.excerpt.slice(0, 140)}
              {selectedPost.excerpt.length > 140 ? '...' : ''}
            </p>
          )}

          <Link
            href={`/posts/${selectedPost.slug}`}
            className="mt-auto inline-flex items-center mb-2 gap-1 text-[10px] font-semibold uppercase "
          >
            <span className="pt-0.5">Explore</span> <HiArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  )

  if (!isFull) {
    return (
      <section className="border-ink px-6 py-12">
        <h2 className="mb-10 pt-2 text-lg font-mono font-bold uppercase tracking-wide">
          Movement Map
        </h2>

        {mapEl}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTags([])}
            className={`rounded-full border border-ink px-3 py-1 text-[10px] font-semibold uppercase ${
              activeTags.length === 0 ? 'bg-ink text-paper' : ''
            }`}
          >
            All
          </button>
          {tags.map((tag) => {
            const isActive = activeTags.includes(tag.name)
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.name)}
                className="flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 cursor-pointer text-[10px] font-semibold uppercase"
                style={
                  isActive
                    ? { backgroundColor: tag.color, borderColor: tag.color, color: '#fff' }
                    : undefined
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: isActive ? '#fff' : tag.color }}
                />
                {tag.name}
              </button>
            )
          })}
        </div>

        <Link href="/map" className="mt-10 inline-block text-xs font-semibold uppercase underline">
          Open full map →
        </Link>
      </section>
    )
  }

  return (
    <div className="flex lg:h-screen flex-col border-t border-ink pt-18 lg:flex-row">
      <aside className="flex flex-col gap-6 overflow-y-auto border-b border-ink p-6 lg:w-80 lg:border-b-0 lg:border-r">
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase opacity-70">
            Search
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, author, location..."
            className="w-full border border-ink px-3 py-2 text-sm"
          />
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase opacity-70">Issues</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive = activeTags.includes(tag.name)
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.name)}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase"
                  style={
                    isActive
                      ? { backgroundColor: tag.color, borderColor: tag.color, color: '#fff' }
                      : undefined
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: isActive ? '#fff' : tag.color }}
                  />
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase opacity-70">
            Scale (select one or more)
          </p>
          <div className="flex flex-col gap-1.5">
            {(Object.keys(SCALE_LABELS) as Scale[]).map((scale) => {
              const isActive = activeScales.includes(scale)
              return (
                <button
                  key={scale}
                  onClick={() => toggleScale(scale)}
                  className={`rounded-full border border-ink px-3 py-1 text-left text-[10px] font-semibold uppercase ${
                    isActive ? 'bg-ink text-paper' : ''
                  }`}
                >
                  {SCALE_LABELS[scale]}
                </button>
              )
            })}
          </div>
        </div>

        {dateBounds.min !== dateBounds.max && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase opacity-70">
              {new Date(dateRange[0]).toLocaleDateString()} –{' '}
              {new Date(dateRange[1]).toLocaleDateString()}
            </p>
            <DualRangeSlider
              min={dateBounds.min}
              max={dateBounds.max}
              value={dateRange}
              onChange={setDateRange}
              step={DAY_MS}
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                onClick={() => applyDatePreset(7)}
                className="rounded-full border border-ink px-2.5 py-1 text-[10px] font-semibold uppercase"
              >
                Last week
              </button>
              <button
                onClick={() => applyDatePreset(30)}
                className="rounded-full border border-ink px-2.5 py-1 text-[10px] font-semibold uppercase"
              >
                Last month
              </button>
              <button
                onClick={() => applyDatePreset('all')}
                className="rounded-full border border-ink px-2.5 py-1 text-[10px] font-semibold uppercase"
              >
                All time
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-4">
          <button
            onClick={exportCSV}
            className="flex-1 border border-ink px-3 py-2 text-[10px] font-semibold uppercase"
          >
            Export CSV
          </button>
          <button
            onClick={exportGeoJSON}
            className="flex-1 border border-ink px-3 py-2 text-[10px] font-semibold uppercase"
          >
            Export GeoJSON
          </button>
        </div>
      </aside>

      {mapEl}
    </div>
  )
}
