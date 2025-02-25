'use client'

import { useRef } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { GameState, deserializePosition } from '../types/conway';
import { computeNextGeneration } from '../utils/conwayLogic';

interface ConwayGridProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export function ConwayGrid({ gameState, setGameState }: ConwayGridProps) {
  const gridRef = useRef<THREE.Group>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Advance the simulation by one step
  const step = () => {
    const newActiveCells = computeNextGeneration(gameState);
    setGameState(prev => ({ ...prev, activeCells: newActiveCells }));
  };
  
  // Animation loop with proper type annotations
  useFrame((_: RootState, delta: number) => {
    if (gameState.running) {
      lastUpdateRef.current += delta;
      if (lastUpdateRef.current > (1.0 / gameState.speed)) {
        step();
        lastUpdateRef.current = 0;
      }
    }
    
    if (gridRef.current) {
      gridRef.current.rotation.y += delta * 0.05;
    }
  });
  
  return (
    <group ref={gridRef}>
      {/* Grid box to show boundaries */}
      <mesh position={[gameState.gridSize/2 - 0.5, gameState.gridSize/2 - 0.5, gameState.gridSize/2 - 0.5]}>
        <boxGeometry args={[gameState.gridSize, gameState.gridSize, gameState.gridSize]} />
        <meshBasicMaterial color="white" wireframe={true} transparent opacity={0.1} />
      </mesh>
      
      {/* Render active cells */}
      {Array.from(gameState.activeCells).map(cellKey => {
        const [x, y, z] = deserializePosition(cellKey);
        return (
          <mesh key={cellKey} position={[x, y, z]}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="lightgrey" />
          </mesh>
        );
      })}
    </group>
  );
} 