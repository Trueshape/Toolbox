// App.tsx — sceglie la pagina (homepage o impostazioni) e carica il catalogo: dal server in locale, dal file incluso nella versione pubblica.
import { useEffect, useState } from "react";
import catalogFile from "../data/catalog.json";
import { HomeView } from "./components/HomeView";
import { SettingsForm } from "./components/SettingsForm";
import { READ_ONLY } from "./lib/mode";
import { DEFAULT_SETTINGS } from "./lib/settings";
import type { Catalog } from "./types";

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(READ_ONLY ? (catalogFile as Catalog) : null);
  const [error, setError] = useState("");
  const onSettings = window.location.pathname.replace(/\/$/, "").endsWith("/impostazioni");

  useEffect(() => {
    if (READ_ONLY) return;
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data: Catalog) => setCatalog(data))
      .catch(() => setError("Server locale non raggiungibile."));
  }, []);

  if (onSettings) {
    if (READ_ONLY) return <p className="p-6 text-muted-foreground">Pagina non disponibile.</p>;
    return catalog ? <SettingsForm initial={{ ...DEFAULT_SETTINGS, ...catalog.settings }} categories={catalog.categories} sites={catalog.sites} /> : <p className="p-6">Caricamento…</p>;
  }
  if (!catalog) return <p className="p-6 text-muted-foreground">{error || "Caricamento…"}</p>;
  return <HomeView catalog={catalog} />;
}
