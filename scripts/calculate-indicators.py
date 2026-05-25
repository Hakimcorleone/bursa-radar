from __future__ import annotations

import os
import uuid
from decimal import Decimal, InvalidOperation

import pandas as pd
import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def decimal_or_none(value):
    if value is None or pd.isna(value):
        return None
    try:
        return Decimal(str(round(float(value), 6)))
    except (ValueError, InvalidOperation):
        return None


def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=period, min_periods=period).mean()
    avg_loss = loss.rolling(window=period, min_periods=period).mean()
    rs = avg_gain / avg_loss.replace(0, pd.NA)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50)


def main():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is required")

    processed = 0
    generated = 0
    skipped = []

    with psycopg.connect(DATABASE_URL) as conn:
        stocks = conn.execute(
            'SELECT "id", "symbol" FROM "Stock" WHERE "isActive" = TRUE ORDER BY "symbol" ASC'
        ).fetchall()

        for stock_id, symbol in stocks:
            processed += 1
            rows = conn.execute(
                """
                SELECT "date", "open", "high", "low", "close", "adjustedClose", "volume"
                FROM "PriceBar"
                WHERE "stockId" = %s
                ORDER BY "date" ASC
                """,
                (stock_id,),
            ).fetchall()

            if len(rows) < 2:
                skipped.append((symbol, "not enough price bars"))
                continue

            frame = pd.DataFrame(
                rows,
                columns=["date", "open", "high", "low", "close", "adjustedClose", "volume"],
            )
            frame["close"] = frame["close"].astype(float)
            frame["volume"] = frame["volume"].fillna(0).astype(float)
            frame["ma20"] = frame["close"].rolling(window=20, min_periods=1).mean()
            frame["ma50"] = frame["close"].rolling(window=50, min_periods=1).mean()
            frame["ma200"] = frame["close"].rolling(window=200, min_periods=1).mean()
            frame["rsi14"] = calculate_rsi(frame["close"], 14)
            frame["avgVolume20"] = frame["volume"].rolling(window=20, min_periods=1).mean()
            frame["high52w"] = frame["close"].rolling(window=252, min_periods=1).max()
            frame["low52w"] = frame["close"].rolling(window=252, min_periods=1).min()
            frame["dailyChange"] = frame["close"].diff()
            frame["dailyChangePercent"] = (frame["dailyChange"] / frame["close"].shift(1)) * 100
            frame["volumeRatio"] = frame["volume"] / frame["avgVolume20"].replace(0, pd.NA)
            frame["distanceFrom52wHigh"] = ((frame["close"] - frame["high52w"]) / frame["high52w"].replace(0, pd.NA)) * 100

            latest = frame.iloc[-1]
            snapshot_date = latest["date"]
            close = float(latest["close"])
            ma20 = float(latest["ma20"])
            ma50 = float(latest["ma50"])
            ma200 = float(latest["ma200"])

            conn.execute(
                """
                INSERT INTO "IndicatorSnapshot" (
                  "id", "stockId", "date", "close", "dailyChange", "dailyChangePercent",
                  "ma20", "ma50", "ma200", "rsi14", "avgVolume20", "volumeRatio",
                  "high52w", "low52w", "distanceFrom52wHigh",
                  "priceAboveMa20", "priceAboveMa50", "priceAboveMa200", "createdAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT ("stockId", "date") DO UPDATE SET
                  "close" = EXCLUDED."close",
                  "dailyChange" = EXCLUDED."dailyChange",
                  "dailyChangePercent" = EXCLUDED."dailyChangePercent",
                  "ma20" = EXCLUDED."ma20",
                  "ma50" = EXCLUDED."ma50",
                  "ma200" = EXCLUDED."ma200",
                  "rsi14" = EXCLUDED."rsi14",
                  "avgVolume20" = EXCLUDED."avgVolume20",
                  "volumeRatio" = EXCLUDED."volumeRatio",
                  "high52w" = EXCLUDED."high52w",
                  "low52w" = EXCLUDED."low52w",
                  "distanceFrom52wHigh" = EXCLUDED."distanceFrom52wHigh",
                  "priceAboveMa20" = EXCLUDED."priceAboveMa20",
                  "priceAboveMa50" = EXCLUDED."priceAboveMa50",
                  "priceAboveMa200" = EXCLUDED."priceAboveMa200"
                """,
                (
                    uuid.uuid4().hex,
                    stock_id,
                    snapshot_date,
                    decimal_or_none(close),
                    decimal_or_none(latest["dailyChange"]),
                    decimal_or_none(latest["dailyChangePercent"]),
                    decimal_or_none(ma20),
                    decimal_or_none(ma50),
                    decimal_or_none(ma200),
                    decimal_or_none(latest["rsi14"]),
                    decimal_or_none(latest["avgVolume20"]),
                    decimal_or_none(latest["volumeRatio"]),
                    decimal_or_none(latest["high52w"]),
                    decimal_or_none(latest["low52w"]),
                    decimal_or_none(latest["distanceFrom52wHigh"]),
                    close > ma20,
                    close > ma50,
                    close > ma200,
                ),
            )
            conn.commit()
            generated += 1
            print(f"OK {symbol}: indicator snapshot for {snapshot_date}")

    print("\nBursa Console indicator summary")
    print(f"stocks processed: {processed}")
    print(f"snapshots generated: {generated}")
    print(f"skipped: {len(skipped)}")
    for symbol, reason in skipped:
        print(f"- {symbol}: {reason}")


if __name__ == "__main__":
    main()
