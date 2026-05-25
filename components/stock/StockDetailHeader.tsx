import type { Awaited } from "react";
import { RadioTower } from "lucide-react";
import type { getStockDetail } from "@/lib/data/queries";
import { formatDateTime, formatPercent, formatPrice, formatVolume } from "@/lib/format";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { SignalBadge } from "@/components/ui/SignalBadge";

type StockDetail = NonNullable<Awaited<ReturnType<typeof getStockDetail>>>;

export function StockDetailHeader({ stock }: { stock: StockDetail }) {
  const signal = stock.score?.signalLabel ?? "Manual Review";
  return (
    <RetroPanel title="Character Stats" subtitle="Bursa counter profile" variant="hero">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-4xl font-black text-white md:text-6xl">{stock.symbol}</h1>
            <SignalBadge label={signal} />
          </div>
          <p className="mt-2 max-w-3xl text-cyan/75">{stock.companyName}</p>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs uppercase text-cyan/60">
            <span className="border border-cyan/15 bg-black/20 px-2 py-1">{stock.yahooSymbol}</span>
            <span className="border border-cyan/15 bg-black/20 px-2 py-1">{stock.sector ?? "Unassigned Sector"}</span>
            <span className="border border-cyan/15 bg-black/20 px-2 py-1">{stock.market}</span>
          </div>
        </div>
        <div className="grid min-w-[280px] gap-2 sm:grid-cols-2">
          <Stat label="Close" value={`RM ${formatPrice(stock.latestClose)}`} />
          <Stat label="Move" value={formatPercent(stock.dailyChangePercent)} />
          <Stat label="Volume" value={formatVolume(stock.latestVolume)} />
          <Stat label="Latest" value={formatDateTime(stock.latestDate)} />
        </div>
      </div>
      <div className="mt-5 flex items-start gap-2 border-t border-cyan/10 pt-4 text-sm leading-6 text-cyan/75">
        <RadioTower size={18} className="mt-1 text-amber" />
        <span>{stock.score?.reason ?? "Indicator snapshot missing. Manual review recommended."}</span>
      </div>
    </RetroPanel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="retro-corners border border-cyan/15 bg-black/25 p-3">
      <div className="font-mono text-[10px] uppercase text-cyan/55">{label}</div>
      <div className="mt-1 truncate font-mono text-sm font-black text-white">{value}</div>
    </div>
  );
}
