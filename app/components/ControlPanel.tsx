'use client'

import { useEffect, useRef, useState } from 'react'

interface ControlPanelProps {
  running: boolean;
  speed: number;
  size: number;
  onToggleRunning: () => void;
  onStep: () => void;
  onRandomize: () => void;
  onSpeedChange: (speed: number) => void;
  onSizeChange: (size: number) => void;
}

const SIZE_OPTIONS = [16, 24, 32, 40, 48];

const secondaryButton =
  'flex-1 border border-line bg-transparent px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-dim transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-dim';

const formatOption = (size: number) => `${size}\u00b3 \u2014 ${(size ** 3).toLocaleString()} cells`;

interface LatticeSelectProps {
  value: number;
  onChange: (size: number) => void;
}

function LatticeSelect({ value, onChange }: LatticeSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`flex w-full items-center justify-between border px-3 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent ${
          open ? 'border-accent text-accent' : 'border-line text-bright hover:border-accent'
        }`}
      >
        <span className="tabular-nums">{formatOption(value)}</span>
        <span className={`text-[9px] text-dim transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden>
          ▼
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute bottom-full left-0 z-50 mb-1 w-full border border-line bg-panel shadow-lg"
        >
          {SIZE_OPTIONS.map(option => {
            const selected = option === value;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-accent ${
                    selected ? 'bg-ink text-accent' : 'text-dim'
                  }`}
                >
                  <span className="tabular-nums">{formatOption(option)}</span>
                  {selected && <span className="h-1.5 w-1.5 bg-accent" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ControlPanel({
  running,
  speed,
  size,
  onToggleRunning,
  onStep,
  onRandomize,
  onSpeedChange,
  onSizeChange,
}: ControlPanelProps) {
  return (
    <div className="absolute bottom-3 right-3 z-40 flex w-60 flex-col gap-4 border border-line bg-panel/85 p-4 font-mono backdrop-blur-sm">
      {/* Status */}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em]">
        <span className="flex items-center gap-2">
          <span className={`pulse-dot h-1.5 w-1.5 ${running ? 'animate-pulse bg-accent' : 'bg-gold'}`} aria-hidden />
          <span className={running ? 'text-accent' : 'text-gold'}>{running ? 'Running' : 'Standby'}</span>
        </span>
        <span className="text-dim">
          Sim <span className="tabular-nums text-bright">{speed} gen/s</span>
        </span>
      </div>

      {/* Run / Halt */}
      <button
        onClick={onToggleRunning}
        className={`w-full border px-4 py-2.5 text-[11px] uppercase tracking-[0.24em] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent ${
          running
            ? 'border-alert/60 text-alert hover:border-alert hover:bg-alert/10'
            : 'border-accent/60 text-accent hover:border-accent hover:bg-accent/10'
        }`}
      >
        {running ? 'Halt' : 'Run'}
      </button>

      <div className="flex gap-2">
        <button onClick={onStep} disabled={running} className={secondaryButton}>
          Step
        </button>
        <button onClick={onRandomize} className={secondaryButton}>
          Reseed
        </button>
      </div>

      {/* Tick rate */}
      <label className="flex flex-col gap-2">
        <span className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-dim">
          <span>Tick rate</span>
          <span className="tabular-nums text-bright">{speed} gen/s</span>
        </span>
        <input
          type="range"
          min={1}
          max={12}
          step={1}
          value={speed}
          onChange={e => onSpeedChange(parseInt(e.target.value, 10))}
          className="hud-range"
        />
      </label>

      {/* Lattice */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-dim">Lattice</span>
        <LatticeSelect value={size} onChange={onSizeChange} />
      </div>

      <p className="text-center text-[10px] uppercase tracking-[0.18em] text-dim/70">
        Drag orbit / scroll zoom
      </p>
    </div>
  );
}
