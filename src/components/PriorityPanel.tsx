import React from 'react';
import { EngineWeights, FrequencyBandData } from '../types/spectrum';
import { getSelectionReason } from '../utils/simulationEngine';
import { Brain, Sliders, Info, Zap, Clock, HelpCircle, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

interface PriorityPanelProps {
  bands: FrequencyBandData[];
  selectedBand: FrequencyBandData;
  weights: EngineWeights;
  onUpdateWeights: (newWeights: EngineWeights) => void;
  onSelectBand: (band: FrequencyBandData) => void;
}

export const PriorityPanel: React.FC<PriorityPanelProps> = ({
  bands,
  selectedBand,
  weights,
  onUpdateWeights,
  onSelectBand,
}) => {
  // Sort bands by priority score descending
  const sortedBands = [...bands].sort((a, b) => b.priorityScore - a.priorityScore);
  const topBand = sortedBands[0];

  // Dynamic explanation for currently inspected band (or top band)
  const targetBand = selectedBand || topBand;
  const reasons = getSelectionReason(targetBand, weights);

  // Helper for ASCII-like block meter
  const renderBlockMeter = (value: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((value / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  const handleWeightChange = (key: keyof EngineWeights, val: number) => {
    sound.playClick();
    onUpdateWeights({
      ...weights,
      [key]: val,
    });
  };

  return (
    <div className="bg-[#051c3d] rounded-2xl border-4 border-[#09356b] shadow-2xl p-4 flex flex-col gap-4 text-white select-none w-full lg:w-80 xl:w-96">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b-2 border-[#09356b] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#32e6ff] to-[#04a9d8] border-2 border-[#01374a] flex items-center justify-center text-black font-extrabold shadow-[0_2px_0_#01374a]">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-game font-extrabold tracking-wide uppercase text-white">
              SMART SCAN ENGINE
            </h2>
            <p className="text-[10px] font-semibold text-cyan-300">
              Cognitive Multi-Factor Evaluator
            </p>
          </div>
        </div>
        <span className="text-[10px] font-game font-bold px-2 py-0.5 rounded bg-[#014cb8] text-[#6ef52c] border border-[#0094ff]">
          LIVE
        </span>
      </div>

      {/* Target Focus Card */}
      <div className="bg-[#03132a] rounded-xl border-2 border-[#0066ee] p-3 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-game font-extrabold text-sm text-cyan-300">
              ANALYZING {targetBand.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ({targetBand.centerFreq})
            </span>
          </div>
          <span
            className={`text-xs font-game font-extrabold px-2 py-0.5 rounded ${
              targetBand.priorityScore >= 70
                ? 'bg-rose-500 text-white'
                : 'bg-[#6ef52c] text-black'
            }`}
          >
            SCORE: {targetBand.priorityScore}
          </span>
        </div>

        {/* 4 Factor Bars Requested in Prompt */}
        <div className="space-y-2 text-xs font-mono">
          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="flex items-center gap-1 text-slate-300">
                <Zap className="w-3 h-3 text-rose-400" /> ACTIVITY
              </span>
              <span className="text-rose-400 font-bold">{targetBand.activity}%</span>
            </div>
            <div className="text-rose-400 text-xs tracking-wider">
              {renderBlockMeter(targetBand.activity)}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-cyan-400" /> RECENCY
              </span>
              <span className="text-cyan-400 font-bold">
                {Math.min(100, targetBand.recency * 10)}% ({targetBand.recency} slots)
              </span>
            </div>
            <div className="text-cyan-400 text-xs tracking-wider">
              {renderBlockMeter(Math.min(100, targetBand.recency * 10))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="flex items-center gap-1 text-slate-300">
                <HelpCircle className="w-3 h-3 text-amber-400" /> UNCERTAINTY
              </span>
              <span className="text-amber-400 font-bold">{targetBand.uncertainty}%</span>
            </div>
            <div className="text-amber-400 text-xs tracking-wider">
              {renderBlockMeter(targetBand.uncertainty)}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldAlert className="w-3 h-3 text-[#6ef52c]" /> HISTORY
              </span>
              <span className="text-[#6ef52c] font-bold">{targetBand.history}%</span>
            </div>
            <div className="text-[#6ef52c] text-xs tracking-wider">
              {renderBlockMeter(targetBand.history)}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Reason Explanation Box */}
      <div className="bg-[#020e21] rounded-xl border-2 border-[#0094ff]/60 p-3 shadow-inner">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-game font-bold text-[#6ef52c]">
          <Info className="w-3.5 h-3.5" />
          <span>WHY {targetBand.name}?</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-[#6ef52c] font-bold">&bull;</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Priority Score Leaderboard */}
      <div className="flex-1 min-h-[160px] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-game font-bold uppercase tracking-wider text-slate-300">
            PRIORITY SCORES
          </span>
          <span className="text-[10px] text-slate-400">Click band to inspect</span>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-44 pr-1">
          {sortedBands.map((band, idx) => {
            const isTop = idx === 0;
            const isInspected = band.id === targetBand.id;
            return (
              <div
                key={band.id}
                onClick={() => {
                  sound.playClick();
                  onSelectBand(band);
                }}
                className={`flex items-center justify-between p-1.5 rounded-lg border cursor-pointer transition-all ${
                  isInspected
                    ? 'bg-[#063366] border-[#32e6ff] shadow-sm'
                    : 'bg-[#021329] border-[#004ba8]/60 hover:bg-[#032247]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-game font-extrabold text-xs px-1.5 py-0.5 rounded ${
                      isTop ? 'bg-[#6ef52c] text-black' : 'bg-[#002f66] text-white'
                    }`}
                  >
                    {band.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    {renderBlockMeter(band.priorityScore).substring(0, 8)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-white">
                    {band.priorityScore}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      band.state === 'HIGH'
                        ? 'bg-rose-500'
                        : band.state === 'UNCERTAIN'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heuristic Weight Controls (Expandable/Adjustable) */}
      <div className="bg-[#020e21] rounded-xl border-2 border-[#09356b] p-3 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-game font-bold text-slate-300 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            WEIGHTS MATRIX
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onUpdateWeights({
                activityWeight: 0.35,
                recencyWeight: 0.25,
                uncertaintyWeight: 0.25,
                historyWeight: 0.15,
                scanWindow: 2,
                priorityThreshold: 50,
              });
            }}
            className="text-[10px] font-game text-cyan-400 hover:text-white"
          >
            DEFAULT
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>Activity Bias (w_a)</span>
              <span className="font-mono text-cyan-300 font-bold">
                {Math.round(weights.activityWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={weights.activityWeight}
              onChange={(e) => handleWeightChange('activityWeight', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#002855] rounded-lg appearance-none cursor-pointer accent-[#6ef52c]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>Uncertainty Bias (w_u)</span>
              <span className="font-mono text-amber-300 font-bold">
                {Math.round(weights.uncertaintyWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={weights.uncertaintyWeight}
              onChange={(e) => handleWeightChange('uncertaintyWeight', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#002855] rounded-lg appearance-none cursor-pointer accent-[#ffd333]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
