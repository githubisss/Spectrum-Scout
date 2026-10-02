import React from 'react';
import { Crosshair, RotateCcw } from 'lucide-react';
import { EngineWeights, FrequencyBandData, ScanMode } from '../types/spectrum';
import { DEFAULT_WEIGHTS, getSelectionReason } from '../utils/simulationEngine';
import { Button, FACTOR_META, Label, Panel, StateChip, cx } from './ui';

type FactorKey = keyof typeof FACTOR_META;

const WEIGHT_KEYS: Record<FactorKey, keyof EngineWeights> = {
  activity: 'activityWeight',
  recency: 'recencyWeight',
  uncertainty: 'uncertaintyWeight',
  history: 'historyWeight',
};

const FACTOR_HINTS: Record<FactorKey, string> = {
  activity: 'Current RF occupancy',
  recency: 'Slots since last visit ×10',
  uncertainty: 'How little we know',
  history: 'Past threat evidence',
};

interface EnginePanelProps {
  bands: FrequencyBandData[];
  band: FrequencyBandData;
  isFollowing: boolean;
  isCurrent: boolean;
  isNext: boolean;
  scanMode: ScanMode;
  weights: EngineWeights;
  onUpdateWeights: (weights: EngineWeights) => void;
  onInspect: (bandId: number | null) => void;
  onForceNext: (bandId: number) => void;
}

function factorValue(band: FrequencyBandData, key: FactorKey): number {
  switch (key) {
    case 'activity':
      return band.activity;
    case 'recency':
      return Math.min(100, band.recency * 10);
    case 'uncertainty':
      return band.uncertainty;
    case 'history':
      return band.history;
  }
}

export const EnginePanel: React.FC<EnginePanelProps> = ({
  bands,
  band,
  isFollowing,
  isCurrent,
  isNext,
  scanMode,
  weights,
  onUpdateWeights,
  onInspect,
  onForceNext,
}) => {
  const factorKeys = Object.keys(FACTOR_META) as FactorKey[];
  const contributions = factorKeys.map((key) => {
    const value = factorValue(band, key);
    const weight = weights[WEIGHT_KEYS[key]];
    return { key, value, weight, contribution: value * weight };
  });
  const rawTotal = contributions.reduce((sum, c) => sum + c.contribution, 0);
  const reasons = getSelectionReason(band, weights);
  const ranked = [...bands].sort((a, b) => b.priorityScore - a.priorityScore);
  const weightSum = factorKeys.reduce((sum, k) => sum + weights[WEIGHT_KEYS[k]], 0);

  const role = isCurrent ? 'Being scanned now' : isNext ? 'Next scan target' : 'Inspecting';

  return (
    <div className="space-y-4">
      {/* Selected band breakdown */}
      <Panel
        title={
          <span className="flex items-center gap-2">
            Why {band.name}?
            <StateChip state={band.state} />
          </span>
        }
        subtitle={
          <>
            {role} · {band.centerFreq}
            {scanMode === 'NORMAL' && isNext && ' · Sequential mode ignores priority'}
          </>
        }
        actions={
          !isFollowing && (
            <Button variant="ghost" onClick={() => onInspect(null)} title="Follow the scanner's next target">
              <Crosshair className="size-3.5" />
              Follow
            </Button>
          )
        }
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <Label>Priority score</Label>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-semibold text-fg tabular">{band.priorityScore}</span>
              <span className="text-sm text-faint">/ 100</span>
            </div>
          </div>
          <div className="text-right text-[11px] text-muted">
            Rank {ranked.findIndex((b) => b.id === band.id) + 1} of {bands.length}
          </div>
        </div>

        {/* Stacked contribution bar */}
        <div
          className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-line"
          role="img"
          aria-label={contributions
            .map((c) => `${FACTOR_META[c.key].label} contributes ${Math.round(c.contribution)}`)
            .join(', ')}
        >
          {contributions.map((c) => (
            <div
              key={c.key}
              className="h-full transition-[width] duration-300 first:rounded-l-full"
              style={{
                width: `${Math.min(100, c.contribution)}%`,
                backgroundColor: FACTOR_META[c.key].hex,
              }}
            />
          ))}
        </div>

        <table className="mt-3 w-full text-xs">
          <thead>
            <tr className="text-[11px] text-faint">
              <th scope="col" className="pb-1 text-left font-medium">Factor</th>
              <th scope="col" className="pb-1 text-right font-medium">Value</th>
              <th scope="col" className="pb-1 text-right font-medium">× Weight</th>
              <th scope="col" className="pb-1 text-right font-medium">= Points</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular">
            {contributions.map((c) => (
              <tr key={c.key}>
                <td className="py-1 font-sans">
                  <span className="flex items-center gap-2">
                    <span className={cx('size-2 rounded-sm', FACTOR_META[c.key].swatch)} />
                    <span className="text-fg">{FACTOR_META[c.key].label}</span>
                  </span>
                </td>
                <td className="py-1 text-right text-muted">{Math.round(c.value)}</td>
                <td className="py-1 text-right text-muted">{c.weight.toFixed(2)}</td>
                <td className="py-1 text-right text-fg">{c.contribution.toFixed(1)}</td>
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="pt-1.5 font-sans text-muted">Total</td>
              <td />
              <td />
              <td className="pt-1.5 text-right font-semibold text-fg">{rawTotal.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
        {Math.round(rawTotal) !== band.priorityScore && (
          <p className="mt-1 text-[11px] text-faint">Score is clamped to the 5–100 range.</p>
        )}

        <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs text-muted">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-xs">
          <div>
            <dt className="text-faint">Emitter</dt>
            <dd className="mt-0.5 text-fg">{band.emitterType}</dd>
          </div>
          <div>
            <dt className="text-faint">Range</dt>
            <dd className="mt-0.5 font-mono text-fg">{band.frequencyRange}</dd>
          </div>
          <div>
            <dt className="text-faint">Signal</dt>
            <dd className="mt-0.5 font-mono text-fg tabular">{band.signalStrength} dBm</dd>
          </div>
          <div>
            <dt className="text-faint">Pulse rate</dt>
            <dd className="mt-0.5 font-mono text-fg tabular">{band.pulsesPerSec} /s</dd>
          </div>
          <div>
            <dt className="text-faint">Intercepts</dt>
            <dd className="mt-0.5 font-mono text-fg tabular">{band.interceptCount}</dd>
          </div>
          <div>
            <dt className="text-faint">Last seen</dt>
            <dd className="mt-0.5 font-mono text-fg tabular">
              {band.recency === 0 ? 'now' : `${band.recency} slots ago`}
            </dd>
          </div>
        </dl>

        {!isNext && !isCurrent && (
          <Button className="mt-4 w-full" onClick={() => onForceNext(band.id)}>
            Scan {band.name} next
          </Button>
        )}
      </Panel>

      {/* Ranking */}
      <Panel title="Priority ranking" subtitle="Smart mode always scans the top band" bodyClassName="p-2">
        <ol className="space-y-0.5">
          {ranked.map((b, idx) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => onInspect(b.id)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-xs transition-colors',
                  b.id === band.id ? 'bg-raised' : 'hover:bg-raised/60'
                )}
              >
                <span className="w-4 text-right font-mono text-faint tabular">{idx + 1}</span>
                <span className="w-8 text-left font-semibold text-fg">{b.name}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <span
                    className={cx('block h-full rounded-full', idx === 0 ? 'bg-accent' : 'bg-muted/50')}
                    style={{ width: `${b.priorityScore}%` }}
                  />
                </span>
                <span className="w-7 text-right font-mono text-fg tabular">{b.priorityScore}</span>
              </button>
            </li>
          ))}
        </ol>
      </Panel>

      {/* Weights */}
      <Panel
        title="Heuristic weights"
        subtitle={`Sum ${weightSum.toFixed(2)}${Math.abs(weightSum - 1) > 0.001 ? ' (scores are not normalized)' : ''}`}
        actions={
          <Button
            variant="ghost"
            onClick={() => onUpdateWeights({ ...DEFAULT_WEIGHTS })}
            title="Restore default weights"
          >
            <RotateCcw className="size-3.5" />
            Defaults
          </Button>
        }
      >
        <div className="space-y-4">
          {factorKeys.map((key) => {
            const weightKey = WEIGHT_KEYS[key];
            const value = weights[weightKey];
            const id = `weight-${key}`;
            return (
              <div key={key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <label htmlFor={id} className="flex items-center gap-2 text-xs text-fg">
                    <span className={cx('size-2 rounded-sm', FACTOR_META[key].swatch)} />
                    {FACTOR_META[key].label}
                    <span className="text-faint">{FACTOR_HINTS[key]}</span>
                  </label>
                  <span className="font-mono text-xs text-fg tabular">{value.toFixed(2)}</span>
                </div>
                <input
                  id={id}
                  type="range"
                  min={0}
                  max={0.8}
                  step={0.05}
                  value={value}
                  onChange={(e) => onUpdateWeights({ ...weights, [weightKey]: parseFloat(e.target.value) })}
                  className="slider"
                  style={{ '--fill': `${(value / 0.8) * 100}%` } as React.CSSProperties}
                />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};
