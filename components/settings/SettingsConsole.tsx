"use client";

import { useEffect, useState } from "react";
import { MonitorCog, Power, ScanLine, SlidersHorizontal } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { RetroPanel } from "@/components/ui/RetroPanel";

type Status = {
  lastRefresh: string | null;
  latestPriceDate: string | null;
  provider: string;
};

export function SettingsConsole({ status }: { status: Status }) {
  const [boot, setBoot] = useState(true);
  const [scanlines, setScanlines] = useState(true);
  const [compact, setCompact] = useState(false);
  const [intensity, setIntensity] = useState(70);

  useEffect(() => {
    const bootDisabled = window.localStorage.getItem("bursa-boot-disabled") === "1";
    setBoot(!bootDisabled);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("bursa-boot-disabled", boot ? "0" : "1");
    document.documentElement.classList.toggle("scanlines-off", !scanlines);
    document.documentElement.classList.toggle("compact-mode", compact);
    document.documentElement.style.setProperty("--motion-intensity", String(intensity));
  }, [boot, scanlines, compact, intensity]);

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase text-amber">Console preferences</p>
        <h1 className="mt-1 font-mono text-3xl font-black text-white md:text-5xl">SETTINGS BAY</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <RetroPanel title="Visual Settings" subtitle="Retro display controls" interactive>
          <div className="space-y-4">
            <Toggle icon={<Power size={18} />} label="Boot animation" checked={boot} onChange={setBoot} />
            <Toggle icon={<ScanLine size={18} />} label="Scanline overlay" checked={scanlines} onChange={setScanlines} />
            <Toggle icon={<MonitorCog size={18} />} label="Compact mode" checked={compact} onChange={setCompact} />
            <label className="block border border-cyan/15 bg-black/25 p-3">
              <span className="mb-2 flex items-center gap-2 font-mono text-xs uppercase text-cyan"><SlidersHorizontal size={17} /> Animation intensity</span>
              <input type="range" min="20" max="100" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} className="w-full accent-amber" />
            </label>
          </div>
        </RetroPanel>
        <RetroPanel title="Data Mode" subtitle="Refresh info" variant="amber">
          <div className="space-y-3 font-mono text-sm text-cyan/75">
            <Row label="Provider" value={status.provider} />
            <Row label="Latest refresh" value={formatDateTime(status.lastRefresh)} />
            <Row label="Latest price date" value={formatDateTime(status.latestPriceDate)} />
            <div className="border border-amber/30 bg-amber/10 p-3 text-amber">Run npm run refresh:data locally to fetch prices, calculate indicators, and generate scores.</div>
          </div>
        </RetroPanel>
      </div>
    </div>
  );
}

function Toggle({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 border border-cyan/15 bg-black/25 p-3">
      <span className="flex items-center gap-2 font-mono text-xs uppercase text-cyan">{icon}{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-amber" />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-cyan/10 pb-2"><span>{label}</span><span className="text-white">{value}</span></div>;
}
