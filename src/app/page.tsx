// page.tsx — homepage di Toolbox: legge data/catalog.json e lo passa alla vista (griglia modulare, DESIGN.md)

import { HomeView } from "../components/HomeView";
import { readCatalog } from "../lib/catalog";

export default async function Page() {
  const catalog = await readCatalog();
  return <HomeView catalog={catalog} />;
}
