'use client'

import dynamic from 'next/dynamic'
import '../styles/fonts.css' // Import the font CSS

// Import the Conway component with no SSR since it uses browser APIs
const ConwayGame3D = dynamic(() => import('./ConwayGame3D'), { ssr: false })

export default function ConwayWrapper() {
  return <ConwayGame3D />
} 