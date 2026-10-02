import React from 'react';
import {
  Activity,
  BookOpen,
  ChevronsRight,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ScanMode, ViewTab } from '../types/spectrum';
import { Button, Kbd, Segmented, cx } from './ui';

interface TopBarProps {
  tab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  scanMode: ScanMode;
  onScanModeChange: (mode: ScanMode) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onInjectBurst: () => void;
  currentSlot: number;
  maxSlots: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

const TABS: { id: ViewTab; label: string; icon: LucideIcon }[] = [
  { id: 'scanner', label: 'Scanner', icon: Radio },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'missions', label: 'Missions', icon: Trophy },
  { id: 'method', label: 'Method', icon: BookOpen },
];

const SPEEDS = [0.5, 1, 1.5, 2, 2.5];

const LogoMark: React.FC = () => (
  <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
    <rect width="32" height="32" rx="8" className="fill-raised" />
    <path
      d="M9 21a10 10 0 0 1 14 0M11.8 18.2a6 6 0 0 1 8.4 0"
      fill="none"
      stroke="#2dd4bf"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="16" cy="22" r="1.8" fill="#2dd4bf" />
    <path d="M6 10h4M12 10h2M16 10h6M24 10h2" stroke="#5e687a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TopBar: React.FC<TopBarProps> = ({
  tab,
  onTabChange,
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  scanMode,
  onScanModeChange,
  speed,
  onSpeedChange,
  onInjectBurst,
  currentSlot,
  maxSlots,
  isMuted,
  onToggleMute,
}) => {
  const progress = (currentSlot / maxSlots) * 100;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      {/* Row 1: identity + navigation */}
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-4 pt-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <LogoMark />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-fg">Spectrum Scout</div>
            <div className="hidden truncate text-xs text-muted sm:block">
              Adaptive spectrum scanning simulator
            </div>
          </div>
        </div>

        <nav
          aria-label="Views"
          className="ml-auto flex items-center gap-1 overflow-x-auto md:ml-8 md:mr-auto"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                  active ? 'bg-raised text-fg' : 'text-muted hover:text-fg'
                )}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
          title={isMuted ? 'Sound off' : 'Sound on'}
          className="inline-flex rounded-lg p-2 text-muted transition-colors hover:bg-raised hover:text-fg"
        >
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>

      {/* Row 2: transport — the single place for simulation controls */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Button
            variant="primary"
            onClick={onTogglePlay}
            className="w-24"
            title="Run / pause (Space)"
          >
            {isRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {isRunning ? 'Pause' : 'Run'}
          </Button>
          <Button onClick={onStep} disabled={isRunning} title="Advance one time slot (→)">
            <ChevronsRight className="size-3.5" />
            Step
          </Button>
          <Button variant="ghost" onClick={onReset} title="Reset simulation (R)" aria-label="Reset simulation">
            <RotateCcw className="size-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-faint">Strategy</span>
          <Segmented<ScanMode>
            ariaLabel="Scan strategy"
            value={scanMode}
            onChange={onScanModeChange}
            options={[
              { value: 'SMART', label: 'Smart', title: 'Scan the highest-priority band next (M)' },
              { value: 'NORMAL', label: 'Sequential', title: 'Sweep B1 → B12 in order (M)' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-faint">Speed</span>
          <Segmented<number>
            ariaLabel="Simulation speed"
            value={speed}
            onChange={onSpeedChange}
            options={SPEEDS.map((s) => ({ value: s, label: `${s}×` }))}
          />
        </div>

        <Button onClick={onInjectBurst} title="Inject a burst emitter on a random band (B)">
          <Zap className="size-3.5 text-uncertain" />
          Inject burst
        </Button>

        <div className="ml-auto flex min-w-[160px] flex-1 items-center gap-3 sm:flex-none">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span
              className={cx(
                'size-1.5 rounded-full',
                isRunning ? 'bg-accent animate-pulse-dot' : 'bg-faint'
              )}
            />
            <span className="font-mono tabular text-fg">
              {String(currentSlot).padStart(3, '0')}
            </span>
            <span className="font-mono text-faint">/ {maxSlots}</span>
          </div>
          <div
            className="h-1 flex-1 overflow-hidden rounded-full bg-line sm:w-32 sm:flex-none"
            role="progressbar"
            aria-label="Time slot"
            aria-valuemin={1}
            aria-valuemax={maxSlots}
            aria-valuenow={currentSlot}
          >
            <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
          <span className="hidden items-center gap-1 text-[11px] text-faint xl:flex">
            <Kbd>Space</Kbd> run <Kbd>→</Kbd> step <Kbd>M</Kbd> mode
          </span>
        </div>
      </div>
    </header>
  );
};
