import React, { useState } from 'react';
import { FrequencyBandData } from '../types/spectrum';
import { Meter, Panel, STATE_META, Segmented, StateChip, cx } from './ui';

interface BandTableProps {
  bands: FrequencyBandData[];
  currentBandId: number;
  nextBandId: number;
  inspectedBandId: number;
  onInspect: (bandId: number) => void;
}

type SortKey = 'band' | 'priority';

export const BandTable: React.FC<BandTableProps> = ({
  bands,
  currentBandId,
  nextBandId,
  inspectedBandId,
  onInspect,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('band');
  const rows =
    sortKey === 'priority'
      ? [...bands].sort((a, b) => b.priorityScore - a.priorityScore)
      : bands;

  return (
    <Panel
      title="Bands"
      subtitle="Everything the receiver currently believes about each band"
      bodyClassName="p-0"
      actions={
        <Segmented<SortKey>
          ariaLabel="Sort bands"
          value={sortKey}
          onChange={setSortKey}
          options={[
            { value: 'band', label: 'By band' },
            { value: 'priority', label: 'By priority' },
          ]}
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-faint">
              <th scope="col" className="py-2 pl-4 pr-2 font-medium">Band</th>
              <th scope="col" className="px-2 py-2 font-medium">Range</th>
              <th scope="col" className="px-2 py-2 font-medium">Emitter</th>
              <th scope="col" className="px-2 py-2 font-medium">State</th>
              <th scope="col" className="w-36 px-2 py-2 font-medium">Activity</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Signal</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Last seen</th>
              <th scope="col" className="py-2 pl-2 pr-4 text-right font-medium">Priority</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((band) => {
              const isCurrent = band.id === currentBandId;
              const isNext = band.id === nextBandId && !isCurrent;
              const isInspected = band.id === inspectedBandId;

              return (
                <tr
                  key={band.id}
                  tabIndex={0}
                  onClick={() => onInspect(band.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onInspect(band.id);
                    }
                  }}
                  aria-selected={isInspected}
                  className={cx(
                    'cursor-pointer border-b border-line/60 transition-colors last:border-0',
                    isInspected ? 'bg-raised' : 'hover:bg-raised/60'
                  )}
                >
                  <td className="relative py-2 pl-4 pr-2">
                    {isCurrent && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent" />}
                    <div className="flex items-center gap-2">
                      <span className={cx('font-semibold', isCurrent ? 'text-accent' : 'text-fg')}>
                        {band.name}
                      </span>
                      {isCurrent && <span className="text-[10px] font-medium text-accent">dwell</span>}
                      {isNext && <span className="text-[10px] font-medium text-muted">next</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 font-mono text-muted">{band.frequencyRange}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-fg">{band.emitterType}</td>
                  <td className="px-2 py-2">
                    <StateChip state={band.state} />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <Meter
                        value={band.activity}
                        colorClass={STATE_META[band.state].dot}
                        className="flex-1"
                      />
                      <span className="w-7 text-right font-mono text-muted tabular">{band.activity}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right font-mono text-muted tabular">
                    {band.signalStrength} dBm
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right font-mono text-muted tabular">
                    {band.recency === 0 ? 'now' : `${band.recency} slots`}
                  </td>
                  <td className="py-2 pl-2 pr-4 text-right">
                    <span
                      className={cx(
                        'inline-block min-w-8 rounded-md px-1.5 py-0.5 text-center font-mono font-semibold tabular',
                        band.priorityScore >= 70
                          ? 'bg-accent/15 text-accent'
                          : 'bg-line/60 text-fg'
                      )}
                    >
                      {band.priorityScore}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
