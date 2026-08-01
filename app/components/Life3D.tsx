'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Edges, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {
  DEFAULT_RULES,
  Simulation,
  cellIndex,
  countAlive,
  createRandomSimulation,
  stepSimulation,
} from '../lib/life'
import { ControlPanel } from './ControlPanel'
import { StatsPanel, TelemetryBar } from './Hud'

const DEFAULT_SIZE = 24;
const HISTORY_WINDOW = 90;

// Soft image-based lighting from three's built-in room environment, so the
// cubes pick up gentle gradients instead of flat ambient shading.
function StudioEnvironment() {
  const gl = useThree(state => state.gl);
  const scene = useThree(state => state.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    return () => {
      scene.environment = null;
      envMap.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

interface CellsProps {
  sim: Simulation;
}

// All live cells drawn as one instanced mesh of beveled cubes. Newborn cells
// are near-white and slightly small; they deepen through pink toward red and
// grow to full size as they survive generations.
function Cells({ sim }: CellsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const capacity = sim.size ** 3;

  const geometry = useMemo(() => new RoundedBoxGeometry(0.86, 0.86, 0.86, 2, 0.1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { size, cells, ages } = sim;
    const half = (size - 1) / 2;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const color = new THREE.Color();
    let count = 0;

    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = cellIndex(x, y, z, size);
          if (cells[i] !== 1) continue;

          const growth = 0.78 + 0.22 * Math.min(ages[i] / 4, 1);
          position.set(x - half, y - half, z - half);
          scale.setScalar(growth);
          matrix.compose(position, quaternion, scale);
          mesh.setMatrixAt(count, matrix);

          const t = Math.min(ages[i] / 8, 1);
          color.setHSL(0.01, 0.02 + 0.83 * t, 0.95 - 0.45 * t);
          mesh.setColorAt(count, color);
          count++;
        }
      }
    }

    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [sim]);

  return (
    <instancedMesh key={capacity} ref={meshRef} args={[undefined, undefined, capacity]} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial roughness={0.32} metalness={0.05} envMapIntensity={0.65} />
    </instancedMesh>
  );
}

export default function Life3D() {
  const [sim, setSim] = useState<Simulation>(() => createRandomSimulation(DEFAULT_SIZE));
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(4); // generations per second
  const [history, setHistory] = useState<number[]>([]);

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const advance = () => setSim(prev => stepSimulation(prev, DEFAULT_RULES));
  const randomize = (size: number = sim.size) => {
    setHistory([]);
    setSim(createRandomSimulation(size));
  };

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(advance, 1000 / speed);
    return () => clearInterval(interval);
  }, [running, speed]);

  const population = useMemo(() => countAlive(sim), [sim]);

  useEffect(() => {
    setHistory(prev => [...prev.slice(-(HISTORY_WINDOW - 1)), population]);
  }, [sim, population]);

  const cameraDistance = sim.size * 1.7;

  return (
    <div className="relative h-full w-full">
      <Canvas
        key={sim.size}
        camera={{ position: [cameraDistance, cameraDistance * 0.7, cameraDistance], fov: 45 }}
      >
        <color attach="background" args={['#F2F5F9']} />
        <fog attach="fog" args={['#F2F5F9', cameraDistance * 1.6, cameraDistance * 3.6]} />
        <StudioEnvironment />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 2]} intensity={0.75} color="#FFFFFF" />
        <directionalLight position={[-3, -1, -3]} intensity={0.2} color="#B9D2F5" />

        {/* Lattice boundary as crisp hairline edges */}
        <mesh>
          <boxGeometry args={[sim.size, sim.size, sim.size]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color="#8FA3BC" />
        </mesh>

        {/* Ground reference grid and soft contact shadow */}
        <gridHelper
          args={[sim.size * 3, 24, '#C3CEDC', '#E2E8F1']}
          position={[0, -(sim.size / 2) - 1.5, 0]}
        />
        <ContactShadows
          position={[0, -(sim.size / 2) - 1.45, 0]}
          opacity={0.3}
          scale={sim.size * 2.4}
          blur={2.4}
          far={sim.size * 1.2}
          color="#1C2B45"
        />

        <Cells sim={sim} />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <TelemetryBar generation={sim.generation} population={population} size={sim.size} running={running} />
      <StatsPanel
        history={history}
        population={population}
        births={sim.births}
        deaths={sim.deaths}
        size={sim.size}
      />

      <ControlPanel
        running={running}
        speed={speed}
        size={sim.size}
        onToggleRunning={() => setRunning(r => !r)}
        onStep={advance}
        onRandomize={() => randomize()}
        onSpeedChange={setSpeed}
        onSizeChange={size => randomize(size)}
      />
    </div>
  );
}
