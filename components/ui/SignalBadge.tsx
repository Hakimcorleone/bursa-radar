import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  "Breakout Mode": "border-amber/60 bg-amber/15 text-amber",
  "Momentum Watch": "border-cyan/60 bg-cyan/15 text-cyan",
  "Powering Up": "border-teal/60 bg-teal/15 text-teal",
  Calm: "border-white/30 bg-white/10 text-white",
  "Weak Trend": "border-magenta/50 bg-magenta/15 text-magenta",
  "Danger Zone": "border-danger/60 bg-danger/15 text-danger",
  "Boss Alert": "border-danger/70 bg-danger/20 text-danger",
  "Manual Review": "border-amber/40 bg-black/20 text-amber",
  "Low Energy": "border-cyan/25 bg-black/20 text-cyan/70",
  "On Radar": "border-cyan/40 bg-cyan/10 text-cyan"
};

export function SignalBadge({ label, className }: { label: string; className?: string }) {
  return <span className={cn("inline-flex items-center border px-2.5 py-1 font-mono text-[11px] font-black uppercase", styles[label] ?? styles["Manual Review"], className)}>{label}</span>;
}
