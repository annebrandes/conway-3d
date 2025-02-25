'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, RootState } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Type for cell coordinates
type CellPosition = [number, number, number]

// Game state type
interface GameState {
  activeCells: Set<string>;
  gridSize: number;
  running: boolean;
  speed: number;
}

// Utility to serialize/deserialize cell positions
const serializePosition = (pos: CellPosition): string => `${pos[0]},${pos[1]},${pos[2]}`
const deserializePosition = (key: string): CellPosition => key.split(',').map(Number) as CellPosition

// Conway's 3D Grid Component
function ConwayGrid({ gameState, setGameState }: { 
  gameState: GameState, 
  setGameState: React.Dispatch<React.SetStateAction<GameState>> 
}) {
  const gridRef = useRef<THREE.Group>(null)
  const lastUpdateRef = useRef<number>(0)
  
  // Count neighbors of a cell in 3D space
  const countNeighbors = (pos: CellPosition): number => {
    const [x, y, z] = pos
    let count = 0
    
    // Check all 26 neighboring cells in 3D space
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          // Skip the cell itself
          if (dx === 0 && dy === 0 && dz === 0) continue
          
          const neighborPos: CellPosition = [x + dx, y + dy, z + dz]
          const neighborKey = serializePosition(neighborPos)
          
          if (gameState.activeCells.has(neighborKey)) {
            count++
          }
        }
      }
    }
    
    return count
  }
  
  // Advance the simulation by one step
  const step = () => {
    const newActiveCells = new Set<string>()
    const { gridSize, activeCells } = gameState
    
    // Check all active cells and their neighbors
    const cellsToCheck = new Set<string>()
    
    // Add all active cells
    activeCells.forEach(cell => cellsToCheck.add(cell))
    
    // Add all neighbors of active cells
    activeCells.forEach(cell => {
      const [x, y, z] = deserializePosition(cell)
      
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (dx === 0 && dy === 0 && dz === 0) continue
            
            const neighborPos: CellPosition = [x + dx, y + dy, z + dz]
            // Skip cells outside the grid boundaries
            if (neighborPos.some(coord => coord < 0 || coord >= gridSize)) continue
            
            cellsToCheck.add(serializePosition(neighborPos))
          }
        }
      }
    })
    
    // Apply 3D Conway's rules
    cellsToCheck.forEach(cellKey => {
      const pos = deserializePosition(cellKey)
      const isAlive = activeCells.has(cellKey)
      const neighbors = countNeighbors(pos)
      
      // Common 3D Conway ruleset: survive with 4-6 neighbors, born with 5-7 neighbors
      if (isAlive && (neighbors >= 4 && neighbors <= 6)) {
        newActiveCells.add(cellKey)
      } else if (!isAlive && (neighbors >= 5 && neighbors <= 7)) {
        newActiveCells.add(cellKey)
      }
    })
    
    setGameState(prev => ({ ...prev, activeCells: newActiveCells }))
  }
  
  // Animation loop with proper type annotations
  useFrame((_: RootState, delta: number) => {
    if (gameState.running) {
      lastUpdateRef.current += delta
      if (lastUpdateRef.current > (1.0 / gameState.speed)) {
        step()
        lastUpdateRef.current = 0
      }
    }
    
    if (gridRef.current) {
      gridRef.current.rotation.y += delta * 0.05
    }
  })
  
  return (
    <group ref={gridRef}>
      {/* Grid box to show boundaries */}
      <mesh position={[gameState.gridSize/2 - 0.5, gameState.gridSize/2 - 0.5, gameState.gridSize/2 - 0.5]}>
        <boxGeometry args={[gameState.gridSize, gameState.gridSize, gameState.gridSize]} />
        <meshBasicMaterial color="white" wireframe={true} transparent opacity={0.1} />
      </mesh>
      
      {/* Render active cells */}
      {Array.from(gameState.activeCells).map(cellKey => {
        const [x, y, z] = deserializePosition(cellKey)
        return (
          <mesh key={cellKey} position={[x, y, z]}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="lightgrey" />
          </mesh>
        )
      })}
    </group>
  )
}

// Main Conway 3D Component
export default function ConwayGame3D() {
  const [gameState, setGameState] = useState<GameState>({
    activeCells: new Set<string>(),
    gridSize: 10,
    running: false,
    speed: 1,
  })
  
  // Initialize with random cells
  const initializeRandom = (size?: number) => {
    // Determine grid size to use
    const gridSize = size !== undefined ? size : gameState.gridSize;
    
    // Create new active cells directly (no delayed initialization)
    const newActiveCells = new Set<string>();
    
    // Add random cells (about 10% of the grid)
    const totalCells = Math.floor((gridSize * gridSize * gridSize) * 0.1);
    
    for (let i = 0; i < totalCells; i++) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      const z = Math.floor(Math.random() * gridSize);
      newActiveCells.add(serializePosition([x, y, z]));
    }
    
    // Update state in a single operation
    setGameState(prev => ({
      ...prev,
      activeCells: newActiveCells,
      gridSize: gridSize,
      running: false
    }));
  };
  
  // Initialize on mount
  useEffect(() => {
    initializeRandom()
  }, [])
  
  // Extract step function to avoid duplication
  const handleStep = () => {
    if (!gameState.running) {
      setGameState(prev => {
        const cellsToCheck = new Set<string>();
        const newActiveCells = new Set<string>();
        
        // Add all active cells and their neighbors to check
        prev.activeCells.forEach(cell => {
          cellsToCheck.add(cell);
          
          const [x, y, z] = deserializePosition(cell);
          
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dy === 0 && dz === 0) continue;
                
                const neighborPos: CellPosition = [x + dx, y + dy, z + dz];
                // Skip cells outside the grid boundaries
                if (neighborPos.some(coord => coord < 0 || coord >= prev.gridSize)) continue;
                
                cellsToCheck.add(serializePosition(neighborPos));
              }
            }
          }
        });
        
        // Define a helper function to count neighbors
        const countNeighbors = (pos: CellPosition): number => {
          const [x, y, z] = pos;
          let count = 0;
          
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dy === 0 && dz === 0) continue;
                
                const neighborPos: CellPosition = [x + dx, y + dy, z + dz];
                const neighborKey = serializePosition(neighborPos);
                
                if (prev.activeCells.has(neighborKey)) {
                  count++;
                }
              }
            }
          }
          
          return count;
        };
        
        // Apply rules to all cells to check
        cellsToCheck.forEach(cellKey => {
          const pos = deserializePosition(cellKey);
          const isAlive = prev.activeCells.has(cellKey);
          const neighbors = countNeighbors(pos);
          
          // Apply 3D Conway rules
          if (isAlive && (neighbors >= 4 && neighbors <= 6)) {
            newActiveCells.add(cellKey);
          } else if (!isAlive && (neighbors >= 5 && neighbors <= 7)) {
            newActiveCells.add(cellKey);
          }
        });
        
        return { ...prev, activeCells: newActiveCells };
      });
    }
  };

  return (
    <div className="w-full h-screen bg-black relative" style={{ fontFamily: 'Calibre, sans-serif' }}>
      <Canvas camera={{ position: [20, 20, 20], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <ConwayGrid gameState={gameState} setGameState={setGameState} />
        <OrbitControls enableDamping dampingFactor={0.25} />
      </Canvas>
      
      <div className="controls fixed right-4 bottom-4 bg-gray-800/70 backdrop-blur-lg p-5 rounded-md shadow-xl flex flex-col gap-4 z-50 w-64 transition-all duration-300 ease-in-out">
        <h3 className="text-white/90 font-medium text-lg mb-1 tracking-wide pb-2">Controls</h3>
      
        {/* Play/Pause Toggle Button */}
        <button 
          className={`px-4 py-2.5 border border-gray-700 rounded-md flex items-center justify-center gap-2 transition-all duration-300 ${
            gameState.running 
            ? 'bg-gray-700 ' 
            : 'bg-gray-800'
          }`}
          onClick={() => setGameState(prev => ({ ...prev, running: !prev.running }))}
        >
          <div className={`w-4 h-4 ${gameState.running ? 'text-red-400' : 'text-green-400 animate-pulse'}`}>
            {gameState.running ? (
              // Pause icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              // Play icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-white font-medium">{gameState.running ? 'Pause' : 'Play'}</span>
        </button>
        
        <div className="flex gap-2 w-full">
          {/* Step Button */}
          <button 
            className="flex-1 px-3 py-2.5 bg-gray-800 text-white rounded-md flex items-center justify-center gap-2 transition-all duration-300 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleStep}
            disabled={gameState.running}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Step</span>
          </button>
          
          {/* Random Button */}
          <button 
            className="flex-1 px-3 py-2.5 bg-gray-800 text-white rounded-md flex items-center justify-center gap-2 transition-all duration-300 border border-gray-700"
            onClick={() => initializeRandom()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Random</span>
          </button>
        </div>
        
        {/* Speed Control */}
        <div className="flex flex-col items-start gap-2 mt-1">
          <div className="flex items-center gap-2 text-white/90">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M1.5 7.125c0-1.036.84-1.875 1.875-1.875h6c1.036 0 1.875.84 1.875 1.875v3.75c0 1.036-.84 1.875-1.875 1.875h-6A1.875 1.875 0 0 1 1.5 10.875v-3.75zm12 1.5c0-1.036.84-1.875 1.875-1.875h5.25c1.035 0 1.875.84 1.875 1.875v8.25c0 1.035-.84 1.875-1.875 1.875h-5.25a1.875 1.875 0 0 1-1.875-1.875v-8.25zM3 16.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875v2.25c0 1.035-.84 1.875-1.875 1.875h-5.25A1.875 1.875 0 0 1 3 18.375v-2.25z" clipRule="evenodd" />
            </svg>
            <span className="text-sm tracking-wide">Speed: <span className="text-white font-medium">{gameState.speed}x</span></span>
          </div>
          <div className="relative w-full h-6 flex items-center">
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.5" 
              value={gameState.speed} 
              onChange={e => setGameState(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
              className="w-full accent-white cursor-pointer appearance-none bg-gray-700/50 h-1 rounded-md outline-none"
              style={{
                background: `linear-gradient(to right, rgb(255 255 255 / 0.8) 0%, rgb(255 255 255 / 0.8) ${(gameState.speed - 0.5) * 100 / 4.5}%, rgb(75 85 99 / 0.5) ${(gameState.speed - 0.5) * 100 / 4.5}%, rgb(75 85 99 / 0.5) 100%)`
              }}
            />
          </div>
        </div>
        
        {/* Grid Size Control - Dropdown */}
        <div className="flex flex-col items-start gap-2 mt-1">
          <div className="flex items-center gap-2 text-white/90">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6zM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25z" clipRule="evenodd" />
            </svg>
            <span className="text-sm tracking-wide">Grid Size</span>
          </div>
          <div className="relative w-full">
            <select
              value={gameState.gridSize}
              onChange={e => {
                const newSize = parseInt(e.target.value, 10);
                initializeRandom(newSize);
              }}
              className="w-full appearance-none bg-gray-800/90 text-white/90 px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-white/50 pr-10 text-sm transition-all duration-200"
            >
              <option value="5">5³ (Small)</option>
              <option value="10">10³ (Medium)</option>
              <option value="15">15³ (Large)</option>
              <option value="20">20³ (Extra Large)</option>
              <option value="25">25³ (Huge)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-1 text-center italic">
          Click and drag to rotate the view
        </div>
      </div>
    </div>
  )
} 