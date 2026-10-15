// POST /api/heartbeat: la pagina lo invia ogni 5 secondi. Se i segnali si fermano (scheda chiusa), il server locale si chiude.

import { NextResponse } from "next/server";

const state = globalThis as unknown as { __lastBeat?: number; __watchdog?: ReturnType<typeof setInterval> };
const TIMEOUT_MS = 20000;

export async function POST() {
  state.__lastBeat = Date.now();
  if (!state.__watchdog) {
    state.__watchdog = setInterval(() => {
      if (Date.now() - (state.__lastBeat ?? 0) > TIMEOUT_MS) {
        console.log("Pagina chiusa: server locale fermato.");
        process.exit(0);
      }
    }, 5000);
  }
  return NextResponse.json({ ok: true });
}
