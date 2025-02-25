'use client'

import dynamic from 'next/dynamic'

// Import the Conway component with no SSR since it uses browser APIs
const ConwayGame3D = dynamic(() => import('./ConwayGame3D'), { ssr: false })

export default function ConwayWrapper() {
  return <ConwayGame3D />
} 