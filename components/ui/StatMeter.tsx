"use client";

import { motion } from "framer-motion";
import { clamp } from "@/lib/utils";

const tones = {
  cyan: "from-cyan to-teal",
  amber: "from-amber to-cyan",
  danger: "from-danger to-amber",
  magenta: "from-magenta to-cyan"
};

export function StatMeter({ label, value, tone = "cyan" }: { label: string; value: number; tone?: keyof typeof tones }) {
  const safeValue = clamp(Number.isFinite(value) ? value : 0);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between font-mono text-xs uppercase text-cyan/70">
        <span>{label}</span><span className="text-white">{Math.round(safeValue)}</span>
      </div>
      <div className="h-3 overflow-hidden border border-cyan/20 bg-black/35">
        <motion.div className={`h-full bg-gradient-to-r ${tones[tone]} shadow-glow`} initial={{ width: 0 }} animate={{ width: `${safeValue}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>
    </div>
  );
}
