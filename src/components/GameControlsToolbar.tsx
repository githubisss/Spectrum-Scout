import React from 'react';
import { EngineWeights, FrequencyBandData, ScanMode } from '../types/spectrum';
import { sound } from '../utils/audio';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  ArrowUpDown,
  ArrowLeftRight,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Sliders,
  Sparkles,
  Trash2,
  Move,
} from 'lucide-react';

interface GameControlsToolbarProps {
  weights: EngineWeights;
  onUpdateWeights: (weights: EngineWeights) => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onPrevBand: () => void;
  onNextBand: () => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  scanMode: ScanMode;
  onToggleMode: () => void;
  onInjectBurst: () => void;
  editorMode: 'BUILD' | 'EDIT' | 'DELETE';
  setEditorMode: (mode: 'BUILD' | 'EDIT' | 'DELETE') => void;
  speed: number;
  setSpeed: (speed: number) => void;
}

export const GameControlsToolbar: React.FC<GameControlsToolbarProps> = ({
  weights,
  onUpdateWeights,
  onStepForward,
  onStepBackward,
  onReset,
  onPrevBand,
  onNextBand,
  isRunning,
  onTogglePlay,
  scanMode,
  onToggleMode,
  onInjectBurst,
  editorMode,
  setEditorMode,
  speed,
  setSpeed,
}) => {
  // ▲ Increase Scan Weight
  const handleIncreaseWeight = () => {
    sound.playClick();
    const nextVal = Math.min(0.8, Number((weights.activityWeight + 0.05).toFixed(2)));
    onUpdateWeights({ ...weights, activityWeight: nextVal });
  };

  // ▼ Decrease Scan Weight
  const handleDecreaseWeight = () => {
    sound.playClick();
    const nextVal = Math.max(0.05, Number((weights.activityWeight - 0.05).toFixed(2)));
    onUpdateWeights({ ...weights, activityWeight: nextVal });
  };

  // ↔ Adjust Scan Window
  const handleCycleWindow = () => {
    sound.playClick();
    const nextWindow = weights.scanWindow >= 4 ? 1 : weights.scanWindow + 1;
    onUpdateWeights({ ...weights, scanWindow: nextWindow });
  };

  // ↕ Adjust Priority Threshold
  const handleCycleThreshold = () => {
    sound.playClick();
    const nextThresh = weights.priorityThreshold >= 70 ? 30 : weights.priorityThreshold + 20;
    onUpdateWeights({ ...weights, priorityThreshold: nextThresh });
  };

  return (
    <div className="bg-[#03152d] border-t-4 border-[#013575] shadow-2xl p-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Mode Selection Inspired by Geometry Dash [BUILD, EDIT, DELETE] */}
        <div className="flex items-center gap-2">
          {/* Side Circle Utility Buttons */}
          <div className="hidden sm:flex flex-col gap-1.5 mr-1">
            <button
              onClick={() => {
                sound.playClick();
                setSpeed(Math.min(3, speed + 0.5));
              }}
              title="Speed Up / Zoom"
              className="w-8 h-8 rounded-full game-btn-lime flex items-center justify-center text-black"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSpeed(Math.max(0.5, speed - 0.5));
              }}
              title="Slow Down"
              className="w-8 h-8 rounded-full game-btn-lime flex items-center justify-center text-black"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs Stack [BUILD, EDIT, DELETE] */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setEditorMode('BUILD');
                onInjectBurst();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-game font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                editorMode === 'BUILD'
                  ? 'game-btn-lime text-black'
                  : 'bg-[#06244f] text-slate-300 border border-[#0094ff]/60 hover:text-white'
              }`}
              title="Inject Simulated RF Pulse"
            >
              <Sparkles className="w-3 h-3" />
              <span>BUILD (INJECT)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setEditorMode('EDIT');
                onToggleMode();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-game font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                editorMode === 'EDIT'
                  ? 'game-btn-cyan text-black'
                  : 'bg-[#06244f] text-slate-300 border border-[#0094ff]/60 hover:text-white'
              }`}
              title="Toggle Normal vs Smart Scan Mode"
            >
              <Sliders className="w-3 h-3" />
              <span>EDIT (MODE)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setEditorMode('DELETE');
                onReset();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-game font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                editorMode === 'DELETE'
                  ? 'game-btn-pink text-white'
                  : 'bg-[#06244f] text-slate-300 border border-[#0094ff]/60 hover:text-white'
              }`}
              title="Clear Spectrum Data"
            >
              <Trash2 className="w-3 h-3" />
              <span>CLEAR</span>
            </button>
          </div>
        </div>

        {/* Center: The Iconic Game-Control Pad (Lime Green 3D Rounded Buttons) */}
        <div className="flex flex-col items-center gap-2">
          {/* Top Row: [▲ Increase Weight] [▼ Decrease Weight] [◀ Prev Band] [▶ Next Band] [▶ Play/Pause] */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* ▲ Increase Scan Weight */}
            <button
              onClick={handleIncreaseWeight}
              title="▲ Increase Scan Weight (+5%)"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl game-btn-lime flex flex-col items-center justify-center text-black font-extrabold"
            >
              <ChevronUp className="w-6 h-6 stroke-[3]" />
            </button>

            {/* ▼ Decrease Scan Weight */}
            <button
              onClick={handleDecreaseWeight}
              title="▼ Decrease Scan Weight (-5%)"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl game-btn-lime flex flex-col items-center justify-center text-black font-extrabold"
            >
              <ChevronDown className="w-6 h-6 stroke-[3]" />
            </button>

            {/* ◀ Previous Band */}
            <button
              onClick={() => {
                sound.playClick();
                onPrevBand();
              }}
              title="◀ Previous Band Cursor"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl game-btn-lime flex flex-col items-center justify-center text-black font-extrabold"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>

            {/* ▶ Next Band */}
            <button
              onClick={() => {
                sound.playClick();
                onNextBand();
              }}
              title="▶ Next Band Cursor"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl game-btn-lime flex flex-col items-center justify-center text-black font-extrabold"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Main Play / Pause */}
            <button
              onClick={() => {
                sound.playClick();
                onTogglePlay();
              }}
              title={isRunning ? 'Pause' : 'Start Simulation'}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-extrabold text-black ${
                isRunning ? 'game-btn-orange' : 'game-btn-lime'
              }`}
            >
              {isRunning ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Bottom Row: [⏪ Prev Step] [⏩ Next Step] [↔ Scan Window] [↕ Priority Threshold] [⟳ Restart] */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* ⏪ Previous Step */}
            <button
              onClick={() => {
                sound.playClick();
                onStepBackward();
              }}
              title="⏪ Step Backward (Time Slot -1)"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl game-btn-lime flex flex-col items-center justify-center text-black font-extrabold"
            >
              <ChevronsLeft className="w-6 h-6 stroke-[3]" />
            </button>

            {/* ⏩ Next Step */}
            <button
              onClick={() => {
                sound.playClick();
                onStepForward();
              }}
              title="⏩ Step Forward (Time Slot +1)"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl game-btn-lime flex flex-col items-center justify-center text-black font-extrabold"
            >
              <ChevronsRight className="w-6 h-6 stroke-[3]" />
            </button>

            {/* ↔ Adjust Scan Window */}
            <button
              onClick={handleCycleWindow}
              title={`↔ Adjust Scan Window (Current: ${weights.scanWindow} slots)`}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl game-btn-lime flex flex-col items-center justify-center text-black font-extrabold"
            >
              <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[9px] font-game font-bold -mt-0.5">
                {weights.scanWindow}W
              </span>
            </button>

            {/* ↕ Adjust Priority */}
            <button
              onClick={handleCycleThreshold}
              title={`↕ Adjust Priority Threshold (Current: ${weights.priorityThreshold})`}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl game-btn-lime flex flex-col items-center justify-center text-black font-extrabold"
            >
              <ArrowUpDown className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[9px] font-game font-bold -mt-0.5">
                {weights.priorityThreshold}P
              </span>
            </button>

            {/* ⟳ Restart Simulation */}
            <button
              onClick={() => {
                sound.playClick();
                onReset();
              }}
              title="⟳ Restart Simulation"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl game-btn-lime flex flex-col items-center justify-center text-black font-extrabold"
            >
              <RotateCcw className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Right Side: Simulation Speed & Quick Navigation */}
        <div className="flex flex-col gap-2 min-w-[150px]">
          {/* Speed slider */}
          <div className="bg-[#020e21] p-2 rounded-xl border border-[#0094ff]/60">
            <div className="flex justify-between items-center text-[10px] font-game font-bold text-slate-300 mb-1">
              <span>SPEED:</span>
              <span className="text-[#6ef52c] font-mono">{speed}x</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
              <span>SLOW</span>
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
                className="w-full h-1.5 bg-[#002855] rounded-lg appearance-none cursor-pointer accent-[#6ef52c]"
              />
              <span>FAST</span>
            </div>
          </div>

          {/* Quick Info Chip */}
          <div className="flex items-center justify-between bg-[#020e21] px-2.5 py-1 rounded-xl border border-[#0094ff]/60 text-[10px] font-game font-bold">
            <span className="text-slate-400">WEIGHT BIAS:</span>
            <span className="text-cyan-300 font-mono">
              ACT: {Math.round(weights.activityWeight * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
