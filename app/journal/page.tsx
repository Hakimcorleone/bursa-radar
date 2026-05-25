import { getJournalData } from "@/lib/data/queries";
import { JournalTerminal } from "@/components/journal/JournalTerminal";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const data = await getJournalData();
  return <JournalTerminal initialEntries={data.entries} stocks={data.stocks} />;
}
