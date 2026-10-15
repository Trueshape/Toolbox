// catalog.ts — lettura e scrittura di data/catalog.json, più le regole di validazione. Solo lato server.

import { promises as fs } from "fs";
import { execFile } from "child_process";
import path from "path";
import type { Catalog, Category } from "../types";
import { PLACEMENTS } from "./settings";

const FILE = path.join(process.cwd(), "data", "catalog.json");
const MAX_THUMB_CHARS = 1_500_000; // circa 1 MB di immagine in base64


export async function readCatalog(): Promise<Catalog> {
  return JSON.parse(await fs.readFile(FILE, "utf8")) as Catalog;
}

// Ogni scrittura salva prima una copia del catalogo in data/backups/ (ignorata da git), tenendo le ultime KEEP_BACKUPS.
const BACKUP_DIR = path.join(process.cwd(), "data", "backups");
const KEEP_BACKUPS = 50;

async function pruneBackups(): Promise<void> {
  const names = (await fs.readdir(BACKUP_DIR)).filter((n) => n.startsWith("catalog-")).sort();
  const old = names.slice(0, Math.max(0, names.length - KEEP_BACKUPS));
  await Promise.all(old.map((n) => fs.unlink(path.join(BACKUP_DIR, n))));
}

export async function writeCatalog(catalog: Catalog): Promise<void> {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  try {
    const current = await fs.readFile(FILE, "utf8");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await fs.writeFile(path.join(BACKUP_DIR, "catalog-" + stamp + ".json"), current, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err; // primo salvataggio: nulla da copiare
  }
  await pruneBackups();

  // scrittura atomica: prima un file temporaneo, poi sostituzione del file vero
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(catalog, null, 2) + "\n", "utf8");
  await fs.rename(tmp, FILE);

  // dopo ogni scrittura, commit e push del solo catalogo (in coda, uno alla volta)
  pushQueue = pushQueue.then(() => pushCatalog()).catch((err) => console.error("Push catalogo fallito:", err));
}

// Coda dei push: due modifiche rapide non si pestano i piedi.
let pushQueue: Promise<void> = Promise.resolve();

function git(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("git", args, { cwd: process.cwd(), timeout: 60000 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout);
    });
  });
}

async function pushCatalog(): Promise<void> {
  await git(["add", "--", "data/catalog.json"]);
  const staged = await git(["diff", "--cached", "--name-only", "--", "data/catalog.json"]);
  if (!staged.trim()) return; // nessuna modifica reale da inviare
  await git(["commit", "-m", "Catalogo: aggiornamento automatico", "--", "data/catalog.json"]);
  await git(["push", "origin", "main"]);
}

// le scritture sono consentite solo in sviluppo: in produzione il catalogo è di sola lettura
export function writesEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

// impostazioni del sito: titolo, descrizione e posizione validi
export function validSettingsPatch(body: Record<string, unknown>): string | null {
  if (body.placement !== undefined && !PLACEMENTS.some((p) => p.value === body.placement)) return "posizione non valida";
  return null;
}

export function validCategories(list: unknown, catalog: Catalog): list is Category[] {
  const names = catalog.categories.map((c) => c.name);
  return Array.isArray(list) && list.length > 0 && list.every((c) => names.includes(c));
}

export function validThumb(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/") && value.length <= MAX_THUMB_CHARS;
}

// indirizzo http/https valido, altrimenti null
export function parseUrl(value: unknown): string | null {
  try {
    const url = new URL(String(value ?? ""));
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

// id leggibile dal nome, unico nel catalogo: "Museo Strano" diventa "museo-strano", poi "museo-strano-2"
export function uniqueSlug(text: string, catalog: Catalog): string {
  const base =
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "sito";
  let id = base;
  let n = 2;
  while (catalog.sites.some((s) => s.id === id)) id = base + "-" + n++;
  return id;
}
