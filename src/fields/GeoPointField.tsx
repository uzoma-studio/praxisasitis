'use client'

import dynamic from 'next/dynamic'

const GeoPointFieldInner = dynamic(
  () => import('./GeoPointFieldInner').then((mod) => mod.GeoPointField),
  {
    ssr: false,
    loading: () => <p style={{ fontSize: 12, opacity: 0.6 }}>Loading map…</p>,
  },
)

export function GeoPointField(props: any) {
  return <GeoPointFieldInner {...props} />
}