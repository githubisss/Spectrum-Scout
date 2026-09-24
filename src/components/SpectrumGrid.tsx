import React, { useMemo } from 'react';
import { FrequencyBandData, ScanMode } from '../types/spectrum';
import { sound } from '../utils/audio';
import { Radio, Zap, AlertTriangle, ShieldCheck, Target, ArrowRight, Activity, Crosshair } from 'lucide-react';
import { WaterfallHeatmap } from './WaterfallHeatmap';

interface SpectrumGridProps {
  bands: FrequencyBandData[];
  currentBandId: number;
  nextBandId: number;
  scanMode: ScanMode;
  onSelectBand: (band: FrequencyBandData) => void;
  selectedBandId: number;
  slotNumber: number;
  isRunning?: boolean;
}

export const SpectrumGrid: React.FC<SpectrumGridProps> = ({
  bands,
  currentBandId,
  nextBandId,
  scanMode,
  onSelectBand,
  selectedBandId,
  slotNumber,
  isRunning = true,
}) => {
  const currentBand = bands.find((b) => b.id === currentBandId) || bands[0];
  const nextBand = bands.find((b) => b.id === nextBandId) || bands[1];

  // SVG Waveform generation mimicking the Geometry Dash editor wave path
  const wavePoints = useMemo(() => {
    const width = 1200;
    const height = 110;
    const step = width / (bands.length * 4);
    const points: [number, number][] = [];

    // Base phase offset based on slotNumber to animate smooth movement
    const phase = slotNumber * 0.45;

    let x = 0;
    for (let i = 0; i <= bands.length * 4; i++) {
      const bandIndex = Math.min(bands.length - 1, Math.floor(i / 4));
      const band = bands[bandIndex];
      const activityNorm = band.activity / 100;
      
      // Undulating sine + band activity modulation
      const y = height * 0.5 + 
        Math.sin(i * 0.6 + phase) * 22 * (0.4 + activityNorm) +
        (band.isAlerting ? Math.cos(i * 1.8 + phase * 2) * 16 : 0);

      points.push([x, Math.max(12, Math.min(height - 12, y))]);
      x += step;
    }

    // Build SVG path
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const pPrev = points[i - 1];
      const pCur = points[i];
      const midX = (pPrev[0] + pCur[0]) / 2;
      const midY = (pPrev[1] + pCur[1]) / 2;
      d += ` Q ${pPrev[0]} ${pPrev[1]}, ${midX} ${midY}`;
    }
    return { d, points };
  }, [bands, slotNumber]);

  const activityArray = useMemo(() => bands.map((b) => b.activity), [bands]);

  // Compute cursor positions (percentage across grid)
  const currentPosPct = ((currentBand.id - 0.5) / bands.length) * 100;
  const nextPosPct = ((nextBand.id - 0.5) / bands.length) * 100;

  return (
    <div className="relative bg-gd-blueprint rounded-2xl border-4 border-[#09356b] shadow-2xl p-3 sm:p-5 overflow-hidden flex flex-col flex-1 min-h-[500px]">
      {/* Top Editor Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-[#03152d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border-2 border-[#0094ff]/60 shadow-lg">
        {/* Current & Next Scan indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#020b18] px-3 py-1.5 rounded-lg border border-[#0088ff]">
            <span className="text-[10px] font-game font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-[#6ef52c]" /> CURRENT DWELL:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded font-game font-extrabold text-sm bg-[#6ef52c] text-black border border-[#144005] animate-pulse">
                {currentBand.name}
              </span>
              <span className="text-xs font-mono text-cyan-300 font-bold">
                {currentBand.centerFreq}
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  currentBand.state === 'HIGH'
                    ? 'bg-red-500 shadow-[0_0_8px_#ff0040]'
                    : currentBand.state === 'UNCERTAIN'
                    ? 'bg-yellow-400 shadow-[0_0_8px_#ffcc00]'
                    : currentBand.state === 'LOW'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#00ff66]'
                    : 'bg-slate-400'
                }`}
              />
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-cyan-400 hidden sm:block animate-bounce-x" />

          <div className="flex items-center gap-2 bg-[#020b18] px-3 py-1.5 rounded-lg border border-[#0088ff]">
            <span className="text-[10px] font-game font-bold uppercase tracking-wider text-slate-400">
              NEXT SCAN VECTOR:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded font-game font-extrabold text-sm bg-[#32e6ff] text-black border border-[#01374a]">
                {nextBand.name}
              </span>
              <span className="text-xs font-mono text-slate-300">
                Prio: {nextBand.priorityScore}
              </span>
            </div>
          </div>
        </div>

        {/* Scan Strategy Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#020b18] rounded-lg border border-[#0088ff]/60">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">STRATEGY:</span>
            <span className="text-xs font-game font-bold text-[#6ef52c] flex items-center gap-1">
              {scanMode === 'SMART' ? (
                <>🧠 DYNAMIC COGNITIVE SCAN</>
              ) : (
                <>🔄 SEQUENTIAL LINEAR SWEEP</>
              )}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> LOW</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> UNCERTAIN</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> HIGH</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> IDLE</span>
          </div>
        </div>
      </div>

      {/* Real-time Spectrogram Waterfall */}
      <div className="mb-3">
        <WaterfallHeatmap
          currentBandId={currentBandId}
          bandsCount={bands.length}
          activityLevels={activityArray}
          isRunning={isRunning}
          scanMode={scanMode}
        />
      </div>

      {/* Level Editor Waveform & Signal Trajectory Canvas */}
      <div className="relative h-28 mb-4 rounded-xl bg-[#031533]/85 border-2 border-[#00a6ff]/50 overflow-hidden shadow-inner flex items-center">
        {/* Grid lines inside waveform */}
        <div className="absolute inset-0 bg-gd-dark-grid opacity-60" />

        {/* Dynamic Sweeping Radar Beam Curtain that sweeps left to right */}
        {isRunning && (
          <div
            className="absolute top-0 bottom-0 w-24 pointer-events-none bg-gradient-to-r from-transparent via-[#6ef52c]/20 to-[#6ef52c]/40 border-r-2 border-[#6ef52c] transition-all duration-300 ease-out shadow-[0_0_20px_#6ef52c]"
            style={{
              left: `${Math.max(0, currentPosPct - 8)}%`,
            }}
          />
        )}

        {/* Vector Beam Projection connecting Current Band to Next Band */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <line
            x1={`${currentPosPct}%`}
            y1="50%"
            x2={`${nextPosPct}%`}
            y2="50%"
            stroke="#32e6ff"
            strokeWidth="2"
            strokeDasharray="6 3"
            className="animate-pulse"
          />
        </svg>

        {/* Level Editor Center Line (Ground Guide) */}
        <div className="absolute w-full h-[1.5px] bg-[#00e1ff]/30 top-1/2 -translate-y-1/2" />

        {/* Animated Wave SVG */}
        <svg
          viewBox="0 0 1200 110"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Subtle glow blur filter */}
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4df725" />
              <stop offset="30%" stopColor="#00f7ff" />
              <stop offset="70%" stopColor="#ffd426" />
              <stop offset="100%" stopColor="#ff3b6b" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Under-glow area */}
          <path
            d={`${wavePoints.d} L 1200 110 L 0 110 Z`}
            fill="url(#waveGradient)"
            opacity="0.12"
          />

          {/* Main green oscillating wave stroke */}
          <path
            d={wavePoints.d}
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Obstacle spikes & energy orbs (Geometry Dash Editor themed) */}
          {bands.map((band, idx) => {
            const x = (idx + 0.5) * (1200 / bands.length);
            const isScanned = band.id === currentBandId;
            const isTarget = band.id === nextBandId;

            return (
              <g key={`marker-${band.id}`} className="transition-all duration-300">
                {/* Vertical scan guide column */}
                {isScanned && (
                  <line
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={110}
                    stroke="#6ef52c"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                    opacity="0.9"
                  />
                )}

                {/* Energy Orb / Target Ring */}
                <circle
                  cx={x}
                  cy={55 + Math.sin(idx * 0.8 + slotNumber * 0.4) * 22}
                  r={isScanned ? 10 : isTarget ? 7 : 4.5}
                  fill={
                    isScanned
                      ? '#6ef52c'
                      : band.state === 'HIGH'
                      ? '#ff2255'
                      : band.state === 'UNCERTAIN'
                      ? '#ffd333'
                      : '#00e1ff'
                  }
                  stroke="#000"
                  strokeWidth="2"
                  className={isScanned ? 'animate-ping' : ''}
                />

                {/* Fixed center orb */}
                <circle
                  cx={x}
                  cy={55 + Math.sin(idx * 0.8 + slotNumber * 0.4) * 22}
                  r={isScanned ? 6 : isTarget ? 5 : 3}
                  fill={isScanned ? '#ffffff' : '#012048'}
                  stroke="#000"
                  strokeWidth="1.5"
                />

                {/* Pulse spike if high threat */}
                {band.state === 'HIGH' && (
                  <polygon
                    points={`${x - 5},105 ${x},85 ${x + 5},105`}
                    fill="#ff2255"
                    stroke="#140207"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Target Reticle Locking on Current Band */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 ease-out pointer-events-none flex flex-col items-center z-20"
          style={{
            left: `${currentPosPct}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-10 h-10 rounded-full border-2 border-[#6ef52c] shadow-[0_0_18px_#6ef52c] flex items-center justify-center animate-spin">
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
            <div className="absolute inset-0 border border-t-[#6ef52c] border-b-transparent border-l-transparent border-r-transparent rounded-full animate-ping" />
          </div>
          <span className="text-[9px] font-game font-extrabold bg-[#6ef52c] text-black px-1.5 py-0.2 rounded mt-1 border border-black shadow">
            LOCK
          </span>
        </div>

        {/* Dynamic Ghost Next-Target Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none flex flex-col items-center opacity-75 z-10"
          style={{
            left: `${nextPosPct}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-7 h-7 rounded-full border border-dashed border-[#32e6ff] shadow-[0_0_10px_#32e6ff] flex items-center justify-center animate-pulse">
            <div className="w-1.5 h-1.5 bg-[#32e6ff] rounded-full" />
          </div>
          <span className="text-[8px] font-game font-bold bg-[#32e6ff] text-black px-1 rounded mt-0.5">
            NEXT
          </span>
        </div>
      </div>

      {/* Frequency Bands Level Editor Matrix (12 Bands) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 flex-1">
        {bands.map((band) => {
          const isCurrent = band.id === currentBandId;
          const isNext = band.id === nextBandId;
          const isSelected = band.id === selectedBandId;

          // State styling
          let stateBg = 'border-[#0066ee] bg-[#021b44]/90';
          let badgeColor = 'bg-slate-700 text-slate-300 border-slate-900';

          if (band.state === 'HIGH') {
            stateBg = 'border-rose-500 bg-[#350714]/90 shadow-[0_0_14px_rgba(255,20,70,0.3)]';
            badgeColor = 'bg-rose-500 text-white border-rose-900';
          } else if (band.state === 'UNCERTAIN') {
            stateBg = 'border-amber-400 bg-[#2b1f02]/90 shadow-[0_0_12px_rgba(255,190,0,0.25)]';
            badgeColor = 'bg-amber-400 text-black border-amber-800';
          } else if (band.state === 'LOW') {
            stateBg = 'border-emerald-500 bg-[#022b16]/90';
            badgeColor = 'bg-emerald-400 text-black border-emerald-900';
          }

          if (isCurrent) {
            stateBg = 'border-[#6ef52c] bg-[#0d3b14]/95 shadow-[0_0_24px_#6ef52c] scale-[1.03] z-10';
          } else if (isNext) {
            stateBg = 'border-[#32e6ff] bg-[#042845]/95 shadow-[0_0_15px_#32e6ff] z-5';
          }

          return (
            <div
              key={band.id}
              onClick={() => {
                sound.playClick();
                onSelectBand(band);
              }}
              className={`relative rounded-xl border-3 p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none ${stateBg} ${
                isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
              } hover:brightness-110 active:scale-95`}
            >
              {/* Laser line moving across currently scanned card */}
              {isCurrent && (
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#6ef52c] to-transparent animate-scan-curtain" />
                </div>
              )}

              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-game font-extrabold text-sm sm:text-base text-white tracking-wide">
                    {band.name}
                  </span>
                  <span className={`text-[9px] font-game font-extrabold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                    {band.state}
                  </span>
                </div>

                <div className="text-[10px] font-mono font-semibold text-cyan-300 mb-1.5 leading-tight truncate">
                  {band.centerFreq}
                </div>
              </div>

              {/* Animated Mini Waveform / Pulse Visualizer */}
              <div className="h-12 w-full bg-[#010c1c] rounded-lg border border-[#0055b3]/70 p-1 flex items-end justify-between gap-[2px] mb-2 overflow-hidden relative">
                {band.waveformPattern.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${Math.max(10, Math.round(h * 100))}%` }}
                    className={`w-full rounded-t-sm transition-all duration-150 ${
                      isCurrent
                        ? 'bg-[#6ef52c]'
                        : band.state === 'HIGH'
                        ? 'bg-rose-500'
                        : band.state === 'UNCERTAIN'
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                    }`}
                  />
                ))}

                {/* High Alert pulsing badge */}
                {band.state === 'HIGH' && (
                  <div className="absolute inset-0 bg-rose-500/15 animate-pulse pointer-events-none flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-400 opacity-70" />
                  </div>
                )}
              </div>

              {/* Activity & Priority Metrics */}
              <div className="space-y-1">
                {/* Activity Bar */}
                <div>
                  <div className="flex justify-between text-[9px] font-semibold text-slate-400 mb-0.5">
                    <span>RF Power</span>
                    <span className="font-mono text-white">{band.activity}%</span>
                  </div>
                  <div className="w-full bg-[#031326] h-1.5 rounded-full overflow-hidden border border-black/40">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        band.activity >= 70
                          ? 'bg-rose-500'
                          : band.activity >= 40
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${band.activity}%` }}
                    />
                  </div>
                </div>

                {/* Priority Score Stamp */}
                <div className="pt-1 flex items-center justify-between border-t border-white/10">
                  <span className="text-[9px] font-game font-bold uppercase text-slate-400">Prio</span>
                  <span
                    className={`text-xs font-game font-extrabold px-1.5 py-0.5 rounded ${
                      band.priorityScore >= 75
                        ? 'bg-rose-600 text-white'
                        : band.priorityScore >= 50
                        ? 'bg-amber-500 text-black'
                        : 'bg-[#033066] text-cyan-300'
                    }`}
                  >
                    {band.priorityScore}
                  </span>
                </div>
              </div>

              {/* Target Indicator Badges */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6ef52c] text-black font-game font-extrabold text-[9px] px-2 py-0.5 rounded-full border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1 z-20 whitespace-nowrap">
                  <Target className="w-2.5 h-2.5" />
                  <span>DWELL</span>
                </div>
              )}

              {isNext && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#32e6ff] text-black font-game font-extrabold text-[9px] px-2 py-0.5 rounded-full border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1 z-20 whitespace-nowrap">
                  <ArrowRight className="w-2.5 h-2.5" />
                  <span>NEXT</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Spectrum Legend & Tagline */}
      <div className="mt-4 pt-2 border-t-2 border-[#0094ff]/40 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#a5d2ff]">
        <div className="flex items-center gap-2">
          <span className="font-game font-bold text-white uppercase text-[11px]">SPECTRUM GUIDE:</span>
          <span>12 Simulated GHz Radar & EW Bands (B1 to B12)</span>
        </div>
        <div className="text-[11px] font-game text-[#6ef52c] italic">
          &ldquo;Don&apos;t scan everything equally. Scan what matters next.&rdquo;
        </div>
      </div>
    </div>
  );
};
