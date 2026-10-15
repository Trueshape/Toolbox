# PROJECT.md — modello per ogni nuovo progetto

Copia questo file nella radice del progetto e compilalo dall'alto verso il basso.
Regola: non scrivere codice finché i passi 1-5 non sono compilati.

---

## 0. Esiste già? (10 min)

Cerca "[idea] open source" e "[idea] app". Se qualcosa fa già l'80%, usalo o parti da lì.

- **Trovato:** esistono liste simili (Product Hunt, AlternativeTo, "awesome-lists" su GitHub), ma sono generaliste o senza thumbnail/feedback curati a mano.
- **Perché lo costruisco comunque:** curatela personale su siti di nicchia, con thumbnail e feedback — nessuno di questi lo fa così.

## 1. Scopo (10 min)

- **Nome:** Toolbox
- **Cosa fa, in una frase:** Toolbox raccoglie e cataloga siti web utili e poco conosciuti, per chi ama scoprire cose di nicchia sul web.
- **Nicchia (per chi, quale settore):** utenti curiosi che cercano siti diversi dal solito, per categoria
- **Finito quando** (massimo 3 criteri verificabili):
  1. Posso aggiungere un sito (nome, url, categoria, thumbnail, descrizione) modificando un file e vederlo comparire online
  2. Un visitatore può mettere like e lasciare un feedback su un sito, e il numero di like si aggiorna
  3. Il pulsante "sito a caso" apre in una nuova scheda un sito scelto a caso dal catalogo
- **Non include:** login utenti, pannello admin con interfaccia, ricerca full-text, commenti annidati

## 2. Tipo di progetto (5 min)

Scegli uno: [x] sito web  [ ] web app  [ ] app desktop  [ ] app mobile  [ ] script/automazione  [ ] gioco  [ ] CLI  [ ] dati/AI

## 3. Stack (15 min)

Se conosci già uno strumento che risolve il problema, usa quello. Altrimenti parti dal default.

| Tipo | Default | Alternative |
|---|---|---|
| Sito / web app | TypeScript + React / Next.js | Astro (contenuti), Vue/Nuxt, Svelte, HTML+CSS+JS (sito piccolo) |
| Script / automazione / dati | Python | Node.js, PowerShell, Go |
| App desktop | Electron o Tauri | |
| Mobile | React Native / Expo | |
| Gioco 2D/3D | Godot o Three.js | |

**Scelta:** TypeScript + Next.js + Supabase (solo per like e feedback)
**Motivo (una riga):** i siti li aggiungo io modificando un file di dati (niente login/admin); like e feedback li scrivono i visitatori, quindi serve un piccolo database pubblico senza autenticazione da gestire.

**Librerie già pronte da riusare** (non farle inventare all'AI):
- UI: shadcn/ui
- Animazioni: GSAP (scroll, reveal, hover, click)
- 3D: Three.js
- Onboarding/tour: driver.js
- Componenti web (slider, tab, navigazione): Osmo Vault (osmo.supply)

## 4. Stile (solo se c'è un'interfaccia) (20 min)

1. Scegli 1-3 siti di riferimento (godly.design, Osmo, deck.gallery per presentazioni).
2. Crea `DESIGN.md` con: colori, font, spaziature, layout, cosa fare e cosa evitare.
   Prompt: "Leggi DESIGN.md e costruisci il frontend con i suoi colori, font, spaziature e layout."
3. Copia le decisioni (spaziature, dimensione testo, un colore di accento), non l'intero sito.

**Skill utili per Claude Code:** Impeccable, UI/UX Pro Max, Design DNA (estrae lo stile da un sito), Taste Skill, Stop Slop.
**Skill per movimento e profondità:** GSAP, Motion Design, Three.js, Genjutsu.

**Riferimento:** mockup proprio "Griglia modulare" (3 impianti confrontati nell'artifact di design, scelto questo)
**File DESIGN.md creato:** [x] sì

## 5. Piano (30 min)

Flusso: **Prompt → Piano → Costruzione**. Il passo di mezzo è quello che conta.

1. Attiva la modalità piano (Shift+Tab), anche per modifiche piccole.
2. Chiedi un piano `plan.md` con sotto-passi e caselle da spuntare.
3. Un passo alla volta. Finito un passo: spunta la casella, azzera il contesto, continua.
4. Per un progetto nuovo: brainstorm → specifica → piano di implementazione → costruzione.

**Versione 1 (3-5 funzioni indispensabili):**
- [ ] Catalogo siti a card, filtrabile per categoria (dati da file locale)
- [ ] Pagina/scheda sito: thumbnail, descrizione, like, form feedback
- [ ] Pulsante "sito a caso"
- [ ] Salvataggio like e feedback su Supabase

**Dopo (non ora):**
- Ricerca testuale
- Tag multipli oltre alla categoria singola
- Statistiche (siti più votati)

## 6. Cartella e sicurezza del lavoro (5 min)

- [ ] Cartella in `D:\AI\Projects\NomeProgetto`
- [ ] `git init` e repo GitHub **privato** subito. Push dopo ogni passo.
- [ ] `README.md`
- [ ] `CLAUDE.md` (regole per l'AI in questo progetto)
- [ ] `overview.md`: elenco di ogni file con una riga su cosa fa. Collegalo dal `CLAUDE.md`.
- [ ] Commento di intestazione in ogni file (risparmia contesto)
- [ ] **Online dal primo giorno:** pubblica subito una versione vuota (Vercel o Netlify per i siti, gratis). I problemi emergono quando sono piccoli.
- [ ] `decisions.md`: una riga per ogni scelta importante (data, cosa, perché). Collegalo dal `CLAUDE.md`.

Esempio di `decisions.md`:
```
2026-09-26 — Next.js invece di Astro — serve login utenti
```

## 7. Prima del lancio

- [ ] Revisione di sicurezza prima di ogni pubblicazione, poi un secondo controllo.
- [ ] Chiedi esplicitamente **rate limiting** (senza, un abuso può costare migliaia).
- [ ] Chiedi se la **row level security** è attiva (senza, il database è aperto).
- [ ] Secondo modello che attacca il codice "come un hacker", puntato su pagamenti e chiavi API.
- [ ] Nessuna chiave o password nel repo.

## 8. Regole di lavoro con l'AI

- Non lasciare che l'AI reinventi ciò che esiste: riusa librerie mature e personalizzale.
- Spegni "ultrathink": più pensiero costa più token e allucina di più.
- Costruisci per una nicchia che conosci, non uno strumento generico.
- Un solo progetto attivo alla volta.

---

## Stato

- **Passo attuale:** progetto Next.js creato, DESIGN.md scritto, plan.md pronto. Prossimo: Passo 0 di plan.md (dati e struttura base).
- **Prossima azione (meno di 2 minuti):** creare `src/data/sites.ts` con i primi siti di esempio.
