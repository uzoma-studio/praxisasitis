import L from 'leaflet'

// Centered on Lagos, zoomed out enough to show most of Nigeria.
export const MAP_CENTER: [number, number] = [6.5244, 3.3792]
export const DEFAULT_ZOOM = 6

// Fallback used whenever a post has no issue tags / no tag color set.
export const DEFAULT_ACCENT = '#b23b2e'

// CartoDB Positron, full variant — pale peach landmass, muted blue water,
// plus roads, rivers, and place labels baked into the tiles.
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '

export function markerIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<span style="
      display:block;
      width:20px;height:20px;
      border-radius:9999px;
      background:${color};
      border:2px solid white;
      box-shadow:0 0 0 1px rgba(0,0,0,0.35);
    "></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Solid filled circle with a count, ringed in a lighter tint of the same
// color — mirrors the reference screenshot's cluster bubbles rather than
// the default leaflet.markercluster look.
export function clusterIcon(cluster: any) {
  const count = cluster.getChildCount()
  const size = count >= 10 ? 44 : count >= 5 ? 38 : 32

  return L.divIcon({
    className: '',
    html: `<div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:${size}px;
      height:${size}px;
      border-radius:9999px;
      background:#5b8bab;
      color:#fff;
      font-family:ui-monospace, monospace;
      font-weight:600;
      font-size:13px;
      border:5px solid rgba(91,139,171,0.35);
      box-shadow:0 1px 3px rgba(0,0,0,0.25);
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}
