import React, { useState } from 'react';
import { Mission, ScanEvent, ScanMode } from '../types/spectrum';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Star, Target, Clock, AlertTriangle, CheckCircle2, Play, ArrowRight, Sparkles } from 'lucide-react';

interface MissionModeViewProps {
  missions: Mission[];
  onStartMission: (missionId: number) => void;
  activeMissionId: number | null;
  score: number;
  totalDetections: number;
  scanTime: number;
  missedSignals: number;
  scanMode: ScanMode;
  onToggleMode: () => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onInjectBurst: () => void;
}

export const MissionModeView: React.FC<MissionModeViewProps> = ({
  missions,
  onStartMission,
  activeMissionId,
  score,
  totalDetections,
  scanTime,
  missedSignals,
  scanMode,
  onToggleMode,
  isRunning,
  onTogglePlay,
  onInjectBurst,
}) => {
  const activeMission = missions.find((m) => m.id === activeMissionId) || missions[0];

  const handleClaimSuccess = () => {
    sound.playMissionComplete();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 select-none">
      {/* Game HUD Bar */}
      <div className="bg-[#051c3d] border-4 border-[#09356b] rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl game-btn-orange flex items-center justify-center text-black font-extrabold text-2xl">
            🏆
          </div>
          <div>
            <h2 className="text-xl font-game font-extrabold text-white">
              TACTICAL MISSION OPS
            </h2>
            <p className="text-xs text-slate-300">
              Electronic Warfare Cognitive Scanning Challenges
            </p>
          </div>
        </div>

        {/* Live Score Counters (Requested in Prompt: ⭐ Score, 🎯 Detections, ⏱ Scan Time, ⚠ False Alarms) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Score */}
          <div className="bg-[#021124] px-3.5 py-2 rounded-xl border-2 border-[#09356b] text-center min-w-[90px]">
            <span className="text-[10px] text-amber-400 font-game font-bold flex items-center justify-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> SCORE
            </span>
            <span className="text-lg font-mono font-extrabold text-white">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Detections */}
          <div className="bg-[#021124] px-3.5 py-2 rounded-xl border-2 border-[#09356b] text-center min-w-[90px]">
            <span className="text-[10px] text-[#6ef52c] font-game font-bold flex items-center justify-center gap-1">
              <Target className="w-3 h-3" /> DETECTIONS
            </span>
            <span className="text-lg font-mono font-extrabold text-[#6ef52c]">
              {totalDetections}
            </span>
          </div>

          {/* Scan Time */}
          <div className="bg-[#021124] px-3.5 py-2 rounded-xl border-2 border-[#09356b] text-center min-w-[90px]">
            <span className="text-[10px] text-cyan-400 font-game font-bold flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> SCAN TIME
            </span>
            <span className="text-lg font-mono font-extrabold text-cyan-300">
              {scanTime}s
            </span>
          </div>

          {/* Missed / False Alarms */}
          <div className="bg-[#021124] px-3.5 py-2 rounded-xl border-2 border-[#09356b] text-center min-w-[90px]">
            <span className="text-[10px] text-rose-400 font-game font-bold flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> MISSED / FA
            </span>
            <span className="text-lg font-mono font-extrabold text-rose-400">
              {missedSignals}
            </span>
          </div>
        </div>
      </div>

      {/* Active Mission Spotlight */}
      <div className="bg-gradient-to-r from-[#031d45] to-[#062c66] border-4 border-[#0094ff] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-game font-extrabold bg-[#6ef52c] text-black">
              MISSION 0{activeMission.id}
            </span>
            <h3 className="text-lg font-game font-extrabold text-white">
              {activeMission.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onTogglePlay();
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-game font-extrabold flex items-center gap-1.5 ${
                isRunning ? 'game-btn-orange text-black' : 'game-btn-lime text-black'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'PAUSE MISSION' : 'RUN MISSION SIM'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onInjectBurst();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-game font-bold bg-[#143058] border border-[#0094ff] text-cyan-300 hover:text-white flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6ef52c]" />
              <span>STIMULATE EW BURST</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-200 mb-4 max-w-2xl">
          {activeMission.description}
        </p>

        {/* Mission Progress Bar */}
        <div className="bg-[#021124] p-3 rounded-xl border border-[#0094ff]/60 mb-4">
          <div className="flex justify-between items-center text-xs font-game font-bold mb-1">
            <span className="text-slate-300 uppercase">OBJECTIVE PROGRESS:</span>
            <span className="text-[#6ef52c] font-mono">
              {activeMission.currentValue} / {activeMission.targetValue}
            </span>
          </div>
          <div className="w-full bg-[#002855] h-3 rounded-full overflow-hidden border border-black">
            <div
              className="h-full bg-gradient-to-r from-[#0094ff] to-[#6ef52c] transition-all duration-300"
              style={{
                width: `${Math.min(100, (activeMission.currentValue / activeMission.targetValue) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Strategy Advice */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#01142e]/80 p-3 rounded-xl border border-[#0055b3]">
          <div className="flex items-center gap-2">
            <span className="font-game font-bold text-amber-400">TACTICAL HINT:</span>
            <span className="text-slate-300">
              {scanMode === 'NORMAL'
                ? '⚠️ You are in NORMAL SCAN mode. Sequential sweeping will cause you to miss agile hops! Switch to SMART SCAN.'
                : '✅ SMART SCAN active! Cognitive prioritization is locking onto high-probability bands automatically.'}
            </span>
          </div>

          {scanMode === 'NORMAL' && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleMode();
              }}
              className="px-3 py-1 rounded-lg text-xs font-game font-extrabold game-btn-lime text-black"
            >
              SWITCH TO SMART SCAN
            </button>
          )}

          {activeMission.completed && (
            <button
              onClick={handleClaimSuccess}
              className="px-3 py-1 rounded-lg text-xs font-game font-extrabold game-btn-orange text-black flex items-center gap-1 animate-bounce"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CLAIM REWARD +{activeMission.scoreReward} ⭐</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Mission Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missions.map((mission) => {
          const isActive = mission.id === activeMissionId;
          return (
            <div
              key={mission.id}
              onClick={() => {
                sound.playClick();
                onStartMission(mission.id);
              }}
              className={`rounded-2xl border-3 p-4 cursor-pointer transition-all duration-200 select-none ${
                isActive
                  ? 'border-[#6ef52c] bg-[#04284d] shadow-[0_0_20px_rgba(110,245,44,0.3)] scale-[1.01]'
                  : 'border-[#09356b] bg-[#051c3d] hover:bg-[#07244f]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-game font-extrabold text-xs px-2 py-0.5 rounded bg-[#014cb8] text-[#6ef52c] border border-[#0094ff]">
                    MISSION 0{mission.id}
                  </span>
                  <h4 className="font-game font-extrabold text-base text-white">
                    {mission.title}
                  </h4>
                </div>
                {mission.completed ? (
                  <span className="flex items-center gap-1 text-xs font-game font-bold text-[#6ef52c]">
                    <CheckCircle2 className="w-4 h-4" /> CLEARED
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-amber-400">
                    +{mission.scoreReward} ⭐
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mb-3">
                {mission.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <span className="text-slate-400 font-mono">
                  Progress: {mission.currentValue} / {mission.targetValue}
                </span>
                <span
                  className={`font-game font-bold text-xs ${
                    isActive ? 'text-[#6ef52c]' : 'text-cyan-400'
                  }`}
                >
                  {isActive ? 'ACTIVE MISSION ▶' : 'SELECT MISSION'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
