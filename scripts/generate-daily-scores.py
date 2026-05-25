from __future__ import annotations

import json
import os
import uuid
from decimal import Decimal

import pandas as pd
import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
MIN_VOLUME_THRESHOLD = int(os.getenv("MIN_VOLUME_THRESHOLD", "100000"))


def number(value, default=None):
    if value is None:
        return default
    try:
        value = float(value)
        if pd.isna(value):
            return default
        return value
    except (TypeError, ValueError):
        return default


def clamp(value: int, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, value))


def signal_label(final_score: int, risk_score: int, missing_data: bool) -> str:
    if missing_data:
        return "Manual Review"
    if risk_score >= 15:
        return "Danger Zone"
    if final_score >= 80:
        return "Breakout Mode"
    if final_score >= 70:
        return "Momentum Watch"
    if final_score >= 60:
        return "Powering Up"
    if final_score >= 45:
        return "Calm"
    if final_score >= 30:
        return "Weak Trend"
    return "Low Energy"


def build_reason(indicator, latest_volume: int | None, risk_flags: list[str], missing_data: bool) -> str:
    if missing_data:
        return "Incomplete market data detected. Manual review recommended."

    close, daily_change_pct, ma20, ma50, ma200, rsi14, volume_ratio = indicator
    parts = []

    if close is not None and ma20 is not None and ma50 is not None and close > ma20 and close > ma50:
        parts.append("Price is above MA20 and MA50")
    elif close is not None and ma200 is not None and close < ma200:
        parts.append("Price remains below MA200, indicating weak long-term trend")
    else:
        parts.append("Trend is mixed across key moving averages")

    if volume_ratio is not None and volume_ratio >= 1.2:
        parts.append(f"volume is {volume_ratio:.1f}x its 20-day average")
    elif latest_volume is not None and latest_volume < MIN_VOLUME_THRESHOLD:
        parts.append("low volume detected")

    if rsi14 is not None and rsi14 > 75:
        parts.append("RSI is above 75, so chasing risk is elevated")
    elif rsi14 is not None and 45 <= rsi14 <= 70:
        parts.append("RSI is in a constructive watchlist range")

    if daily_change_pct is not None and daily_change_pct > 0:
        parts.append("latest daily change is positive")
    elif daily_change_pct is not None and daily_change_pct < 0:
        parts.append("latest daily change is negative")

    if risk_flags:
        parts.append("risk flags: " + ", ".join(risk_flags))

    return ". ".join(parts) + "."


def main():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is required")

    processed = 0
    generated = 0

    with psycopg.connect(DATABASE_URL) as conn:
        stocks = conn.execute(
            'SELECT "id", "symbol", "fetchFailed" FROM "Stock" WHERE "isActive" = TRUE ORDER BY "symbol" ASC'
        ).fetchall()

        for stock_id, symbol, fetch_failed in stocks:
            processed += 1
            snapshot = conn.execute(
                """
                SELECT "date", "close", "dailyChange", "dailyChangePercent", "ma20", "ma50", "ma200",
                       "rsi14", "avgVolume20", "volumeRatio", "high52w", "low52w", "distanceFrom52wHigh",
                       "priceAboveMa20", "priceAboveMa50", "priceAboveMa200"
                FROM "IndicatorSnapshot"
                WHERE "stockId" = %s
                ORDER BY "date" DESC
                LIMIT 1
                """,
                (stock_id,),
            ).fetchone()

            latest_bar = conn.execute(
                'SELECT "volume" FROM "PriceBar" WHERE "stockId" = %s ORDER BY "date" DESC LIMIT 1',
                (stock_id,),
            ).fetchone()

            recent_changes = conn.execute(
                """
                SELECT "close"
                FROM "PriceBar"
                WHERE "stockId" = %s
                ORDER BY "date" DESC
                LIMIT 20
                """,
                (stock_id,),
            ).fetchall()

            missing_data = snapshot is None or fetch_failed
            if snapshot is None:
                score_date = pd.Timestamp.today().date()
                values = [None] * 15
            else:
                score_date = snapshot[0]
                values = list(snapshot[1:])

            close, daily_change, daily_change_pct, ma20, ma50, ma200, rsi14, avg_volume20, volume_ratio, high52w, low52w, distance_high, above_ma20, above_ma50, above_ma200 = values
            close = number(close)
            daily_change_pct = number(daily_change_pct)
            ma20 = number(ma20)
            ma50 = number(ma50)
            ma200 = number(ma200)
            rsi14 = number(rsi14)
            volume_ratio = number(volume_ratio)
            distance_high = number(distance_high)
            latest_volume = int(latest_bar[0]) if latest_bar and latest_bar[0] is not None else None

            momentum = 0
            if above_ma20:
                momentum += 5
            if above_ma50:
                momentum += 5
            if daily_change_pct is not None and daily_change_pct > 0:
                momentum += 5
            if distance_high is not None and distance_high >= -8:
                momentum += 5
            if rsi14 is not None and 45 <= rsi14 <= 70:
                momentum += 5

            volume_score = 0
            if volume_ratio is not None and volume_ratio > 1.2:
                volume_score += 5
            if volume_ratio is not None and volume_ratio > 1.5:
                volume_score += 5
            if volume_ratio is not None and volume_ratio > 2.0:
                volume_score += 5
            if latest_volume is not None and latest_volume >= MIN_VOLUME_THRESHOLD:
                volume_score += 5

            trend = 0
            if above_ma50:
                trend += 7
            if above_ma200:
                trend += 7
            if ma20 is not None and ma50 is not None and ma20 > ma50:
                trend += 6
            if above_ma20 and above_ma50 and above_ma200:
                trend += 5

            risk = 0
            risk_flags = []
            if rsi14 is not None and rsi14 > 75:
                risk += 5
                risk_flags.append("RSI over 75")
            if close is not None and ma200 is not None and close < ma200:
                risk += 4
                risk_flags.append("below MA200")
            if latest_volume is None or latest_volume < MIN_VOLUME_THRESHOLD:
                risk += 4
                risk_flags.append("low volume")
            if distance_high is not None and distance_high <= -35:
                risk += 4
                risk_flags.append("far from 52-week high")
            if daily_change_pct is not None and abs(daily_change_pct) >= 8:
                risk += 3
                risk_flags.append("extreme daily move")
            if missing_data:
                risk += 8
                risk_flags.append("missing data")

            closes = [number(row[0]) for row in recent_changes]
            closes = [value for value in closes if value is not None]
            if len(closes) >= 5:
                pct_changes = pd.Series(list(reversed(closes))).pct_change().dropna().abs()
                average_abs_move = float(pct_changes.mean() * 100) if not pct_changes.empty else 0
                stability = 10 if average_abs_move < 1.2 else 7 if average_abs_move < 2.5 else 4 if average_abs_move < 4 else 1
            else:
                stability = 2
                missing_data = True

            final_score = clamp(round(momentum + volume_score + trend + stability - risk))
            label = signal_label(final_score, risk, missing_data)
            reason = build_reason((close, daily_change_pct, ma20, ma50, ma200, rsi14, volume_ratio), latest_volume, risk_flags, missing_data)

            conn.execute(
                """
                INSERT INTO "DailyScore" (
                  "id", "stockId", "date", "momentumScore", "volumeScore", "trendScore", "riskScore",
                  "stabilityScore", "finalScore", "signalLabel", "reason", "riskFlags", "createdAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, NOW())
                ON CONFLICT ("stockId", "date") DO UPDATE SET
                  "momentumScore" = EXCLUDED."momentumScore",
                  "volumeScore" = EXCLUDED."volumeScore",
                  "trendScore" = EXCLUDED."trendScore",
                  "riskScore" = EXCLUDED."riskScore",
                  "stabilityScore" = EXCLUDED."stabilityScore",
                  "finalScore" = EXCLUDED."finalScore",
                  "signalLabel" = EXCLUDED."signalLabel",
                  "reason" = EXCLUDED."reason",
                  "riskFlags" = EXCLUDED."riskFlags"
                """,
                (
                    uuid.uuid4().hex,
                    stock_id,
                    score_date,
                    clamp(momentum, 0, 25),
                    clamp(volume_score, 0, 20),
                    clamp(trend, 0, 25),
                    clamp(risk, 0, 20),
                    clamp(stability, 0, 10),
                    final_score,
                    label,
                    reason,
                    json.dumps(risk_flags),
                ),
            )
            conn.commit()
            generated += 1
            print(f"OK {symbol}: {label} score={final_score} risk={risk}")

    print("\nBursa Console score summary")
    print(f"stocks processed: {processed}")
    print(f"scores generated: {generated}")


if __name__ == "__main__":
    main()
