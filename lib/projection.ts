import type { SubwayLine } from "./lines";

export interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * Convert a polyline percentage point to canvas pixels for a given canvas size.
 * Adds a small horizontal margin so endpoints don't kiss the screen edge.
 */
export function pctToPixel(
  pt: [number, number],
  w: number,
  h: number,
): CanvasPoint {
  return { x: pt[0] * w, y: pt[1] * h };
}

/**
 * Cumulative segment lengths in pixel space for a line at canvas size (w, h).
 * Returns [cum0=0, cum1, cum2, ..., totalLen].
 */
export function buildCumulative(
  line: SubwayLine,
  w: number,
  h: number,
): { cum: number[]; total: number } {
  const cum: number[] = [0];
  for (let i = 1; i < line.polyline.length; i++) {
    const a = pctToPixel(line.polyline[i - 1], w, h);
    const b = pctToPixel(line.polyline[i], w, h);
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  return { cum, total: cum[cum.length - 1] || 1 };
}

/**
 * Sample a point at progress t ∈ [0,1] along the polyline (canvas pixel space).
 * Uses cumulative segment lengths for arc-length parameterization so motion
 * looks even regardless of segment length variation.
 */
export function sampleAt(
  line: SubwayLine,
  cum: number[],
  total: number,
  w: number,
  h: number,
  t: number,
): CanvasPoint {
  const clamped = Math.max(0, Math.min(1, t));
  const target = clamped * total;
  let i = 1;
  while (i < cum.length && cum[i] < target) i++;
  if (i >= cum.length) i = cum.length - 1;
  const segStart = cum[i - 1];
  const segLen = cum[i] - segStart || 1e-9;
  const u = (target - segStart) / segLen;
  const a = pctToPixel(line.polyline[i - 1], w, h);
  const b = pctToPixel(line.polyline[i], w, h);
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}
