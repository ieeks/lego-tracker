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
- Theme-Name und Parent-Theme werden von Rebrickable geladen und in Firestore gespeichert
  - Darstellung: „City › Arctic" Format in SetCard und DetailModal
  - Backfill für bestehende Sets: `backfill-parent-theme.mjs`
- Dashboard: 2×2 Stats-Grid (Gesamt Sets, Gesamt Teile, Wunschliste, OVP-Ratio)
- Filter-Chips: Sammlung / Auf Wunschliste / Gebaut / OVP — zweizeilig (2×2 Grid, kein horizontales Scrollen)
- Parent-Theme Filter-Chips: horizontales Scrollen unter der Sortierung, zeigt alle vorhandenen Parent-Themes der aktuellen Ansicht; Wechsel des Status-Filters setzt Theme-Filter zurück
- Sortierung nach Hinzufüge-Datum (Standard) oder Teileanzahl (absteigend)
- Suche nach Name oder Set-Nummer
- Bottom Sheet Detail-Modal mit Status-Wechsel und Löschen
- Statistik-Screen: Statusverteilung, Gesamtwert Sammlung, Gesamtwert Wunschliste
- Info-Screen
- BrickSet API v3 Integration für UVP-Preise (`retailPrice`)
  - Cloudflare Worker als CORS-Proxy und Secret-Manager (`lego-brickset-proxy.gxnpny5jhn.workers.dev`)
  - Preise werden in Firestore gecacht — einmaliger Fetch, kein automatisches Re-fetch
  - 🔄 Button im Detail-Modal zum manuellen Aktualisieren einzelner Sets
  - „Alle Preise laden" Button in StatsScreen für alle Sets ohne Preis (mit Fortschrittsanzeige: „Lade… (3/12)")
  - Gesamtwert Sammlung + Wunschliste in StatsScreen
  - Bulk-Backfill: `scripts/backfill-prices.mjs`

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
- BrickSet API v3 für UVP-Preise (kein BrickLink, da Seller-only ohne offizielle DE-Preise)
- Cloudflare Worker für CORS-Proxy + Secret Management (`BRICKSET_API_KEY` liegt nur im Worker)

---

## Firestore Collection: `sets`

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

Hinweise:
- `themeName` / `parentThemeName` / `year` nur bei Sets vorhanden, die nach dem jeweiligen Update hinzugefügt wurden
- `retailPrice`: optional, Float, von BrickSet DE via Cloudflare Worker; `null` wenn kein Preis verfügbar

---

## Nächste mögliche Schritte

- Wunschliste → Sammlung mit einem Tap verschieben
- Suche nach Set-Name (ohne Nummer) via Rebrickable
