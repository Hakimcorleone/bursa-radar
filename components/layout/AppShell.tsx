"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Database, Gauge, Settings, SquareStack } from "lucide-react";
import { RetroBackground } from "./RetroBackground";
import { ScanlineOverlay } from "./ScanlineOverlay";
import { BootScreen } from "./BootScreen";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/watchlist", label: "Watchlist", icon: SquareStack },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/data-status", label: "Data Core", icon: Database },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-hidden text-cyan/90">
      <RetroBackground />
      <ScanlineOverlay />
      <BootScreen />
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-cyan/15 bg-black/20 px-4 py-4 backdrop-blur md:px-6 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:py-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="retro-corners grid h-12 w-12 place-items-center border border-amber/50 bg-amber/10 text-amber shadow-amber transition group-hover:bg-amber/20">
              <BarChart3 size={24} />
            </div>
            <div>
              <div className="font-mono text-xl font-black text-white">BURSA</div>
              <div className="font-mono text-xs uppercase text-cyan/60">Console</div>
            </div>
          </Link>
          <nav className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={cn("relative flex shrink-0 items-center gap-3 border px-3 py-3 font-mono text-sm uppercase transition", active ? "border-cyan/50 text-white" : "border-cyan/10 text-cyan/65 hover:border-amber/40 hover:text-amber")}>
                  {active ? <motion.span layoutId="active-nav" className="absolute inset-0 -z-10 bg-cyan/10" /> : null}
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 hidden border-t border-cyan/10 pt-4 text-xs leading-5 text-cyan/50 lg:block">
            Personal watchlist dashboard only. Not financial advice. Market data may be delayed or incomplete.
          </div>
        </aside>
        <main className="flex-1 px-4 py-5 md:px-6 lg:px-8 lg:py-7">
          {children}
          <footer className="mt-10 border-t border-cyan/10 pt-4 text-xs text-cyan/50 lg:hidden">
            Personal watchlist dashboard only. Not financial advice. Market data may be delayed or incomplete.
          </footer>
        </main>
      </div>
    </div>
  );
}
