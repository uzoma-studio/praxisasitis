'use client'

import { useState, useCallback } from 'react'
import { useField } from '@payloadcms/ui'
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

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function GeoPointField(props: any) {
  const { path } = props
  const { value, setValue } = useField<[number, number] | undefined>({ path })

  // Sibling field on the same collection, so we can auto-fill it from search results.
  // Assumes 'coordinates' and 'locationDescription' are both top-level fields on Posts.
  const locationDescriptionPath = path.replace(/coordinates$/, 'locationDescription')
  const { setValue: setLocationDescription } = useField<string>({ path: locationDescriptionPath })

  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>(
    [],
  )

  const lng = value?.[0]
  const lat = value?.[1]
  const position: [number, number] = lat && lng ? [lat, lng] : NIGERIA_CENTER

  const handlePick = useCallback(
    (pickedLat: number, pickedLng: number) => {
      setValue([pickedLng, pickedLat]) // GeoJSON order: [lng, lat]
    },
    [setValue],
  )

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
      e.preventDefault() // critical — stops Enter from bubbling up into Payload's outer document form
      runSearch()
    }
  }

  function selectResult(result: { lat: string; lon: string; display_name: string }) {
    handlePick(parseFloat(result.lat), parseFloat(result.lon))
    setLocationDescription(result.display_name)
    setResults([])
    setQuery(result.display_name)
  }

  return (
    <div className="field-type">
      <label className="field-label">Geotag (lat/long)</label>

      {/* Plain div, not <form> — Payload's document edit view already wraps everything
          in its own <form>; a nested form causes the browser to submit/reload the page. */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for an address or landmark..."
          style={{ flex: 1, padding: 8 }}
        />
        <button type="button" onClick={runSearch} disabled={searching}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <ul
          style={{ marginBottom: 8, border: '1px solid #ccc', maxHeight: 150, overflowY: 'auto' }}
        >
          {results.map((r, i) => (
            <li key={i} style={{ padding: 6, cursor: 'pointer' }} onClick={() => selectResult(r)}>
              {r.display_name}
            </li>
          ))}
        </ul>
      )}

      <div style={{ height: 320, marginBottom: 8 }}>
        <MapContainer
          center={position}
          zoom={lat ? 13 : 6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ClickHandler onPick={handlePick} />
          {lat && lng && <Marker position={[lat, lng]} />}
        </MapContainer>
      </div>

      <p style={{ fontSize: 12, opacity: 0.7 }}>
        Search an address, or click directly on the map to place/adjust the pin.
        {lat && lng ? ` Current: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : ' No location set yet.'}
      </p>
    </div>
  )
}
