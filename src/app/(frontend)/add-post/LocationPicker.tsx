'use client'

import { useCallback, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const NIGERIA_CENTER: [number, number] = [9.082, 8.6753]

type SearchResult = { display_name: string; lat: string; lon: string }

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({
  lat,
  lng,
  onPick,
  onSelectSearchResult,
}: {
  lat?: number
  lng?: number
  onPick: (lat: number, lng: number) => void
  onSelectSearchResult: (result: { lat: number; lng: number; description: string }) => void
}) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  const position: [number, number] = lat && lng ? [lat, lng] : NIGERIA_CENTER

  const runSearch = useCallback(async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ng&limit=5`,
        { headers: { 'Accept-Language': 'en' } },
      )
      const data = await res.json()
      setResults(data)
    } finally {
      setSearching(false)
    }
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      runSearch()
    }
  }

  function selectResult(result: SearchResult) {
    const resultLat = parseFloat(result.lat)
    const resultLng = parseFloat(result.lon)
    onSelectSearchResult({ lat: resultLat, lng: resultLng, description: result.display_name })
    setResults([])
    setQuery(result.display_name)
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for an address or landmark…"
          className={inputClass}
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={searching}
          className="shrink-0 border border-ink px-4 py-3 font-mono text-xs font-bold uppercase hover:bg-ink hover:text-paper disabled:opacity-60"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="mt-2 max-h-40 divide-y divide-ink overflow-y-auto border border-ink">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => selectResult(r)}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-ink hover:text-paper"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 h-72 border border-ink">
        <MapContainer
          center={position}
          zoom={lat ? 13 : 6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ClickHandler onPick={onPick} />
          {lat && lng && <Marker position={[lat, lng]} />}
        </MapContainer>
      </div>

      <p className="mt-2 text-xs opacity-70">
        Search an address, or click directly on the map to place or adjust the pin.
        {lat && lng ? ` Current: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : ' No location set yet.'}
      </p>
    </div>
  )
}

const inputClass =
  'w-full flex-1 border border-ink bg-transparent px-5 py-4 font-mono text-sm outline-none placeholder:text-ink/45 focus:ring-1 focus:ring-ink'
