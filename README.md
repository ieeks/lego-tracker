# LEGO Tracker

Mobile-first Web-App zur Verwaltung einer privaten LEGO-Sammlung inkl. Wunschliste. Gebaut für den Alltag — schnelle Erfassung, kein Login, iOS-Feel.

**Live:** [manuel-app.dev/lego](https://ieeks.github.io/lego-tracker/)

---

## Features

- Set per Nummer eingeben oder QR-Code aus der LEGO-Anleitung scannen
- Rebrickable API lädt Name, Bild, Teileanzahl, Theme und Erscheinungsjahr automatisch
- Echtzeit-Sync via Firebase Firestore
- Status-System: **Gebaut** / **OVP** / **Wunschliste**
- Standort pro Set: Daheim oder Oma/Opa
- Swipe-to-Delete auf Set-Cards (mit Direction Lock gegen versehentliches Triggern beim Scrollen)
- Filter-Chips (2×2 Grid): Sammlung / Wunschliste / Gebaut / OVP
- Sortierung nach Hinzufüge-Datum oder Teileanzahl
- Suche nach Set-Name oder Nummer
- Bottom Sheet Detail-Modal mit Status-Wechsel, Standort und Löschen
- Statistik-Screen und Info-Screen

## Stack

- React + Vite
- Firebase Firestore (Echtzeit via `onSnapshot`)
- Rebrickable API v3
- jsQR (QR-Code-Scanning, funktioniert auf Safari iOS)
- Inline Styles, kein CSS-Framework
- GitHub Pages via GitHub Actions

## Datenstruktur (Firestore `sets`)

```json
{
  "setNumber": "42115-1",
  "name": "Lamborghini Sián FKP 37",
  "image": "https://...",
  "theme": 1,
  "themeName": "Technic",
  "parts": 3696,
  "year": 2020,
  "status": "built",
  "location": "home",
  "createdAt": "<timestamp>"
}
```

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
VITE_FIREBASE_APP_ID=...
```

## Deploy

Push auf `main` → GitHub Actions baut und deployed automatisch auf GitHub Pages.
