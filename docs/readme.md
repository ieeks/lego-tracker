# LEGO Sammlung Tracker

Mobile-first Web-App zur Verwaltung einer privaten LEGO-Sammlung.
Erstellt mit React + Vite, Firebase Firestore und Rebrickable API.

Live: https://ieeks.github.io/lego-tracker/
GitHub: https://github.com/ieeks/lego-tracker

---

## Funktionen

- Set per Nummer suchen → Daten automatisch via Rebrickable laden
- QR-Code aus der LEGO-Anleitung scannen → Set wird automatisch erkannt
- Bild, Name, Teileanzahl, Theme automatisch befüllt
- Hinzufügen zur Sammlung oder Wunschliste
- Status verwalten: Gebaut / OVP / Wunschliste
- Standort pro Set: Daheim oder Oma/Opa
- Swipe-to-Delete auf Set-Cards
- Dashboard mit Stats (Gesamt Sets, Teile, Wunschliste, OVP-Ratio)
- UVP-Preise via BrickSet API (Anzeige in Karten, Modal und Statistik)
- Statistikübersicht mit Gesamtwert Sammlung und Wunschliste
- Optimiert für iPhone (Mobile-first, iOS-Design)

---

## Technologie-Stack

- Frontend: React + Vite
- Datenbank: Firebase Firestore (Echtzeit via onSnapshot)
- API: Rebrickable v3 (Set-Daten)
- API: BrickSet v3 via Cloudflare Worker (UVP-Preise)
- QR-Scanner: jsQR (funktioniert auf Safari iOS)
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

Oder Doppelklick auf **„LEGO Tracker starten.command"**.

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

Preise werden in Firestore gecacht. Einmaliges Bulk-Backfill für bestehende Sets:

```bash
node scripts/backfill-prices.mjs
```

Das Script aktualisiert nur Sets ohne `retailPrice` und überschreibt keine vorhandenen Werte.

---

## Navigation

| Tab | Inhalt |
|-----|--------|
| Sammlung | Alle Sets mit Filter-Chips (Sammlung / Wunschliste / Gebaut) |
| Wunschliste | Sets mit Status "wishlist", inkl. „Alle Preise laden" Button |
| Statistik | Anzahl, Teile, Statusverteilung, Gesamtwert Sammlung + Wunschliste |
| Info | App-Info, Export, Reset |

Set hinzufügen: FAB-Button (+) oben rechts im Header

---

## Deployment

Automatisch via GitHub Actions bei jedem Push auf `main`.
Secrets müssen in GitHub → Settings → Secrets hinterlegt sein (siehe `.env.local`).
