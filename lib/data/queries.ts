import { prisma } from "@/lib/prisma";

const toNumber = (value: unknown): number | null => {
  if (value == null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const toDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null;
  return new Date(value).toISOString();
};

export type PricePoint = {
  date: string;
  close: number;
  volume: number | null;
};

export type WatchlistViewItem = {
  id: string;
  stockId: string;
  symbol: string;
  yahooSymbol: string;
  companyName: string;
  sector: string | null;
  market: string;
  fetchFailed: boolean;
  watchStatus: string;
  personalNote: string | null;
  priority: number;
  latestClose: number | null;
  latestVolume: number | null;
  latestDate: string | null;
  dailyChange: number | null;
  dailyChangePercent: number | null;
  volumeRatio: number | null;
  rsi14: number | null;
  ma20: number | null;
  ma50: number | null;
  ma200: number | null;
  distanceFrom52wHigh: number | null;
  score: {
    momentumScore: number;
    volumeScore: number;
    trendScore: number;
    riskScore: number;
    stabilityScore: number;
    finalScore: number;
    signalLabel: string;
    reason: string;
    riskFlags: string[];
    date: string | null;
  } | null;
  sparkline: PricePoint[];
};

function serializeWatchlistItem(item: any): WatchlistViewItem {
  const stock = item.stock;
  const barsDesc = stock.priceBars ?? [];
  const latestBar = barsDesc[0];
  const indicator = stock.indicatorSnapshots?.[0];
  const score = stock.dailyScores?.[0];
  const riskFlags = Array.isArray(score?.riskFlags) ? (score.riskFlags as string[]) : [];

  return {
    id: item.id,
    stockId: stock.id,
    symbol: stock.symbol,
    yahooSymbol: stock.yahooSymbol,
    companyName: stock.companyName,
    sector: stock.sector,
    market: stock.market,
    fetchFailed: stock.fetchFailed,
    watchStatus: item.watchStatus,
    personalNote: item.personalNote,
    priority: item.priority,
    latestClose: toNumber(latestBar?.close ?? indicator?.close),
    latestVolume: latestBar?.volume == null ? null : Number(latestBar.volume),
    latestDate: toDate(latestBar?.date ?? indicator?.date),
    dailyChange: toNumber(indicator?.dailyChange),
    dailyChangePercent: toNumber(indicator?.dailyChangePercent),
    volumeRatio: toNumber(indicator?.volumeRatio),
    rsi14: toNumber(indicator?.rsi14),
    ma20: toNumber(indicator?.ma20),
    ma50: toNumber(indicator?.ma50),
    ma200: toNumber(indicator?.ma200),
    distanceFrom52wHigh: toNumber(indicator?.distanceFrom52wHigh),
    score: score
      ? {
          momentumScore: score.momentumScore,
          volumeScore: score.volumeScore,
          trendScore: score.trendScore,
          riskScore: score.riskScore,
          stabilityScore: score.stabilityScore,
          finalScore: score.finalScore,
          signalLabel: score.signalLabel,
          reason: score.reason,
          riskFlags,
          date: toDate(score.date)
        }
      : null,
    sparkline: [...barsDesc]
      .reverse()
      .map((bar: any) => ({
        date: toDate(bar.date) ?? "",
        close: Number(bar.close),
        volume: bar.volume == null ? null : Number(bar.volume)
      }))
  };
}

export async function getWatchlistData() {
  const items = await prisma.watchlistItem.findMany({
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    include: {
      stock: {
        include: {
          priceBars: { orderBy: { date: "desc" }, take: 60 },
          indicatorSnapshots: { orderBy: { date: "desc" }, take: 1 },
          dailyScores: { orderBy: { date: "desc" }, take: 1 }
        }
      }
    }
  });

  return items.map(serializeWatchlistItem);
}

export async function getStocksData() {
  const stocks = await prisma.stock.findMany({
    orderBy: { symbol: "asc" },
    include: {
      priceBars: { orderBy: { date: "desc" }, take: 1 },
      indicatorSnapshots: { orderBy: { date: "desc" }, take: 1 },
      dailyScores: { orderBy: { date: "desc" }, take: 1 }
    }
  });

  return stocks.map((stock: any) => ({
    id: stock.id,
    symbol: stock.symbol,
    yahooSymbol: stock.yahooSymbol,
    companyName: stock.companyName,
    sector: stock.sector,
    market: stock.market,
    isActive: stock.isActive,
    fetchFailed: stock.fetchFailed,
    latestClose: toNumber(stock.priceBars?.[0]?.close),
    dailyChangePercent: toNumber(stock.indicatorSnapshots?.[0]?.dailyChangePercent),
    signalLabel: stock.dailyScores?.[0]?.signalLabel ?? "Manual Review",
    finalScore: stock.dailyScores?.[0]?.finalScore ?? null
  }));
}

export async function getDataStatus() {
  const [totalStocks, totalWatchlistItems, failedTickers, latestBar, latestScore, activeStocks] = await Promise.all([
    prisma.stock.count(),
    prisma.watchlistItem.count(),
    prisma.stock.findMany({ where: { fetchFailed: true }, select: { symbol: true, yahooSymbol: true } }),
    prisma.priceBar.findFirst({ orderBy: { date: "desc" }, select: { date: true, createdAt: true } }),
    prisma.dailyScore.findFirst({ orderBy: { date: "desc" }, select: { date: true, createdAt: true } }),
    prisma.stock.findMany({ where: { isActive: true }, select: { id: true, _count: { select: { indicatorSnapshots: true } } } })
  ]);

  const missingIndicatorCount = activeStocks.filter((stock) => stock._count.indicatorSnapshots === 0).length;
  const latestRefreshDate = [latestBar?.createdAt, latestScore?.createdAt].filter(Boolean).sort((a, b) => Number(b) - Number(a))[0];

  return {
    lastRefresh: toDate(latestRefreshDate ?? null),
    latestPriceDate: toDate(latestBar?.date),
    totalStocks,
    totalWatchlistItems,
    failedTickers,
    failedTickerCount: failedTickers.length,
    missingIndicatorCount,
    latestGeneratedScoreDate: toDate(latestScore?.date),
    provider: process.env.MARKET_DATA_PROVIDER ?? "yfinance"
  };
}

export async function getDashboardData() {
  const [watchlist, status] = await Promise.all([getWatchlistData(), getDataStatus()]);
  const positiveTodayCount = watchlist.filter((item) => (item.dailyChangePercent ?? 0) > 0).length;
  const dangerZoneCount = watchlist.filter((item) => item.score?.signalLabel === "Danger Zone").length;
  const highestMomentum = [...watchlist].sort((a, b) => (b.score?.finalScore ?? -1) - (a.score?.finalScore ?? -1))[0] ?? null;

  return {
    watchlist,
    status,
    stats: {
      watchlistCount: watchlist.length,
      positiveTodayCount,
      dangerZoneCount,
      highestMomentum
    }
  };
}

export async function getStockDetail(symbol: string) {
  const normalized = decodeURIComponent(symbol).toUpperCase();
  const stock = await prisma.stock.findFirst({
    where: {
      OR: [
        { symbol: { equals: normalized, mode: "insensitive" } },
        { yahooSymbol: { equals: normalized, mode: "insensitive" } }
      ]
    },
    include: {
      priceBars: { orderBy: { date: "desc" }, take: 260 },
      indicatorSnapshots: { orderBy: { date: "desc" }, take: 1 },
      dailyScores: { orderBy: { date: "desc" }, take: 1 },
      watchlistItem: true,
      journalEntries: { orderBy: { createdAt: "desc" }, take: 12 },
      announcements: { orderBy: { announcementDate: "desc" }, take: 8 }
    }
  });

  if (!stock) return null;
  const item = stock.watchlistItem
    ? serializeWatchlistItem({ ...stock.watchlistItem, stock })
    : serializeWatchlistItem({ id: stock.id, watchStatus: "Manual Review", personalNote: null, priority: 99, stock });

  return {
    ...item,
    priceHistory: [...stock.priceBars].reverse().map((bar: any) => ({
      date: toDate(bar.date) ?? "",
      open: toNumber(bar.open),
      high: toNumber(bar.high),
      low: toNumber(bar.low),
      close: Number(bar.close),
      adjustedClose: toNumber(bar.adjustedClose),
      volume: bar.volume == null ? null : Number(bar.volume)
    })),
    journalEntries: stock.journalEntries.map((entry: any) => ({
      id: entry.id,
      stockId: entry.stockId,
      title: entry.title,
      body: entry.body,
      tag: entry.tag,
      createdAt: toDate(entry.createdAt),
      updatedAt: toDate(entry.updatedAt)
    })),
    announcements: stock.announcements.map((announcement: any) => ({
      id: announcement.id,
      title: announcement.title,
      category: announcement.category,
      url: announcement.url,
      sentimentLabel: announcement.sentimentLabel,
      catalystScore: announcement.catalystScore,
      announcementDate: toDate(announcement.announcementDate)
    }))
  };
}

export async function getJournalData() {
  const [entries, stocks] = await Promise.all([
    prisma.personalJournal.findMany({
      orderBy: { createdAt: "desc" },
      include: { stock: { select: { id: true, symbol: true, companyName: true } } }
    }),
    prisma.stock.findMany({ orderBy: { symbol: "asc" }, select: { id: true, symbol: true, companyName: true } })
  ]);

  return {
    entries: entries.map((entry: any) => ({
      id: entry.id,
      stockId: entry.stockId,
      symbol: entry.stock.symbol,
      companyName: entry.stock.companyName,
      title: entry.title,
      body: entry.body,
      tag: entry.tag,
      createdAt: toDate(entry.createdAt),
      updatedAt: toDate(entry.updatedAt)
    })),
    stocks
  };
}
