// thumbnail.ts — fa lo screenshot di un sito con Edge (o Chrome) in modalità headless, solo lato server.
// Se nessun browser è installato o la pagina non risponde, restituisce null e il sito resta senza miniatura.

import { execFile } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const BROWSERS = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
];

async function findBrowser(): Promise<string | null> {
  for (const p of BROWSERS) {
    try {
      await fs.access(p);
      return p;
    } catch {
      // prossimo percorso
    }
  }
  return null;
}

export async function captureThumbnail(url: string): Promise<string | null> {
  const browser = await findBrowser();
  if (!browser) return null;

  const out = path.join(os.tmpdir(), "toolbox-" + Date.now() + "-" + Math.random().toString(36).slice(2) + ".png");
  await new Promise<void>((resolve) => {
    execFile(
      browser,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1280,720",
        "--virtual-time-budget=8000",
        "--screenshot=" + out,
        url,
      ],
      { timeout: 30000 },
      () => resolve(),
    );
  });

  try {
    const buf = await fs.readFile(out);
    await fs.unlink(out).catch(() => {});
    return buf.length ? "data:image/png;base64," + buf.toString("base64") : null;
  } catch {
    return null;
  }
}
