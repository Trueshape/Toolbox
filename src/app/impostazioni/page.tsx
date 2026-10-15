// page.tsx — pagina impostazioni del sito: legge le impostazioni salvate e mostra il form.

import { notFound } from "next/navigation";
import { SettingsForm } from "../../components/SettingsForm";
import { READ_ONLY } from "../../lib/mode";
import { readCatalog } from "../../lib/catalog";
import { DEFAULT_SETTINGS } from "../../lib/settings";

export default async function SettingsPage() {
  if (READ_ONLY) notFound(); // nel sito pubblico le impostazioni non sono disponibili
  const catalog = await readCatalog();
  return <SettingsForm initial={{ ...DEFAULT_SETTINGS, ...catalog.settings }} />;
}
