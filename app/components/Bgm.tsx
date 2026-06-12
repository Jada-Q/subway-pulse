"use client";

import { useCallback } from "react";
import { BgmToggle, useBgm } from "@/lib/bgm/engine";
import { preset } from "@/lib/bgm/preset";
import { getSignals } from "@/lib/bgm/signals";
import type { FocusMode } from "@/lib/lines";

export default function Bgm({ focus }: { focus: FocusMode }) {
  const getSignalsForFocus = useCallback(() => getSignals(focus), [focus]);
  const bgm = useBgm({ preset, variant: focus, getSignals: getSignalsForFocus });
  return (
    <BgmToggle status={bgm.status} embed={bgm.embed} debug={bgm.debug} onToggle={bgm.toggle} />
  );
}
