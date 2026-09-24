import React from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Cpu, Compass, Activity, Crosshair, HelpCircle, Trophy } from 'lucide-react';
import { ScanMode } from '../types/spectrum';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentTab: 'scan' | 'simulation' | 'analytics' | 'missions' | 'how-it-works';
  setCurrentTab: (tab: 'scan' | 'simulation' | 'analytics' | 'missions' | 'how-it-works') => void;
  scanMode: ScanMode;
  setScanMode: (mode: ScanMode) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  onReset: () => void;
  currentSlot: number;
  maxSlots: number;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  scanMode,
  setScanMode,
  isRunning,
  setIsRunning,
  onReset,
  currentSlot,
  maxSlots,
  isMuted,
  setIsMuted,
}) => {
  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const handleTabChange = (tab: 'scan' | 'simulation' | 'analytics' | 'missions' | 'how-it-works') => {
    sound.playClick();
    setCurrentTab(tab);
  };

  const handleModeToggle = () => {
    sound.playClick();
    setScanMode(scanMode === 'SMART' ? 'NORMAL' : 'SMART');
  };

  return (
    <header className="bg-[#051c3d] border-b-4 border-[#013575] shadow-xl px-4 py-2.5 select-none relative z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#6ef52c] to-[#42b810] border-2 border-[#144005] shadow-[0_3px_0_#144005] flex items-center justify-center text-black font-extrabold text-2xl">
            📡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-game font-extrabold text-white tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                SPECTRUM SCOUT
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-game font-bold uppercase rounded bg-[#014cb8] text-[#71f73b] border border-[#0094ff]">
                DRDO EW SIM
              </span>
            </div>
            <p className="text-xs font-semibold text-[#8dc7ff] tracking-tight">
              Adaptive Spectrum Scanning Simulator &middot; Observe. Learn. Prioritize.
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Game Editor Style) */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#021124] rounded-xl border-2 border-[#09356b] shadow-inner">
          <button
            onClick={() => handleTabChange('scan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-game font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'scan'
                ? 'game-btn-lime text-black'
                : 'text-slate-300 hover:text-white hover:bg-[#06244f]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>SCANNER</span>
          </button>

          <button
            onClick={() => handleTabChange('simulation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-game font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'simulation'
                ? 'game-btn-cyan text-black'
                : 'text-slate-300 hover:text-white hover:bg-[#06244f]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ENGINE</span>
          </button>

          <button
            onClick={() => handleTabChange('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-game font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'analytics'
                ? 'game-btn-pink text-white'
                : 'text-slate-300 hover:text-white hover:bg-[#06244f]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>ANALYTICS</span>
          </button>

          <button
            onClick={() => handleTabChange('missions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-game font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'missions'
                ? 'game-btn-orange text-black'
                : 'text-slate-300 hover:text-white hover:bg-[#06244f]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>MISSIONS</span>
          </button>

          <button
            onClick={() => handleTabChange('how-it-works')}
            className={`px-3 py-1.5 rounded-lg text-xs font-game font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'how-it-works'
                ? 'game-btn-navy text-cyan-300 border-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-[#06244f]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HOW IT WORKS</span>
          </button>
        </nav>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Scan Mode Toggle */}
          <div className="flex items-center bg-[#021124] p-1 rounded-xl border-2 border-[#09356b]">
            <button
              onClick={handleModeToggle}
              className={`px-2.5 py-1 rounded-lg text-xs font-game font-extrabold flex items-center gap-1 transition-all ${
                scanMode === 'SMART'
                  ? 'bg-gradient-to-r from-[#6ef52c] to-[#39d108] text-black shadow-[0_2px_0_#144005]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3 h-3" />
              SMART
            </button>
            <button
              onClick={handleModeToggle}
              className={`px-2.5 py-1 rounded-lg text-xs font-game font-extrabold flex items-center gap-1 transition-all ${
                scanMode === 'NORMAL'
                  ? 'bg-gradient-to-r from-[#32e6ff] to-[#04a9d8] text-black shadow-[0_2px_0_#01374a]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              NORMAL
            </button>
          </div>

          {/* Time Slot Badge */}
          <div className="px-2.5 py-1 bg-[#021124] border-2 border-[#09356b] rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block leading-none">TIME SLOT</span>
            <span className="text-xs font-mono font-bold text-[#6ef52c] tracking-wider">
              {String(currentSlot).padStart(2, '0')} / {maxSlots}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-[#1e293b] border-[#475569] text-slate-400'
                : 'game-btn-cyan text-black'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Play/Pause quick button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsRunning(!isRunning);
            }}
            className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
              isRunning
                ? 'game-btn-orange text-black'
                : 'game-btn-lime text-black'
            }`}
            title={isRunning ? 'Pause Simulation' : 'Start Simulation'}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
