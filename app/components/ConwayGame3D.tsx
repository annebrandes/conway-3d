'use client'

import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { GameState } from '../types/conway'
import { generateRandomCells } from '../utils/conwayLogic'
import { ConwayGrid } from './ConwayGrid'
import { GameControls } from './GameControls'

// Main Conway 3D Component
export default function ConwayGame3D() {
  const [gameState, setGameState] = useState<GameState>({
    activeCells: new Set<string>(),
    gridSize: 10,
    running: false,
    speed: 1,
  })
  
  // Initialize on mount
  useEffect(() => {
    const initialCells = generateRandomCells(gameState.gridSize);
    setGameState(prev => ({ ...prev, activeCells: initialCells }));
  }, [])

  return (
    <div className="w-full h-screen bg-black relative" style={{ fontFamily: 'Calibre, sans-serif' }}>
      <Canvas camera={{ position: [20, 20, 20], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <ConwayGrid gameState={gameState} setGameState={setGameState} />
        <OrbitControls enableDamping dampingFactor={0.25} />
      </Canvas>
      
      <GameControls gameState={gameState} setGameState={setGameState} />
    </div>
  )
} 