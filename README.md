# Conway's Game of Life in 3D

A three-dimensional implementation of Conway's Game of Life built with Next.js and React Three Fiber.

## About Conway's Game of Life

Conway's Game of Life is a cellular automaton devised by mathematician John Conway in 1970. In its classic form, it simulates evolution of cells on a 2D grid according to simple rules:

1. Any live cell with 2-3 live neighbors survives.
2. Any dead cell with exactly 3 live neighbors becomes a live cell.
3. All other live cells die, and all other dead cells stay dead.

### How 3D Conway Differs from 2D

In traditional 2D Conway, each cell has 8 neighbors. In 3D, each cell has 26 neighbors (a 3×3×3 cube centered on the cell, minus the cell itself). The new rules of a 3D grid are:

1. Any live cell with 4-6 live neighbors survives.
2. Any dead cell with 5-7 live neighbors becomes a live cell.
3. All other live cells die, and all other dead cells stay dead.

## Getting Started

First, run the development server:

```bash
pnpm install
pnpm run dev
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the simulation.
