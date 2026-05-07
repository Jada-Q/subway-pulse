"use client";

import { useEffect, useRef } from "react";
import {
  LINE_ORDER,
  LINES,
  type FocusMode,
  type LineId,
  type SubwayLine,
} from "@/lib/lines";
import { buildCumulative, pctToPixel, sampleAt } from "@/lib/projection";
import { getActiveTrains, type Train } from "@/lib/trains";

interface Props {
  focus: FocusMode;
}

const TRAIL_SECONDS = 45;
const TRAIL_SAMPLES = 18;

export default function SubwayCanvas({ focus }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const nowMs = Date.now();
      const nowSec = nowMs / 1000;

      // Clear with deep navy
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#04060c");
      bg.addColorStop(1, "#070a14");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Pre-compute cumulative for each line at current canvas size
      const lineGeom = new Map<
        LineId,
        { cum: number[]; total: number }
      >();
      for (const id of LINE_ORDER) {
        lineGeom.set(id, buildCumulative(LINES[id], w, h));
      }

      // Draw polylines (translucent)
      for (const id of LINE_ORDER) {
        const line = LINES[id];
        const dim = focus !== "all" && focus !== id;
        const baseAlpha = dim ? 0.05 : 0.25;
        drawPolyline(ctx, line, w, h, baseAlpha);
      }

      // Draw station ticks
      for (const id of LINE_ORDER) {
        const line = LINES[id];
        const dim = focus !== "all" && focus !== id;
        if (dim) continue;
        const geom = lineGeom.get(id);
        if (!geom) continue;
        drawStations(ctx, line, geom.cum, geom.total, w, h);
      }

      // Draw endpoint station labels (origin + terminus per line)
      for (const id of LINE_ORDER) {
        const line = LINES[id];
        const dim = focus !== "all" && focus !== id;
        if (dim) continue;
        const geom = lineGeom.get(id);
        if (!geom) continue;
        drawEndpointLabels(ctx, line, geom.cum, geom.total, w, h);
      }

      // Active trains (deterministic from nowSec)
      const { trains } = getActiveTrains(nowSec);

      // Trails — sampled backwards in time using the deterministic scheduler
      ctx.lineCap = "round";
      ctx.lineWidth = 1.6;
      for (const train of trains) {
        const dim = focus !== "all" && focus !== train.lineId;
        if (dim) continue;
        drawTrail(ctx, train, nowSec, lineGeom, w, h);
      }

      // Train dots
      for (const train of trains) {
        const dim = focus !== "all" && focus !== train.lineId;
        if (dim) continue;
        const line = LINES[train.lineId];
        const geom = lineGeom.get(train.lineId);
        if (!geom) continue;
        const p = sampleAt(line, geom.cum, geom.total, w, h, train.t);
        drawTrainDot(ctx, p.x, p.y, line.color);
      }

      // Subtle film grain
      drawNoise(ctx, w, h);

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [focus]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 h-full w-full"
      aria-label="Subway Pulse — Tokyo Metro"
    />
  );
}

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  line: SubwayLine,
  w: number,
  h: number,
  alpha: number,
) {
  ctx.strokeStyle = withAlpha(line.color, alpha);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i < line.polyline.length; i++) {
    const p = pctToPixel(line.polyline[i], w, h);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

function drawStations(
  ctx: CanvasRenderingContext2D,
  line: SubwayLine,
  cum: number[],
  total: number,
  w: number,
  h: number,
) {
  ctx.strokeStyle = withAlpha(line.color, 0.55);
  ctx.lineWidth = 1;
  ctx.fillStyle = "#000";
  for (const station of line.stations) {
    const p = sampleAt(line, cum, total, w, h, station.position);
    // Hollow ring: small black fill punches a hole in the line, ring outlines it.
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Draw a fading trail behind a train by re-evaluating its scheduler position
 * at TRAIL_SAMPLES discrete past times. We use the same train id so the trail
 * follows it precisely back along its arc-length parameterized progress.
 */
function drawTrail(
  ctx: CanvasRenderingContext2D,
  train: Train,
  nowSec: number,
  lineGeom: Map<LineId, { cum: number[]; total: number }>,
  w: number,
  h: number,
) {
  const line = LINES[train.lineId];
  const geom = lineGeom.get(train.lineId);
  if (!geom) return;

  const points: Array<{ x: number; y: number; age: number }> = [];
  for (let i = 0; i < TRAIL_SAMPLES; i++) {
    const ageSec = (i / (TRAIL_SAMPLES - 1)) * TRAIL_SECONDS;
    const sampleSec = nowSec - ageSec;
    const elapsed = sampleSec - train.spawnedAtSec;
    if (elapsed < 0) break;
    const progress = elapsed / line.endToEndSeconds;
    if (progress < 0 || progress > 1) break;
    const t = train.direction === 1 ? progress : 1 - progress;
    const p = sampleAt(line, geom.cum, geom.total, w, h, t);
    points.push({ x: p.x, y: p.y, age: ageSec });
  }

  if (points.length < 2) return;

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const ageNorm = b.age / TRAIL_SECONDS;
    const alpha = Math.max(0, 0.55 * (1 - ageNorm));
    if (alpha < 0.02) continue;
    ctx.strokeStyle = withAlpha(line.color, alpha);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawEndpointLabels(
  ctx: CanvasRenderingContext2D,
  line: SubwayLine,
  cum: number[],
  total: number,
  w: number,
  h: number,
) {
  // Mobile is too narrow for two endpoint labels per line — skip below 768px
  if (w < 768) return;
  if (line.stations.length < 2) return;

  const start = line.stations[0];
  const end = line.stations[line.stations.length - 1];
  const startP = sampleAt(line, cum, total, w, h, start.position);
  const endP = sampleAt(line, cum, total, w, h, end.position);

  const prevAlign = ctx.textAlign;
  const prevBaseline = ctx.textBaseline;

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Kanji (line color, slightly brighter)
  ctx.fillStyle = withAlpha(line.color, 0.75);
  ctx.font = '11px "Hiragino Mincho ProN", "Yu Mincho", serif';
  ctx.fillText(start.name, startP.x, startP.y - 18);
  ctx.fillText(end.name, endP.x, endP.y - 18);

  // Romaji (muted mono, smaller, beneath)
  ctx.fillStyle = withAlpha(line.color, 0.5);
  ctx.font = '9px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillText(start.romaji, startP.x, startP.y - 7);
  ctx.fillText(end.romaji, endP.x, endP.y - 7);

  ctx.textAlign = prevAlign;
  ctx.textBaseline = prevBaseline;
}

function drawTrainDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  // Glow halo
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
  glow.addColorStop(0, withAlpha(color, 0.55));
  glow.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  // Crisp core
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 2.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawNoise(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "rgba(255,255,255,0.012)";
  for (let i = 0; i < 140; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
  ctx.fillStyle = "rgba(0,0,0,0.014)";
  for (let i = 0; i < 140; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
}

function withAlpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}
