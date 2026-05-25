import { getWatchlistData } from "@/lib/data/queries";
import { WatchlistTerminal } from "@/components/watchlist/WatchlistTerminal";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const watchlist = await getWatchlistData();

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase text-amber">Personal watchlist terminal</p>
        <h1 className="mt-1 font-mono text-3xl font-black text-white md:text-5xl">WATCHLIST MEMORY</h1>
        <p className="mt-2 max-w-2xl text-sm text-cyan/70">Delayed market data. Cards use stored price bars, indicator snapshots, and daily scores from the database.</p>
      </div>
      {watchlist.length ? <WatchlistTerminal items={watchlist} /> : <EmptyState title="NO WATCHLIST MEMORY FOUND" body="Run npm run db:seed, then npm run refresh:data." />}
    </div>
  );
}
