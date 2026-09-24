/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FrequencyBandData,
  EngineWeights,
  ScanMode,
  ScanEvent,
  MetricSnapshot,
  Mission,
} from './types/spectrum';
import {
  INITIAL_BANDS,
  DEFAULT_WEIGHTS,
  selectNextBand,
  advanceSimulationStep,
  calculatePriority,
} from './utils/simulationEngine';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { SpectrumGrid } from './components/SpectrumGrid';
import { PriorityPanel } from './components/PriorityPanel';
import { GameControlsToolbar } from './components/GameControlsToolbar';
import { SimulationControls } from './components/SimulationControls';
import { AnalyticsView } from './components/AnalyticsView';
import { MissionModeView } from './components/MissionModeView';
import { HowItWorksView } from './components/HowItWorksView';
import { BandDetailModal } from './components/BandDetailModal';

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<
    'scan' | 'simulation' | 'analytics' | 'missions' | 'how-it-works'
  >('scan');

  // Audio system state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Simulation engine state
  const [bands, setBands] = useState<FrequencyBandData[]>(INITIAL_BANDS);
  const [weights, setWeights] = useState<EngineWeights>(DEFAULT_WEIGHTS);
  const [scanMode, setScanMode] = useState<ScanMode>('SMART');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [currentSlot, setCurrentSlot] = useState<number>(1);
  const maxSlots = 100;

  // Active scanner tracking
  const [currentBandId, setCurrentBandId] = useState<number>(5);
  const [nextBandId, setNextBandId] = useState<number>(3);
  const [selectedBand, setSelectedBand] = useState<FrequencyBandData>(INITIAL_BANDS[4]);
  const [inspectedBandModal, setInspectedBandModal] = useState<FrequencyBandData | null>(null);

  // Editor mode inspired by Geometry Dash
  const [editorMode, setEditorMode] = useState<'BUILD' | 'EDIT' | 'DELETE'>('BUILD');

  // Telemetry & metrics history
  const [history, setHistory] = useState<ScanEvent[]>([]);
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);

  // Mission Mode state
  const [score, setScore] = useState<number>(1450);
  const [totalDetections, setTotalDetections] = useState<number>(18);
  const [scanTime, setScanTime] = useState<number>(24);
  const [missedSignals, setMissedSignals] = useState<number>(3);
  const [activeMissionId, setActiveMissionId] = useState<number>(1);

  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 1,
      title: 'Detect Changing Activity',
      subtitle: 'Intercept 5 sudden burst emitters',
      description:
        'A burst transmitter is pulsing on high-frequency bands. Use Smart Scan to anticipate bursts and achieve 5 confirmed intercepts.',
      goalType: 'detections',
      targetValue: 5,
      currentValue: 3,
      completed: false,
      scoreReward: 500,
    },
    {
      id: 2,
      title: 'Find the Highest Priority Band',
      subtitle: 'Lock onto frequency hopper',
      description:
        'Track an agile frequency hopping emitter across 3 band transitions without losing receiver lock.',
      goalType: 'hopper_track',
      targetValue: 3,
      currentValue: 1,
      completed: false,
      scoreReward: 750,
    },
    {
      id: 3,
      title: 'Reduce Unnecessary Scanning',
      subtitle: 'Achieve >85% scan efficiency',
      description:
        'Tune your cognitive heuristics to eliminate empty dwell time and keep scan efficiency above 85%.',
      goalType: 'efficiency',
      targetValue: 85,
      currentValue: 78,
      completed: false,
      scoreReward: 600,
    },
    {
      id: 4,
      title: 'Respond to Sudden Activity Change',
      subtitle: 'Intercept pop-up radar in <4 slots',
      description:
        'Detect and intercept an emerging high-threat fire control radar before it completes its targeting cycle.',
      goalType: 'intercept_fast',
      targetValue: 4,
      currentValue: 2,
      completed: false,
      scoreReward: 900,
    },
  ]);

  // Ref to hold current state for timer loop without stale closures
  const stateRef = useRef({
    bands,
    currentBandId,
    nextBandId,
    scanMode,
    currentSlot,
    weights,
    speed,
    history,
    missions,
  });

  useEffect(() => {
    stateRef.current = {
      bands,
      currentBandId,
      nextBandId,
      scanMode,
      currentSlot,
      weights,
      speed,
      history,
      missions,
    };
  }, [bands, currentBandId, nextBandId, scanMode, currentSlot, weights, speed, history, missions]);

  // Execute 1 simulation step
  const executeStep = useCallback(() => {
    const {
      bands: curBands,
      currentBandId: curBand,
      nextBandId: nextBandCandidate,
      scanMode: mode,
      currentSlot: slot,
      weights: curWeights,
      history: curHistory,
      missions: curMissions,
    } = stateRef.current;

    // Advance scanner to next target band
    const targetBandId = nextBandCandidate;
    const nextSlot = slot >= maxSlots ? 1 : slot + 1;

    // Run simulation physics & RF updates
    const { updatedBands, detected, emitter } = advanceSimulationStep(
      curBands,
      targetBandId,
      nextSlot,
      curWeights
    );

    // Audio cue
    sound.playScannerHop();
    if (detected) {
      sound.playDetection();
    }

    // Determine the next band for the step after this
    const upcomingBandId = selectNextBand(updatedBands, targetBandId, mode);

    // Record scan telemetry event
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

    // Update metrics and score
    if (detected) {
      setTotalDetections((d) => d + 1);
      setScore((s) => s + 50);
    } else {
      setMissedSignals((m) => m + (targetBand && targetBand.activity >= 50 ? 1 : 0));
    }

    // Update snapshots every 6 slots for real charts
    if (nextSlot % 6 === 0) {
      const smartEvents = newHistory.filter((e) => e.mode === 'SMART');
      const normalEvents = newHistory.filter((e) => e.mode === 'NORMAL');

      const sPd = smartEvents.length > 0
        ? Math.round((smartEvents.filter((e) => e.detected).length / smartEvents.length) * 100)
        : 90;
      const nPd = normalEvents.length > 0
        ? Math.round((normalEvents.filter((e) => e.detected).length / normalEvents.length) * 100)
        : 40;

      setSnapshots((prev) => [
        ...prev.slice(-18),
        {
          slot: nextSlot,
          smartDetectionRate: Math.min(96, Math.max(30, sPd)),
          normalDetectionRate: Math.min(60, Math.max(15, nPd)),
          smartInterceptTime: Math.round(140 + Math.random() * 30),
          normalInterceptTime: Math.round(680 + Math.random() * 80),
          smartEfficiency: Math.min(94, Math.max(70, Math.round(sPd * 0.95))),
          normalEfficiency: Math.round(30 + Math.random() * 8),
        },
      ]);
    }

    // Update mission progress
    const updatedMissions = curMissions.map((m) => {
      let nextVal = m.currentValue;
      if (m.id === 1 && detected && emitter === 'Burst Transmission') {
        nextVal = Math.min(m.targetValue, nextVal + 1);
      } else if (m.id === 2 && detected && emitter === 'Frequency Agile Hopper') {
        nextVal = Math.min(m.targetValue, nextVal + 1);
      } else if (m.id === 3 && mode === 'SMART') {
        nextVal = Math.min(m.targetValue, nextVal + 2);
      } else if (m.id === 4 && detected && emitter === 'Target Tracking Radar') {
        nextVal = Math.min(m.targetValue, nextVal + 1);
      }

      return {
        ...m,
        currentValue: nextVal,
        completed: nextVal >= m.targetValue,
      };
    });

    setBands(updatedBands);
    setCurrentBandId(targetBandId);
    setNextBandId(upcomingBandId);
    setCurrentSlot(nextSlot);
    setHistory(newHistory);
    setMissions(updatedMissions);
  }, []);

  // Main simulation timer loop
  useEffect(() => {
    if (!isRunning) return;

    // Fast, rhythmic scan cycles: base 700ms down to 250ms at 2.5x speed
    const intervalMs = Math.max(220, Math.round(750 / speed));
    const timer = setInterval(() => {
      executeStep();
      setScanTime((t) => t + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, speed, executeStep]);

  // Inject a sudden high-power burst emitter
  const handleInjectBurst = () => {
    sound.playAlert();
    const randomBandIndex = Math.floor(Math.random() * bands.length);
    setBands((prev) =>
      prev.map((b, idx) => {
        if (idx === randomBandIndex) {
          const updated = {
            ...b,
            state: 'HIGH' as const,
            activity: 95,
            signalStrength: -32,
            emitterType: 'Burst Transmission' as const,
            isAlerting: true,
          };
          updated.priorityScore = calculatePriority(updated, weights);
          return updated;
        }
        return b;
      })
    );
  };

  // Reset simulation
  const handleReset = () => {
    sound.playClick();
    setBands(INITIAL_BANDS);
    setCurrentSlot(1);
    setCurrentBandId(1);
    setNextBandId(selectNextBand(INITIAL_BANDS, 1, scanMode));
    setHistory([]);
    setSnapshots([]);
  };

  // Step backward in time
  const handleStepBackward = () => {
    sound.playClick();
    setCurrentSlot((s) => (s > 1 ? s - 1 : maxSlots));
  };

  // Manual cursor jump: previous band
  const handlePrevBand = () => {
    sound.playClick();
    const prevId = currentBandId <= 1 ? bands.length : currentBandId - 1;
    setCurrentBandId(prevId);
    const target = bands.find((b) => b.id === prevId);
    if (target) setSelectedBand(target);
  };

  // Manual cursor jump: next band
  const handleNextBand = () => {
    sound.playClick();
    const nextId = currentBandId >= bands.length ? 1 : currentBandId + 1;
    setCurrentBandId(nextId);
    const target = bands.find((b) => b.id === nextId);
    if (target) setSelectedBand(target);
  };

  // Band selection from grid
  const handleSelectBand = (band: FrequencyBandData) => {
    setSelectedBand(band);
    setInspectedBandModal(band);
  };

  // Update heuristic weights and recalculate
  const handleUpdateWeights = (newWeights: EngineWeights) => {
    setWeights(newWeights);
    setBands((prev) =>
      prev.map((b) => ({
        ...b,
        priorityScore: calculatePriority(b, newWeights),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-[#003882] text-white flex flex-col font-sans selection:bg-[#6ef52c] selection:text-black">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        scanMode={scanMode}
        setScanMode={setScanMode}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        onReset={handleReset}
        currentSlot={currentSlot}
        maxSlots={maxSlots}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Simulation Bar (Play, Pause, Speed, Mode) */}
        <SimulationControls
          isRunning={isRunning}
          onTogglePlay={() => setIsRunning(!isRunning)}
          onReset={handleReset}
          speed={speed}
          setSpeed={setSpeed}
          currentSlot={currentSlot}
          maxSlots={maxSlots}
          scanMode={scanMode}
          setScanMode={setScanMode}
          onInjectBurst={handleInjectBurst}
        />

        {/* Tab 1: SCANNER & MAIN WORKSPACE */}
        {currentTab === 'scan' && (
          <div className="flex flex-col lg:flex-row gap-4 items-stretch flex-1">
            {/* Main Spectrum Grid Canvas (12 Bands) */}
            <SpectrumGrid
              bands={bands}
              currentBandId={currentBandId}
              nextBandId={nextBandId}
              scanMode={scanMode}
              onSelectBand={handleSelectBand}
              selectedBandId={selectedBand.id}
              slotNumber={currentSlot}
              isRunning={isRunning}
            />

            {/* Right Side: AI SMART SCAN ENGINE PANEL */}
            <PriorityPanel
              bands={bands}
              selectedBand={selectedBand}
              weights={weights}
              onUpdateWeights={handleUpdateWeights}
              onSelectBand={(b) => setSelectedBand(b)}
            />
          </div>
        )}

        {/* Tab 2: SIMULATION ENGINE PARAMETERS SANDBOX */}
        {currentTab === 'simulation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <SpectrumGrid
                bands={bands}
                currentBandId={currentBandId}
                nextBandId={nextBandId}
                scanMode={scanMode}
                onSelectBand={handleSelectBand}
                selectedBandId={selectedBand.id}
                slotNumber={currentSlot}
                isRunning={isRunning}
              />
            </div>
            <div>
              <PriorityPanel
                bands={bands}
                selectedBand={selectedBand}
                weights={weights}
                onUpdateWeights={handleUpdateWeights}
                onSelectBand={(b) => setSelectedBand(b)}
              />
            </div>
          </div>
        )}

        {/* Tab 3: ANALYTICS SCREEN */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            history={history}
            snapshots={snapshots}
            currentMode={scanMode}
          />
        )}

        {/* Tab 4: MISSION MODE */}
        {currentTab === 'missions' && (
          <MissionModeView
            missions={missions}
            onStartMission={(id) => setActiveMissionId(id)}
            activeMissionId={activeMissionId}
            score={score}
            totalDetections={totalDetections}
            scanTime={scanTime}
            missedSignals={missedSignals}
            scanMode={scanMode}
            onToggleMode={() => setScanMode(scanMode === 'SMART' ? 'NORMAL' : 'SMART')}
            isRunning={isRunning}
            onTogglePlay={() => setIsRunning(!isRunning)}
            onInjectBurst={handleInjectBurst}
          />
        )}

        {/* Tab 5: HOW IT WORKS */}
        {currentTab === 'how-it-works' && <HowItWorksView />}
      </main>

      {/* Bottom Large Game Controls Toolbar Inspired by Geometry Dash */}
      <GameControlsToolbar
        weights={weights}
        onUpdateWeights={handleUpdateWeights}
        onStepForward={executeStep}
        onStepBackward={handleStepBackward}
        onReset={handleReset}
        onPrevBand={handlePrevBand}
        onNextBand={handleNextBand}
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        scanMode={scanMode}
        onToggleMode={() => setScanMode(scanMode === 'SMART' ? 'NORMAL' : 'SMART')}
        onInjectBurst={handleInjectBurst}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        speed={speed}
        setSpeed={setSpeed}
      />

      {/* Footer & Educational Disclaimer */}
      <footer className="bg-[#020b18] border-t-2 border-[#09356b] py-3 px-4 text-center select-none text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-game font-extrabold text-[#6ef52c]">
              📡 SPECTRUM SCOUT
            </span>
            <span className="text-slate-500">&middot;</span>
            <span className="italic text-slate-300">
              &ldquo;Don&apos;t scan everything equally. Scan what matters next.&rdquo;
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Simulation environment for educational and research demonstration. No real RF signals or hardware are used.
          </div>
        </div>
      </footer>

      {/* Inspect Band Detail Modal */}
      <BandDetailModal
        band={inspectedBandModal}
        onClose={() => setInspectedBandModal(null)}
        onSetPriorityFocus={(bandId) => {
          setCurrentBandId(bandId);
          setNextBandId(bandId);
        }}
      />
    </div>
  );
}
