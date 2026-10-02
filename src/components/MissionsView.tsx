import React from 'react';
import { Check, Info, Pause, Play, Zap } from 'lucide-react';
import { Mission, ScanMode } from '../types/spectrum';
import { Button, Label, Meter, cx } from './ui';

interface MissionsViewProps {
  missions: Mission[];
  activeMissionId: number;
  claimedIds: number[];
  onSelectMission: (id: number) => void;
  onClaim: (id: number) => void;
  score: number;
  totalDetections: number;
  scanTime: number;
  missedSignals: number;
  scanMode: ScanMode;
  onUseSmart: () => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onInjectBurst: () => void;
}

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-xl border border-line bg-surface px-4 py-3">
    <Label>{label}</Label>
    <div className="mt-1.5 font-mono text-xl font-semibold text-fg tabular">{value}</div>
  </div>
);

export const MissionsView: React.FC<MissionsViewProps> = ({
  missions,
  activeMissionId,
  claimedIds,
  onSelectMission,
  onClaim,
  score,
  totalDetections,
  scanTime,
  missedSignals,
  scanMode,
  onUseSmart,
  isRunning,
  onTogglePlay,
  onInjectBurst,
}) => {
  const completed = missions.filter((m) => m.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-fg">Missions</h1>
          <p className="mt-0.5 text-sm text-muted">
            Short objectives that show where adaptive scanning pays off. {completed} of {missions.length} complete.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={onTogglePlay}>
            {isRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {isRunning ? 'Pause' : 'Run'}
          </Button>
          <Button onClick={onInjectBurst}>
            <Zap className="size-3.5 text-uncertain" />
            Inject burst
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Score" value={score.toLocaleString()} />
        <Stat label="Detections" value={totalDetections} />
        <Stat label="Scan time" value={`${scanTime}s`} />
        <Stat label="Missed active bands" value={missedSignals} />
      </div>

      {scanMode === 'NORMAL' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-uncertain/30 bg-uncertain/5 px-4 py-3 text-xs">
          <span className="flex items-center gap-2 text-muted">
            <Info className="size-3.5 shrink-0 text-uncertain" />
            Sequential sweep is on. It visits every band in turn and will miss most hops and bursts.
          </span>
          <Button onClick={onUseSmart}>Switch to Smart</Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {missions.map((mission, idx) => {
          const isActive = mission.id === activeMissionId;
          const isClaimed = claimedIds.includes(mission.id);
          const pct = (mission.currentValue / mission.targetValue) * 100;

          return (
            <article
              key={mission.id}
              className={cx(
                'flex flex-col rounded-xl border bg-surface p-4 transition-colors',
                isActive ? 'border-accent/60' : 'border-line'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-faint">Mission {idx + 1}</div>
                  <h2 className="mt-0.5 text-sm font-semibold text-fg">{mission.title}</h2>
                  <p className="mt-0.5 text-xs text-muted">{mission.subtitle}</p>
                </div>
                <span
                  className={cx(
                    'shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-inset',
                    isClaimed ? 'text-faint ring-line' : 'text-uncertain ring-uncertain/30'
                  )}
                >
                  +{mission.scoreReward}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted">{mission.description}</p>

              <div className="mt-auto pt-4">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-faint">Progress</span>
                  <span className="font-mono text-fg tabular">
                    {mission.currentValue} / {mission.targetValue}
                  </span>
                </div>
                <Meter value={pct} colorClass={mission.completed ? 'bg-accent' : 'bg-muted/60'} />

                <div className="mt-3 flex items-center justify-end gap-2">
                  {isClaimed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-accent">
                      <Check className="size-3.5" />
                      Claimed
                    </span>
                  ) : mission.completed ? (
                    <Button variant="primary" onClick={() => onClaim(mission.id)}>
                      Claim +{mission.scoreReward}
                    </Button>
                  ) : isActive ? (
                    <span className="text-xs font-medium text-accent">Active mission</span>
                  ) : (
                    <Button variant="ghost" onClick={() => onSelectMission(mission.id)}>
                      Make active
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
