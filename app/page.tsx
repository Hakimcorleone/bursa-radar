import { Activity, AlertTriangle, Database, RadioTower, Star, TrendingUp } from "lucide-react";
import { getDashboardData } from "@/lib/data/queries";
import { formatDateTime, formatPercent, formatPrice } from "@/lib/format";
import { MarketMoodCard } from "@/components/dashboard/MarketMoodCard";
import { WatchlistCard } from "@/components/watchlist/WatchlistCard";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { StatMeter } from "@/components/ui/StatMeter";
import { SignalBadge } from "@/components/ui/SignalBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const topFive = data.watchlist.slice(0, 5);
  const highest = data.stats.highestMomentum;
  const hasMarketMemory = Boolean(data.status.latestPriceDate);
  const terminalLines = hasMarketMemory
    ? ["MARKET DATA LOADED", "PRICE BARS SYNCED", "INDICATORS ONLINE", "WATCHLIST MEMORY READY"]
    : ["NO MARKET MEMORY FOUND", "RUN npm run refresh:data", "WAITING FOR PRICE BARS", "WATCHLIST MEMORY STANDBY"];

  return (
    <div className="space-y-6 compactable">
      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <RetroPanel title="BURSA CONSOLE" subtitle="Personal Watchlist Terminal" variant="hero">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="max-w-2xl text-sm leading-6 text-cyan/80">
                Delayed market data. Personal watchlist dashboard only. Latest refresh: {formatDateTime(data.status.lastRefresh)}.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniStat icon={<RadioTower size={18} />} label="Watchlist" value={String(data.stats.watchlistCount)} />
                <MiniStat icon={<TrendingUp size={18} />} label="Positive Today" value={String(data.stats.positiveTodayCount)} />
                <MiniStat icon={<AlertTriangle size={18} />} label="Danger Zone" value={String(data.stats.dangerZoneCount)} />
                <MiniStat icon={<Database size={18} />} label="Provider" value={data.status.provider} />
              </div>
            </div>
            <div className="min-w-52 rounded border border-amber/30 bg-amber/10 p-4 font-mono text-xs text-amber">
              <div className="mb-2 flex items-center gap-2 text-white"><Activity size={16} /> SIGNAL HUD</div>
              {highest ? (
                <div className="space-y-2">
                  <div className="text-2xl font-black text-white">{highest.symbol}</div>
                  <SignalBadge label={highest.score?.signalLabel ?? "Manual Review"} />
                  <div>Score: {highest.score?.finalScore ?? "--"}</div>
                </div>
              ) : (
                <div>Awaiting watchlist memory</div>
              )}
            </div>
          </div>
        </RetroPanel>
        <MarketMoodCard watchlist={data.watchlist} />
      </section>

      {!hasMarketMemory ? (
        <EmptyState title="NO MARKET MEMORY FOUND" body="Run npm run refresh:data to load Bursa data." />
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <RetroPanel title="Momentum Core" subtitle="Highest watchlist score" interactive>
          {highest ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-3xl font-black text-white">{highest.symbol}</div>
                  <div className="text-sm text-cyan/70">{highest.companyName}</div>
                </div>
                <SignalBadge label={highest.score?.signalLabel ?? "Manual Review"} />
              </div>
              <StatMeter label="Final Score" value={highest.score?.finalScore ?? 0} tone="amber" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded border border-cyan/15 bg-white/[0.03] p-3">Close<br /><span className="text-white">RM {formatPrice(highest.latestClose)}</span></div>
                <div className="rounded border border-cyan/15 bg-white/[0.03] p-3">Daily<br /><span className="text-white">{formatPercent(highest.dailyChangePercent)}</span></div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-cyan/70">No watchlist items seeded yet.</p>
          )}
        </RetroPanel>

        <RetroPanel title="Data Status" subtitle="Pipeline memory" interactive>
          <div className="space-y-3 font-mono text-sm text-cyan/80">
            <StatusRow label="Latest price date" value={formatDateTime(data.status.latestPriceDate)} />
            <StatusRow label="Stocks" value={String(data.status.totalStocks)} />
            <StatusRow label="Failed tickers" value={String(data.status.failedTickerCount)} />
            <StatusRow label="Missing indicators" value={String(data.status.missingIndicatorCount)} />
          </div>
        </RetroPanel>

        <RetroPanel title="Terminal Log" subtitle="System messages" variant="amber">
          <div className="space-y-2 font-mono text-xs">
            {terminalLines.map((line) => (
              <div key={line} className="flex items-center gap-2 text-amber">
                <Star size={13} className="text-cyan" /> {line}
              </div>
            ))}
          </div>
        </RetroPanel>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-lg font-black text-white">Top Watchlist Slots</h2>
          <span className="text-xs uppercase text-cyan/60">Delayed market data</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {topFive.map((item) => (
            <WatchlistCard key={item.id} item={item} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="retro-corners border border-cyan/20 bg-black/20 p-3">
      <div className="mb-2 flex items-center gap-2 text-cyan">{icon}<span className="font-mono text-xs uppercase">{label}</span></div>
      <div className="truncate text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-cyan/10 pb-2">
      <span>{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
