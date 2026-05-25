import { getDataStatus } from "@/lib/data/queries";
import { SettingsConsole } from "@/components/settings/SettingsConsole";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const status = await getDataStatus();
  return <SettingsConsole status={status} />;
}
