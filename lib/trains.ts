import { LINE_ORDER, LINES, type LineId, type SubwayLine } from "./lines";

export type Direction = 1 | -1;

export interface Train {
  id: string;
  lineId: LineId;
  /** Progress along the polyline, 0..1. */
  t: number;
  direction: Direction;
  /** Wall-clock spawn time, seconds. */
  spawnedAtSec: number;
}

export interface ActiveSnapshot {
  trains: Train[];
  countsByLine: Record<LineId, number>;
}

/**
 * Deterministic train schedule generator.
 *
 * For each line we compute, given current wall-clock seconds, all train
 * spawn events whose run window [spawn, spawn+endToEnd] contains `now`.
 * That way:
 *   - Output is purely a function of `now` — no hidden state, no drift.
 *   - Position is consistent across reloads.
 *   - Half spawn forward, half spawn backward (alternating by spawn index).
 */
export function getActiveTrains(nowSec: number): ActiveSnapshot {
  const trains: Train[] = [];
  const countsByLine: Record<LineId, number> = {
    yamanote: 0,
    marunouchi: 0,
    ginza: 0,
    hibiya: 0,
    chiyoda: 0,
  };

  for (const lineId of LINE_ORDER) {
    const line = LINES[lineId];
    const lineTrains = trainsForLine(line, nowSec);
    trains.push(...lineTrains);
    countsByLine[lineId] = lineTrains.length;
  }

  return { trains, countsByLine };
}

function trainsForLine(line: SubwayLine, nowSec: number): Train[] {
  const headway = line.headwaySeconds;
  const runtime = line.endToEndSeconds;
  // Earliest spawn that could still be running now:
  //   spawn >= nowSec - runtime  →  earliest k >= ceil((nowSec - runtime) / headway)
  // Latest spawn that has already happened: k <= floor(nowSec / headway).
  const earliestK = Math.ceil((nowSec - runtime) / headway);
  const latestK = Math.floor(nowSec / headway);

  const out: Train[] = [];
  for (let k = earliestK; k <= latestK; k++) {
    const spawnedAt = k * headway;
    const elapsed = nowSec - spawnedAt;
    if (elapsed < 0 || elapsed > runtime) continue;
    const progress = elapsed / runtime;

    // Alternate direction by k. Use line id hash so different lines
    // start in different parities — keeps the diagram visually balanced.
    const parityOffset = parityForLine(line.id);
    const direction: Direction = (k + parityOffset) % 2 === 0 ? 1 : -1;
    const t = direction === 1 ? progress : 1 - progress;

    out.push({
      id: `${line.id}-${k}`,
      lineId: line.id,
      t,
      direction,
      spawnedAtSec: spawnedAt,
    });
  }
  return out;
}

function parityForLine(id: LineId): number {
  // Stable hash so each line picks its own starting parity.
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 2;
}
