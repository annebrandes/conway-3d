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
            <meshStandardMaterial color="cyan" />
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
  const initializeRandom = () => {
    const newActiveCells = new Set<string>()
    const { gridSize } = gameState
    
    // Add random cells (about 10% of the grid)
    const totalCells = Math.floor((gridSize * gridSize * gridSize) * 0.1)
    
    for (let i = 0; i < totalCells; i++) {
      const x = Math.floor(Math.random() * gridSize)
      const y = Math.floor(Math.random() * gridSize)
      const z = Math.floor(Math.random() * gridSize)
      newActiveCells.add(serializePosition([x, y, z]))
    }
    
    setGameState(prev => ({ ...prev, activeCells: newActiveCells, running: false }))
  }
  
  // Initialize on mount
  useEffect(() => {
    initializeRandom()
  }, [])
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="controls p-4 bg-black/10 backdrop-blur flex gap-4 flex-wrap">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setGameState(prev => ({ ...prev, running: !prev.running }))}
        >
          {gameState.running ? 'Pause' : 'Play'}
        </button>
        
        <button 
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => {
            if (!gameState.running) {
              // Create a ref to the ConwayGrid's step function
              const tempState = {...gameState};
              // Make a single update using the current state
              setGameState(prev => {
                // Create a new Set with the same values for the active cells
                const newState = {
                  ...prev,
                  activeCells: new Set([...prev.activeCells])
                };
                
                // Find neighbors and apply rules (simplified step function)
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
          }}
        >
          Step
        </button>
        
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={initializeRandom}
        >
          Random
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-white">Speed:</span>
          <input 
            type="range" 
            min="0.5" 
            max="5" 
            step="0.5" 
            value={gameState.speed} 
            onChange={e => setGameState(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
            className="w-24"
          />
        </div>
      </div>
      
      <div className="flex-1">
        <Canvas camera={{ position: [15, 15, 15], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <ConwayGrid gameState={gameState} setGameState={setGameState} />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  )
} 