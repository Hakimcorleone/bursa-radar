import { AlertTriangle, CheckCircle2, Database } from "lucide-react";
import { getDataStatus } from "@/lib/data/queries";
import { formatDateTime } from "@/lib/format";
import { RetroPanel } from "@/components/ui/RetroPanel";

export const dynamic = "force-dynamic";

export default async function DataStatusPage() {
  const status = await getDataStatus();

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase text-amber">Pipeline status</p>
        <h1 className="mt-1 font-mono text-3xl font-black text-white md:text-5xl">DATA CORE</h1>
        <p className="mt-2 text-sm text-cyan/70">Delayed market data. Provider: {status.provider}.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatusPanel icon={<Database size={20} />} label="Last Refresh" value={formatDateTime(status.lastRefresh)} />
        <StatusPanel icon={<CheckCircle2 size={20} />} label="Latest Price Date" value={formatDateTime(status.latestPriceDate)} />
        <StatusPanel icon={<AlertTriangle size={20} />} label="Failed Tickers" value={String(status.failedTickerCount)} />
        <StatusPanel icon={<Database size={20} />} label="Total Stocks" value={String(status.totalStocks)} />
        <StatusPanel icon={<Database size={20} />} label="Watchlist Items" value={String(status.totalWatchlistItems)} />
        <StatusPanel icon={<AlertTriangle size={20} />} label="Missing Indicators" value={String(status.missingIndicatorCount)} />
      </div>

      <RetroPanel title="Failed Ticker Log" subtitle="Graceful pipeline failures">
        {status.failedTickers.length ? (
          <div className="space-y-2 font-mono text-sm text-danger">
            {status.failedTickers.map((ticker) => <div key={ticker.yahooSymbol}>{ticker.symbol} / {ticker.yahooSymbol}</div>)}
          </div>
        ) : (
          <p className="text-sm text-cyan/70">No failed tickers currently marked.</p>
        )}
      </RetroPanel>
    </div>
  );
}

function StatusPanel({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <RetroPanel title={label} interactive>
      <div className="flex items-center gap-3 text-cyan">{icon}<span className="font-mono text-2xl font-black text-white">{value}</span></div>
    </RetroPanel>
  );
}
