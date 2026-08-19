'use client'

import type { Dispatch, SetStateAction } from 'react'

type IssueTag = {
  id: string
  name: string
  color?: string
}

type Scale = 'small_group' | 'neighbourhood' | 'city_wide' | 'multi_city'

const SCALE_LABELS: Record<Scale, string> = {
  small_group: 'Small group (≤10)',
  neighbourhood: 'Neighbourhood',
  city_wide: 'City-wide',
  multi_city: 'Multi-city',
}

type MapFiltersProps = {
  tags: IssueTag[]
  activeTags: string[]
  setActiveTags: Dispatch<SetStateAction<string[]>>

  activeScales: Scale[]
  setActiveScales: Dispatch<SetStateAction<Scale[]>>

  search: string
  setSearch: Dispatch<SetStateAction<string>>

  dateBounds: {
    min: number
    max: number
  }

  dateRange: [number, number]
  setDateRange: Dispatch<SetStateAction<[number, number]>>

  applyDatePreset: (days: number | 'all') => void

  exportCSV: () => void
  exportGeoJSON: () => void

  onDone?: () => void

  DualRangeSlider: React.ComponentType<{
    min: number
    max: number
    value: [number, number]
    onChange: (value: [number, number]) => void
    step?: number
  }>
}

const DAY_MS = 24 * 60 * 60 * 1000

export function MapFilters({
  tags,
  activeTags,
  setActiveTags,
  activeScales,
  setActiveScales,
  search,
  setSearch,
  dateBounds,
  dateRange,
  setDateRange,
  applyDatePreset,
  exportCSV,
  exportGeoJSON,
  onDone,
  DualRangeSlider,
}: MapFiltersProps) {
  function toggleTag(name: string) {
    setActiveTags((prev) =>
      prev.includes(name)
        ? prev.filter((tag) => tag !== name)
        : [...prev, name],
    )
  }

  function toggleScale(scale: Scale) {
    setActiveScales((prev) =>
      prev.includes(scale)
        ? prev.filter((item) => item !== scale)
        : [...prev, scale],
    )
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* MOBILE HEADER */}
      {onDone && (
        <div className="flex items-center justify-between border-b border-ink pb-5">
          <div>
            <p className="font-mono text-sm font-bold uppercase">
              Filters
            </p>

            <p className="mt-1 text-[10px] uppercase opacity-60">
              Refine movement records
            </p>
          </div>

          <button
            type="button"
            onClick={onDone}
            className="flex h-9 w-9 items-center justify-center border border-ink text-sm"
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase opacity-70">
          Search
        </label>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title, author, location..."
          className="w-full border border-ink bg-transparent px-3 py-2 text-sm outline-none"
        />
      </div>

      {/* ISSUES */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase opacity-70">
          Issues
        </p>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isActive = activeTags.includes(tag.name)

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase transition-colors"
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
      </div>

      {/* SCALE */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase opacity-70">
          Scale
        </p>

        <div className="flex flex-col gap-1.5">
          {(Object.keys(SCALE_LABELS) as Scale[]).map((scale) => {
            const isActive = activeScales.includes(scale)

            return (
              <button
                key={scale}
                type="button"
                onClick={() => toggleScale(scale)}
                className={`rounded-full border border-ink px-3 py-2 text-left text-[10px] font-semibold uppercase transition-colors ${
                  isActive ? 'bg-ink text-paper' : ''
                }`}
              >
                {SCALE_LABELS[scale]}
              </button>
            )
          })}
        </div>
      </div>

      {/* DATE */}
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
              type="button"
              onClick={() => applyDatePreset(7)}
              className="rounded-full border border-ink px-2.5 py-1 text-[10px] font-semibold uppercase"
            >
              Last week
            </button>

            <button
              type="button"
              onClick={() => applyDatePreset(30)}
              className="rounded-full border border-ink px-2.5 py-1 text-[10px] font-semibold uppercase"
            >
              Last month
            </button>

            <button
              type="button"
              onClick={() => applyDatePreset('all')}
              className="rounded-full border border-ink px-2.5 py-1 text-[10px] font-semibold uppercase"
            >
              All time
            </button>
          </div>
        </div>
      )}

      {/* EXPORT */}
      <div className="mt-auto flex gap-2 border-t border-ink pt-6">
        <button
          type="button"
          onClick={exportCSV}
          className="flex-1 border border-ink px-3 py-2 text-[10px] font-semibold uppercase"
        >
          Export CSV
        </button>

        <button
          type="button"
          onClick={exportGeoJSON}
          className="flex-1 border border-ink px-3 py-2 text-[10px] font-semibold uppercase"
        >
          Export GeoJSON
        </button>
      </div>
    </div>
  )
}