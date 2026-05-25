"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, RadioTower } from "lucide-react";
import type { WatchlistViewItem } from "@/lib/data/queries";
import { formatPercent, formatPrice, formatVolume } from "@/lib/format";
import { SparklineMiniChart } from "@/components/charts/SparklineMiniChart";
import { SignalBadge } from "@/components/ui/SignalBadge";
import { cn } from "@/lib/utils";

export function WatchlistCard({ item, compact = false }: { item: WatchlistViewItem; compact?: boolean }) {
  const up = (item.dailyChangePercent ?? 0) >= 0;

  return (
    <motion.div layout whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} className="group h-full">
      <Link href={`/stock/${item.symbol}`} className={cn("retro-corners retro-bevel relative flex h-full flex-col overflow-hidden border border-cyan/20 bg-panel/80 p-4 transition duration-300 hover:border-amber/60 hover:bg-panel2/90", compact && "p-3")}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(103,232,249,.14),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(246,200,95,.12),transparent_32%)] opacity-40 transition group-hover:opacity-80" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <motion.div className="font-mono text-2xl font-black text-white" whileHover={{ scale: 1.06 }}>{item.symbol}</motion.div>
            <div className="mt-1 line-clamp-2 text-xs text-cyan/65">{item.companyName}</div>
          </div>
          <SignalBadge label={item.score?.signalLabel ?? item.watchStatus ?? "Manual Review"} />
        </div>
        <div className="relative z-10 mt-4">
          <SparklineMiniChart data={item.sparkline} pulse />
        </div>
        <div className="relative z-10 mt-4 grid grid-cols-2 gap-2 text-xs">
          <Stat label="Close" value={`RM ${formatPrice(item.latestClose)}`} />
          <Stat label="Daily" value={formatPercent(item.dailyChangePercent)} accent={up ? "text-teal" : "text-danger"} />
          <Stat label="Volume" value={formatVolume(item.latestVolume)} />
          <Stat label="Score" value={item.score?.finalScore != null ? String(item.score.finalScore) : "--"} />
        </div>
        <div className="relative z-10 mt-4 flex items-center justify-between border-t border-cyan/10 pt-3 font-mono text-[11px] uppercase text-cyan/60">
          <span className="flex items-center gap-1"><RadioTower size={12} /> {item.watchStatus}</span>
          <span className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">Open Details <ArrowUpRight size={13} /></span>
        </div>
      </Link>
    </motion.div>
  );
}

function Stat({ label, value, accent = "text-white" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="border border-cyan/10 bg-black/20 p-2">
      <div className="font-mono uppercase text-cyan/50">{label}</div>
      <div className={cn("mt-1 truncate font-mono font-black", accent)}>{value}</div>
    </div>
  );
}
