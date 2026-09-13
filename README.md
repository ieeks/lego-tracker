# LEGO Tracker

Mobile-first Web-App zur Verwaltung einer privaten LEGO-Sammlung inkl. Wunschliste. Gebaut für den Alltag — schnelle Erfassung, kein Login, iOS-Feel.

**Live:** [ieeks.github.io/lego-tracker](https://ieeks.github.io/lego-tracker/)

---

## Features

- Set per Nummer eingeben oder QR-Code aus der LEGO-Anleitung scannen
- Rebrickable API lädt Name, Bild, Teileanzahl, Theme und Erscheinungsjahr automatisch
- Echtzeit-Sync via Firebase Firestore
- Status-System: **Gebaut** / **OVP** / **Wunschliste**
  - Wunsch-Sets gehen per „In OVP" oder „Schon gebaut" direkt in den Besitz über, und wieder zurück
- Standort pro Set: Daheim oder Oma/Opa
- Swipe-to-Delete auf Set-Cards (mit Direction Lock gegen versehentliches Triggern beim Scrollen)
- Filter-Chips (2×2 Pill-Grid): Sammlung / Wunschliste / Gebaut / OVP
- Theme-Filter mit Bottom Sheet
- Sortierung nach Hinzufüge-Datum, Teileanzahl oder Theme
- Suche nach Set-Name oder Nummer
- Bottom Sheet Detail-Modal mit Status-Wechsel, Standort und Löschen
- **Set-Katalog** aus dem Rebrickable-Dump: alle Sets ab Jahrgang 2026 durchsuchen,
  nach Jahr, Sync-Lauf, Preis und Theme filtern und direkt auf die Wunschliste setzen
- UVP-Preise via BrickSet API (Anzeige in Karten, Modal, Katalog und Statistik)
- Fehlende Teilezahlen holt das Detail-Sheet beim Öffnen selbst nach
- Statistik-Screen und Info-Screen
- Design-Tokens in `src/styles/tokens.css` (Farbe kodiert Status, nie Dekoration)
- Lucide React Icon System (keine Emoji oder Unicode-Symbole)

## Stack

- React + Vite
- Firebase Firestore (Echtzeit via `onSnapshot`)
- Firebase Authentication (anonymes Sign-in)
- Rebrickable API v3
- BrickSet API v3 via Cloudflare Worker (UVP-Preise)
- jsQR (QR-Code-Scanning, funktioniert auf Safari iOS)
- lucide-react (Icon System)
- Inline Styles + CSS Custom Properties, kein CSS-Framework
- GitHub Pages via GitHub Actions

## Design System

Einzige Quelle ist `src/styles/tokens.css`. Grundregel: **Farbe kodiert Status,
nie Dekoration** — jeder Akzent ist an genau eine Bedeutung gebunden.

```css
--paper:    #F4EDE1;   /* Seitenhintergrund */
--card:     #FFFFFF;   /* Karten, Sheets */
--ink:      #2A2118;   /* Text */
--ink-soft: #8A7A66;   /* Sekundärtext, Mikrolabels */

--brick:    #C8452E;   /* Primär / Wunschliste */
--stud:     #E5A427;   /* OVP, ungebaut */
--leaf:     #5E8C4A;   /* Gebaut */
--petrol:   #2A6F7B;   /* Theme-Akzent, Statistik */
--danger:   #8E3323;   /* Löschen — bewusst nicht --brick */

--font-display: 'Fraunces', Georgia, serif;          /* nie für Ziffern */
--font-body:    'DM Sans', system-ui, sans-serif;    /* inkl. aller Zahlen */
--font-mono:    'IBM Plex Mono', ui-monospace, monospace;  /* nur Mikrolabels */
```

> `design-system.html` im Wurzelverzeichnis zeigt noch die abgelöste
> Birchline-Palette (`--clay`, `--slate`, `--oat`) und ist als Referenz überholt.

## Datenstruktur (Firestore `sets`)

```json
{
  "setNumber": "42115-1",
  "name": "Lamborghini Sián FKP 37",
  "image": "https://...",
  "theme": 1,
  "themeName": "Technic",
  "parentThemeName": "LEGO Technic",
  "parts": 3696,
  "year": 2020,
  "status": "built",
  "location": "home",
  "retailPrice": 379.99,
  "createdAt": "<timestamp>"
}
```

## Set-Katalog

Der Katalog-Tab arbeitet nicht auf Firestore, sondern auf statischen Dateien unter
`public/catalog/` — sie werden nur geladen, wenn der Tab geöffnet wird.

```
public/catalog/index.json    # Themes, Jahrgänge, Stand
public/catalog/<jahr>.json   # die Sets des Jahrgangs
```

Erzeugt werden sie aus dem [Rebrickable-CSV-Dump](https://rebrickable.com/downloads/):

```bash
npm run sync:catalog                      # lädt von Rebrickable
node scripts/syncCatalog.mjs --from <dir> # nutzt lokale CSVs (Test)
```

Automatisch läuft das montags um 04:00 UTC über `.github/workflows/catalog-sync.yml`
(Rebrickable erlaubt den Abruf höchstens täglich) und committet das Ergebnis nach `main`.

Ein Set im Katalog:

```json
{
  "set_num": "21373-1",
  "name": "Downton Abbey",
  "year": 2026,
  "parts": null,
  "theme": "LEGO Ideas and CUUSOO",
  "subtheme": null,
  "theme_id": 576,
  "img": "https://...",
  "uvp_eur": 299.99,
  "first_seen": "2026-09-12"
}
```

- `parts: null` heißt „noch unbekannt": angekündigte Sets stehen im Dump mit 0 Teilen.
- `uvp_eur` kommt von BrickSet und überlebt einen Ausfall der API (der vorherige Wert bleibt stehen).
- `first_seen` ist der Sync-Lauf, in dem das Set zuerst auftauchte — die Grundlage für
  den Filter „Neu am" und die Sortierung „Neueste". `null` heißt „war schon vor dem
  ersten gestempelten Lauf da".

Nicht alles aus dem Dump landet im Katalog: Gear, Bücher, Sammelfiguren und weitere
Themes ohne Sammelwert sind ausgeschlossen, ebenso Setnummern ohne führende Ziffer
(Polybags, Katalog-Artefakte). Die Liste steht in `scripts/syncCatalog.mjs`.

## Firebase Setup

### Authentication
In der Firebase Console muss **Anonymous Authentication** aktiviert sein:
> Authentication → Sign-in method → Anonym → Aktivieren

Die App meldet sich beim Start automatisch anonym an (`signInAnonymously`). Ohne diese Einstellung schlagen alle Schreibzugriffe fehl.

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sets/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Lokale Entwicklung

```bash
npm install
npm run dev
```

`.env.local` benötigt:

```
VITE_REBRICKABLE_KEY=your_key
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Deploy

Push auf `main` → GitHub Actions baut und deployed automatisch auf GitHub Pages.
