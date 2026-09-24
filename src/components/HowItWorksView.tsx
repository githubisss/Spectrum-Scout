import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { Eye, Ruler, ListOrdered, Radio, RefreshCw, Repeat, ArrowDown, Shield, Brain, CheckCircle, ChevronRight } from 'lucide-react';

export const HowItWorksView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: 'Observe',
      icon: Eye,
      color: 'text-[#6ef52c]',
      btnClass: 'game-btn-lime',
      tagline: 'The simulator generates activity across frequency bands.',
      description:
        'In realistic electromagnetic environments, various radar systems, communication bursts, and agile emitters transmit intermittently across gigahertz frequency bands without prior notice.',
      mathConcept: 'Stochastic RF power density distribution across B1..B12',
      details: [
        'Frequency Agile Hoppers switch bands pseudo-randomly every few slots.',
        'Target Tracking and Fire Control radars emit periodic high-PRF pulse bursts.',
        'Ambient noise floors fluctuate, creating uncertainty and false alarm risks.',
      ],
    },
    {
      num: 2,
      title: 'Measure',
      icon: Ruler,
      color: 'text-cyan-400',
      btnClass: 'game-btn-cyan',
      tagline: 'The system records recent observations and dwell outcomes.',
      description:
        'When the electronic support measure (ESM) receiver tunes into a band, it measures signal amplitude, pulse repetition frequency (PRF), bandwidth, and duration.',
      mathConcept: 'Dwell interval measurements: Amplitude (dBm), PRF, Time-since-last-intercept',
      details: [
        'Stores historical dwell results without requiring prior intelligence database.',
        'Calculates lapse time (recency) for bands left unobserved.',
        'Measures spectral entropy to track informational uncertainty.',
      ],
    },
    {
      num: 3,
      title: 'Prioritize',
      icon: ListOrdered,
      color: 'text-amber-400',
      btnClass: 'game-btn-orange',
      tagline: 'Each band receives a dynamic priority score in real-time.',
      description:
        'Instead of blind sequential sweeps, an adaptive cognitive engine computes a real-time Priority Score for each frequency band using a balanced exploration vs. exploitation heuristic.',
      mathConcept: 'P(b) = w_a·Activity(b) + w_r·Recency(b) + w_u·Uncertainty(b) + w_h·History(b)',
      details: [
        'Exploitation: Prioritizes active emitters to maintain vital track lock.',
        'Exploration: Prioritizes stale bands with high uncertainty to detect agile hopping.',
        'Heuristic weights can be tuned in real-time to adapt to mission objectives.',
      ],
    },
    {
      num: 4,
      title: 'Scan',
      icon: Radio,
      color: 'text-purple-400',
      btnClass: 'game-btn-pink',
      tagline: 'The receiver tuner steers to the highest-priority band.',
      description:
        'The fast superheterodyne or digital receiver LO (local oscillator) hops directly to the band selected by the Smart Scan Engine rather than wasting time on empty bands.',
      mathConcept: 'Selected Band = argmax_b [ P(b) ] with minimum dwell constraints',
      details: [
        'Cuts average intercept time from ~720ms down to ~140ms.',
        'Concentrates receiver sensitivity where high-threat signals are most probable.',
        'Avoids static cycle patterns that enemy electronic countermeasures could exploit.',
      ],
    },
    {
      num: 5,
      title: 'Update',
      icon: RefreshCw,
      color: 'text-emerald-400',
      btnClass: 'game-btn-lime',
      tagline: 'New observations change beliefs and adjust all priorities.',
      description:
        'Upon scanning the selected band, the cognitive engine immediately resets its recency counter, lowers uncertainty, and updates threat history via Bayesian inference.',
      mathConcept: 'Uncertainty_new = Uncertainty_old * 0.4; Recency = 0',
      details: [
        'If an agile hopper just disappeared, the system flags adjacent bands.',
        'If high activity is detected, threat classification confidence escalates.',
        'Unvisited bands naturally gain urgency over time to prevent blind spots.',
      ],
    },
    {
      num: 6,
      title: 'Repeat',
      icon: Repeat,
      color: 'text-rose-400',
      btnClass: 'game-btn-pink',
      tagline: 'The closed-loop cognitive cycle continuously adapts.',
      description:
        'The receiver continuously cycles through this observe-learn-prioritize loop at microsecond speeds, ensuring total situational awareness even against unknown and dynamic threats.',
      mathConcept: 'Continuous closed-loop cognitive electronic warfare framework',
      details: [
        'Zero reliance on pre-loaded threat libraries.',
        'Robust against frequency agile hopping and intermittent emissions.',
        'Proven in simulation to achieve >90% detection probability.',
      ],
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="bg-[#051c3d] border-4 border-[#09356b] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-game font-extrabold bg-[#6ef52c] text-black">
              DRDO EW CHALLENGE
            </span>
            <h2 className="text-xl font-game font-extrabold text-white">
              HOW SPECTRUM SCOUT WORKS
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Simulation of a Smart Scan Strategy for Electronic Warfare in the absence of prior reliable intelligence of emitters and their operating characteristics.
          </p>
        </div>

        <div className="bg-[#021124] px-4 py-2 rounded-xl border border-[#0094ff] text-right">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">CORE PARADIGM</span>
          <span className="text-xs font-game font-bold text-[#6ef52c]">
            OBSERVE &middot; LEARN &middot; PRIORITIZE
          </span>
        </div>
      </div>

      {/* 6-Step Horizontal / Flow Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((s) => {
          const isSelected = s.num === activeStep;
          const Icon = s.icon;
          return (
            <button
              key={s.num}
              onClick={() => {
                sound.playClick();
                setActiveStep(s.num);
              }}
              className={`p-3 rounded-xl border-3 flex flex-col items-center text-center transition-all duration-200 ${
                isSelected
                  ? 'border-[#6ef52c] bg-[#072d54] shadow-[0_0_15px_rgba(110,245,44,0.35)] scale-105 z-10'
                  : 'border-[#09356b] bg-[#031838] hover:bg-[#05244f]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-base mb-1.5 ${
                  isSelected ? 'game-btn-lime text-black' : 'bg-[#01142e] text-slate-300 border border-[#0055b3]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-game font-extrabold text-xs text-white">
                {s.num}. {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Step Deep Dive Card */}
      {(() => {
        const s = steps.find((item) => item.num === activeStep)!;
        const Icon = s.icon;
        return (
          <div className="bg-[#041a3d] border-4 border-[#0094ff] rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-black font-extrabold ${s.btnClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-game font-bold text-[#6ef52c] uppercase">
                    STEP {s.num} OF 6
                  </span>
                  <h3 className="text-2xl font-game font-extrabold text-white">
                    {s.title}
                  </h3>
                </div>
              </div>

              <div className="bg-[#021124] px-4 py-2 rounded-xl border border-[#0094ff]/60">
                <span className="text-[10px] text-slate-400 font-mono block">MATHEMATICAL FORMULATION</span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {s.mathConcept}
                </span>
              </div>
            </div>

            <p className="text-base font-semibold text-white mb-2">
              &ldquo;{s.tagline}&rdquo;
            </p>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {s.description}
            </p>

            {/* Key Mechanics */}
            <div className="bg-[#020e21] rounded-xl border-2 border-[#09356b] p-4 mb-6">
              <h4 className="text-xs font-game font-extrabold text-[#6ef52c] uppercase mb-3 flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                KEY ADAPTIVE MECHANISMS
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {s.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#6ef52c] shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Step Nav Button */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">
                Interactive Concept Stepper
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveStep(activeStep >= 6 ? 1 : activeStep + 1);
                }}
                className="px-4 py-2 rounded-xl text-xs font-game font-extrabold game-btn-lime text-black flex items-center gap-1.5"
              >
                <span>{activeStep >= 6 ? 'RESTART WALKTHROUGH' : 'NEXT STEP'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Comparison Explainer Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Normal Sweep drawbacks */}
        <div className="bg-[#03152d] border-2 border-rose-500/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 text-rose-400 font-game font-extrabold text-sm uppercase">
            <span>🔄 Traditional Sequential Scan</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Visits every band in fixed order: <code>B1 &rarr; B2 &rarr; B3 &rarr; B4 &rarr; B5 ...</code>
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5">
            <li className="flex items-center gap-1.5 text-rose-300">
              <span>&times;</span> Spends ~70% of time listening to dead empty noise.
            </li>
            <li className="flex items-center gap-1.5 text-rose-300">
              <span>&times;</span> Intercept latency is slow (takes 700ms+ to return).
            </li>
            <li className="flex items-center gap-1.5 text-rose-300">
              <span>&times;</span> Misses rapid burst transmitters and agile frequency hoppers.
            </li>
          </ul>
        </div>

        {/* Smart scan advantage */}
        <div className="bg-[#03152d] border-2 border-[#6ef52c]/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 text-[#6ef52c] font-game font-extrabold text-sm uppercase">
            <span>🧠 Spectrum Scout Smart Scan</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Dynamically chooses next band: <code>B1 &rarr; B5 &rarr; B8 &rarr; B5 &rarr; B3 ...</code>
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5">
            <li className="flex items-center gap-1.5 text-[#6ef52c]">
              <span>&#10003;</span> Intercepts critical emitters within ~140ms.
            </li>
            <li className="flex items-center gap-1.5 text-[#6ef52c]">
              <span>&#10003;</span> Balances exploration (staleness) and exploitation (threat).
            </li>
            <li className="flex items-center gap-1.5 text-[#6ef52c]">
              <span>&#10003;</span> Adapts autonomously with zero prior intelligence required.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
