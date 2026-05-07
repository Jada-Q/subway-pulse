"use client";

import { useEffect, useState } from "react";
import { LINES, LINE_ORDER, type FocusMode, type LineId } from "@/lib/lines";
import { getActiveTrains } from "@/lib/trains";

interface Props {
  focus: FocusMode;
}

export default function LineLegend({ focus }: Props) {
  const [counts, setCounts] = useState<Record<LineId, number>>({
    yamanote: 0,
    marunouchi: 0,
    ginza: 0,
    hibiya: 0,
    chiyoda: 0,
  });

  useEffect(() => {
    const tick = () => {
      const { countsByLine } = getActiveTrains(Date.now() / 1000);
      setCounts(countsByLine);
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-6 top-1/2 z-10 -translate-y-1/2 select-none space-y-2 font-serif text-xs text-white opacity-30 transition-opacity duration-500 hover:opacity-90 md:left-10"
      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.65)" }}
    >
      {LINE_ORDER.map((id) => {
        const line = LINES[id];
        const dim = focus !== "all" && focus !== id;
        return (
          <div
            key={id}
            className={
              "flex items-center gap-2 transition-opacity " +
              (dim ? "opacity-30" : "opacity-100")
            }
          >
            <span
              className="inline-block h-1.5 w-3 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            <span className="tracking-wide">{line.romaji}</span>
            <span className="font-mono text-[10px] opacity-60">
              {counts[id]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
