// api.ts — API locali di Toolbox, attive solo con "npm run dev" (come middleware di Vite).
// Leggono e scrivono data/catalog.json, scaricano titoli, immagini e favicon. Nella versione pubblica non esistono.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { parseUrl, readCatalog, uniqueSlug, validCategories, validSettingsPatch, validThumb, writeCatalog, writesEnabled } from "../src/lib/catalog";
import { ICON_NAMES } from "../src/lib/categoryIcons";
import { fetchFavicon } from "../src/lib/favicon";
import { DEFAULT_SETTINGS, type Placement } from "../src/lib/settings";
import { captureThumbnail } from "../src/lib/thumbnail";
import type { Category, Site } from "../src/types";

type Json = Record<string, unknown>;

function send(res: ServerResponse, status: number, body: unknown, type = "application/json; charset=utf-8") {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<Json> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as Json;
}

const UA = { "User-Agent": "Mozilla/5.0 Toolbox" };
const notWritable = { error: "sola lettura in produzione" };

// --- sito / categorie / impostazioni ---

async function createSite(req: IncomingMessage, res: ServerResponse) {
  if (!writesEnabled()) return send(res, 405, notWritable);
  const body = await readJson(req);
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const descrizione = typeof body.descrizione === "string" ? body.descrizione.trim() : "";
  const url = parseUrl(body.url);
  const catalog = await readCatalog();
  if (!nome || nome.length > 120) return send(res, 400, { error: "nome non valido" });
  if (!url) return send(res, 400, { error: "indirizzo non valido" });
  if (descrizione.length > 300) return send(res, 400, { error: "descrizione troppo lunga" });
  if (!validCategories(body.categorie, catalog)) return send(res, 400, { error: "scegli almeno una categoria" });
  if (body.thumbnail != null && !validThumb(body.thumbnail)) return send(res, 400, { error: "miniatura non valida" });

  const site: Site = {
    id: uniqueSlug(nome, catalog),
    nome,
    url,
    categorie: body.categorie,
    descrizione,
    pinned: body.pinned === true,
  };
  if (typeof body.thumbnail === "string") site.thumbnail = body.thumbnail;
  else {
    const shot = await captureThumbnail(url);
    if (shot) site.thumbnail = shot;
  }
  const icon = await fetchFavicon(url);
  if (icon) site.favicon = icon;

  catalog.sites.push(site);
  await writeCatalog(catalog);
  send(res, 201, site);
}

async function updateSite(req: IncomingMessage, res: ServerResponse, id: string) {
  if (!writesEnabled()) return send(res, 405, notWritable);
  const body = await readJson(req);
  const catalog = await readCatalog();
  if (body.categorie !== undefined && !validCategories(body.categorie, catalog)) return send(res, 400, { error: "categorie non valide" });
  if (body.pinned !== undefined && typeof body.pinned !== "boolean") return send(res, 400, { error: "pinned deve essere booleano" });
  if (body.thumbnail !== undefined && body.thumbnail !== null && !validThumb(body.thumbnail)) return send(res, 400, { error: "miniatura non valida" });
  if (body.nome !== undefined && (typeof body.nome !== "string" || !body.nome.trim() || body.nome.trim().length > 120)) return send(res, 400, { error: "nome non valido" });
  if (body.descrizione !== undefined && (typeof body.descrizione !== "string" || body.descrizione.trim().length > 300)) return send(res, 400, { error: "descrizione troppo lunga" });
  let url: string | null = null;
  if (body.url !== undefined) {
    url = parseUrl(body.url);
    if (!url) return send(res, 400, { error: "indirizzo non valido" });
  }

  const site = catalog.sites.find((s) => s.id === id);
  if (!site) return send(res, 404, { error: "sito non trovato" });
  if (body.categorie !== undefined) site.categorie = body.categorie as Category[];
  if (body.pinned !== undefined) site.pinned = body.pinned as boolean;
  if (typeof body.nome === "string") site.nome = body.nome.trim();
  if (typeof body.descrizione === "string") site.descrizione = body.descrizione.trim();
  if (url && url !== site.url) {
    site.url = url;
    const icon = await fetchFavicon(url);
    if (icon) site.favicon = icon;
    else delete site.favicon;
  }
  if (body.thumbnail === null) delete site.thumbnail;
  else if (typeof body.thumbnail === "string") site.thumbnail = body.thumbnail;

  await writeCatalog(catalog);
  send(res, 200, site);
}

async function deleteSite(res: ServerResponse, id: string) {
  if (!writesEnabled()) return send(res, 405, notWritable);
  const catalog = await readCatalog();
  const before = catalog.sites.length;
  catalog.sites = catalog.sites.filter((s) => s.id !== id);
  if (catalog.sites.length === before) return send(res, 404, { error: "sito non trovato" });
  await writeCatalog(catalog);
  send(res, 200, { ok: true });
}

async function createCategory(req: IncomingMessage, res: ServerResponse) {
  if (!writesEnabled()) return send(res, 405, notWritable);
  const body = await readJson(req);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const color = typeof body.color === "string" && /^#[0-9a-fA-F]{6}$/.test(body.color) ? body.color : "#60a5fa";
  const catalog = await readCatalog();
  if (!name || name.length > 30) return send(res, 400, { error: "nome categoria non valido" });
  if (catalog.categories.some((c) => c.name === name)) return send(res, 400, { error: "categoria già esistente" });
  const icon = typeof body.icon === "string" && (ICON_NAMES as readonly string[]).includes(body.icon) ? body.icon : ICON_NAMES[catalog.categories.length % ICON_NAMES.length];
  const category = { name, color, icon };
  catalog.categories.push(category);
  await writeCatalog(catalog);
  send(res, 201, category);
}

async function updateCategory(req: IncomingMessage, res: ServerResponse, oldName: string) {
  if (!writesEnabled()) return send(res, 405, notWritable);
  const body = await readJson(req);
  const catalog = await readCatalog();
  const category = catalog.categories.find((c) => c.name === oldName);
  if (!category) return send(res, 404, { error: "categoria non trovata" });
  const newName = typeof body.name === "string" ? body.name.trim() : oldName;
  if (!newName || newName.length > 30) return send(res, 400, { error: "nome categoria non valido" });
  if (newName !== oldName && catalog.categories.some((c) => c.name === newName)) return send(res, 400, { error: "categoria già esistente" });
  if (body.color !== undefined) {
    if (typeof body.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.color)) return send(res, 400, { error: "colore non valido" });
    category.color = body.color;
  }
  if (body.icon !== undefined) {
    if (typeof body.icon !== "string" || !(ICON_NAMES as readonly string[]).includes(body.icon)) return send(res, 400, { error: "icona non valida" });
    category.icon = body.icon;
  }
  if (newName !== oldName) {
    category.name = newName;
    for (const site of catalog.sites) site.categorie = site.categorie.map((c) => (c === oldName ? newName : c));
  }
  await writeCatalog(catalog);
  send(res, 200, category);
}

async function deleteCategory(res: ServerResponse, name: string) {
  if (!writesEnabled()) return send(res, 405, notWritable);
  const catalog = await readCatalog();
  if (!catalog.categories.some((c) => c.name === name)) return send(res, 404, { error: "categoria non trovata" });
  const orphans = catalog.sites.filter((s) => s.categorie.length === 1 && s.categorie[0] === name);
  if (orphans.length > 0) {
    return send(res, 409, { error: "Questi siti resterebbero senza categoria: " + orphans.map((s) => s.nome).join(", ") + ". Spostali prima in un'altra categoria." });
  }
  catalog.categories = catalog.categories.filter((c) => c.name !== name);
  for (const site of catalog.sites) site.categorie = site.categorie.filter((c) => c !== name);
  await writeCatalog(catalog);
  send(res, 200, { ok: true });
}

async function updateSettings(req: IncomingMessage, res: ServerResponse) {
  if (!writesEnabled()) return send(res, 405, notWritable);
  const body = await readJson(req);
  const error = validSettingsPatch(body);
  if (error) return send(res, 400, { error });
  const catalog = await readCatalog();
  const current = { ...DEFAULT_SETTINGS, ...catalog.settings };
  catalog.settings = { placement: (body.placement as Placement) ?? current.placement };
  await writeCatalog(catalog);
  send(res, 200, catalog.settings);
}

async function refreshFavicons(res: ServerResponse) {
  if (!writesEnabled()) return send(res, 405, notWritable);
  const catalog = await readCatalog();
  let added = 0;
  for (const site of catalog.sites) {
    if (site.favicon) continue;
    const icon = await fetchFavicon(site.url);
    if (icon) {
      site.favicon = icon;
      added++;
    }
  }
  if (added > 0) await writeCatalog(catalog);
  send(res, 200, { added, total: catalog.sites.length });
}

// --- utilità di consultazione ---

async function pageTitle(res: ServerResponse, raw: string) {
  const url = parseUrl(raw);
  if (!url) return send(res, 400, { error: "indirizzo non valido" });
  const ENT: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">" };
  try {
    const page = await fetch(url, { signal: AbortSignal.timeout(5000), headers: UA });
    const html = (await page.text()).slice(0, 200_000);
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = match ? match[1].replace(/\s+/g, " ").replace(/&(amp|quot|#39|lt|gt);/g, (e) => ENT[e]).trim() : "";
    send(res, 200, { title });
  } catch {
    send(res, 200, { title: "" });
  }
}

async function imageFromLink(res: ServerResponse, raw: string) {
  const url = parseUrl(raw);
  if (!url) return send(res, 400, { error: "indirizzo non valido" });
  try {
    const page = await fetch(url, { signal: AbortSignal.timeout(10000), headers: UA });
    const type = page.headers.get("content-type") ?? "";
    if (!page.ok || !type.startsWith("image/")) return send(res, 400, { error: "il link non è un'immagine" });
    const buf = Buffer.from(await page.arrayBuffer());
    if (buf.length === 0 || buf.length > 8 * 1024 * 1024) return send(res, 400, { error: "immagine troppo grande o vuota" });
    send(res, 200, { dataUrl: "data:" + type + ";base64," + buf.toString("base64") });
  } catch {
    send(res, 502, { error: "immagine non raggiungibile" });
  }
}

// heartbeat: la pagina lo invia ogni 5 secondi; se si ferma per 20 secondi (scheda chiusa) il server si chiude
const beat = globalThis as unknown as { __lastBeat?: number; __watchdog?: ReturnType<typeof setInterval> };
function heartbeat(res: ServerResponse) {
  beat.__lastBeat = Date.now();
  if (!beat.__watchdog) {
    beat.__watchdog = setInterval(() => {
      if (Date.now() - (beat.__lastBeat ?? 0) > 20000) {
        console.log("Pagina chiusa: server locale fermato.");
        process.exit(0);
      }
    }, 5000);
  }
  send(res, 200, { ok: true });
}

// --- instradamento ---

type Route = { method: string; path: RegExp; run: (req: IncomingMessage, res: ServerResponse, m: RegExpMatchArray, q: URLSearchParams) => unknown };

const routes: Route[] = [
  { method: "GET", path: /^\/api\/catalog$/, run: async (_q, res) => send(res, 200, await readCatalog()) },
  { method: "GET", path: /^\/api\/title$/, run: (_q, res, _m, p) => pageTitle(res, p.get("url") ?? "") },
  { method: "GET", path: /^\/api\/image$/, run: (_q, res, _m, p) => imageFromLink(res, p.get("url") ?? "") },
  { method: "POST", path: /^\/api\/heartbeat$/, run: (_q, res) => heartbeat(res) },
  { method: "POST", path: /^\/api\/sites$/, run: (req, res) => createSite(req, res) },
  { method: "PATCH", path: /^\/api\/sites\/([^/]+)$/, run: (req, res, m) => updateSite(req, res, decodeURIComponent(m[1])) },
  { method: "DELETE", path: /^\/api\/sites\/([^/]+)$/, run: (_q, res, m) => deleteSite(res, decodeURIComponent(m[1])) },
  { method: "POST", path: /^\/api\/categories$/, run: (req, res) => createCategory(req, res) },
  { method: "PATCH", path: /^\/api\/categories\/([^/]+)$/, run: (req, res, m) => updateCategory(req, res, decodeURIComponent(m[1])) },
  { method: "DELETE", path: /^\/api\/categories\/([^/]+)$/, run: (_q, res, m) => deleteCategory(res, decodeURIComponent(m[1])) },
  { method: "PATCH", path: /^\/api\/settings$/, run: (req, res) => updateSettings(req, res) },
  { method: "POST", path: /^\/api\/favicons$/, run: (_q, res) => refreshFavicons(res) },
];

export function toolboxApi(): Plugin {
  return {
    name: "toolbox-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (!url.pathname.startsWith("/api/")) return next();
        const route = routes.find((r) => r.method === req.method && r.path.test(url.pathname));
        if (!route) return send(res, 404, { error: "non trovato" });
        try {
          const m = url.pathname.match(route.path)!;
          await route.run(req, res, m, url.searchParams);
        } catch (err) {
          send(res, 500, { error: String(err) });
        }
      });
    },
  };
}
