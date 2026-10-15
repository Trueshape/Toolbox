# Toolbox

Catalogo personale di siti web utili e curiosi, divisi per categoria.

- **Sito pubblico (sola lettura):** https://trueshape.github.io/Toolbox/
- **Repo:** https://github.com/Trueshape/Toolbox

## Avvio in locale

1. Installa Node.js (versione LTS) da https://nodejs.org, se non c'è.
2. Fai doppio clic su `Avvia Toolbox.bat`.

La prima volta installa le dipendenze. Il browser si apre su http://localhost:3100.
Chiudendo la pagina, il server si spegne da solo dopo circa 20 secondi.

## Cosa si può fare in locale

- Aggiungere un sito: scrivi un indirizzo nella barra in alto e premi Invio.
- Cercare: scrivi un testo nella barra in alto, senza Invio.
- Modificare, pinnare ed eliminare siti dal menu del tasto destro.
- Creare, modificare ed eliminare categorie dalla colonna sinistra.
- Cambiare la posizione del titolo nelle card: pulsante "Impostazioni".

Nella versione pubblica si può solo consultare e cercare.

## Dove stanno i dati

- Catalogo: `data/catalog.json`. È il database del progetto.
- Backup: ogni modifica salva una copia in `data/backups/` (ne tiene le ultime 50). La cartella non è nel repo.
- Ogni modifica fa anche commit e push automatico del solo `data/catalog.json`.

## Comandi per sviluppatori

- `npm run dev`: server di sviluppo con API locali.
- `npm run build:pages`: build di sola lettura per GitHub Pages (cartella `dist/`).
- `npm run typecheck`: controllo dei tipi.
