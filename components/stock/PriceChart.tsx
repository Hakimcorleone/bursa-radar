"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/format";

type PriceRow = {
  date: string;
  close: number;
  volume?: number | null;
};

export function PriceChart({ data }: { data: PriceRow[] }) {
  if (data.length < 2) {
    return <div className="grid h-72 place-items-center border border-cyan/10 bg-black/20 font-mono text-sm text-cyan/60">NO PRICE BARS</div>;
  }

  const chartData = data.map((row) => ({ ...row, label: new Date(row.date).toLocaleDateString("en-MY", { month: "short", day: "numeric" }) }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#67e8f9" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(103,232,249,.12)" strokeDasharray="3 3" />
          <XAxis dataKey="label" minTickGap={26} stroke="rgba(103,232,249,.55)" tick={{ fontSize: 11 }} />
          <YAxis stroke="rgba(103,232,249,.55)" tickFormatter={(value) => formatPrice(Number(value))} tick={{ fontSize: 11 }} width={62} />
          <Tooltip contentStyle={{ background: "#0c1020", border: "1px solid rgba(103,232,249,.28)", color: "#e6f7ff" }} labelStyle={{ color: "#f6c85f" }} formatter={(value) => [`RM ${formatPrice(Number(value))}`, "Close"]} />
          <Area type="monotone" dataKey="close" stroke="#f6c85f" fill="url(#priceGlow)" strokeWidth={2} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
