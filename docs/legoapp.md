# LEGO Tracker – Internal Context

## Projektziel

Mobile-first Web-App zur Verwaltung einer privaten LEGO-Sammlung inklusive Wunschliste.

Ziel:
- Schnelle Erfassung von Sets per Set-Nummer oder QR-Code-Scan
- Rebrickable lädt Name, Bild, Teileanzahl, Theme automatisch
- Visuell ansprechend, iOS-feel (SF Pro, Rounded Corners, Frosted Glass Nav)
- Minimaler Aufwand für den Nutzer

---

## Core Features (umgesetzt)

- Set-Nummer eingeben → Rebrickable API lädt Name, Bild, Teileanzahl, Theme
- QR-Code aus LEGO-Anleitung scannen (jsQR, funktioniert auf Safari iOS)
  - URL-Format: `https://LEGO.COM/GO/38/0075316/...` → Set-Nummer extrahieren
- Speicherung in Firebase Firestore (Echtzeit via onSnapshot)
- Status-System: built / boxed / wishlist
- Swipe-to-Delete auf Set-Cards (Touch-Events, roter Button)
- Theme-Name wird von Rebrickable geladen und in Firestore gespeichert
- Dashboard: 2×2 Stats-Grid (Gesamt Sets, Gesamt Teile, Wunschliste, OVP-Ratio)
- Filter-Chips: Sammlung / Auf Wunschliste / Gebaut / OVP — zweizeilig (2×2 Grid, kein horizontales Scrollen)
- Sortierung nach Hinzufüge-Datum (Standard) oder Teileanzahl (absteigend)
- Suche nach Name oder Set-Nummer
- Bottom Sheet Detail-Modal mit Status-Wechsel und Löschen
- Statistik, Info-Screen

---

## Status System

| Status | Label | Farbe |
|--------|-------|-------|
| built | Gebaut ✓ | Grün #059669 |
| boxed | OVP 📦 | Grau #78716C |
| wishlist | Wunsch ♥ | Rot #E11D48 |

---

## Navigation

Bottom Navigation (4 Tabs, Frosted Glass):
- Sammlung (Haus-Icon)
- Wunschliste (Herz-Icon, Badge mit Anzahl)
- Statistik (Balken-Icon)
- Info (Kreis-Icon)

Set hinzufügen: Gelber FAB-Button (+) oben rechts im Header

---

## Design Tokens

- Hintergrund: `#F4F3EE`
- Primärfarbe: `#1D6AE5` / `#1650C4`
- FAB: `#F5CC00` (Gelb)
- Font: SF Pro / -apple-system
- Border Radius: 16–20px
- Shadows: weich (0 2px 14px rgba(0,0,0,0.07))
- Header: blauer Gradient, abgerundete untere Ecken (28px)

---

## Technische Entscheidungen

- React + Vite (kein SSR)
- Firebase Firestore (Echtzeit, kein eigener Server)
- Rebrickable API v3 (Set-Daten + Theme-Namen)
- jsQR für QR-Code-Scanning (kein nativer BarcodeDetector nötig)
- Inline Styles (kein CSS-Framework)
- GitHub Pages via GitHub Actions (automatisch bei Push auf main)

---

## Firestore Collection: `sets`

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

Hinweis: `themeName` ist nur bei Sets vorhanden, die nach dem Update hinzugefügt wurden.

---

## Nächste mögliche Schritte

- Statistik-Screen mit Charts ausbauen
- Wunschliste → Sammlung mit einem Tap verschieben
- Suche nach Set-Name (ohne Nummer) via Rebrickable
- OVP-Ratio / Wunschliste-Zähler reaktivieren (z.B. im Statistik-Screen)
