import React from 'react';
import { FrequencyBandData, SpectrumRow } from '../types/spectrum';
import { Panel, STATE_META, cx } from './ui';

export const WATERFALL_ROWS = 48;
const DETECTION_THRESHOLD = 40;

// Sequential ramp for the waterfall: dark → teal → amber → red.
const HEAT_STOPS: [number, [number, number, number]][] = [
  [0, [14, 20, 29]],
  [30, [21, 59, 74]],
  [55, [30, 128, 122]],
  [75, [224, 179, 65]],
  [100, [242, 95, 92]],
];

function heat(value: number): string {
  const v = Math.max(0, Math.min(100, value));
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const [p1, c1] = HEAT_STOPS[i];
    if (v <= p1) {
      const [p0, c0] = HEAT_STOPS[i - 1];
      const t = (v - p0) / (p1 - p0);
      const mix = (k: number) => Math.round(c0[k] + (c1[k] - c0[k]) * t);
      return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
    }
  }
  const last = HEAT_STOPS[HEAT_STOPS.length - 1][1];
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

const HEAT_GRADIENT = `linear-gradient(to right, ${HEAT_STOPS.map(
  ([p, c]) => `rgb(${c[0]}, ${c[1]}, ${c[2]}) ${p}%`
).join(', ')})`;

interface SpectrumViewProps {
  bands: FrequencyBandData[];
  currentBandId: number;
  nextBandId: number;
  inspectedBandId: number;
  rows: SpectrumRow[];
  onInspect: (bandId: number) => void;
}

export const SpectrumView: React.FC<SpectrumViewProps> = ({
  bands,
  currentBandId,
  nextBandId,
  inspectedBandId,
  rows,
  onInspect,
}) => {
  const newestFirst = [...rows].reverse();
  const padding = Math.max(0, WATERFALL_ROWS - newestFirst.length);

  return (
    <Panel
      title="Spectrum"
      subtitle="Live activity per band, 2–18 GHz. Click a band to inspect it."
      actions={
        <div className="hidden flex-wrap items-center gap-3 text-[11px] text-muted lg:flex">
          {(['HIGH', 'UNCERTAIN', 'LOW', 'IDLE'] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={cx('size-2 rounded-sm', STATE_META[s].dot)} />
              {STATE_META[s].label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed border-muted" />
            Detection threshold
          </span>
        </div>
      }
    >
      {/* Live bars */}
      <div className="grid grid-cols-12 gap-1 sm:gap-1.5">
        {bands.map((band) => {
          const isCurrent = band.id === currentBandId;
          const isNext = band.id === nextBandId && !isCurrent;
          const isInspected = band.id === inspectedBandId;
          const meta = STATE_META[band.state];

          return (
            <button
              key={band.id}
              type="button"
              onClick={() => onInspect(band.id)}
              aria-label={`${band.name}, ${band.centerFreq}, ${meta.label}, activity ${band.activity} percent, priority ${band.priorityScore}`}
              aria-pressed={isInspected}
              className="group flex min-w-0 flex-col items-stretch rounded-md text-left"
            >
              <div className="flex h-5 items-center justify-center">
                {isCurrent && (
                  <span className="rounded bg-accent px-1 text-[9px] font-semibold leading-4 text-bg sm:px-1.5 sm:text-[10px]">
                    DWELL
                  </span>
                )}
                {isNext && (
                  <span className="rounded px-1 text-[9px] font-semibold leading-4 text-accent ring-1 ring-inset ring-accent/60 sm:px-1.5 sm:text-[10px]">
                    NEXT
                  </span>
                )}
              </div>

              <div
                className={cx(
                  'relative h-36 rounded-md transition-colors sm:h-40',
                  isCurrent
                    ? 'bg-accent/10 ring-1 ring-inset ring-accent/60'
                    : isNext
                    ? 'bg-bg outline-1 -outline-offset-1 outline-dashed outline-accent/60'
                    : isInspected
                    ? 'bg-raised ring-1 ring-inset ring-line-strong'
                    : 'bg-bg group-hover:bg-raised'
                )}
              >
                <span className="absolute inset-x-0 top-1 text-center font-mono text-[10px] text-muted tabular">
                  {band.activity}
                </span>
                <div className="absolute inset-x-0 bottom-0 top-5">
                  <div
                    className="pointer-events-none absolute inset-x-0 border-t border-dashed border-muted/40"
                    style={{ bottom: `${DETECTION_THRESHOLD}%` }}
                  />
                  <div
                    className="absolute bottom-0 left-1/2 w-[62%] -translate-x-1/2 rounded-t-[3px] transition-[height] duration-300"
                    style={{
                      height: `${band.activity}%`,
                      backgroundColor: meta.hex,
                      opacity: isCurrent ? 1 : 0.8,
                    }}
                  />
                </div>
              </div>

              <div className="mt-1.5 text-center leading-tight">
                <div
                  className={cx(
                    'text-[11px] font-semibold sm:text-xs',
                    isCurrent ? 'text-accent' : 'text-fg'
                  )}
                >
                  {band.name}
                </div>
                <div className="hidden truncate font-mono text-[10px] text-faint md:block">
                  {band.centerFreq}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Waterfall */}
      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
          <span>
            Waterfall: last {WATERFALL_ROWS} slots, newest at top
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="text-faint">0%</span>
              <span className="h-2 w-20 rounded-sm" style={{ background: HEAT_GRADIENT }} />
              <span className="text-faint">100%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-2.5 rounded-full bg-white" />
              Scanned · detection
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-2.5 rounded-full bg-white/40" />
              Scanned · nothing
            </span>
          </span>
        </div>

        <div className="grid grid-cols-12 gap-1 sm:gap-1.5" aria-hidden="true">
          {bands.map((band, bandIdx) => (
            <div key={band.id} className="flex flex-col overflow-hidden rounded-md">
              {newestFirst.map((row) => {
                const scanned = row.scannedId === band.id;
                return (
                  <div
                    key={row.slot}
                    className="relative h-1"
                    style={{ backgroundColor: heat(row.activity[bandIdx] ?? 0) }}
                  >
                    {scanned && (
                      <div
                        className={cx(
                          'absolute inset-y-px left-1/2 w-1/3 -translate-x-1/2 rounded-full',
                          row.detected ? 'bg-white' : 'bg-white/40'
                        )}
                      />
                    )}
                  </div>
                );
              })}
              {Array.from({ length: padding }, (_, i) => (
                <div key={`pad-${i}`} className="h-1 bg-bg" />
              ))}
            </div>
          ))}
        </div>
        {rows.length === 0 && (
          <p className="mt-2 text-center text-xs text-faint">
            The waterfall fills in as the scanner runs.
          </p>
        )}
      </div>
    </Panel>
  );
};
