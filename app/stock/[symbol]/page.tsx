import { notFound } from "next/navigation";
import { getStockDetail } from "@/lib/data/queries";
import { formatDate, formatPercent, formatPrice, formatVolume } from "@/lib/format";
import { StockDetailHeader } from "@/components/stock/StockDetailHeader";
import { StockStatsPanel } from "@/components/stock/StockStatsPanel";
import { PriceChart } from "@/components/stock/PriceChart";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { JournalCard } from "@/components/journal/JournalCard";

export const dynamic = "force-dynamic";

export default async function StockPage({ params }: { params: { symbol: string } }) {
  const stock = await getStockDetail(params.symbol);
  if (!stock) notFound();

  const recentBars = stock.priceHistory.slice(-8).reverse();

  return (
    <div className="space-y-5 compactable">
      <StockDetailHeader stock={stock} />
      <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <StockStatsPanel stock={stock} />
        <RetroPanel title="1Y Price Radar" subtitle="Stored Bursa price bars" interactive>
          <PriceChart data={stock.priceHistory} />
        </RetroPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RetroPanel title="Indicator Snapshot" subtitle="Latest calculated values">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Metric label="MA20" value={`RM ${formatPrice(stock.ma20)}`} />
            <Metric label="MA50" value={`RM ${formatPrice(stock.ma50)}`} />
            <Metric label="MA200" value={`RM ${formatPrice(stock.ma200)}`} />
            <Metric label="RSI14" value={stock.rsi14?.toFixed(1) ?? "--"} />
            <Metric label="Volume Ratio" value={stock.volumeRatio ? `${stock.volumeRatio.toFixed(2)}x` : "--"} />
            <Metric label="From 52W High" value={formatPercent(stock.distanceFrom52wHigh)} />
          </div>
        </RetroPanel>

        <RetroPanel title="Personal Note" subtitle={stock.watchStatus} variant="amber">
          <p className="text-sm leading-6 text-cyan/75">{stock.personalNote ?? "No personal note saved for this counter."}</p>
        </RetroPanel>

        <RetroPanel title="Announcements" subtitle="Placeholder">
          {stock.announcements.length ? (
            <div className="space-y-3">
              {stock.announcements.map((item) => (
                <div key={item.id} className="border-b border-cyan/10 pb-2 text-sm">
                  <div className="text-white">{item.title}</div>
                  <div className="text-xs text-cyan/60">{formatDate(item.announcementDate)} {item.category ?? ""}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-cyan/70">No announcement parser connected yet.</p>
          )}
        </RetroPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <RetroPanel title="Recent Price Bars" subtitle="Compact OHLCV list">
          <div className="overflow-hidden rounded border border-cyan/10">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-cyan/10 text-cyan">
                <tr><th className="p-2">Date</th><th className="p-2">Close</th><th className="p-2">Volume</th><th className="p-2">Move</th></tr>
              </thead>
              <tbody>
                {recentBars.map((bar, index) => {
                  const previous = recentBars[index + 1]?.close;
                  const move = previous ? ((bar.close - previous) / previous) * 100 : null;
                  return (
                    <tr key={bar.date} className="border-t border-cyan/10 text-cyan/75">
                      <td className="p-2 text-white">{formatDate(bar.date)}</td>
                      <td className="p-2">RM {formatPrice(bar.close)}</td>
                      <td className="p-2">{formatVolume(bar.volume)}</td>
                      <td className="p-2">{formatPercent(move)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </RetroPanel>

        <RetroPanel title="Journal Memory" subtitle="Personal entries">
          <div className="space-y-3">
            {stock.journalEntries.length ? stock.journalEntries.map((entry) => <JournalCard key={entry.id} entry={entry} />) : <p className="text-sm text-cyan/70">No journal entries for this stock yet.</p>}
          </div>
        </RetroPanel>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="retro-corners border border-cyan/15 bg-white/[0.03] p-3">
      <div className="font-mono text-xs uppercase text-cyan/60">{label}</div>
      <div className="mt-1 truncate text-lg font-black text-white">{value}</div>
    </div>
  );
}
