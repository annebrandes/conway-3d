'use client'

// Heads-up display chrome around the simulation viewport: top telemetry bar,
// viewport corner brackets, and a live population sparkline.

interface ReadoutProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function Readout({ label, value, valueClassName = 'text-bright' }: ReadoutProps) {
  return (
    <div className="flex h-full items-center gap-2 border-l border-line px-4">
      <span className="text-dim">{label}</span>
      <span className={`tabular-nums ${valueClassName}`}>{value}</span>
    </div>
  );
}

interface TelemetryBarProps {
  generation: number;
  population: number;
  size: number;
  running: boolean;
}

export function TelemetryBar({ generation, population, size, running }: TelemetryBarProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-40 flex h-11 items-stretch justify-between border-b border-line bg-ink/85 font-mono text-[11px] uppercase tracking-[0.18em] backdrop-blur-sm">
      <div className="flex items-center gap-3 pl-4">
        <span
          className={`pulse-dot h-1.5 w-1.5 ${running ? 'animate-pulse bg-accent' : 'bg-gold'}`}
          aria-hidden
        />
        <span className="text-bright">Conway / Life-3D</span>
      </div>

      <div className="flex items-stretch">
        <div className="hidden md:flex">
          <Readout label="Ruleset" value="B5-7 / S4-6" />
        </div>
        <div className="hidden sm:flex">
          <Readout label="Lattice" value={`${size}\u00b3`} />
        </div>
        <Readout label="Gen" value={String(generation).padStart(4, '0')} valueClassName="text-accent" />
        <Readout label="Alive" value={population.toLocaleString()} valueClassName="text-gold" />
      </div>
    </header>
  );
}

interface StatProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function Stat({ label, value, valueClassName = 'text-bright' }: StatProps) {
  return (
    <div className="flex flex-col gap-0.5 border-l border-line pl-2.5">
      <span className="text-[9px] uppercase tracking-[0.18em] text-dim">{label}</span>
      <span className={`text-[12px] tabular-nums ${valueClassName}`}>{value}</span>
    </div>
  );
}

interface StatsPanelProps {
  history: number[];
  population: number;
  births: number;
  deaths: number;
  size: number;
}

export function StatsPanel({ history, population, births, deaths, size }: StatsPanelProps) {
  const width = 224;
  const height = 44;
  const max = Math.max(...history, 1);

  const points = history
    .map((value, i) => {
      const x = history.length > 1 ? (i / (history.length - 1)) * width : 0;
      const y = height - (value / max) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const density = (population / size ** 3) * 100;
  const delta = births - deaths;

  return (
    <aside className="absolute bottom-3 left-3 z-40 hidden w-64 border border-line bg-panel/90 p-3 font-mono shadow-sm backdrop-blur-sm sm:block">
      <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.18em]">
        <span className="text-dim">Population</span>
        <span className="tabular-nums text-accent">{population.toLocaleString()}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-2 h-11 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        {history.length > 1 ? (
          <polyline points={points} fill="none" stroke="#2D72D2" strokeWidth="1.25" />
        ) : (
          <line x1="0" y1={height - 2} x2={width} y2={height - 2} stroke="#D3DCE6" strokeWidth="1" />
        )}
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-y-3">
        <Stat label="Density" value={`${density.toFixed(1)}%`} />
        <Stat
          label="Delta"
          value={`${delta >= 0 ? '+' : ''}${delta.toLocaleString()}`}
          valueClassName={delta >= 0 ? 'text-accent' : 'text-alert'}
        />
        <Stat label="Peak" value={max.toLocaleString()} valueClassName="text-gold" />
        <Stat label="Births" value={births.toLocaleString()} />
        <Stat label="Deaths" value={deaths.toLocaleString()} />
        <Stat label="Window" value={`${history.length} gen`} />
      </div>
    </aside>
  );
}
