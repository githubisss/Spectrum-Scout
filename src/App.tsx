/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  EngineWeights,
  FrequencyBandData,
  MetricSnapshot,
  Mission,
  ScanEvent,
  ScanMode,
  SpectrumRow,
  ViewTab,
} from './types/spectrum';
import {
  DEFAULT_WEIGHTS,
  INITIAL_BANDS,
  advanceSimulationStep,
  calculatePriority,
  selectNextBand,
} from './utils/simulationEngine';
import { sound } from './utils/audio';

import { TopBar } from './components/TopBar';
import { ScannerView } from './components/ScannerView';
import { AnalyticsView, modelLatency } from './components/AnalyticsView';
import { MissionsView } from './components/MissionsView';
import { MethodView } from './components/MethodView';
import { WATERFALL_ROWS } from './components/SpectrumView';

const MAX_SLOTS = 100;

const INITIAL_MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'Detect changing activity',
    subtitle: 'Intercept 5 burst transmissions',
    description:
      'A burst transmitter is pulsing on high-frequency bands. Use Smart scan to catch the bursts and confirm 5 intercepts.',
    goalType: 'detections',
    targetValue: 5,
    currentValue: 0,
    completed: false,
    scoreReward: 500,
  },
  {
    id: 2,
    title: 'Track the frequency hopper',
    subtitle: 'Intercept the agile hopper 3 times',
    description:
      'An agile emitter changes band every few slots. Keep finding it after it jumps: 3 confirmed intercepts.',
    goalType: 'hopper_track',
    targetValue: 3,
    currentValue: 0,
    completed: false,
    scoreReward: 750,
  },
  {
    id: 3,
    title: 'Reduce unnecessary scanning',
    subtitle: 'Reach 85% scan efficiency',
    description:
      'Tune the heuristic weights so the receiver wastes as few dwells as possible on empty bands.',
    goalType: 'efficiency',
    targetValue: 85,
    currentValue: 0,
    completed: false,
    scoreReward: 600,
  },
  {
    id: 4,
    title: 'Respond to sudden activity',
    subtitle: 'Intercept tracking radars 4 times',
    description:
      'High-threat tracking radars pop up without warning. Intercept them before they complete a targeting cycle.',
    goalType: 'intercept_fast',
    targetValue: 4,
    currentValue: 0,
    completed: false,
    scoreReward: 900,
  },
];

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    tag === 'BUTTON' ||
    target.isContentEditable
  );
}

export default function App() {
  const [tab, setTab] = useState<ViewTab>('scanner');
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Simulation engine state
  const [bands, setBands] = useState<FrequencyBandData[]>(INITIAL_BANDS);
  const [weights, setWeights] = useState<EngineWeights>(DEFAULT_WEIGHTS);
  const [scanMode, setScanMode] = useState<ScanMode>('SMART');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [currentSlot, setCurrentSlot] = useState<number>(1);
  const [currentBandId, setCurrentBandId] = useState<number>(5);
  const [nextBandId, setNextBandId] = useState<number>(3);
  const [inspectId, setInspectId] = useState<number | null>(null);

  // Telemetry
  const [history, setHistory] = useState<ScanEvent[]>([]);
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);
  const [spectrumRows, setSpectrumRows] = useState<SpectrumRow[]>([]);

  // Missions
  const [score, setScore] = useState<number>(0);
  const [totalDetections, setTotalDetections] = useState<number>(0);
  const [scanTime, setScanTime] = useState<number>(0);
  const [missedSignals, setMissedSignals] = useState<number>(0);
  const [activeMissionId, setActiveMissionId] = useState<number>(1);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [claimedIds, setClaimedIds] = useState<number[]>([]);

  useEffect(() => {
    sound.setMuted(isMuted);
  }, [isMuted]);

  // Mirror of the latest state so the timer callback never reads stale values
  const stateRef = useRef({ bands, nextBandId, scanMode, currentSlot, weights, history, missions });
  useEffect(() => {
    stateRef.current = { bands, nextBandId, scanMode, currentSlot, weights, history, missions };
  }, [bands, nextBandId, scanMode, currentSlot, weights, history, missions]);

  const executeStep = useCallback(() => {
    const {
      bands: curBands,
      nextBandId: targetBandId,
      scanMode: mode,
      currentSlot: slot,
      weights: curWeights,
      history: curHistory,
      missions: curMissions,
    } = stateRef.current;

    const nextSlot = slot >= MAX_SLOTS ? 1 : slot + 1;

    const { updatedBands, detected, emitter } = advanceSimulationStep(
      curBands,
      targetBandId,
      nextSlot,
      curWeights
    );

    sound.playScannerHop();
    if (detected) sound.playDetection();

    const upcomingBandId = selectNextBand(updatedBands, targetBandId, mode);
    const targetBand = updatedBands.find((b) => b.id === targetBandId);

    const newEvent: ScanEvent = {
      slot: nextSlot,
      bandId: targetBandId,
      mode,
      detected,
      emitterType: emitter,
      signalLevel: targetBand ? targetBand.signalStrength : -80,
      timestamp: Date.now(),
    };
    const newHistory = [...curHistory.slice(-99), newEvent];

    if (detected) {
      setTotalDetections((d) => d + 1);
      setScore((s) => s + 50);
    } else if (targetBand && targetBand.activity >= 50) {
      setMissedSignals((m) => m + 1);
    }

    // Rolling per-strategy sample every 6 slots
    if (nextSlot % 6 === 0) {
      const rate = (m: ScanMode): number | null => {
        const events = newHistory.filter((e) => e.mode === m);
        return events.length > 0
          ? Math.round((events.filter((e) => e.detected).length / events.length) * 100)
          : null;
      };
      const smartPd = rate('SMART');
      const normalPd = rate('NORMAL');
      setSnapshots((prev) => [
        ...prev.slice(-18),
        {
          slot: nextSlot,
          smartDetectionRate: smartPd,
          normalDetectionRate: normalPd,
          smartInterceptTime: smartPd === null ? null : modelLatency('SMART', smartPd),
          normalInterceptTime: normalPd === null ? null : modelLatency('NORMAL', normalPd),
        },
      ]);
    }

    setSpectrumRows((prev) => [
      ...prev.slice(-(WATERFALL_ROWS - 1)),
      {
        slot: nextSlot,
        activity: updatedBands.map((b) => b.activity),
        scannedId: targetBandId,
        detected,
      },
    ]);

    const updatedMissions = curMissions.map((m) => {
      let value = m.currentValue;
      if (m.id === 1 && detected && emitter === 'Burst Transmission') value += 1;
      else if (m.id === 2 && detected && emitter === 'Frequency Agile Hopper') value += 1;
      else if (m.id === 3 && mode === 'SMART') value += 2;
      else if (m.id === 4 && detected && emitter === 'Target Tracking Radar') value += 1;
      value = Math.min(m.targetValue, value);
      return { ...m, currentValue: value, completed: value >= m.targetValue };
    });

    setBands(updatedBands);
    setCurrentBandId(targetBandId);
    setNextBandId(upcomingBandId);
    setCurrentSlot(nextSlot);
    setHistory(newHistory);
    setMissions(updatedMissions);
  }, []);

  // Simulation clock
  useEffect(() => {
    if (!isRunning) return;
    const intervalMs = Math.max(220, Math.round(750 / speed));
    const timer = setInterval(() => {
      executeStep();
      setScanTime((t) => t + 1);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isRunning, speed, executeStep]);

  const handleTogglePlay = useCallback(() => {
    sound.playClick();
    setIsRunning((r) => !r);
  }, []);

  const handleStep = useCallback(() => {
    if (!isRunning) executeStep();
  }, [executeStep, isRunning]);

  const handleInjectBurst = useCallback(() => {
    sound.playAlert();
    setBands((prev) => {
      const idx = Math.floor(Math.random() * prev.length);
      return prev.map((b, i) => {
        if (i !== idx) return b;
        const updated: FrequencyBandData = {
          ...b,
          state: 'HIGH',
          activity: 95,
          signalStrength: -32,
          emitterType: 'Burst Transmission',
          isAlerting: true,
        };
        updated.priorityScore = calculatePriority(updated, stateRef.current.weights);
        return updated;
      });
    });
  }, []);

  const handleReset = useCallback(() => {
    sound.playClick();
    setBands(INITIAL_BANDS);
    setCurrentSlot(1);
    setCurrentBandId(1);
    setNextBandId(selectNextBand(INITIAL_BANDS, 1, stateRef.current.scanMode));
    setHistory([]);
    setSnapshots([]);
    setSpectrumRows([]);
    setInspectId(null);
  }, []);

  const handleScanModeChange = useCallback((mode: ScanMode) => {
    sound.playClick();
    setScanMode(mode);
  }, []);

  const handleUpdateWeights = (newWeights: EngineWeights) => {
    setWeights(newWeights);
    setBands((prev) => prev.map((b) => ({ ...b, priorityScore: calculatePriority(b, newWeights) })));
  };

  const handleClaim = (id: number) => {
    const mission = missions.find((m) => m.id === id);
    if (!mission || !mission.completed || claimedIds.includes(id)) return;
    sound.playMissionComplete();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 }, colors: ['#2dd4bf', '#5eead4', '#e7eaf0'] });
    setClaimedIds((ids) => [...ids, id]);
    setScore((s) => s + mission.scoreReward);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowRight':
          handleStep();
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
        case 'm':
        case 'M':
          handleScanModeChange(stateRef.current.scanMode === 'SMART' ? 'NORMAL' : 'SMART');
          break;
        case 'b':
        case 'B':
          handleInjectBurst();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleTogglePlay, handleStep, handleReset, handleScanModeChange, handleInjectBurst]);

  return (
    <div className="flex min-h-screen flex-col bg-bg font-sans text-fg">
      <TopBar
        tab={tab}
        onTabChange={(t) => {
          sound.playClick();
          setTab(t);
        }}
        isRunning={isRunning}
        onTogglePlay={handleTogglePlay}
        onStep={handleStep}
        onReset={handleReset}
        scanMode={scanMode}
        onScanModeChange={handleScanModeChange}
        speed={speed}
        onSpeedChange={setSpeed}
        onInjectBurst={handleInjectBurst}
        currentSlot={currentSlot}
        maxSlots={MAX_SLOTS}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((m) => !m)}
      />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6">
        {tab === 'scanner' && (
          <ScannerView
            bands={bands}
            currentBandId={currentBandId}
            nextBandId={nextBandId}
            inspectId={inspectId}
            scanMode={scanMode}
            weights={weights}
            rows={spectrumRows}
            history={history}
            totalDetections={totalDetections}
            missedSignals={missedSignals}
            onUpdateWeights={handleUpdateWeights}
            onInspect={(id) => setInspectId(id)}
            onForceNext={(id) => {
              sound.playClick();
              setNextBandId(id);
              setInspectId(null);
            }}
          />
        )}

        {tab === 'analytics' && (
          <AnalyticsView history={history} snapshots={snapshots} currentMode={scanMode} />
        )}

        {tab === 'missions' && (
          <MissionsView
            missions={missions}
            activeMissionId={activeMissionId}
            claimedIds={claimedIds}
            onSelectMission={setActiveMissionId}
            onClaim={handleClaim}
            score={score}
            totalDetections={totalDetections}
            scanTime={scanTime}
            missedSignals={missedSignals}
            scanMode={scanMode}
            onUseSmart={() => handleScanModeChange('SMART')}
            isRunning={isRunning}
            onTogglePlay={handleTogglePlay}
            onInjectBurst={handleInjectBurst}
          />
        )}

        {tab === 'method' && <MethodView weights={weights} />}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 px-4 py-4 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Spectrum Scout · Don&apos;t scan everything equally. Scan what matters next.</span>
          <span>Educational simulation. No real RF signals or hardware are used.</span>
        </div>
      </footer>
    </div>
  );
}
