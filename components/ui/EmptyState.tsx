import { RetroPanel } from "./RetroPanel";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <RetroPanel title={title} variant="amber">
      <p className="font-mono text-sm text-amber">{body}</p>
    </RetroPanel>
  );
}
