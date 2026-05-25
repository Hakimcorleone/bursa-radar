import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type RetroPanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  variant?: "default" | "hero" | "amber" | "danger";
  interactive?: boolean;
  children: ReactNode;
};

const variants = {
  default: "border-cyan/20 bg-panel/80",
  hero: "border-cyan/30 bg-gradient-to-br from-panel/95 via-panel2/90 to-[#1b1533]/90",
  amber: "border-amber/30 bg-[linear-gradient(135deg,rgba(246,200,95,.13),rgba(17,23,43,.86))]",
  danger: "border-danger/35 bg-[linear-gradient(135deg,rgba(251,113,133,.13),rgba(17,23,43,.86))]"
};

export function RetroPanel({ title, subtitle, variant = "default", interactive, className, children, ...props }: RetroPanelProps) {
  return (
    <section className={cn("retro-corners retro-bevel relative overflow-hidden border p-4 backdrop-blur md:p-5", variants[variant], interactive && "transition duration-300 hover:-translate-y-1 hover:border-amber/50 hover:shadow-glow", className)} {...props}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />
      {(title || subtitle) ? (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="font-mono text-sm font-black uppercase text-white md:text-base">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-xs uppercase text-cyan/55">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      {children}
    </section>
  );
}
