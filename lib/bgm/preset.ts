import type { BgmPreset } from "./engine";

// Subway: dark C minor-pentatonic pulse. AM-sine pad like tunnel resonance,
// sparse plucks as passing trains, a near-subliminal electrical hum, and the
// series' first percussion layer — a soft tick whose tempo follows the
// simulated service rate (more trains running → faster pulse).
export const preset: BgmPreset = {
  key: "subway-pulse",
  rootNote: "C2",
  scale: "minorPentatonic",
  masterVolumeDb: -16,
  reverbDecaySec: 8,
  pad: {
    enabled: true,
    volumeDb: -14,
    synth: "amsine",
    chordSize: 3,
    changeEverySec: [25, 45],
    attackSec: 5,
    releaseSec: 9,
    filterCutoffHz: [300, 1200],
  },
  melody: {
    enabled: true,
    volumeDb: -20,
    instrument: "pluck",
    octaves: [3, 4],
    baseIntervalSec: [9, 20],
    eventTriggered: false,
  },
  texture: {
    enabled: true,
    volumeDb: -26,
    kind: "hum",
    lfoRateHz: [0.05, 0.15],
  },
  percussion: {
    enabled: true,
    volumeDb: -30,
    kind: "softTick",
    bpm: [40, 90],
  },
  mappings: [
    // denser service → faster tick, like headways tightening
    { signal: "serviceRate", target: "perc.bpm", range: [0, 1] },
    // denser service → plucks fire more often
    { signal: "serviceRate", target: "melody.density", range: [0.1, 0.9] },
    // rush hour lifts the pad slightly (1 = full volumeDb, 0.75 ≈ -3dB)
    { signal: "isRushHour", target: "pad.volume", range: [0.75, 1] },
  ],
};
