import type { MarketDataProvider, MarketDataProviderName } from "./types";
import { yfinanceProvider } from "./yfinance-provider";

const providers: Record<MarketDataProviderName, MarketDataProvider> = {
  yfinance: yfinanceProvider,
  twelvedata: {
    name: "twelvedata",
    supportsHistoricalDaily: true,
    notes: "Reserved provider slot for a future paid market data API."
  },
  eodhd: {
    name: "eodhd",
    supportsHistoricalDaily: true,
    notes: "Reserved provider slot for a future paid market data API."
  },
  "bursa-vendor": {
    name: "bursa-vendor",
    supportsHistoricalDaily: true,
    notes: "Reserved provider slot for an official or approved Bursa data vendor."
  }
};

export function getMarketDataProvider(name = process.env.MARKET_DATA_PROVIDER): MarketDataProvider {
  const providerName = (name || "yfinance") as MarketDataProviderName;
  return providers[providerName] ?? yfinanceProvider;
}
