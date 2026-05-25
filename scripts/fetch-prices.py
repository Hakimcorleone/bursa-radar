from __future__ import annotations

import os
import uuid
from datetime import date
from decimal import Decimal, InvalidOperation

import pandas as pd
import psycopg
import yfinance as yf
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
DEFAULT_HISTORY_PERIOD = os.getenv("DEFAULT_HISTORY_PERIOD", "1y")


def decimal_or_none(value):
    if value is None or pd.isna(value):
        return None
    try:
        return Decimal(str(round(float(value), 6)))
    except (ValueError, InvalidOperation):
        return None


def int_or_none(value):
    if value is None or pd.isna(value):
        return None
    try:
        return int(value)
    except ValueError:
        return None


def fetch_history(yahoo_symbol: str) -> pd.DataFrame:
    ticker = yf.Ticker(yahoo_symbol)
    frame = ticker.history(period=DEFAULT_HISTORY_PERIOD, interval="1d", auto_adjust=False)
    if frame.empty:
        return frame
    frame = frame.reset_index()
    frame.columns = [str(column).replace(" ", "") for column in frame.columns]
    return frame


def upsert_price_bar(conn, stock_id: str, row) -> date | None:
    raw_date = row.get("Date")
    if pd.isna(raw_date):
        return None
    bar_date = pd.to_datetime(raw_date).date()
    close = decimal_or_none(row.get("Close"))
    if close is None:
        return None

    conn.execute(
        """
        INSERT INTO "PriceBar" (
          "id", "stockId", "date", "open", "high", "low", "close", "adjustedClose", "volume", "createdAt"
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT ("stockId", "date") DO UPDATE SET
          "open" = EXCLUDED."open",
          "high" = EXCLUDED."high",
          "low" = EXCLUDED."low",
          "close" = EXCLUDED."close",
          "adjustedClose" = EXCLUDED."adjustedClose",
          "volume" = EXCLUDED."volume"
        """,
        (
            uuid.uuid4().hex,
            stock_id,
            bar_date,
            decimal_or_none(row.get("Open")),
            decimal_or_none(row.get("High")),
            decimal_or_none(row.get("Low")),
            close,
            decimal_or_none(row.get("AdjClose")),
            int_or_none(row.get("Volume")),
        ),
    )
    return bar_date


def main():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is required")

    processed = 0
    success_count = 0
    failed = []
    latest_data_date = None

    with psycopg.connect(DATABASE_URL) as conn:
        stocks = conn.execute(
            'SELECT "id", "symbol", "yahooSymbol" FROM "Stock" WHERE "isActive" = TRUE ORDER BY "symbol" ASC'
        ).fetchall()

        for stock_id, symbol, yahoo_symbol in stocks:
            processed += 1
            try:
                history = fetch_history(yahoo_symbol)
                if history.empty:
                    raise ValueError("No rows returned from yfinance")

                written_dates = []
                with conn.transaction():
                    for _, row in history.iterrows():
                        written_date = upsert_price_bar(conn, stock_id, row)
                        if written_date:
                            written_dates.append(written_date)

                    conn.execute(
                        'UPDATE "Stock" SET "fetchFailed" = FALSE, "updatedAt" = NOW() WHERE "id" = %s',
                        (stock_id,),
                    )

                if not written_dates:
                    raise ValueError("No valid price bars written")

                latest_for_symbol = max(written_dates)
                latest_data_date = max(latest_data_date, latest_for_symbol) if latest_data_date else latest_for_symbol
                success_count += 1
                print(f"OK {symbol} {yahoo_symbol}: {len(written_dates)} bars, latest {latest_for_symbol}")
            except Exception as error:  # noqa: BLE001 - pipeline should continue per ticker
                failed.append((symbol, yahoo_symbol, str(error)))
                conn.execute(
                    'UPDATE "Stock" SET "fetchFailed" = TRUE, "updatedAt" = NOW() WHERE "id" = %s',
                    (stock_id,),
                )
                conn.commit()
                print(f"FAIL {symbol} {yahoo_symbol}: {error}")

    print("\nBursa Console price fetch summary")
    print(f"total tickers processed: {processed}")
    print(f"success count: {success_count}")
    print(f"failed count: {len(failed)}")
    print(f"latest data date: {latest_data_date or 'n/a'}")
    if failed:
        print("failed tickers:")
        for symbol, yahoo_symbol, message in failed:
            print(f"- {symbol} ({yahoo_symbol}): {message}")


if __name__ == "__main__":
    main()
