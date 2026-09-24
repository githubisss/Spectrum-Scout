import React from 'react';
import { ScanMode } from '../types/spectrum';
import { sound } from '../utils/audio';
import { Play, Pause, RotateCcw, Shuffle, Sparkles, AlertCircle } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
  currentSlot: number;
  maxSlots: number;
  scanMode: ScanMode;
  setScanMode: (mode: ScanMode) => void;
  onInjectBurst: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  speed,
  setSpeed,
  currentSlot,
  maxSlots,
  scanMode,
  setScanMode,
  onInjectBurst,
}) => {
  return (
    <div className="bg-[#041a3d] border-2 border-[#09356b] rounded-2xl p-3 shadow-xl flex flex-wrap items-center justify-between gap-3 text-white select-none">
      {/* Play / Pause / Reset Primary Cluster */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sound.playClick();
            onTogglePlay();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-game font-extrabold flex items-center gap-2 ${
            isRunning ? 'game-btn-orange text-black' : 'game-btn-lime text-black'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>START SIMULATION</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onReset();
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-game font-extrabold game-btn-navy text-slate-200 border-[#005ac7] flex items-center gap-1.5"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onInjectBurst();
          }}
          className="px-3 py-2 rounded-xl text-xs font-game font-bold bg-[#143058] border border-[#0094ff] hover:bg-[#1a4074] text-cyan-300 flex items-center gap-1.5"
          title="Trigger Sudden RF Emitter Pulse"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#6ef52c]" />
          <span>INJECT BURST</span>
        </button>
      </div>

      {/* Speed Slider: SLOW ━━━━━●━━━━ FAST */}
      <div className="flex items-center gap-2 bg-[#021124] px-3 py-1.5 rounded-xl border border-[#09356b]">
        <span className="text-[10px] font-game font-bold text-slate-400">SPEED:</span>
        <span className="text-[10px] font-mono text-slate-400">SLOW</span>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.5"
          value={speed}
          onChange={(e) => {
            sound.playClick();
            setSpeed(parseFloat(e.target.value));
          }}
          className="w-24 sm:w-32 h-1.5 bg-[#002855] rounded-lg appearance-none cursor-pointer accent-[#6ef52c]"
        />
        <span className="text-[10px] font-mono text-slate-400">FAST</span>
        <span className="text-xs font-mono font-bold text-[#6ef52c] ml-1">{speed}x</span>
      </div>

      {/* Normal vs Smart Mode Switcher */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-game font-bold text-slate-400 uppercase hidden sm:inline">
          SCAN MODE:
        </span>
        <div className="bg-[#020e21] p-1 rounded-xl border-2 border-[#09356b] flex items-center">
          <button
            onClick={() => {
              sound.playClick();
              setScanMode('NORMAL');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-game font-extrabold transition-all ${
              scanMode === 'NORMAL'
                ? 'bg-gradient-to-r from-[#32e6ff] to-[#04a9d8] text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            NORMAL SCAN
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setScanMode('SMART');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-game font-extrabold transition-all ${
              scanMode === 'SMART'
                ? 'bg-gradient-to-r from-[#6ef52c] to-[#39d108] text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SMART SCAN
          </button>
        </div>
      </div>

      {/* Time Slot Scrubber & Progress */}
      <div className="w-full sm:w-auto flex items-center gap-3">
        <div className="flex-1 sm:w-44">
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-300 mb-0.5">
            <span>TIME SLOT</span>
            <span className="text-[#6ef52c]">{String(currentSlot).padStart(2, '0')} / {maxSlots}</span>
          </div>
          <div className="w-full bg-[#020b18] h-2 rounded-full overflow-hidden border border-[#0094ff]/40">
            <div
              className="h-full bg-gradient-to-r from-[#0094ff] to-[#6ef52c] transition-all duration-200"
              style={{ width: `${(currentSlot / maxSlots) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
