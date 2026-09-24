import { BandState, EmitterClass, EngineWeights, FrequencyBandData, ScanMode } from '../types/spectrum';

export const INITIAL_BANDS: FrequencyBandData[] = [
  {
    id: 1,
    name: 'B1',
    frequencyRange: '2.0 - 2.4 GHz',
    centerFreq: '2.20 GHz',
    state: 'LOW',
    activity: 22,
    recency: 4,
    uncertainty: 28,
    history: 35,
    priorityScore: 28,
    emitterType: 'Surveillance Radar',
    signalStrength: -78,
    pulsesPerSec: 120,
    interceptCount: 2,
    waveformPattern: [0.2, 0.4, 0.3, 0.5, 0.2, 0.3, 0.4, 0.2, 0.3, 0.5, 0.3, 0.2],
    isAlerting: false,
  },
  {
    id: 2,
    name: 'B2',
    frequencyRange: '2.4 - 2.6 GHz',
    centerFreq: '2.50 GHz',
    state: 'UNCERTAIN',
    activity: 35,
    recency: 7,
    uncertainty: 58,
    history: 42,
    priorityScore: 44,
    emitterType: 'Telemetry Link',
    signalStrength: -72,
    pulsesPerSec: 250,
    interceptCount: 3,
    waveformPattern: [0.1, 0.3, 0.7, 0.2, 0.5, 0.8, 0.2, 0.4, 0.6, 0.3, 0.5, 0.2],
    isAlerting: false,
  },
  {
    id: 3,
    name: 'B3',
    frequencyRange: '3.1 - 3.4 GHz',
    centerFreq: '3.25 GHz',
    state: 'HIGH',
    activity: 84,
    recency: 3,
    uncertainty: 62,
    history: 76,
    priorityScore: 78,
    emitterType: 'Target Tracking Radar',
    signalStrength: -48,
    pulsesPerSec: 850,
    interceptCount: 9,
    waveformPattern: [0.3, 0.8, 0.9, 0.4, 0.9, 0.95, 0.5, 0.85, 0.9, 0.3, 0.8, 0.6],
    isAlerting: true,
  },
  {
    id: 4,
    name: 'B4',
    frequencyRange: '4.4 - 5.0 GHz',
    centerFreq: '4.70 GHz',
    state: 'LOW',
    activity: 18,
    recency: 2,
    uncertainty: 20,
    history: 24,
    priorityScore: 21,
    emitterType: 'Noise / Idle',
    signalStrength: -86,
    pulsesPerSec: 40,
    interceptCount: 1,
    waveformPattern: [0.1, 0.15, 0.1, 0.2, 0.1, 0.18, 0.12, 0.1, 0.2, 0.15, 0.1, 0.1],
    isAlerting: false,
  },
  {
    id: 5,
    name: 'B5',
    frequencyRange: '5.6 - 5.8 GHz',
    centerFreq: '5.70 GHz',
    state: 'HIGH',
    activity: 92,
    recency: 9,
    uncertainty: 82,
    history: 88,
    priorityScore: 89,
    emitterType: 'Burst Transmission',
    signalStrength: -38,
    pulsesPerSec: 1400,
    interceptCount: 12,
    waveformPattern: [0.2, 0.95, 0.9, 0.98, 0.3, 0.9, 0.95, 0.88, 0.2, 0.94, 0.9, 0.4],
    isAlerting: true,
  },
  {
    id: 6,
    name: 'B6',
    frequencyRange: '8.5 - 9.0 GHz',
    centerFreq: '8.75 GHz',
    state: 'UNCERTAIN',
    activity: 46,
    recency: 5,
    uncertainty: 64,
    history: 52,
    priorityScore: 54,
    emitterType: 'Intermittent Jammer',
    signalStrength: -65,
    pulsesPerSec: 420,
    interceptCount: 4,
    waveformPattern: [0.2, 0.5, 0.6, 0.3, 0.7, 0.4, 0.6, 0.5, 0.8, 0.3, 0.5, 0.4],
    isAlerting: false,
  },
  {
    id: 7,
    name: 'B7',
    frequencyRange: '9.0 - 9.6 GHz',
    centerFreq: '9.30 GHz',
    state: 'IDLE',
    activity: 8,
    recency: 11,
    uncertainty: 40,
    history: 15,
    priorityScore: 19,
    emitterType: 'Noise / Idle',
    signalStrength: -92,
    pulsesPerSec: 10,
    interceptCount: 1,
    waveformPattern: [0.05, 0.1, 0.08, 0.12, 0.05, 0.08, 0.1, 0.05, 0.08, 0.1, 0.06, 0.08],
    isAlerting: false,
  },
  {
    id: 8,
    name: 'B8',
    frequencyRange: '10.0 - 11.2 GHz',
    centerFreq: '10.6 GHz',
    state: 'HIGH',
    activity: 78,
    recency: 6,
    uncertainty: 71,
    history: 70,
    priorityScore: 74,
    emitterType: 'Frequency Agile Hopper',
    signalStrength: -52,
    pulsesPerSec: 1100,
    interceptCount: 7,
    waveformPattern: [0.4, 0.85, 0.3, 0.9, 0.8, 0.2, 0.92, 0.85, 0.4, 0.88, 0.3, 0.75],
    isAlerting: true,
  },
  {
    id: 9,
    name: 'B9',
    frequencyRange: '12.0 - 13.5 GHz',
    centerFreq: '12.75 GHz',
    state: 'LOW',
    activity: 26,
    recency: 4,
    uncertainty: 30,
    history: 32,
    priorityScore: 29,
    emitterType: 'Telemetry Link',
    signalStrength: -75,
    pulsesPerSec: 180,
    interceptCount: 2,
    waveformPattern: [0.15, 0.3, 0.2, 0.4, 0.35, 0.2, 0.45, 0.3, 0.2, 0.4, 0.25, 0.3],
    isAlerting: false,
  },
  {
    id: 10,
    name: 'B10',
    frequencyRange: '14.0 - 15.2 GHz',
    centerFreq: '14.6 GHz',
    state: 'UNCERTAIN',
    activity: 52,
    recency: 8,
    uncertainty: 68,
    history: 45,
    priorityScore: 56,
    emitterType: 'Surveillance Radar',
    signalStrength: -62,
    pulsesPerSec: 540,
    interceptCount: 5,
    waveformPattern: [0.3, 0.6, 0.5, 0.7, 0.4, 0.65, 0.5, 0.7, 0.45, 0.6, 0.5, 0.4],
    isAlerting: false,
  },
  {
    id: 11,
    name: 'B11',
    frequencyRange: '15.5 - 16.8 GHz',
    centerFreq: '16.1 GHz',
    state: 'LOW',
    activity: 14,
    recency: 5,
    uncertainty: 25,
    history: 18,
    priorityScore: 18,
    emitterType: 'Noise / Idle',
    signalStrength: -88,
    pulsesPerSec: 30,
    interceptCount: 1,
    waveformPattern: [0.1, 0.18, 0.12, 0.15, 0.1, 0.2, 0.1, 0.14, 0.12, 0.1, 0.15, 0.1],
    isAlerting: false,
  },
  {
    id: 12,
    name: 'B12',
    frequencyRange: '17.0 - 18.0 GHz',
    centerFreq: '17.5 GHz',
    state: 'HIGH',
    activity: 70,
    recency: 4,
    uncertainty: 54,
    history: 65,
    priorityScore: 66,
    emitterType: 'Target Tracking Radar',
    signalStrength: -55,
    pulsesPerSec: 920,
    interceptCount: 6,
    waveformPattern: [0.2, 0.7, 0.85, 0.4, 0.8, 0.75, 0.3, 0.85, 0.7, 0.35, 0.8, 0.6],
    isAlerting: true,
  },
];

export const DEFAULT_WEIGHTS: EngineWeights = {
  activityWeight: 0.35,
  recencyWeight: 0.25,
  uncertaintyWeight: 0.25,
  historyWeight: 0.15,
  scanWindow: 2,
  priorityThreshold: 50,
};

/**
 * Computes priority score based on weighted multi-factor heuristic:
 * P(b) = w_a * Activity + w_r * RecencyNorm + w_u * Uncertainty + w_h * History
 */
export function calculatePriority(band: FrequencyBandData, weights: EngineWeights): number {
  const recencyScore = Math.min(100, band.recency * 10);
  const rawScore =
    band.activity * weights.activityWeight +
    recencyScore * weights.recencyWeight +
    band.uncertainty * weights.uncertaintyWeight +
    band.history * weights.historyWeight;

  return Math.round(Math.min(100, Math.max(5, rawScore)));
}

/**
 * Chooses the next band based on scan strategy:
 * NORMAL: Strictly sequential (B1 -> B2 -> ... -> B12 -> B1)
 * SMART: Maximum priority score (adaptive cognitive scan)
 */
export function selectNextBand(
  bands: FrequencyBandData[],
  currentBandId: number,
  mode: ScanMode
): number {
  if (mode === 'NORMAL') {
    const next = (currentBandId % bands.length) + 1;
    return next;
  }

  // SMART SCAN: Pick band with highest priority score, favoring bands other than current
  const sorted = [...bands].sort((a, b) => {
    // If scores are very close, prioritize the one not visited recently
    if (Math.abs(b.priorityScore - a.priorityScore) <= 2) {
      return b.recency - a.recency;
    }
    return b.priorityScore - a.priorityScore;
  });

  // If top candidate is current band and its recency is 0, pick 2nd if it has high priority
  if (sorted[0].id === currentBandId && sorted.length > 1 && sorted[1].priorityScore >= 50) {
    return sorted[1].id;
  }

  return sorted[0].id;
}

/**
 * Generates dynamic bullet points explaining why a particular band was selected
 */
export function getSelectionReason(band: FrequencyBandData, weights: EngineWeights): string[] {
  const reasons: string[] = [];

  if (band.activity >= 70) {
    reasons.push(`High RF power density detected (${band.activity}% activity, ${band.signalStrength} dBm)`);
  } else if (band.activity >= 40) {
    reasons.push(`Moderate signal emergence observed (${band.activity}%)`);
  }

  if (band.recency >= 6) {
    reasons.push(`Long dwell lapse: ${band.recency} time slots without observation`);
  } else if (band.recency <= 1) {
    reasons.push(`Active track continuation (dwell window lock)`);
  }

  if (band.uncertainty >= 60) {
    reasons.push(`High informational entropy (spectral uncertainty ${band.uncertainty}%)`);
  }

  if (band.history >= 65) {
    reasons.push(`Historical high-threat emitter profile: ${band.emitterType}`);
  }

  if (reasons.length < 3) {
    if (weights.activityWeight >= 0.4) {
      reasons.push(`Dominant activity weight factor (${Math.round(weights.activityWeight * 100)}% bias)`);
    } else {
      reasons.push(`Bayesian belief update flags probable emitter transition`);
    }
  }

  return reasons.slice(0, 3);
}

/**
 * Advances the simulation by one time slot.
 * Generates changing electromagnetic emitter events and updates band dynamics.
 */
export function advanceSimulationStep(
  bands: FrequencyBandData[],
  scannedBandId: number,
  slotNumber: number,
  weights: EngineWeights
): { updatedBands: FrequencyBandData[]; detected: boolean; emitter: EmitterClass } {
  // Determine if agile hopper jumps band
  const isHopperJumpSlot = slotNumber % 4 === 0;
  const targetHopperBand = isHopperJumpSlot ? ((slotNumber * 3) % 12) + 1 : null;

  // Determine if burst transmission occurs
  const burstActive = (slotNumber % 5 === 0) || (slotNumber % 7 === 0);

  let wasDetected = false;
  let detectedEmitter: EmitterClass = 'Noise / Idle';

  const updatedBands = bands.map((band) => {
    const isCurrentScanned = band.id === scannedBandId;
    let newActivity = band.activity;
    let newRecency = isCurrentScanned ? 0 : band.recency + 1;
    let newUncertainty = isCurrentScanned
      ? Math.max(10, Math.round(band.uncertainty * 0.4))
      : Math.min(95, Math.round(band.uncertainty + 6));
    let newHistory = band.history;
    let newEmitter = band.emitterType;
    let newStrength = band.signalStrength;
    let newInterceptCount = band.interceptCount;

    // Simulate Agile Hopper behavior
    if (band.id === targetHopperBand) {
      newEmitter = 'Frequency Agile Hopper';
      newActivity = Math.min(98, 75 + Math.floor(Math.random() * 22));
      newStrength = -45 - Math.floor(Math.random() * 15);
      newHistory = Math.min(95, newHistory + 8);
    } else if (band.emitterType === 'Frequency Agile Hopper' && isHopperJumpSlot) {
      // Hopper departed this band
      newEmitter = 'Noise / Idle';
      newActivity = Math.max(8, Math.floor(Math.random() * 18));
      newStrength = -85;
    }

    // Simulate Burst Transmission on B5 or B8
    if ((band.id === 5 || band.id === 8) && burstActive) {
      newActivity = Math.min(96, 80 + Math.floor(Math.random() * 18));
      newStrength = -36;
      newEmitter = 'Burst Transmission';
    } else if (band.emitterType === 'Burst Transmission' && !burstActive) {
      newActivity = Math.max(12, Math.floor(Math.random() * 25));
      newStrength = -80;
    }

    // Natural stochastic RF fluctuations
    const delta = (Math.random() - 0.5) * 12;
    newActivity = Math.round(Math.min(98, Math.max(5, newActivity + delta)));

    // Update state category
    let newState: BandState = 'IDLE';
    if (newActivity >= 65) {
      newState = 'HIGH';
    } else if (newActivity >= 35 || newUncertainty >= 60) {
      newState = 'UNCERTAIN';
    } else if (newActivity >= 15) {
      newState = 'LOW';
    }

    // When scanned, record intercept and update history
    if (isCurrentScanned) {
      if (newActivity >= 40) {
        wasDetected = true;
        detectedEmitter = newEmitter;
        newInterceptCount += 1;
        newHistory = Math.min(95, newHistory + 5);
      } else {
        newHistory = Math.max(10, newHistory - 2);
      }
    }

    // Generate animated waveform pattern
    const newWave = band.waveformPattern.map((v) => {
      const noise = (Math.random() - 0.48) * 0.15;
      const base = newActivity / 100;
      return Math.min(0.98, Math.max(0.08, base * 0.7 + v * 0.2 + noise));
    });

    const updatedBand: FrequencyBandData = {
      ...band,
      activity: newActivity,
      recency: newRecency,
      uncertainty: newUncertainty,
      history: newHistory,
      state: newState,
      emitterType: newEmitter,
      signalStrength: newStrength,
      interceptCount: newInterceptCount,
      waveformPattern: newWave,
      isAlerting: newState === 'HIGH',
      priorityScore: 0, // recalculated below
    };

    updatedBand.priorityScore = calculatePriority(updatedBand, weights);
    return updatedBand;
  });

  return {
    updatedBands,
    detected: wasDetected,
    emitter: detectedEmitter,
  };
}
