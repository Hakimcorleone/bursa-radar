import type { MarketDataProvider } from "./types";

export const yfinanceProvider: MarketDataProvider = {
  name: "yfinance",
  supportsHistoricalDaily: true,
  notes:
    "MVP provider executed through scripts/fetch-prices.py. Yahoo Finance Bursa symbols usually use the .KL suffix. Data may be delayed or incomplete."
};
