export type BandState = 'LOW' | 'UNCERTAIN' | 'HIGH' | 'IDLE';

export type EmitterClass = 
  | 'Surveillance Radar'
  | 'Frequency Agile Hopper'
  | 'Burst Transmission'
  | 'Target Tracking Radar'
  | 'Intermittent Jammer'
  | 'Telemetry Link'
  | 'Noise / Idle';

export interface FrequencyBandData {
  id: number;
  name: string; // e.g. "B1", "B2", ...
  frequencyRange: string; // e.g. "2.4 - 2.6 GHz"
  centerFreq: string; // e.g. "2.50 GHz"
  state: BandState;
  activity: number; // 0 - 100
  recency: number; // time steps since last visited
  uncertainty: number; // 0 - 100
  history: number; // 0 - 100
  priorityScore: number; // 0 - 100
  emitterType: EmitterClass;
  signalStrength: number; // dBm (-90 to -20)
  pulsesPerSec: number;
  interceptCount: number;
  waveformPattern: number[]; // normalized heights 0..1 for mini visualizer
  isAlerting: boolean;
}

export type ScanMode = 'SMART' | 'NORMAL';

export interface EngineWeights {
  activityWeight: number; // 0 - 1
  recencyWeight: number; // 0 - 1
  uncertaintyWeight: number; // 0 - 1
  historyWeight: number; // 0 - 1
  scanWindow: number; // dwell time 1 - 5 slots
  priorityThreshold: number; // 0 - 100
}

export interface ScanEvent {
  slot: number;
  bandId: number;
  mode: ScanMode;
  detected: boolean;
  emitterType: EmitterClass;
  signalLevel: number;
  timestamp: number;
}

export interface MetricSnapshot {
  slot: number;
  smartDetectionRate: number;
  normalDetectionRate: number;
  smartInterceptTime: number;
  normalInterceptTime: number;
  smartEfficiency: number;
  normalEfficiency: number;
}

export interface Mission {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  goalType: 'detections' | 'efficiency' | 'intercept_fast' | 'hopper_track';
  targetValue: number;
  currentValue: number;
  completed: boolean;
  scoreReward: number;
}
