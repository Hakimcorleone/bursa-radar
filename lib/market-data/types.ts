export type MarketDataProviderName = "yfinance" | "twelvedata" | "eodhd" | "bursa-vendor";

export type MarketSymbol = {
  symbol: string;
  yahooSymbol: string;
  companyName: string;
  market: string;
};

export type OhlcvBar = {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  adjustedClose: number | null;
  volume: number | null;
};

export type MarketDataProvider = {
  name: MarketDataProviderName;
  supportsHistoricalDaily: boolean;
  notes: string;
};
