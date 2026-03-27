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
- Swipe-to-Delete auf Set-Cards
- Dashboard mit Stats (Gesamt Sets, Teile, Wunschliste, OVP-Ratio)
- Statistikübersicht
- Optimiert für iPhone (Mobile-first, iOS-Design)

---

## Technologie-Stack

- Frontend: React + Vite
- Datenbank: Firebase Firestore (Echtzeit via onSnapshot)
- API: Rebrickable v3
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
  "parts": 3696,
  "status": "built",
  "createdAt": "timestamp"
}
```

---

## Navigation

| Tab | Inhalt |
|-----|--------|
| Sammlung | Alle Sets mit Filter-Chips (Sammlung / Wunschliste / Gebaut) |
| Wunschliste | Sets mit Status "wishlist" |
| Statistik | Anzahl, Teile, Statusverteilung |
| Info | App-Info, Export, Reset |

Set hinzufügen: FAB-Button (+) oben rechts im Header

---

## Deployment

Automatisch via GitHub Actions bei jedem Push auf `main`.
Secrets müssen in GitHub → Settings → Secrets hinterlegt sein (siehe `.env.local`).
