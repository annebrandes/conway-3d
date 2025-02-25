// Types for Conway's Game of Life 3D

// Type for cell coordinates
export type CellPosition = [number, number, number]

// Game state type
export interface GameState {
  activeCells: Set<string>;
  gridSize: number;
  running: boolean;
  speed: number;
}

// Utility to serialize/deserialize cell positions
export const serializePosition = (pos: CellPosition): string => `${pos[0]},${pos[1]},${pos[2]}`
export const deserializePosition = (key: string): CellPosition => key.split(',').map(Number) as CellPosition 