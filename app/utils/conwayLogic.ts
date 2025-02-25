import { CellPosition, GameState, serializePosition, deserializePosition } from '../types/conway';

// Count neighbors of a cell in 3D space
export const countNeighbors = (pos: CellPosition, activeCells: Set<string>): number => {
  const [x, y, z] = pos;
  let count = 0;
  
  // Check all 26 neighboring cells in 3D space
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        // Skip the cell itself
        if (dx === 0 && dy === 0 && dz === 0) continue;
        
        const neighborPos: CellPosition = [x + dx, y + dy, z + dz];
        const neighborKey = serializePosition(neighborPos);
        
        if (activeCells.has(neighborKey)) {
          count++;
        }
      }
    }
  }
  
  return count;
};

// Advance the simulation by one step
export const computeNextGeneration = (gameState: GameState): Set<string> => {
  const newActiveCells = new Set<string>();
  const { gridSize, activeCells } = gameState;
  
  // Check all active cells and their neighbors
  const cellsToCheck = new Set<string>();
  
  // Add all active cells
  activeCells.forEach(cell => cellsToCheck.add(cell));
  
  // Add all neighbors of active cells
  activeCells.forEach(cell => {
    const [x, y, z] = deserializePosition(cell);
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          
          const neighborPos: CellPosition = [x + dx, y + dy, z + dz];
          // Skip cells outside the grid boundaries
          if (neighborPos.some(coord => coord < 0 || coord >= gridSize)) continue;
          
          cellsToCheck.add(serializePosition(neighborPos));
        }
      }
    }
  });
  
  // Apply 3D Conway's rules
  cellsToCheck.forEach(cellKey => {
    const pos = deserializePosition(cellKey);
    const isAlive = activeCells.has(cellKey);
    const neighbors = countNeighbors(pos, activeCells);
    
    // Common 3D Conway ruleset: survive with 4-6 neighbors, born with 5-7 neighbors
    if (isAlive && (neighbors >= 4 && neighbors <= 6)) {
      newActiveCells.add(cellKey);
    } else if (!isAlive && (neighbors >= 5 && neighbors <= 7)) {
      newActiveCells.add(cellKey);
    }
  });
  
  return newActiveCells;
};

// Initialize with random cells
export const generateRandomCells = (gridSize: number): Set<string> => {
  const newActiveCells = new Set<string>();
  
  // Add random cells (about 10% of the grid)
  const totalCells = Math.floor((gridSize * gridSize * gridSize) * 0.1);
  
  for (let i = 0; i < totalCells; i++) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const z = Math.floor(Math.random() * gridSize);
    newActiveCells.add(serializePosition([x, y, z]));
  }
  
  return newActiveCells;
}; 