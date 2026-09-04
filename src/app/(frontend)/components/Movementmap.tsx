'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import {
  MAP_CENTER,
  DEFAULT_ZOOM,
  DEFAULT_ACCENT,
  TILE_URL,
  TILE_ATTRIBUTION,
  markerIcon,
  clusterIcon,
} from '@/lib/map-shared'
import { HiArrowRight } from 'react-icons/hi'
import { MapFilters } from './MapFilters'
import { HoverText } from './HoverText'

type IssueTag = {
  id: string
  name: string
  color?: string
}

type Scale = 'small_group' | 'neighbourhood' | 'city_wide' | 'multi_city'

type Post = {
  id: string
  title: string
  slug: string
  author?: string
  locationDescription?: string
  excerpt?: string
  dateStart?: string
  dateEnd?: string
  scale?: Scale
  coordinates?: [number, number]
  media?: { url?: string }[]
  issueTags?: { name: string; color?: string }[]
}

type MovementMapProps = {
  tags: IssueTag[]
  posts: Post[]
  variant?: 'snapshot' | 'full'
}

const DAY_MS = 24 * 60 * 60 * 1000

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
          style={{
            left: `${percent(thumb === 'start' ? value[0] : value[1])}%`,
          }}
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

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const withDates = useMemo(() => posts.filter((p) => p.dateStart), [posts])

  const dateBounds = useMemo(() => {
    const times = withDates.map((p) => new Date(p.dateStart!).getTime())

    return times.length
      ? {
          min: Math.min(...times),
          max: Math.max(...times),
        }
      : {
          min: 0,
          max: 0,
        }
  }, [withDates])

  const [dateRange, setDateRange] = useState<[number, number]>([dateBounds.min, dateBounds.max])

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase()

    return posts.filter((post) => {
      if (!post.coordinates) return false

      if (activeTags.length > 0) {
        const postTagNames = post.issueTags?.map((t) => t.name) ?? []

        if (!activeTags.some((t) => postTagNames.includes(t))) {
          return false
        }
      }

      if (activeScales.length > 0 && (!post.scale || !activeScales.includes(post.scale))) {
        return false
      }

      if (post.dateStart) {
        const t = new Date(post.dateStart).getTime()

        if (t < dateRange[0] || t > dateRange[1]) {
          return false
        }
      }

      if (q) {
        const haystack = [post.title, post.author, post.locationDescription, post.excerpt]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(q)) {
          return false
        }
      }

      return true
    })
  }, [posts, activeTags, activeScales, dateRange, search])

  const selectedColor = selectedPost?.issueTags?.[0]?.color ?? DEFAULT_ACCENT

  function toggleTag(name: string) {
    setActiveTags((prev) => {
      if (!isFull) {
        return prev.includes(name) ? [] : [name]
      }

      return prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    })
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
        geometry: {
          type: 'Point',
          coordinates: p.coordinates,
        },
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
          ? 'relative isolate h-[calc(100vh-120px)] min-h-[500px] lg:h-full lg:min-h-0'
          : 'relative isolate h-[470px] overflow-hidden border border-ink'
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
                eventHandlers={{
                  click: () => setSelectedPost(post),
                }}
              />
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* MOBILE FILTER BUTTON */}
      {isFull && (
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-full border border-ink bg-paper px-4 py-2 text-[10px] font-semibold uppercase shadow-md lg:hidden"
        >
          <span className="h-2 w-2 rounded-full bg-ink" />
          Filters
        </button>
      )}

      {/* SELECTED POST */}
      {selectedPost && (
        <div
          className="absolute bottom-4 left-4 top-4 z-[1000] flex w-74 flex-col rounded-xl border border-ink p-4 text-white shadow-lg"
          style={{
            backgroundColor: `${selectedColor}e6`,
          }}
        >
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute right-3 top-4 cursor-pointer text-base opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            ✕
          </button>

          {selectedPost.locationDescription && (
            <p className="mt-4 pr-12 text-[10px] font-semibold uppercase leading-tight opacity-80">
              {selectedPost.locationDescription}
            </p>
          )}

          {selectedPost.media?.[0]?.url && (
            <div className="relative mb-2 mt-4 h-32 w-full overflow-hidden rounded">
              <Image
                src={selectedPost.media[0].url}
                alt={selectedPost.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <h3 className="mt-4 font-mono text-base font-bold leading-none">{selectedPost.title}</h3>

          {selectedPost.excerpt && (
            <p className="mt-2 text-sm leading-snug opacity-80">
              {selectedPost.excerpt.slice(0, 140)}
              {selectedPost.excerpt.length > 140 ? '...' : ''}
            </p>
          )}

          <Link
            href={`/archives/${selectedPost.slug}`}
            className="mt-auto mb-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase"
          >
            <span className="pt-0.5">Explore</span>
            <HiArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  )

  if (!isFull) {
    return (
      <section className="border-ink lg:px-6 px-0 py-12">
        <HoverText
          as="h2"
          text="Movement Map"
          className="mb-10 pt-2 lg:px-0 px-6 font-mono text-lg font-bold uppercase tracking-wide"
        />
        {mapEl}

        <div className="mt-4 flex lg:px-0 px-6 flex-wrap gap-2">
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
                className="flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-[10px] font-semibold uppercase"
                style={
                  isActive
                    ? {
                        backgroundColor: tag.color,
                        borderColor: tag.color,
                        color: '#fff',
                      }
                    : undefined
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: isActive ? '#fff' : tag.color,
                  }}
                />

                {tag.name}
              </button>
            )
          })}
        </div>

        <Link
          href="/map"
          className="lg:px-0 px-6  mt-10 inline-block text-xs font-semibold uppercase underline"
        >
          Open full map →
        </Link>
      </section>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col border-t border-ink pt-18 lg:h-screen lg:flex-row">
      {/* DESKTOP FILTER SIDEBAR */}
      <aside className="hidden flex-col overflow-y-auto border-b border-ink p-6 lg:flex lg:w-80 lg:border-b-0 lg:border-r">
        <MapFilters
          tags={tags}
          activeTags={activeTags}
          setActiveTags={setActiveTags}
          activeScales={activeScales}
          setActiveScales={setActiveScales}
          search={search}
          setSearch={setSearch}
          dateBounds={dateBounds}
          dateRange={dateRange}
          setDateRange={setDateRange}
          applyDatePreset={applyDatePreset}
          exportCSV={exportCSV}
          exportGeoJSON={exportGeoJSON}
          DualRangeSlider={DualRangeSlider}
        />
      </aside>

      {/* MOBILE FILTER DRAWER */}
      {mobileFiltersOpen && (
        <>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 z-[1999] bg-black/25 lg:hidden"
          />

          <aside className="fixed inset-y-0 right-0 z-[2000] flex w-[min(88vw,380px)] flex-col overflow-y-auto border-l border-ink bg-paper p-6 shadow-2xl lg:hidden">
            <MapFilters
              tags={tags}
              activeTags={activeTags}
              setActiveTags={setActiveTags}
              activeScales={activeScales}
              setActiveScales={setActiveScales}
              search={search}
              setSearch={setSearch}
              dateBounds={dateBounds}
              dateRange={dateRange}
              setDateRange={setDateRange}
              applyDatePreset={applyDatePreset}
              exportCSV={exportCSV}
              exportGeoJSON={exportGeoJSON}
              DualRangeSlider={DualRangeSlider}
              onDone={() => setMobileFiltersOpen(false)}
            />
          </aside>
        </>
      )}

      {/* MAP */}
      <div className="relative min-h-[calc(100vh-120px)] flex-1 lg:min-h-0">{mapEl}</div>
    </div>
  )
}
