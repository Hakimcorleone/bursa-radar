"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const lines = [
  "INITIALIZING BURSA CONSOLE...",
  "LOADING WATCHLIST MEMORY...",
  "FETCHING MARKET DATA...",
  "SIGNAL HUD READY"
];

export function BootScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem("bursa-boot-disabled") === "1") return;
    if (window.sessionStorage.getItem("bursa-boot-seen") === "1") return;
    setVisible(true);
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem("bursa-boot-seen", "1");
      setVisible(false);
    }, 3300);
    return () => window.clearTimeout(timer);
  }, []);

  const skip = () => {
    window.sessionStorage.setItem("bursa-boot-seen", "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-void" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }}>
          <div className="retro-corners retro-bevel w-[min(92vw,680px)] border border-cyan/30 bg-panel/95 p-6 md:p-8">
            <div className="mb-6 font-mono text-3xl font-black text-white md:text-5xl">BURSA CONSOLE</div>
            <div className="space-y-3 font-mono text-sm text-cyan">
              {lines.map((line, index) => (
                <motion.div key={line} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.55 }} className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-amber shadow-amber" /> {line}
                </motion.div>
              ))}
            </div>
            <button onClick={skip} className="mt-7 border border-amber/50 bg-amber/10 px-4 py-2 font-mono text-xs uppercase text-amber transition hover:bg-amber/20" type="button">
              Skip Boot
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
