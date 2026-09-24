import React from 'react';
import { FrequencyBandData } from '../types/spectrum';
import { sound } from '../utils/audio';
import { X, Radio, Activity, ShieldAlert, Cpu, Waves as WaveIcon, Sparkles } from 'lucide-react';

interface BandDetailModalProps {
  band: FrequencyBandData | null;
  onClose: () => void;
  onSetPriorityFocus: (bandId: number) => void;
}

export const BandDetailModal: React.FC<BandDetailModalProps> = ({
  band,
  onClose,
  onSetPriorityFocus,
}) => {
  if (!band) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-[#051c3d] border-4 border-[#0094ff] rounded-2xl p-5 max-w-lg w-full shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#021329] border border-[#0094ff] flex items-center justify-center text-slate-300 hover:text-white hover:bg-rose-600 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
          <div className="w-12 h-12 rounded-xl game-btn-cyan flex items-center justify-center text-black font-extrabold text-xl">
            {band.name}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-game font-extrabold text-white">
                FREQUENCY BAND {band.name}
              </h3>
              <span
                className={`text-[10px] font-game font-extrabold px-2 py-0.5 rounded ${
                  band.state === 'HIGH'
                    ? 'bg-rose-500 text-white'
                    : band.state === 'UNCERTAIN'
                    ? 'bg-amber-400 text-black'
                    : 'bg-emerald-400 text-black'
                }`}
              >
                {band.state}
              </span>
            </div>
            <p className="text-xs text-cyan-300 font-mono">
              Center: {band.centerFreq} &middot; Span: {band.frequencyRange}
            </p>
          </div>
        </div>

        {/* Oscilloscope Mini Waveform */}
        <div className="bg-[#020e21] rounded-xl border-2 border-[#0055b3] p-3 mb-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2">
            <span>LIVE RF WAVEFORM DWELL (OSCILLOSCOPE)</span>
            <span className="text-[#6ef52c] font-bold">128 SAMPLES / DWELL</span>
          </div>

          <div className="h-16 flex items-end justify-between gap-1 px-1 bg-[#010a17] rounded-lg border border-[#003882] p-1.5 overflow-hidden">
            {band.waveformPattern.map((v, i) => (
              <div
                key={i}
                style={{ height: `${Math.max(12, Math.round(v * 100))}%` }}
                className={`w-full rounded-t-sm ${
                  band.state === 'HIGH'
                    ? 'bg-rose-500'
                    : band.state === 'UNCERTAIN'
                    ? 'bg-amber-400'
                    : 'bg-[#6ef52c]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-5 font-mono">
          <div className="bg-[#021329] p-2.5 rounded-xl border border-[#0055b3]">
            <span className="text-[10px] text-slate-400 block font-sans">EMITTER CLASSIFICATION</span>
            <span className="text-white font-bold font-sans text-sm">
              {band.emitterType}
            </span>
          </div>

          <div className="bg-[#021329] p-2.5 rounded-xl border border-[#0055b3]">
            <span className="text-[10px] text-slate-400 block font-sans">ESTIMATED RF POWER</span>
            <span className="text-rose-400 font-bold text-sm">
              {band.signalStrength} dBm ({band.activity}%)
            </span>
          </div>

          <div className="bg-[#021329] p-2.5 rounded-xl border border-[#0055b3]">
            <span className="text-[10px] text-slate-400 block font-sans">PULSE REPETITION (PRF)</span>
            <span className="text-cyan-300 font-bold text-sm">
              {band.pulsesPerSec} pulses/s
            </span>
          </div>

          <div className="bg-[#021329] p-2.5 rounded-xl border border-[#0055b3]">
            <span className="text-[10px] text-slate-400 block font-sans">COGNITIVE PRIORITY</span>
            <span className="text-[#6ef52c] font-bold text-sm">
              {band.priorityScore} / 100
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onSetPriorityFocus(band.id);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-xs font-game font-extrabold game-btn-lime text-black flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>FORCE SCANNER DWELL ON {band.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
