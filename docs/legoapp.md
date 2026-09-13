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
  - Aktiv: gefüllt in `var(--ink)`, Text in `var(--on-accent)`
  - Inaktiv: transparent, `1.5px solid var(--line)`, Text in `var(--ink-soft)`
- Theme-Filter: Bottom Sheet mit allen vorhandenen Parent-Themes der aktuellen Ansicht
- Sortierung nach Hinzufüge-Datum (Standard), Teileanzahl (absteigend) oder Theme (alphabetisch)
- Suche nach Name oder Set-Nummer
- Bottom Sheet Detail-Modal mit Status-Wechsel und Löschen
- Statistik-Screen: Statusverteilung, Gesamtwert Sammlung, Gesamtwert Wunschliste
- Info-Screen: App-Info, JSON-Export, Sammlung zurücksetzen
- **Set-Katalog** aus dem Rebrickable-CSV-Dump (`public/catalog/`, wöchentlicher Sync)
  - Suche, Filter nach Jahr, Sync-Lauf („Neu am"), Preis, Theme und „noch nicht erfasst"
  - Sortierung nach Teilen, Preis oder Neuzugang; direkt auf die Wunschliste setzen
  - Filterzustand steht in der URL, ein gefilterter Blick ist teilbar
- Wunsch-Sets gehen per „In OVP" oder „Schon gebaut" in den Besitz über, der Rückweg
  auf die Wunschliste steht im selben Sheet
- Fehlende Teilezahl (`parts: 0`, bei Rebrickable = „noch unbekannt") wird beim
  Öffnen des Detail-Sheets einmal nachgeladen und gespeichert
- BrickSet API v3 Integration für UVP-Preise (`retailPrice`)
  - Cloudflare Worker als CORS-Proxy und Secret-Manager (`lego-brickset-proxy.gxnpny5jhn.workers.dev`)
  - Preise werden in Firestore gecacht — einmaliger Fetch, kein automatisches Re-fetch
  - Refresh-Button im Detail-Modal zum manuellen Aktualisieren einzelner Sets
  - „Alle Preise laden" Button in StatsScreen und WishlistScreen (mit Fortschrittsanzeige)
  - Gesamtwert Sammlung + Wunschliste in StatsScreen
- Design-Tokens in `src/styles/tokens.css`: Fraunces / DM Sans / IBM Plex Mono,
  Farbe kodiert Status
- Lucide React Icon System: konsistente 16–22px Icons, strokeWidth 1.75, keine Emoji

---

## Status System

Firestore speichert den Zustand in einem einzelnen `status`-Feld, nicht in
getrennten Booleans. Fehlt das Feld, gilt das Set als Besitz.

| Status | Label | Farbe |
|--------|-------|-------|
| built | Gebaut | `var(--leaf)` #5E8C4A |
| boxed | OVP | `var(--stud)` #E5A427 |
| wishlist | Wunsch | `var(--brick)` #C8452E |
| *(kein Feld)* | Besitz | `var(--ink-soft)` #8A7A66 |

Wege zwischen den Zuständen (alle im Detail-Sheet):
- Wunsch → OVP oder Gebaut über zwei eigene Buttons („Gekauft?")
- Gebaut ↔ OVP über den Status-Button
- Besitz → Wunsch über „Zurück auf die Wunschliste"

---

## Navigation

Bottom Navigation (5 Tabs, Frosted Glass):
- Sammlung (Home-Icon, Lucide `Home`)
- Katalog (Lucide `Sparkles`) — Tab-id bleibt `neuheiten`, weil sie als `?tab=`
  in geteilten Links steht
- Wunschliste (Herz-Icon, Lucide `Heart`, Badge mit Anzahl)
- Statistik (Balken-Icon, Lucide `BarChart2`)
- Info (Info-Icon, Lucide `Info`)

Set hinzufügen: Plus-Button (`Plus` Icon) oben rechts im Header

---

## Design System

Einzige Quelle: `src/styles/tokens.css`. Grundregel dort: **Farbe kodiert Status,
nie Dekoration** — jeder Akzent ist an genau eine Bedeutung gebunden. Wird eine
Farbe rein optisch gesetzt, gehört sie nicht in die Tokens.

```css
/* Basis */
--paper:      #F4EDE1;   /* Seitenhintergrund */
--card:       #FFFFFF;   /* Karten, Sheets */
--ink:        #2A2118;   /* Text */
--ink-soft:   #8A7A66;   /* Sekundärtext, Mikrolabels */
--line:       rgba(42, 33, 24, 0.10);

/* Akzente, je an eine Bedeutung gebunden */
--brick:      #C8452E;   /* Primär / Wunschliste */
--stud:       #E5A427;   /* OVP, ungebaut */
--leaf:       #5E8C4A;   /* Gebaut */
--petrol:     #2A6F7B;   /* Theme-Akzent, Statistik */
--danger:     #8E3323;   /* Löschen — bewusst nicht --brick */

/* Chip-Flächen: gedämpfte Träger derselben Bedeutung */
--leaf-soft: #EDF3EA;  --stud-soft: #FBF0DC;  --stud-ink: #A5701A;
--neutral-soft: #F3EFE7;  --petrol-soft: #E4EEF0;  --brick-soft: #FBE7E2;
--danger-soft: #F6E4E0;

/* Typografie */
--font-display: 'Fraunces', Georgia, serif;               /* nie für Ziffern */
--font-body:    'DM Sans', system-ui, sans-serif;          /* inkl. aller Zahlen */
--font-mono:    'IBM Plex Mono', ui-monospace, monospace;  /* nur Mikrolabels */

/* Radien */
--r-card: 22px;  --r-pill: 999px;  --r-thumb: 16px;
--r-field: 12px;  --r-chip: 8px;
```

Dazu Abstände (`--sp-1` … `--sp-6`), Schatten (`--shadow-sm/md/lg/sheet`) und eine
eigene Palette fürs Kamera-Overlay (`--camera-*`), die bewusst außerhalb der
Papier-Palette liegt: auf einem Videobild trägt nur Schwarz/Weiß genug Kontrast.

> `design-system.html` im Wurzelverzeichnis zeigt noch die abgelöste
> Birchline-Palette und ist als Referenz überholt.

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
| Katalog | `Sparkles` | BottomNav |
| Statistik | `BarChart2` | BottomNav |
| Info | `Info` | BottomNav |
| Suche / Zurücksetzen | `Search`, `X` | Katalog-Suchfeld und Filter-Reset |
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
- `parts: 0` heißt „noch unbekannt" (angekündigte Sets stehen bei Rebrickable mit 0).
  Das Detail-Sheet lädt die Zahl beim Öffnen nach und schreibt sie zurück.

---

## Set-Katalog (`public/catalog/`)

Zweite Datenquelle neben Firestore, bewusst statisch: `index.json` (Themes,
Jahrgänge, Stand) und `<jahr>.json` je Jahrgang, geladen erst beim Öffnen des
Tabs. Erzeugt aus dem Rebrickable-CSV-Dump über `npm run sync:catalog`,
automatisch montags um 04:00 UTC via `.github/workflows/catalog-sync.yml`.

Felder je Set: `set_num`, `name`, `year`, `parts`, `theme`, `subtheme`,
`theme_id`, `img`, `uvp_eur`, `first_seen`.

- `parts: null` = noch unbekannt (im Dump 0)
- `uvp_eur` von BrickSet; fällt die API aus, bleiben die Preise des letzten Laufs stehen
- `first_seen` = Lauf, in dem das Set zuerst auftauchte; Grundlage für „Neu am"
  und „Neueste". `null` = war schon vor dem ersten gestempelten Lauf da.

Ausgeschlossen sind Themes ohne Sammelwert (Gear, Bücher, Sammelfiguren u. a.)
und Setnummern ohne führende Ziffer (Polybags, Katalog-Artefakte) — die Listen
stehen in `scripts/syncCatalog.mjs`.

---

## Nächste mögliche Schritte

- Suche nach Set-Name (ohne Nummer) via Rebrickable
- Push-Notifications bei Preisänderungen
- `ReleaseCard` entschlacken: EOL-Badge, Notiz-, Regions-, Alters- und
  Minifiguren-Felder wurden nur von den entfernten Wellen befüllt und laufen
  jetzt ins Leere
