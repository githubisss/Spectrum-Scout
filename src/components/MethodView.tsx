import React, { useState } from 'react';
import { Eye, ListOrdered, Radio, RefreshCw, Repeat, Ruler } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EngineWeights } from '../types/spectrum';
import { FACTOR_META, Panel, cx } from './ui';

interface Step {
  title: string;
  icon: LucideIcon;
  summary: string;
  body: string;
  formula: string;
  points: string[];
}

const STEPS: Step[] = [
  {
    title: 'Observe',
    icon: Eye,
    summary: 'Emitters appear across the bands without warning.',
    body:
      'Radars, communication bursts and frequency-agile emitters transmit intermittently across the 2–18 GHz range. The receiver has no threat library telling it where to look.',
    formula: 'Activity(b, t) = emitter model + random fluctuation',
    points: [
      'An agile hopper jumps to a new band every 4 slots.',
      'Burst transmitters on B5 and B8 switch on every 5th and 7th slot.',
      'Every band jitters by up to ±6 points per slot.',
    ],
  },
  {
    title: 'Measure',
    icon: Ruler,
    summary: 'Each dwell records what the receiver actually saw.',
    body:
      'When the receiver tunes to a band it measures signal level, pulse rate and activity. Bands it did not visit only grow older and less certain.',
    formula: 'Detection ⇔ Activity(b) ≥ 40 on the scanned band',
    points: [
      'History rises by 5 on a detection and falls by 2 on an empty dwell.',
      'Recency counts the slots since a band was last visited.',
      'Uncertainty measures how stale the current belief about a band is.',
    ],
  },
  {
    title: 'Prioritize',
    icon: ListOrdered,
    summary: 'Every band gets a score that balances threat against staleness.',
    body:
      'Activity and history reward staying on known threats (exploitation). Recency and uncertainty reward checking bands that have not been visited (exploration).',
    formula: 'P(b) = wₐ·A + wᵣ·R + wᵤ·U + wₕ·H',
    points: [
      'R is slots-since-visit × 10, capped at 100.',
      'P is clamped to the 5–100 range.',
      'Change the weights live in the Scanner view.',
    ],
  },
  {
    title: 'Scan',
    icon: Radio,
    summary: 'The receiver tunes to the highest-priority band.',
    body:
      'Instead of stepping through every band, the Smart strategy jumps straight to the band most likely to matter. Sequential mode is kept for comparison.',
    formula: 'next = argmax_b P(b)',
    points: [
      'Ties within 2 points go to the band left unvisited longer.',
      'If the top band was just scanned, a runner-up scoring ≥ 50 goes first.',
      'Sequential mode ignores scores: B1 → B2 → … → B12.',
    ],
  },
  {
    title: 'Update',
    icon: RefreshCw,
    summary: 'The new observation changes every belief.',
    body:
      'The scanned band becomes fresh and certain. Every other band gets a little staler, so no band can be ignored forever.',
    formula: 'Scanned: R = 0, U = U × 0.4 · Others: R + 1, U + 6',
    points: [
      'Uncertainty never drops below 10 or rises above 95.',
      'Ignored bands eventually rise to the top of the ranking on their own.',
      'Scores are recalculated for all bands every slot.',
    ],
  },
  {
    title: 'Repeat',
    icon: Repeat,
    summary: 'The loop runs continuously and adapts as emitters change.',
    body:
      'Observe, measure, prioritize, scan and update repeat every slot. The schedule emerges from what the receiver has learned rather than from a fixed plan.',
    formula: 'Closed loop: observe → measure → prioritize → scan → update',
    points: [
      'No prior intelligence about emitters is required.',
      'Hopping and bursty emitters are revisited quickly once seen.',
      'The same idea underlies cognitive radar and multi-armed bandit scheduling.',
    ],
  },
];

export const MethodView: React.FC<{ weights: EngineWeights }> = ({ weights }) => {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  const Icon = step.icon;

  const terms = [
    { key: 'activity', w: weights.activityWeight, sym: 'Activity' },
    { key: 'recency', w: weights.recencyWeight, sym: 'Recency' },
    { key: 'uncertainty', w: weights.uncertaintyWeight, sym: 'Uncertainty' },
    { key: 'history', w: weights.historyWeight, sym: 'History' },
  ] as const;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-fg">How the smart scan works</h1>
        <p className="mt-0.5 max-w-3xl text-sm text-muted">
          A receiver can only listen to one band at a time. With no prior intelligence about the emitters, Spectrum
          Scout learns where to look from its own observations.
        </p>
      </div>

      {/* Live formula */}
      <Panel title="Priority score, with your current weights">
        <div className="overflow-x-auto">
          <div className="flex min-w-max flex-wrap items-center gap-x-2 gap-y-2 font-mono text-sm">
            <span className="text-fg">P(b) =</span>
            {terms.map((t, i) => (
              <React.Fragment key={t.key}>
                {i > 0 && <span className="text-faint">+</span>}
                <span className="inline-flex items-center gap-1.5 rounded-md bg-raised px-2 py-1">
                  <span className={cx('size-2 rounded-sm', FACTOR_META[t.key].swatch)} />
                  <span className="text-fg tabular">{t.w.toFixed(2)}</span>
                  <span className="text-faint">·</span>
                  <span className="text-muted">{t.sym}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Step list */}
        <nav aria-label="Scan loop steps">
          <ol className="space-y-1">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === active;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive ? 'step' : undefined}
                    className={cx(
                      'flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      isActive
                        ? 'border-line-strong bg-raised'
                        : 'border-transparent hover:bg-surface'
                    )}
                  >
                    <span
                      className={cx(
                        'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md',
                        isActive ? 'bg-accent text-bg' : 'bg-raised text-muted'
                      )}
                    >
                      <StepIcon className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-fg">
                        {i + 1}. {s.title}
                      </span>
                      <span className="block text-xs text-muted">{s.summary}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Step detail */}
        <Panel
          title={
            <span className="flex items-center gap-2">
              <Icon className="size-4 text-accent" />
              Step {active + 1}: {step.title}
            </span>
          }
          actions={
            <button
              type="button"
              onClick={() => setActive((active + 1) % STEPS.length)}
              className="text-xs font-medium text-accent hover:text-accent-strong"
            >
              {active === STEPS.length - 1 ? 'Back to start' : 'Next step →'}
            </button>
          }
        >
          <p className="text-sm leading-relaxed text-fg">{step.body}</p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-bg px-3 py-2.5 font-mono text-xs text-accent">
            {step.formula}
          </pre>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {step.points.map((p) => (
              <li key={p} className="flex gap-2.5">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="Sequential sweep" subtitle="B1 → B2 → B3 → … → B12 → B1">
          <ul className="space-y-2 text-sm text-muted">
            <li>Spends most dwells on empty bands.</li>
            <li>A band is revisited only once every 12 slots, so bursts and hops slip through.</li>
            <li>Predictable: the pattern is easy to anticipate.</li>
          </ul>
        </Panel>
        <Panel title="Smart scan" subtitle="e.g. B5 → B8 → B3 → B5 → B10 …">
          <ul className="space-y-2 text-sm text-muted">
            <li>Concentrates dwells where activity and threat evidence are highest.</li>
            <li>Still revisits quiet bands as their recency and uncertainty grow.</li>
            <li>Adapts on its own; no threat library needed.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
};
