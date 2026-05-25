"use client";

import { FormEvent, useState } from "react";
import { BookOpen, Save } from "lucide-react";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { JournalCard, type JournalEntryView } from "./JournalCard";

type StockOption = { id: string; symbol: string; companyName: string };

export function JournalTerminal({ initialEntries, stocks }: { initialEntries: JournalEntryView[]; stocks: StockOption[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [stockId, setStockId] = useState(stocks[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("Manual Review");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!stockId || !title.trim() || !body.trim()) return;
    setSaving(true);
    const response = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockId, title, body, tag })
    });
    if (response.ok) {
      const entry = await response.json();
      setEntries((current) => [entry, ...current]);
      setTitle("");
      setBody("");
    }
    setSaving(false);
  }

  async function remove(id: string) {
    const response = await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
    if (response.ok) setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase text-amber">Personal notes</p>
        <h1 className="mt-1 font-mono text-3xl font-black text-white md:text-5xl">JOURNAL MEMORY</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
        <RetroPanel title="New Entry" subtitle="Manual review log" variant="amber">
          <form onSubmit={submit} className="space-y-3">
            <select value={stockId} onChange={(event) => setStockId(event.target.value)} className="w-full border border-cyan/15 bg-black/35 px-3 py-2 text-sm text-white outline-none">
              {stocks.map((stock) => <option key={stock.id} value={stock.id}>{stock.symbol} - {stock.companyName}</option>)}
            </select>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Entry title" className="w-full border border-cyan/15 bg-black/35 px-3 py-2 text-sm text-white outline-none placeholder:text-cyan/35" />
            <select value={tag} onChange={(event) => setTag(event.target.value)} className="w-full border border-cyan/15 bg-black/35 px-3 py-2 font-mono text-xs uppercase text-white outline-none">
              {["Manual Review", "On Radar", "Momentum Watch", "Calm", "Danger Zone"].map((option) => <option key={option}>{option}</option>)}
            </select>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write personal watchlist context" rows={8} className="w-full resize-none border border-cyan/15 bg-black/35 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-cyan/35" />
            <button disabled={saving} type="submit" className="inline-flex items-center gap-2 border border-amber/50 bg-amber/10 px-4 py-2 font-mono text-xs uppercase text-amber transition hover:bg-amber/20 disabled:opacity-50">
              {saving ? <BookOpen size={15} /> : <Save size={15} />} Save Entry
            </button>
          </form>
        </RetroPanel>
        <RetroPanel title="Entries" subtitle={`${entries.length} saved`}>
          <div className="space-y-3">
            {entries.length ? entries.map((entry) => <JournalCard key={entry.id} entry={entry} onDelete={remove} />) : <p className="font-mono text-sm text-cyan/65">NO JOURNAL MEMORY FOUND</p>}
          </div>
        </RetroPanel>
      </div>
    </div>
  );
}
