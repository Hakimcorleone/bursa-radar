import type { getStockDetail } from "@/lib/data/queries";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { StatMeter } from "@/components/ui/StatMeter";

type StockDetail = NonNullable<Awaited<ReturnType<typeof getStockDetail>>>;

export function StockStatsPanel({ stock }: { stock: StockDetail }) {
  const score = stock.score;
  return (
    <RetroPanel title="Signal HUD" subtitle="Momentum, trend, risk" interactive>
      <div className="space-y-4">
        <StatMeter label="Momentum" value={score?.momentumScore ?? 0} tone="cyan" />
        <StatMeter label="Volume" value={score?.volumeScore ?? 0} tone="amber" />
        <StatMeter label="Trend" value={score?.trendScore ?? 0} tone="magenta" />
        <StatMeter label="Risk" value={score?.riskScore ?? 0} tone="danger" />
        <StatMeter label="Stability" value={score?.stabilityScore ?? 0} tone="cyan" />
        <div className="border-t border-cyan/10 pt-4">
          <StatMeter label="Final Score" value={score?.finalScore ?? 0} tone="amber" />
        </div>
      </div>
    </RetroPanel>
  );
}
