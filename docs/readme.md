# LEGO Sammlung Tracker

Mobile-first Web-App zur Verwaltung einer privaten LEGO-Sammlung.
Erstellt mit React + Vite, Firebase Firestore und Rebrickable API.

Live: https://ieeks.github.io/lego-tracker/
GitHub: https://github.com/ieeks/lego-tracker

---

## Funktionen

- Set per Nummer suchen → Daten automatisch via Rebrickable laden
- QR-Code aus der LEGO-Anleitung scannen → Set wird automatisch erkannt
- Bild, Name, Teileanzahl, Theme und Parent-Theme automatisch befüllt (z.B. „City › Arctic")
- Hinzufügen zur Sammlung oder Wunschliste
- Status verwalten: Gebaut / OVP / Wunschliste
  - Wunsch-Sets per „In OVP" oder „Schon gebaut" in den Besitz übernehmen, und zurück
- Set-Katalog aus dem Rebrickable-Dump: durchsuchen, filtern (u. a. nach Sync-Lauf
  und Preis), sortieren und direkt auf die Wunschliste setzen
- Standort pro Set: Daheim oder Oma/Opa
- Swipe-to-Delete auf Set-Cards
- Dashboard mit Stats (Gesamt Sets, Teile)
- Filter-Chips (Pill-Style): Sammlung / Wunschliste / Gebaut / OVP
- Theme-Filter mit Bottom Sheet (alle verfügbaren Themes der aktuellen Ansicht)
- Sortierung nach Datum, Teileanzahl oder Theme
- UVP-Preise via BrickSet API (Anzeige in Karten, Modal und Statistik)
- Statistikübersicht mit Gesamtwert Sammlung und Wunschliste
- Design-Tokens in `src/styles/tokens.css` (Fraunces + DM Sans + IBM Plex Mono);
  Farbe kodiert Status, nie Dekoration
- Lucide React Icons (konsistentes Icon-System, keine Emoji)
- Optimiert für iPhone (Mobile-first, Touch-Gesten)

---

## Technologie-Stack

- Frontend: React + Vite
- Datenbank: Firebase Firestore (Echtzeit via onSnapshot)
- Auth: Firebase Anonymous Authentication
- API: Rebrickable v3 (Set-Daten, Themes)
- API: BrickSet v3 via Cloudflare Worker (UVP-Preise)
- QR-Scanner: jsQR (funktioniert auf Safari iOS)
- Icons: lucide-react
- Hosting: GitHub Pages (automatisch via GitHub Actions)

---

## Lokales Setup

```bash
git clone https://github.com/ieeks/lego-tracker
cd lego-tracker
npm install
```

`.env.local` anlegen:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_REBRICKABLE_KEY=...
```

```bash
npm run dev
```

---

## Datenstruktur (Firestore Collection: `sets`)

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
  "createdAt": "timestamp"
}
```

`retailPrice`: optional, Float, von BrickSet DE. `null` wenn kein Preis verfügbar.

---

## UVP-Preise (BrickSet)

Preise werden über einen Cloudflare Worker geladen, der die BrickSet API v3 aufruft und den API-Key serverseitig hält:

```
https://lego-brickset-proxy.gxnpny5jhn.workers.dev/?setNumber=42115-1
→ { "retailPrice": 379.99 }
```

Preise werden in Firestore gecacht. Nachladen geht über den Refresh-Knopf im
Detail-Sheet und über „Alle Preise laden" in Wunschliste und Statistik.

---

## Set-Katalog

Statische Dateien unter `public/catalog/`, erzeugt aus dem Rebrickable-CSV-Dump:

```bash
npm run sync:catalog
```

Automatisch montags um 04:00 UTC (`.github/workflows/catalog-sync.yml`), das
Ergebnis wird nach `main` committet und deployt. Jedes Set trägt `first_seen`,
das Datum des Laufs, in dem es zuerst auftauchte — daraus speisen sich der Filter
„Neu am" und die Sortierung „Neueste".

---

## Navigation

| Tab | Inhalt |
|-----|--------|
| Sammlung | Alle Sets mit Pill-Filter-Chips + Theme Bottom Sheet + Sortierung |
| Katalog | Alle Sets ab Jahrgang 2026 aus dem Rebrickable-Dump, mit Suche, Filtern und Wunschlisten-Knopf |
| Wunschliste | Sets mit Status „wishlist", inkl. „Alle Preise laden" |
| Statistik | Anzahl, Statusverteilung, Gesamtwert Sammlung + Wunschliste |
| Info | App-Info, JSON-Export, Sammlung zurücksetzen |

Set hinzufügen: Plus-Button oben rechts im Header

---

## Deployment

Automatisch via GitHub Actions bei jedem Push auf `main`.
Secrets müssen in GitHub → Settings → Secrets hinterlegt sein (siehe `.env.local`).
