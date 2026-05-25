"use client";

import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import type { WatchlistViewItem } from "@/lib/data/queries";
import { WatchlistCard } from "./WatchlistCard";
import { RetroPanel } from "@/components/ui/RetroPanel";

const sorters = ["final score", "daily change %", "volume ratio", "risk score", "symbol"] as const;

export function WatchlistTerminal({ items }: { items: WatchlistViewItem[] }) {
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<(typeof sorters)[number]>("final score");

  const labels = useMemo(() => Array.from(new Set(items.map((item) => item.score?.signalLabel ?? "Manual Review"))).sort(), [items]);
  const statuses = useMemo(() => Array.from(new Set(items.map((item) => item.watchStatus))).sort(), [items]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items
      .filter((item) => !normalized || item.symbol.toLowerCase().includes(normalized) || item.companyName.toLowerCase().includes(normalized))
      .filter((item) => label === "all" || (item.score?.signalLabel ?? "Manual Review") === label)
      .filter((item) => status === "all" || item.watchStatus === status)
      .sort((a, b) => {
        if (sort === "symbol") return a.symbol.localeCompare(b.symbol);
        if (sort === "daily change %") return (b.dailyChangePercent ?? -999) - (a.dailyChangePercent ?? -999);
        if (sort === "volume ratio") return (b.volumeRatio ?? -999) - (a.volumeRatio ?? -999);
        if (sort === "risk score") return (b.score?.riskScore ?? -1) - (a.score?.riskScore ?? -1);
        return (b.score?.finalScore ?? -1) - (a.score?.finalScore ?? -1);
      });
  }, [items, query, label, status, sort]);

  return (
    <div className="space-y-4">
      <RetroPanel title="Filter Deck" subtitle={`${filtered.length} counters visible`}>
        <div className="grid gap-3 lg:grid-cols-[1.3fr_.7fr_.7fr_.7fr]">
          <label className="flex items-center gap-2 border border-cyan/15 bg-black/25 px-3 py-2">
            <Search size={16} className="text-cyan" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbol or company" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-cyan/35" />
          </label>
          <Select value={label} onChange={setLabel} options={["all", ...labels]} />
          <Select value={status} onChange={setStatus} options={["all", ...statuses]} />
          <label className="flex items-center gap-2 border border-cyan/15 bg-black/25 px-3 py-2">
            <Filter size={16} className="text-amber" />
            <select value={sort} onChange={(event) => setSort(event.target.value as (typeof sorters)[number])} className="w-full bg-transparent font-mono text-xs uppercase text-white outline-none">
              {sorters.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>
      </RetroPanel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((item) => <WatchlistCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="border border-cyan/15 bg-black/25 px-3 py-2 font-mono text-xs uppercase text-white outline-none">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}
