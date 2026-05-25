# Bursa Console

Bursa Console is a personal Bursa Malaysia stock watchlist dashboard. It is built as a late-90s console-game style terminal for tracking real Bursa watchlist data, momentum, trend, volume, and personal notes.

This is not a broker, public financial advisory platform, or buy/sell signal service. It uses safer watchlist language such as Momentum Watch, Breakout Mode, Powering Up, Calm, Weak Trend, Danger Zone, Manual Review, Low Energy, and On Radar.

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts
- Prisma ORM
- PostgreSQL
- Python data scripts
- yfinance for MVP Bursa Malaysia market data

## Real Data

The MVP fetches Bursa Malaysia market data through `yfinance`. Yahoo Finance Bursa symbols usually use the `.KL` suffix, such as `1155.KL` for MAYBANK and `1023.KL` for CIMB.

The data pipeline stores daily OHLCV bars, calculates indicator snapshots, and generates deterministic daily watchlist scores from the stored data. If one ticker fails, the script logs the failure, marks the stock, and continues processing the remaining symbols.

## Data Disclaimer

`yfinance` / Yahoo data may be delayed, incomplete, adjusted, or unavailable. It is not an official Bursa Malaysia feed and should be treated as personal research/project data only. Bursa Console is a personal watchlist dashboard, not financial advice.

## Setup

1. Install Node dependencies:

```bash
npm install
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Create `.env` from `.env.example` and configure PostgreSQL:

```bash
cp .env.example .env
```

4. Push the Prisma schema:

```bash
npm run db:push
```

5. Seed Bursa stocks and default watchlist rows:

```bash
npm run db:seed
```

6. Fetch prices, calculate indicators, and generate daily scores:

```bash
npm run refresh:data
```

7. Start the app:

```bash
npm run dev
```

## Commands

- `npm run dev` - start the Next.js app
- `npm run build` - build the app
- `npm run lint` - run Next linting
- `npm run db:push` - push Prisma schema to PostgreSQL
- `npm run db:migrate` - create/run Prisma migration locally
- `npm run db:seed` - seed Bursa stocks and watchlist items
- `npm run fetch:prices` - fetch one year of yfinance OHLCV data
- `npm run calc:indicators` - calculate moving averages, RSI, volume ratios, and trend flags
- `npm run generate:scores` - generate daily watchlist scores
- `npm run refresh:data` - run the full data refresh pipeline

## Future Improvements

- Bursa announcements parser
- Twelve Data / EODHD provider implementation
- Official or approved Bursa data vendor support
- Backtesting
- Alerts
- Portfolio tracker
- AI explanation layer
