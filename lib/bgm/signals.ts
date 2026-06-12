import { LINE_ORDER, LINES, type FocusMode, type SubwayLine } from "@/lib/lines";
import { getActiveTrains } from "@/lib/trains";

// Normalized 0..1 signals consumed by the BGM engine's preset mappings.
// Pure deterministic math over the demo schedule — no network, safe per tick.
//
// Note: the demo schedule (lib/trains.ts) uses constant headways, so the raw
// active-train count is nearly time-invariant. To give serviceRate a day
// shape we modulate the count density with a local-time diurnal curve
// (deep night ≈ 0.1, rush peaks ≈ 1.0), as an honest approximation.
export function getSignals(focus: FocusMode): Record<string, number> {
  const now = new Date();
  const { countsByLine } = getActiveTrains(now.getTime() / 1000);

  let count = 0;
  let capacity = 0;
  if (focus === "all") {
    for (const id of LINE_ORDER) {
      count += countsByLine[id];
      capacity += maxConcurrentTrains(LINES[id]);
    }
  } else {
    count = countsByLine[focus];
    capacity = maxConcurrentTrains(LINES[focus]);
  }
  const density = capacity > 0 ? clamp01(count / capacity) : 0;

  const hour = now.getHours() + now.getMinutes() / 60;
  return {
    serviceRate: clamp01(density * diurnal(hour)),
    isRushHour: isRushHour(hour) ? 1 : 0,
  };
}

/** Theoretical max trains running at once on a line with constant headway. */
function maxConcurrentTrains(line: SubwayLine): number {
  return Math.floor(line.endToEndSeconds / line.headwaySeconds) + 1;
}

/** Local time 7-9 / 17-19 counts as rush hour. */
function isRushHour(hour: number): boolean {
  return (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19);
}

/**
 * Piecewise-linear diurnal service curve, local hour 0..24.
 * Deep night 0.1, morning/evening rush 1.0, midday plateau 0.6.
 */
const DIURNAL_KEYS: Array<[number, number]> = [
  [0, 0.1],
  [5, 0.1],
  [7, 1.0],
  [9, 1.0],
  [11, 0.6],
  [16, 0.6],
  [17, 1.0],
  [19, 1.0],
  [21, 0.5],
  [24, 0.15],
];

function diurnal(hour: number): number {
  const h = clamp01(hour / 24) * 24;
  for (let i = 0; i < DIURNAL_KEYS.length - 1; i++) {
    const [h0, v0] = DIURNAL_KEYS[i];
    const [h1, v1] = DIURNAL_KEYS[i + 1];
    if (h >= h0 && h <= h1) {
      return v0 + ((h - h0) / (h1 - h0)) * (v1 - v0);
    }
  }
  return 0.1;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
