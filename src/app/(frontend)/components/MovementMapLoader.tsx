'use client'

import dynamic from 'next/dynamic'

export const MovementMap = dynamic(() => import('./Movementmap').then((m) => m.MovementMap), {
  ssr: false,
})