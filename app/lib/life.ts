// Conway's Game of Life in 3D.
//
// The grid is a flat Uint8Array of size^3 (1 = alive, 0 = dead), indexed as
// x + size * (y + size * z). A companion Uint16Array tracks how many
// generations each cell has been alive, which drives cell coloring.

export interface Rules {
  surviveMin: number;
  surviveMax: number;
  birthMin: number;
  birthMax: number;
}

// A common 3D ruleset: live cells survive with 4-6 of their 26 neighbors,
// dead cells are born with exactly 5-7.
export const DEFAULT_RULES: Rules = { surviveMin: 4, surviveMax: 6, birthMin: 5, birthMax: 7 };

export interface Simulation {
  size: number;
  cells: Uint8Array;
  ages: Uint16Array;
  generation: number;
  births: number;
  deaths: number;
}

export const cellIndex = (x: number, y: number, z: number, size: number): number =>
  x + size * (y + size * z);

// Seed a random blob in the central region of the grid. Concentrating the
// initial soup gives it room to grow outward instead of dying at the walls.
export const createRandomSimulation = (size: number, density = 0.35): Simulation => {
  const cells = new Uint8Array(size * size * size);
  const lo = Math.floor(size / 4);
  const hi = Math.ceil((3 * size) / 4);

  for (let z = lo; z < hi; z++) {
    for (let y = lo; y < hi; y++) {
      for (let x = lo; x < hi; x++) {
        if (Math.random() < density) cells[cellIndex(x, y, z, size)] = 1;
      }
    }
  }

  const ages = new Uint16Array(cells.length);
  let seeded = 0;
  for (let i = 0; i < cells.length; i++) {
    ages[i] = cells[i];
    seeded += cells[i];
  }
  return { size, cells, ages, generation: 0, births: seeded, deaths: 0 };
};

// Advance one generation
export const stepSimulation = (sim: Simulation, rules: Rules): Simulation => {
  const { size, cells, ages } = sim;
  const nextCells = new Uint8Array(cells.length);
  const nextAges = new Uint16Array(cells.length);
  let births = 0;
  let deaths = 0;

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let neighbors = 0;
        for (let dz = -1; dz <= 1; dz++) {
          const nz = z + dz;
          if (nz < 0 || nz >= size) continue;
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= size) continue;
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0 && dz === 0) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= size) continue;
              neighbors += cells[cellIndex(nx, ny, nz, size)];
            }
          }
        }

        const i = cellIndex(x, y, z, size);
        const alive = cells[i] === 1;
        const survives = alive && neighbors >= rules.surviveMin && neighbors <= rules.surviveMax;
        const born = !alive && neighbors >= rules.birthMin && neighbors <= rules.birthMax;

        if (survives || born) {
          nextCells[i] = 1;
          nextAges[i] = survives ? Math.min(ages[i] + 1, 65535) : 1;
          if (born) births++;
        } else if (alive) {
          deaths++;
        }
      }
    }
  }

  return { size, cells: nextCells, ages: nextAges, generation: sim.generation + 1, births, deaths };
};

export const countAlive = (sim: Simulation): number => {
  let count = 0;
  for (let i = 0; i < sim.cells.length; i++) count += sim.cells[i];
  return count;
};
