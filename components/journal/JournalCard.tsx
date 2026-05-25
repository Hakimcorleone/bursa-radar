import { formatDateTime } from "@/lib/format";
import { SignalBadge } from "@/components/ui/SignalBadge";

export type JournalEntryView = {
  id: string;
  stockId: string;
  symbol?: string;
  companyName?: string;
  title: string;
  body: string;
  tag: string | null;
  createdAt: string | null;
  updatedAt?: string | null;
};

export function JournalCard({ entry, onDelete }: { entry: JournalEntryView; onDelete?: (id: string) => void }) {
  return (
    <article className="retro-corners border border-cyan/15 bg-black/25 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-base font-black text-white">{entry.title}</h3>
          <p className="text-xs text-cyan/55">{entry.symbol ? `${entry.symbol} / ` : ""}{formatDateTime(entry.createdAt)}</p>
        </div>
        {entry.tag ? <SignalBadge label={entry.tag} /> : null}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-cyan/75">{entry.body}</p>
      {onDelete ? <button type="button" onClick={() => onDelete(entry.id)} className="mt-3 border border-danger/40 px-3 py-1 font-mono text-xs uppercase text-danger transition hover:bg-danger/10">Delete</button> : null}
    </article>
  );
}
