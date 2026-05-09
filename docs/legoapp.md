# LEGO Tracker – Internal Context

## Projektziel

Mobile-first Web-App zur Verwaltung einer privaten LEGO-Sammlung inklusive Wunschliste.

Ziel:
- Schnelle Erfassung von Sets per Set-Nummer oder QR-Code-Scan
- Rebrickable lädt Name, Bild, Teileanzahl, Theme automatisch
- Visuell ansprechend, iOS-feel (Birchline Design System, Rounded Corners, Frosted Glass Nav)
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
- Dashboard: 2-Card Stats (Gesamt Sets, Gesamt Teile mit Built-Prozent-Balken)
- Filter-Chips (Pill-Style, 2×2 Grid): Sammlung / Auf Wunschliste / Gebaut / OVP
  - Aktiv: `var(--clay)` Hintergrund, weißer Text
  - Inaktiv: transparent, `var(--gray-300)` Border
- Theme-Filter: Bottom Sheet mit allen vorhandenen Parent-Themes der aktuellen Ansicht
- Sortierung nach Hinzufüge-Datum (Standard), Teileanzahl (absteigend) oder Theme (alphabetisch)
- Suche nach Name oder Set-Nummer
- Bottom Sheet Detail-Modal mit Status-Wechsel und Löschen
- Statistik-Screen: Statusverteilung, Gesamtwert Sammlung, Gesamtwert Wunschliste
- Info-Screen: App-Info, JSON-Export, Sammlung zurücksetzen
- BrickSet API v3 Integration für UVP-Preise (`retailPrice`)
  - Cloudflare Worker als CORS-Proxy und Secret-Manager (`lego-brickset-proxy.gxnpny5jhn.workers.dev`)
  - Preise werden in Firestore gecacht — einmaliger Fetch, kein automatisches Re-fetch
  - Refresh-Button im Detail-Modal zum manuellen Aktualisieren einzelner Sets
  - „Alle Preise laden" Button in StatsScreen und WishlistScreen (mit Fortschrittsanzeige)
  - Gesamtwert Sammlung + Wunschliste in StatsScreen
- Birchline Design System: CSS Custom Properties, Fraunces / DM Sans / DM Mono
- Lucide React Icon System: konsistente 16–22px Icons, strokeWidth 1.75, keine Emoji

---

## Status System

| Status | Label | Farbe |
|--------|-------|-------|
| built | Gebaut | `var(--success)` #788C5D |
| boxed | OVP | `var(--gray-500)` #87867F |
| wishlist | Wunsch | `var(--clay)` #D97757 |

---

## Navigation

Bottom Navigation (4 Tabs, Frosted Glass):
- Sammlung (Home-Icon, Lucide `Home`)
- Wunschliste (Herz-Icon, Lucide `Heart`, Badge mit Anzahl)
- Statistik (Balken-Icon, Lucide `BarChart2`)
- Info (Info-Icon, Lucide `Info`)

Set hinzufügen: Plus-Button (`Plus` Icon) oben rechts im Header

---

## Design System (Birchline)

```css
/* Core Palette */
--clay:   #D97757;   /* Primärfarbe, aktive Zustände */
--slate:  #141413;   /* Überschriften, Primärtext */
--ivory:  #FAF9F5;   /* Kartenhintergrund (Inputs, Modals) */
--oat:    #E3DACC;   /* Seitenhintergrund */

/* Neutral Scale */
--white:    #FFFFFF;
--gray-100: #F0EEE6;
--gray-300: #D1CFC5;  /* Borders, Divider, Placeholder-Icons */
--gray-500: #87867F;  /* Tertiär-Text, Labels, Timestamps */
--gray-700: #3D3D3A;  /* Body-Text, Set-Nummern, Themes, Teile */

/* Semantic */
--success: #788C5D;
--warning: #C78E3F;
--danger:  #B04A4A;
--info:    #5C7CA3;

/* Typography */
--font-display: 'Fraunces', Georgia, serif;   /* Überschriften */
--font-body:    'DM Sans', sans-serif;         /* Fließtext, Buttons */
--font-mono:    'DM Mono', monospace;          /* Nummern, Preise, IDs */

/* Radius */
--r-xs: 4px;  --r-sm: 8px;  --r-md: 12px;  --r-lg: 20px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(20,20,19,0.06);
--shadow-md: 0 4px 10px rgba(20,20,19,0.08);
--shadow-lg: 0 12px 28px rgba(20,20,19,0.12);
```

---

## Icon System (Lucide React)

Alle Icons via `lucide-react`. Keine Emoji oder Unicode-Symbole in der UI.

| Konzept | Icon | Verwendung |
|---------|------|------------|
| Sammlung / Home | `Home` | Filter-Chip, BottomNav, Standort |
| Wunschliste | `Heart` | Filter-Chip, BottomNav, StatusBadge |
| Gebaut | `Hammer` | Filter-Chip, AddScreen Status |
| OVP | `Package` | Filter-Chip, StatusBadge, AddScreen Status |
| Hinzufügen | `Plus` | Header-Button |
| Suche | `Search` | (verfügbar) |
| Statistik | `BarChart2` | BottomNav |
| Info | `Info` | BottomNav |
| Datum | `Calendar` | Sort-Chip |
| Teile | `Layers` | Sort-Chip, StatCard |
| Theme | `Tag` | Sort-Chip, StatsScreen |
| Erledigt | `Check` | StatusBadge, Done-Banner |
| Refresh | `RotateCw` | Preis-Refresh-Button |
| Download | `Download` | Export-Button |
| Kamera | `Camera` | QR-Scanner-Fehler |
| Oma/Opa | `Users` | Standort |

Standardwerte: `size={16}` (inline), `size={22}` (BottomNav), `strokeWidth={1.75}`

---

## Technische Entscheidungen

- React + Vite (kein SSR)
- Firebase Firestore (Echtzeit, kein eigener Server)
- Firebase Anonymous Authentication (Schreibschutz)
- Rebrickable API v3 (Set-Daten + Theme-Namen)
- jsQR für QR-Code-Scanning (kein nativer BarcodeDetector nötig)
- lucide-react für konsistentes Icon-System
- Inline Styles + CSS Custom Properties (kein CSS-Framework)
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
- `location`: optional, `"home"` | `"grandparents"` | `null`

---

## Nächste mögliche Schritte

- Wunschliste → Sammlung mit einem Tap verschieben
- Suche nach Set-Name (ohne Nummer) via Rebrickable
- Sortierung nach Preis
- Push-Notifications bei Preisänderungen
