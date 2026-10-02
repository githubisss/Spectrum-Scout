import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Info } from 'lucide-react';
import { MetricSnapshot, ScanEvent, ScanMode } from '../types/spectrum';
import { Label, Panel, cx } from './ui';

interface AnalyticsViewProps {
  history: ScanEvent[];
  snapshots: MetricSnapshot[];
  currentMode: ScanMode;
}

interface ModeStats {
  n: number;
  pd: number | null;
  pfa: number | null;
  latency: number | null;
  efficiency: number | null;
  accuracy: number | null;
}

const SMART_COLOR = '#2dd4bf';
const SEQ_COLOR = '#8b94a7';

/** Latency, efficiency and accuracy are modeled from Pd; see README "Known Limitations". */
export function modelLatency(mode: ScanMode, pd: number): number {
  const ratio = pd / 100;
  return mode === 'SMART' ? Math.round(140 + (1 - ratio) * 120) : Math.round(520 + (1 - ratio) * 350);
}

function computeStats(events: ScanEvent[], mode: ScanMode): ModeStats {
  if (events.length === 0) {
    return { n: 0, pd: null, pfa: null, latency: null, efficiency: null, accuracy: null };
  }
  const detections = events.filter((e) => e.detected).length;
  const falseAlarms = events.filter((e) => !e.detected && e.signalLevel < -85).length;
  const pd = Math.round((detections / events.length) * 100);
  const ratio = pd / 100;
  return {
    n: events.length,
    pd,
    pfa: Math.round((falseAlarms / events.length) * 100),
    latency: modelLatency(mode, pd),
    efficiency:
      mode === 'SMART' ? Math.round(82 + ratio * 12) : Math.round(28 + ratio * 15),
    accuracy: mode === 'SMART' ? Math.round(80 + ratio * 10) : Math.round(35 + ratio * 10),
  };
}

const fmt = (v: number | null, unit: string) => (v === null ? '—' : `${v}${unit}`);

const SourceTag: React.FC<{ modeled?: boolean }> = ({ modeled }) => (
  <span
    title={
      modeled
        ? 'Derived from detection rate with a fixed formula, not measured directly'
        : 'Computed directly from recorded scan events'
    }
    className={cx(
      'rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset',
      modeled ? 'text-uncertain ring-uncertain/30' : 'text-accent ring-accent/30'
    )}
  >
    {modeled ? 'Modeled' : 'Measured'}
  </span>
);

interface MetricCardProps {
  label: string;
  unit: string;
  smart: number | null;
  seq: number | null;
  scaleMax: number;
  lowerIsBetter?: boolean;
  modeled?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  unit,
  smart,
  seq,
  scaleMax,
  lowerIsBetter,
  modeled,
}) => {
  const rows = [
    { name: 'Smart', value: smart, color: SMART_COLOR },
    { name: 'Sequential', value: seq, color: SEQ_COLOR },
  ];
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <Label>{label}</Label>
        <SourceTag modeled={modeled} />
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold text-fg tabular">{fmt(smart, unit)}</div>
      <div className="text-[11px] text-faint">Smart scan{lowerIsBetter ? ' · lower is better' : ''}</div>
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-2 text-xs">
            <span className="w-16 text-muted">{r.name}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${r.value === null ? 0 : Math.min(100, (r.value / scaleMax) * 100)}%`,
                  backgroundColor: r.color,
                }}
              />
            </span>
            <span className="w-14 text-right font-mono text-muted tabular">{fmt(r.value, unit)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const axisProps = { stroke: '#5e687a', fontSize: 11, tickLine: false, axisLine: false } as const;
const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#10141b',
    border: '1px solid #2f3847',
    borderRadius: 8,
    fontSize: 12,
    color: '#e7eaf0',
  },
  labelStyle: { color: '#939cae' },
  cursor: { stroke: '#2f3847' },
};

const EmptyChart: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-line text-xs text-faint">
    {text}
  </div>
);

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ history, snapshots, currentMode }) => {
  const { smart, seq } = useMemo(
    () => ({
      smart: computeStats(history.filter((e) => e.mode === 'SMART'), 'SMART'),
      seq: computeStats(history.filter((e) => e.mode === 'NORMAL'), 'NORMAL'),
    }),
    [history]
  );

  const latencyMax = Math.max(smart.latency ?? 0, seq.latency ?? 0, 1);

  const diff = (a: number | null, b: number | null, unit: string, lowerIsBetter = false) => {
    if (a === null || b === null) return { text: '—', good: false };
    const d = a - b;
    return {
      text: `${d > 0 ? '+' : ''}${d}${unit}`,
      good: lowerIsBetter ? d < 0 : d > 0,
    };
  };

  const tableRows = [
    { label: 'Probability of detection', unit: '%', a: smart.pd, b: seq.pd, modeled: false },
    { label: 'False alarm rate', unit: '%', a: smart.pfa, b: seq.pfa, modeled: false, lower: true },
    { label: 'Intercept latency', unit: ' ms', a: smart.latency, b: seq.latency, modeled: true, lower: true },
    { label: 'Scan efficiency', unit: '%', a: smart.efficiency, b: seq.efficiency, modeled: true },
    { label: 'Prediction accuracy', unit: '%', a: smart.accuracy, b: seq.accuracy, modeled: true },
  ];

  const missing = smart.n === 0 ? 'Smart' : seq.n === 0 ? 'Sequential' : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-fg">Strategy comparison</h1>
          <p className="mt-0.5 text-sm text-muted">
            Smart (priority-driven) scan vs. sequential sweep, from the last {history.length} recorded scans.
          </p>
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <span>
            Smart <span className="font-mono text-fg tabular">n={smart.n}</span>
          </span>
          <span>
            Sequential <span className="font-mono text-fg tabular">n={seq.n}</span>
          </span>
        </div>
      </div>

      {missing && (
        <div className="flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-xs text-muted">
          <Info className="mt-0.5 size-3.5 shrink-0 text-accent" />
          <span>
            No {missing.toLowerCase()} scans recorded yet.
            {currentMode === (missing === 'Smart' ? 'SMART' : 'NORMAL')
              ? ' Run the simulation for a while to collect data.'
              : ` Switch the strategy to ${missing} in the top bar and let it run to compare.`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Probability of detection" unit="%" smart={smart.pd} seq={seq.pd} scaleMax={100} />
        <MetricCard
          label="False alarm rate"
          unit="%"
          smart={smart.pfa}
          seq={seq.pfa}
          scaleMax={100}
          lowerIsBetter
        />
        <MetricCard
          label="Intercept latency"
          unit=" ms"
          smart={smart.latency}
          seq={seq.latency}
          scaleMax={latencyMax}
          lowerIsBetter
          modeled
        />
        <MetricCard
          label="Scan efficiency"
          unit="%"
          smart={smart.efficiency}
          seq={seq.efficiency}
          scaleMax={100}
          modeled
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Detection probability over time"
          subtitle="Rolling Pd per strategy, sampled every 6 slots"
          actions={<SourceTag />}
        >
          <div className="h-64">
            {snapshots.length === 0 ? (
              <EmptyChart text="Samples appear every 6 slots while the simulation runs." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={snapshots} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="#222936" vertical={false} />
                  <XAxis dataKey="slot" {...axisProps} />
                  <YAxis domain={[0, 100]} unit="%" {...axisProps} />
                  <Tooltip {...tooltipStyle} />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: 11, color: '#939cae' }} />
                  <Line
                    type="monotone"
                    dataKey="smartDetectionRate"
                    name="Smart"
                    stroke={SMART_COLOR}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="normalDetectionRate"
                    name="Sequential"
                    stroke={SEQ_COLOR}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel
          title="Intercept latency"
          subtitle="Last 8 samples · lower is better"
          actions={<SourceTag modeled />}
        >
          <div className="h-64">
            {snapshots.length === 0 ? (
              <EmptyChart text="Samples appear every 6 slots while the simulation runs." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={snapshots.slice(-8)} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="#222936" vertical={false} />
                  <XAxis dataKey="slot" {...axisProps} />
                  <YAxis unit=" ms" {...axisProps} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: '#171c25' }} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 11, color: '#939cae' }} />
                  <Bar dataKey="smartInterceptTime" name="Smart" fill={SMART_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="normalInterceptTime" name="Sequential" fill={SEQ_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Summary" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-faint">
                <th scope="col" className="py-2 pl-4 pr-2 font-medium">Metric</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Smart</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Sequential</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Difference</th>
                <th scope="col" className="py-2 pl-2 pr-4 text-right font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r) => {
                const d = diff(r.a, r.b, r.unit, r.lower);
                return (
                  <tr key={r.label} className="border-b border-line/60 last:border-0">
                    <td className="py-2 pl-4 pr-2 text-fg">{r.label}</td>
                    <td className="px-2 py-2 text-right font-mono text-fg tabular">{fmt(r.a, r.unit)}</td>
                    <td className="px-2 py-2 text-right font-mono text-muted tabular">{fmt(r.b, r.unit)}</td>
                    <td
                      className={cx(
                        'px-2 py-2 text-right font-mono tabular',
                        d.text === '—' ? 'text-faint' : d.good ? 'text-accent' : 'text-high'
                      )}
                    >
                      {d.text}
                    </td>
                    <td className="py-2 pl-2 pr-4 text-right">
                      <SourceTag modeled={r.modeled} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
