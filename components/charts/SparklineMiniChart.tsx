"use client";

import { motion } from "framer-motion";
import type { PricePoint } from "@/lib/data/queries";

export function SparklineMiniChart({ data, pulse = false }: { data: PricePoint[]; pulse?: boolean }) {
  const points = data.filter((point) => Number.isFinite(point.close)).slice(-40);
  if (points.length < 2) {
    return <div className="grid h-16 place-items-center border border-cyan/10 bg-black/20 font-mono text-[10px] text-cyan/50">NO PRICE BARS</div>;
  }

  const width = 220;
  const height = 64;
  const closes = points.map((point) => point.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.close - min) / range) * (height - 8) - 4;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const up = points[points.length - 1].close >= points[0].close;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={pulse ? "h-16 w-full animate-pulseSoft" : "h-16 w-full"} role="img" aria-label="Recent price sparkline">
      <path d={path} fill="none" stroke={up ? "#67e8f9" : "#fb7185"} strokeWidth="2" opacity="0.28" />
      <motion.path d={path} fill="none" stroke={up ? "#f6c85f" : "#fb7185"} strokeWidth="2.5" strokeLinecap="square" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} />
    </svg>
  );
}
