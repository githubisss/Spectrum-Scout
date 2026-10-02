<div align="center">

# 📡 Spectrum Scout

### Adaptive Spectrum Scanning Simulator

**Observe · Learn · Prioritize**

*"Don't scan everything equally. Scan what matters next."*

A browser-based, game-styled simulator showing how a **smart, priority-driven scan strategy** for an electronic-warfare (EW) receiver works when there is **no reliable prior intelligence** about which emitters are out there or how they behave. It compares that strategy against a traditional sequential sweep.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-Apache_2.0-green)

</div>

> [!NOTE]
> This is a **simulation for education and research demonstration only**. No real RF signals, receivers, or hardware are involved. All emitters, bands, and measurements are synthetic.

---

## Table of Contents

- [The Problem](#the-problem)
- [The Idea](#the-idea)
- [Features](#features)
- [The Smart Scan Algorithm](#the-smart-scan-algorithm)
- [Simulated RF Environment](#simulated-rf-environment)
- [Getting Started](#getting-started)
- [Using the Simulator](#using-the-simulator)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Known Limitations](#known-limitations)
- [Roadmap Ideas](#roadmap-ideas)
- [Background & Further Reading](#background--further-reading)
- [License](#license)

---

## The Problem

An Electronic Support Measures (ESM) receiver can only listen to **one frequency band at a time**. The spectrum it has to watch is wide (here, 2–18 GHz split into 12 bands), and the emitters in it are unpredictable:

- **Frequency-agile hoppers** jump between bands.
- **Burst transmitters** are on for a moment and then go quiet.
- **Tracking radars** pulse at high repetition rates.
- **Intermittent jammers** and **telemetry links** come and go.

When there is no threat library to say where to look, the usual fallback is a **sequential sweep** (B1 → B2 → … → B12 → B1). It is simple and fair, but it spends most of its time listening to empty noise and keeps missing short-lived or hopping signals.

## The Idea

Spectrum Scout runs a **closed-loop cognitive scan cycle** instead:

```
 ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌────────┐   ┌──────────┐
 │ OBSERVE  │──▶│ MEASURE  │──▶│ PRIORITIZE │──▶│  SCAN  │──▶│  UPDATE  │──┐
 └──────────┘   └──────────┘   └────────────┘   └────────┘   └──────────┘  │
      ▲                                                                     │
      └──────────────────────────── REPEAT ─────────────────────────────────┘
```

Each band gets a live **priority score** built from what the receiver has seen so far. The receiver tunes to the band with the highest score. Each new observation updates the beliefs, and the loop repeats. Bands that have not been visited for a while gain urgency on their own, so the system **balances exploitation** (staying on active threats) **with exploration** (checking stale or uncertain bands).

---

## Features

| Area | What you get |
|---|---|
| 🎯 **Scan workspace** | Live 12-band spectrum view with an animated waveform, a waterfall heatmap, *current* and *next* band markers, and per-band activity cards |
| 🧠 **Smart Scan Engine panel** | Factor meters for the selected band, plain-language reasons for its score, a ranked priority leaderboard, and weight sliders |
| ⚙️ **Simulation sandbox** | The same grid and engine in a side-by-side layout for experimenting with weights |
| 📊 **Analytics** | Smart vs. Normal comparison: probability of detection (Pd), false-alarm rate (Pfa), intercept latency, scan efficiency, prediction accuracy, plus area and bar charts (Recharts) |
| 🏆 **Mission mode** | Four gamified objectives with a score, detections, scan time, a missed-signal counter, and a confetti reward when a mission is claimed |
| 📖 **How It Works** | Interactive six-step walkthrough of the cognitive loop with the math behind each step |
| 🔍 **Band inspector** | Click any band to open a modal with its emitter class, dBm, pulses/s, priority, and an oscilloscope-style waveform. You can force focus onto that band |
| 🎮 **Game control pad** | Geometry-Dash-inspired toolbar: step forward, adjust weights, move the band cursor, change scan window and threshold, inject bursts |
| 🔊 **Procedural audio** | Retro sound effects generated with the Web Audio API (no audio files), with a mute toggle |
| ⚡ **Burst injection** | Fire a sudden high-power emitter on a random band to watch Smart Scan react |

---

## The Smart Scan Algorithm

The core logic is in [`src/utils/simulationEngine.ts`](src/utils/simulationEngine.ts).

### 1. Priority score

Each band *b* is scored from four normalized (0–100) factors:

```
P(b) = w_a · Activity(b) + w_r · RecencyNorm(b) + w_u · Uncertainty(b) + w_h · History(b)

RecencyNorm(b) = min(100, 10 × slotsSinceLastVisit(b))
P(b) is clamped to [5, 100] and rounded
```

| Factor | Meaning | Role | Default weight |
|---|---|---|---|
| **Activity** | Current RF power / occupancy in the band | Exploitation | `0.35` |
| **Recency** | Time slots since the band was last observed | Exploration | `0.25` |
| **Uncertainty** | How little the system currently knows about the band | Exploration | `0.25` |
| **History** | Accumulated threat evidence from past intercepts | Exploitation | `0.15` |

### 2. Band selection

| Mode | Rule |
|---|---|
| `NORMAL` | Strictly sequential: `next = (current mod 12) + 1` |
| `SMART` | `argmax_b P(b)`. When two scores are within ±2 points, the band left unvisited longer wins. If the top band is the one just scanned and the runner-up scores ≥ 50, the runner-up is picked, so the receiver doesn't lock onto one band forever |

### 3. Belief update after each dwell

| Band | Recency | Uncertainty | History |
|---|---|---|---|
| **Scanned** | reset to `0` | `× 0.4` (floor 10) | `+5` if detected (activity ≥ 40), else `−2` |
| **Not scanned** | `+1` | `+6` (cap 95) | unchanged |

Because recency and uncertainty grow on every unvisited band, a band that has been ignored long enough will eventually be picked. That **prevents permanent blind spots**, similar to the exploration bonus in Upper-Confidence-Bound (UCB) bandit algorithms.

### 4. Band state classification

| State | Condition |
|---|---|
| `HIGH` (alerting) | activity ≥ 65 |
| `UNCERTAIN` | activity ≥ 35 **or** uncertainty ≥ 60 |
| `LOW` | activity ≥ 15 |
| `IDLE` | otherwise |

### 5. Explainability

`getSelectionReason()` produces up to three plain-language reasons for a band's score (e.g. *"Long dwell lapse: 9 time slots without observation"*, *"High informational entropy (spectral uncertainty 82%)"*). They appear in the Smart Scan Engine panel.

---

## Simulated RF Environment

### Frequency plan (12 bands, 2–18 GHz)

| Band | Range | Initial emitter |
|---|---|---|
| B1 | 2.0 – 2.4 GHz | Surveillance Radar |
| B2 | 2.4 – 2.6 GHz | Telemetry Link |
| B3 | 3.1 – 3.4 GHz | Target Tracking Radar |
| B4 | 4.4 – 5.0 GHz | Noise / Idle |
| B5 | 5.6 – 5.8 GHz | Burst Transmission |
| B6 | 8.5 – 9.0 GHz | Intermittent Jammer |
| B7 | 9.0 – 9.6 GHz | Noise / Idle |
| B8 | 10.0 – 11.2 GHz | Frequency Agile Hopper |
| B9 | 12.0 – 13.5 GHz | Telemetry Link |
| B10 | 14.0 – 15.2 GHz | Surveillance Radar |
| B11 | 15.5 – 16.8 GHz | Noise / Idle |
| B12 | 17.0 – 18.0 GHz | Target Tracking Radar |

### Emitter dynamics (per time slot)

- **Agile hopper:** every 4th slot it jumps to band `((slot × 3) mod 12) + 1` with 75–97% activity. The band it left drops back to noise.
- **Burst transmitters:** B5 and B8 burst when `slot mod 5 = 0` or `slot mod 7 = 0`, then decay.
- **Ambient fluctuation:** every band's activity gets random jitter of ±6, clamped to 5–98.
- **Detection:** a dwell counts as an intercept when the scanned band's activity is ≥ 40.

The simulation runs in a loop of **100 time slots**. The tick interval is `max(220 ms, 750 ms / speed)`, with speed between 0.5× and 2.5× (the toolbar zoom buttons go up to 3×).

---

## Getting Started

### Prerequisites

- **Node.js 20+** (or **Bun**; a `bun.lock` is committed)
- A modern browser with Web Audio support

### Install and run

```bash
# clone
git clone <your-fork-url> Spectrum-Scout
cd Spectrum-Scout

# install dependencies
bun install          # or: npm install

# start the dev server on http://localhost:3000
bun run dev          # or: npm run dev
```

### Available scripts

| Script | Description |
|---|---|
| `dev` | Vite dev server on port **3000**, bound to `0.0.0.0` |
| `build` | Production build into `dist/` |
| `preview` | Serve the production build locally |
| `lint` | Type-check with `tsc --noEmit` |
| `clean` | Remove `dist/` |

### Environment variables

Copy `.env.example` to `.env.local` if you need it:

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Reserved for Gemini API calls (scaffolded from Google AI Studio). **The current code does not use it**, so the simulator runs without it |
| `APP_URL` | Hosting URL, injected automatically when deployed through AI Studio / Cloud Run |
| `DISABLE_HMR` | Set to `true` to turn off Vite HMR and file watching (used by AI Studio during agent edits) |

---

## Using the Simulator

1. **Watch it run.** The simulation starts automatically in **SMART** mode. The lime marker shows the band being scanned; the next marker shows where Smart Scan will go next.
2. **Switch modes.** Toggle **SMART ⇄ NORMAL** in the header or the control bar and compare how the scanner moves.
3. **Tune the engine.** In the **Smart Scan Engine** panel, move the *Activity* and *Uncertainty* weight sliders and watch the priority leaderboard reorder. **DEFAULT** restores the default weights.
4. **Stress test.** Press **Inject Burst** (✨) to drop a −32 dBm burst emitter onto a random band.
5. **Inspect.** Click any band card to open the detail modal, then use **Set priority focus** to steer the scanner there manually.
6. **Measure.** Open **Analytics** to compare Pd, Pfa, latency, and efficiency between modes. Run both modes for a while so both have data.
7. **Play.** Open **Missions** and complete the four objectives:

| # | Mission | Goal | Reward |
|---|---|---|---|
| 01 | Detect Changing Activity | Intercept 5 burst transmissions | +500 ⭐ |
| 02 | Find the Highest Priority Band | Track the agile hopper across 3 transitions | +750 ⭐ |
| 03 | Reduce Unnecessary Scanning | Reach > 85% scan efficiency | +600 ⭐ |
| 04 | Respond to Sudden Activity Change | Intercept a tracking radar in < 4 slots | +900 ⭐ |

### Game control pad reference

| Control | Action |
|---|---|
| ▲ / ▼ | Activity weight ±0.05 (range 0.05–0.80) |
| ◀ / ▶ | Move the band cursor |
| ⏪ / ⏩ | Step the time slot backward / forward one step |
| ↔ `nW` | Cycle the scan window (1–4 slots) |
| ↕ `nP` | Cycle the priority threshold (30 / 50 / 70) |
| ⟳ | Restart the simulation |
| BUILD / EDIT / DELETE | Inject a burst / toggle scan mode / clear spectrum data |
| 🔍+ / 🔍− | Speed up / slow down |

---

## Project Structure

```
Spectrum-Scout/
├── index.html                    # HTML shell, fonts (Chakra Petch, JetBrains Mono, Plus Jakarta Sans), SEO meta
├── metadata.json                 # Google AI Studio applet metadata
├── vite.config.ts                # React + Tailwind plugins, '@' alias, HMR toggle
├── tsconfig.json
├── package.json
├── .env.example
└── src/
    ├── main.tsx                  # React entry point (StrictMode)
    ├── App.tsx                   # Root: state, simulation loop, missions, tab routing
    ├── index.css                 # Tailwind import + 3D "game button" styles
    ├── types/
    │   └── spectrum.ts           # Band, weights, scan event, metrics, mission types
    ├── utils/
    │   ├── simulationEngine.ts   # Initial bands, priority formula, band selection, RF dynamics
    │   └── audio.ts              # Web Audio sound synthesizer (singleton `sound`)
    └── components/
        ├── Header.tsx            # Brand, tab navigation, mode toggle, slot counter, mute, play/pause
        ├── SimulationControls.tsx# Play/reset/burst, speed slider, mode switch, slot progress bar
        ├── SpectrumGrid.tsx      # Animated spectrum waveform, markers, 12 band cards
        ├── WaterfallHeatmap.tsx  # Canvas-based scrolling waterfall
        ├── PriorityPanel.tsx     # Factor meters, reasons, leaderboard, weight sliders
        ├── BandDetailModal.tsx   # Per-band inspector
        ├── AnalyticsView.tsx     # Smart-vs-Normal KPIs and Recharts charts
        ├── MissionModeView.tsx   # Mission HUD, objectives, rewards
        ├── HowItWorksView.tsx    # Six-step concept walkthrough
        └── GameControlsToolbar.tsx # Bottom control pad
```

---

## Architecture

```
                         ┌───────────────────────────────┐
                         │            App.tsx            │
                         │  React state (bands, weights, │
                         │  mode, slot, history, missions│
                         │  score) + stateRef            │
                         └──────────────┬────────────────┘
          setInterval(750/speed ms)     │
                ┌───────────────────────▼───────────────────────┐
                │ executeStep()                                  │
                │  1. advanceSimulationStep(bands, target, slot) │  ◀── simulationEngine.ts
                │  2. selectNextBand(updated, target, mode)      │
                │  3. log ScanEvent → history (last 100)         │
                │  4. every 6 slots → MetricSnapshot (last 19)   │
                │  5. update score / missions                    │
                │  6. sound.playScannerHop / playDetection       │  ◀── audio.ts
                └───────────────────────┬───────────────────────┘
                                        │ props
   ┌──────────┬──────────────┬──────────┼───────────┬──────────────┬──────────────┐
   ▼          ▼              ▼          ▼           ▼              ▼              ▼
 Header  SimulationCtrls SpectrumGrid PriorityPanel AnalyticsView MissionMode  GameControlsToolbar
                         └ Waterfall
```

- **Single source of truth:** all state lives in `App.tsx`. There is no external store.
- **No stale closures:** the timer callback reads the latest state through a `useRef` mirror (`stateRef`), so `executeStep` can be memoized with an empty dependency array.
- **Pure engine:** `simulationEngine.ts` has no React dependency, which makes it easy to unit-test or reuse in a headless benchmark.
- **Client-only:** no backend or network calls at runtime (only Google Fonts).

---

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 19 |
| Language | TypeScript |
| Build / dev server | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) plus custom CSS |
| Charts | Recharts 3 |
| Icons | lucide-react |
| Effects | canvas-confetti |
| Audio | Web Audio API (native) |

Declared but **not yet used** in `src/`: `@google/genai`, `express`, `dotenv`, `motion`, `tsx`. These come from the Google AI Studio scaffold.

---

## Known Limitations

Read these before quoting numbers from the app:

- **Analytics are partly illustrative.** Pd and Pfa come from the real scan history, but *intercept latency*, *scan efficiency*, and *prediction accuracy* are derived from Pd with fixed formulas plus random jitter, and are clamped to ranges (e.g. Smart Pd 30–96%, Normal Pd 15–60%). Before any data exists, a synthetic sample curve is shown. Treat the "~140 ms vs ~720 ms" and ">90% Pd" figures as **design targets, not measured results**.
- **Mission progress is approximate.** The counters start partly filled. Mission 03 (efficiency) goes up by 2 on every Smart-mode step instead of tracking efficiency. Mission 04 counts any tracking-radar intercept and has no timing check.
- **Some controls are only partly connected.** `scanWindow` (dwell time) and `priorityThreshold` can be changed but are **not yet used** by the engine. The **Step Backward** button only decrements the slot counter; it doesn't restore earlier band state. Only the Activity and Uncertainty weights have sliders.
- **Score and counters are not reset** by Reset, which only resets bands, slot, and history.
- **Synthetic, deterministic emitters.** Hopper and burst timing follow fixed modular patterns, so a learning policy could exploit them.
- **No tests yet.**

---

## Roadmap Ideas

- [ ] Use `scanWindow` as a real multi-slot dwell and `priorityThreshold` as a gate for alerts and selection
- [ ] Measure intercept latency directly (slots from emitter onset to first intercept) instead of using formulas
- [ ] Headless benchmark: run N Monte-Carlo episodes per mode and report confidence intervals
- [ ] Unit tests for `calculatePriority`, `selectNextBand`, and `advanceSimulationStep` (e.g. Vitest)
- [ ] Add policies to compare against: random, round-robin with revisit, ε-greedy, UCB1, Thompson sampling
- [ ] Stochastic or adversarial emitter models (Markov hop patterns, LPI waveforms)
- [ ] Real state snapshots for step-backward / replay
- [ ] Sliders for Recency and History weights; normalize weights to sum to 1
- [ ] Optional Gemini-powered "EW analyst" commentary using the scaffolded `@google/genai` dependency
- [ ] Remove unused dependencies

---

## Background & Further Reading

Spectrum Scout's heuristic sits where three well-studied areas meet:

- **Cognitive radar / cognitive EW:** a perception–action loop in which the sensor adapts how it transmits or receives based on what it has learned about the environment.
  *S. Haykin, "Cognitive Radar: A Way of the Future," IEEE Signal Processing Magazine, 23(1), 2006.*
- **Multi-armed bandits (exploration vs. exploitation):** picking which "arm" (band) to pull with incomplete information. The recency and uncertainty terms play the same role as the exploration bonus in UCB.
  *P. Auer, N. Cesa-Bianchi, P. Fischer, "Finite-time Analysis of the Multiarmed Bandit Problem," Machine Learning, 47, 2002.*
- **ESM receiver scan scheduling / probability of intercept (POI):** the classic problem of making a narrowband receiver "coincide" with intermittent emitters in time and frequency.
  *R. G. Wiley, "ELINT: The Interception and Analysis of Radar Signals," Artech House, 2006.*
  *D. Adamy, "EW 101: A First Course in Electronic Warfare," Artech House, 2001.*

The project was built around the **DRDO EW challenge** problem statement: *a smart scan strategy for electronic warfare in the absence of prior reliable intelligence of emitters and their operating characteristics.*

---

## License

Source files carry the `SPDX-License-Identifier: Apache-2.0` header. See the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

<div align="center">

**📡 Spectrum Scout**: scan what matters next.

</div>
