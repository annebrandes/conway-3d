'use client'

import dynamic from 'next/dynamic'

// The WebGL canvas needs browser APIs, so skip server-side rendering
const Life3D = dynamic(() => import('./Life3D'), { ssr: false })

export default function LifeApp() {
  return <Life3D />
}
