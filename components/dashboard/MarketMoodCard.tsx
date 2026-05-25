import type { WatchlistViewItem } from "@/lib/data/queries";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { StatMeter } from "@/components/ui/StatMeter";

export function MarketMoodCard({ watchlist }: { watchlist: WatchlistViewItem[] }) {
  const total = watchlist.length || 1;
  const positive = watchlist.filter((item) => (item.dailyChangePercent ?? 0) > 0).length;
  const negative = watchlist.filter((item) => (item.dailyChangePercent ?? 0) < 0).length;
  const danger = watchlist.filter((item) => item.score?.signalLabel === "Danger Zone").length;
  const averageScore = watchlist.length ? watchlist.reduce((sum, item) => sum + (item.score?.finalScore ?? 0), 0) / watchlist.length : 0;

  let mood = "Sideways";
  if (danger / total >= 0.3) mood = "Fragile";
  else if (positive / total > 0.6) mood = "Aggressive";
  else if (negative / total > 0.5) mood = "Cautious";

  return (
    <RetroPanel title="Market Mood" subtitle="Watchlist performance" interactive>
      <div className="space-y-5">
        <div>
          <div className="font-mono text-4xl font-black text-white">{mood}</div>
          <p className="mt-2 text-sm text-cyan/70">{positive} positive, {negative} negative, {danger} danger labels.</p>
        </div>
        <StatMeter label="Watchlist Energy" value={averageScore} tone={mood === "Fragile" ? "danger" : "cyan"} />
      </div>
    </RetroPanel>
  );
}
