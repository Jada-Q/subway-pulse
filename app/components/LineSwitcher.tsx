"use client";

import { useEffect, useState } from "react";
import { LINES, LINE_ORDER, type FocusMode } from "@/lib/lines";

const ITEMS: Array<{ key: FocusMode; label: string; color: string }> = [
  { key: "all", label: "All lines", color: "#ffffff" },
  ...LINE_ORDER.map((id) => ({
    key: id as FocusMode,
    label: `${LINES[id].romaji} ${LINES[id].name}`,
    color: LINES[id].color,
  })),
];

export default function LineSwitcher({ active }: { active: FocusMode }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("embed") === "app") {
      setHidden(true);
    }
  }, []);
  if (hidden) return null;

  return (
    <div
      className="pointer-events-none fixed z-20 select-none
        max-md:right-3 max-md:top-1/2 max-md:-translate-y-1/2
        md:bottom-7 md:left-1/2 md:-translate-x-1/2"
      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.55)" }}
    >
      <div
        className="pointer-events-auto group flex items-center rounded-full opacity-30 transition-opacity duration-500 hover:opacity-100
          max-md:flex-col max-md:gap-4 max-md:px-2 max-md:py-3
          md:flex-row md:gap-5 md:px-5 md:py-3"
      >
        {ITEMS.map((c) => {
          const isActive = active === c.key;
          return (
            <a
              key={c.key}
              href={`?l=${c.key}`}
              className="group/btn relative flex h-6 w-6 items-center justify-center"
              aria-label={c.label}
              title={c.label}
            >
              <span
                className={
                  "block rounded-full transition-all duration-300 " +
                  (isActive ? "h-2 w-2" : "h-1.5 w-1.5 group-hover/btn:h-2 group-hover/btn:w-2")
                }
                style={{
                  backgroundColor: isActive ? c.color : `${c.color}99`,
                  boxShadow: isActive
                    ? `0 0 8px ${c.color}aa`
                    : undefined,
                }}
              />
              <span
                className="pointer-events-none absolute whitespace-nowrap font-serif text-[11px] tracking-wide text-white opacity-0 transition-opacity duration-300 group-hover/btn:opacity-90
                  max-md:right-7 max-md:top-1/2 max-md:-translate-y-1/2
                  md:-top-7"
              >
                {c.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
