"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AnimatedCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 22 }} className={cn("h-full", className)}>
      {children}
    </motion.div>
  );
}
