import React from 'react';
import { ArrowRight } from 'lucide-react';
import {
  EngineWeights,
  FrequencyBandData,
  ScanEvent,
  ScanMode,
  SpectrumRow,
} from '../types/spectrum';
import { BandTable } from './BandTable';
import { EnginePanel } from './EnginePanel';
import { SpectrumView } from './SpectrumView';
import { Label, StateChip } from './ui';

interface ScannerViewProps {
  bands: FrequencyBandData[];
  currentBandId: number;
  nextBandId: number;
  inspectId: number | null;
  scanMode: ScanMode;
  weights: EngineWeights;
  rows: SpectrumRow[];
  history: ScanEvent[];
  totalDetections: number;
  missedSignals: number;
  onUpdateWeights: (weights: EngineWeights) => void;
  onInspect: (bandId: number | null) => void;
  onForceNext: (bandId: number) => void;
}

const RECENT_WINDOW = 20;

const Tile: React.FC<{ label: string; children: React.ReactNode; footer?: React.ReactNode }> = ({
  label,
  children,
  footer,
}) => (
  <div className="rounded-xl border border-line bg-surface px-4 py-3">
    <Label>{label}</Label>
    <div className="mt-1.5">{children}</div>
    {footer && <div className="mt-1 text-xs text-muted">{footer}</div>}
  </div>
);

export const ScannerView: React.FC<ScannerViewProps> = ({
  bands,
  currentBandId,
  nextBandId,
  inspectId,
  scanMode,
  weights,
  rows,
  history,
  totalDetections,
  missedSignals,
  onUpdateWeights,
  onInspect,
  onForceNext,
}) => {
  const current = bands.find((b) => b.id === currentBandId) ?? bands[0];
  const next = bands.find((b) => b.id === nextBandId) ?? bands[0];
  const inspectedId = inspectId ?? nextBandId;
  const inspected = bands.find((b) => b.id === inspectedId) ?? next;

  const recent = history.slice(-RECENT_WINDOW);
  const recentHits = recent.filter((e) => e.detected).length;
  const hitRate = recent.length > 0 ? Math.round((recentHits / recent.length) * 100) : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-4">
        {/* Status */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile label="Dwelling on" footer={current.emitterType}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-semibold text-accent">{current.name}</span>
              <span className="font-mono text-xs text-muted">{current.centerFreq}</span>
              <StateChip state={current.state} />
            </div>
          </Tile>

          <Tile
            label="Next target"
            footer={scanMode === 'SMART' ? 'Highest priority band' : 'Next band in sequence'}
          >
            <div className="flex flex-wrap items-center gap-2">
              <ArrowRight className="size-4 text-faint" />
              <span className="text-xl font-semibold text-fg">{next.name}</span>
              <span className="font-mono text-xs text-muted tabular">score {next.priorityScore}</span>
            </div>
          </Tile>

          <Tile label="Detections" footer="This session">
            <span className="font-mono text-xl font-semibold text-fg tabular">{totalDetections}</span>
          </Tile>

          <Tile
            label={`Hit rate · last ${RECENT_WINDOW}`}
            footer={`${missedSignals} active bands missed`}
          >
            <span className="font-mono text-xl font-semibold text-fg tabular">
              {hitRate === null ? '—' : `${hitRate}%`}
            </span>
          </Tile>
        </div>

        <SpectrumView
          bands={bands}
          currentBandId={currentBandId}
          nextBandId={nextBandId}
          inspectedBandId={inspected.id}
          rows={rows}
          onInspect={onInspect}
        />

        <BandTable
          bands={bands}
          currentBandId={currentBandId}
          nextBandId={nextBandId}
          inspectedBandId={inspected.id}
          onInspect={onInspect}
        />
      </div>

      <aside className="min-w-0">
        <EnginePanel
          bands={bands}
          band={inspected}
          isFollowing={inspectId === null}
          isCurrent={inspected.id === currentBandId}
          isNext={inspected.id === nextBandId}
          scanMode={scanMode}
          weights={weights}
          onUpdateWeights={onUpdateWeights}
          onInspect={onInspect}
          onForceNext={onForceNext}
        />
      </aside>
    </div>
  );
};
