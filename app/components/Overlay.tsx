"use client";

import { useEffect, useState } from "react";
import {
  DATA_MODE,
  DATA_MODE_LABEL,
  DATA_MODE_LABEL_JA,
  type FocusMode,
  type LineId,
} from "@/lib/lines";
import { getActiveTrains } from "@/lib/trains";

interface Props {
  focus: FocusMode;
}

export default function Overlay({ focus }: Props) {
  const [now, setNow] = useState<Date | null>(null);
  const [counts, setCounts] = useState<Record<LineId, number>>({
    yamanote: 0,
    marunouchi: 0,
    ginza: 0,
    hibiya: 0,
    chiyoda: 0,
  });

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d);
      const { countsByLine } = getActiveTrains(d.getTime() / 1000);
      setCounts(countsByLine);
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(now);
  const dateStr = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(now);

  const visibleTotal =
    focus === "all"
      ? counts.yamanote +
        counts.marunouchi +
        counts.ginza +
        counts.hibiya +
        counts.chiyoda
      : counts[focus];

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 select-none text-white"
      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
    >
      <div className="absolute left-6 top-6 font-serif tracking-wide md:left-10 md:top-10">
        <div className="text-xs uppercase tracking-[0.3em] opacity-60">
          Subway Pulse
        </div>
        <div className="mt-2 text-base">TOKYO METRO 東京地下鉄</div>
        <div className="mt-1 text-xs opacity-50">
          {focus === "all"
            ? "5 lines · Yamanote · Marunouchi · Ginza · Hibiya · Chiyoda"
            : `focus · ${focusLabel(focus)}`}
        </div>
      </div>

      <div className="absolute right-6 top-6 text-right font-serif md:right-10 md:top-10">
        <div className="font-mono text-3xl tracking-tight md:text-4xl">
          {time}
        </div>
        <div className="mt-1 text-xs opacity-70">{dateStr} JST</div>
      </div>

      <div className="absolute bottom-6 left-6 space-y-2 font-serif md:bottom-10 md:left-10">
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.25em] opacity-50">
            Trains in motion
          </div>
          <div className="mt-0.5 text-base">
            {visibleTotal}{" "}
            <span className="text-xs opacity-50">
              {focus === "all" ? "across 5 lines" : "on this line"}
            </span>
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.25em] opacity-40">
          {DATA_MODE_LABEL[DATA_MODE]}
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden max-w-[300px] text-right font-serif text-xs italic opacity-50 md:block">
        {DATA_MODE_LABEL_JA[DATA_MODE]}
      </div>
    </div>
  );
}

function focusLabel(id: LineId): string {
  switch (id) {
    case "yamanote":
      return "Yamanote 山手線";
    case "marunouchi":
      return "Marunouchi 丸ノ内線";
    case "ginza":
      return "Ginza 銀座線";
    case "hibiya":
      return "Hibiya 日比谷線";
    case "chiyoda":
      return "Chiyoda 千代田線";
  }
}
