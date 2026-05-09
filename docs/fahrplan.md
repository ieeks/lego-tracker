# LEGO Tracker – Projektfahrplan

## Übersicht

| Phase | Thema | Status |
|-------|-------|--------|
| 1 | Projekt Setup (React + Vite) | ✅ Fertig |
| 2 | Firebase Setup + Firestore | ✅ Fertig |
| 3 | Rebrickable API anbinden | ✅ Fertig |
| 4 | Echte Daten via onSnapshot (Echtzeit) | ✅ Fertig |
| 5 | iOS UI Redesign (Dashboard, Cards, BottomNav) | ✅ Fertig |
| 6 | GitHub Repository (ieeks/lego-tracker) | ✅ Fertig |
| 7 | QR-Code Scanner (jsQR, Safari iOS) | ✅ Fertig |
| 8 | Swipe-to-Delete + Theme-Anzeige | ✅ Fertig |
| 9 | Deployment via GitHub Pages + GitHub Actions | ✅ Fertig |
| 10 | BrickSet API + UVP-Preise | ✅ Fertig |
| 11 | Birchline Design System | ✅ Fertig |
| 12 | Lucide Icon System + Filter Redesign | ✅ Fertig |
| 13 | Statistik-Screen ausbauen | ⬜ Offen |
| 14 | Suche nach Set-Name (ohne Nummer) | ⬜ Offen |

Live: https://ieeks.github.io/lego-tracker/

---

## Phase 1 – Projekt Setup

```bash
npm create vite@latest lego-tracker -- --template react
cd lego-tracker
npm install
npm install firebase jsqr lucide-react
```

Ordnerstruktur:
```
src/
  components/      # SetCard, StatusBadge, BottomNav
  screens/         # CollectionScreen, AddScreen, WishlistScreen, StatsScreen, InfoScreen
  hooks/           # useCollection
  services/        # firebase.js, rebrickable.js, setService.js, bricksetService.js
App.jsx
main.jsx
index.css          # Birchline CSS Custom Properties
```

---

## Phase 2 – Firebase Setup

### 2.1 Firebase Projekt anlegen
1. https://console.firebase.google.com
2. Neues Projekt erstellen
3. Firestore Database aktivieren (Testmodus)
4. Authentication → Anonymous aktivieren
5. Web-App registrieren → Config kopieren

### 2.2 Config in Projekt einfügen

Datei: `src/services/firebase.js`
```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 2.3 Firestore Collection: `sets`

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

---

## Phase 3 – Rebrickable API

Datei: `src/services/rebrickable.js`

- `fetchSet(setNumber)` → Set-Daten (Name, Bild, Teile, Theme-ID, Jahr)
- `fetchThemeNames(themeId)` → `{ themeName, parentThemeName }`

`.env.local`:
```
VITE_REBRICKABLE_KEY=dein_api_key_hier
```

---

## Phase 4 – Echte Daten (Firestore)

Hook `useCollection`: onSnapshot auf Collection `sets`, sortiert nach `createdAt desc`.

`setService.js`:
- `addSet({ setNumber, name, image, parts, theme, themeName, parentThemeName, year, status })`
- `updateSetStatus(id, status)`
- `updateSetLocation(id, location)`
- `updateSetPrice(id, price)`
- `deleteSet(id)`

---

## Phase 5 – iOS UI Redesign

- Header: clay-farbiger Hintergrund, Plus-Button oben rechts
- Stats-Dashboard: 2-Card Grid (Gesamt Sets, Gesamt Teile)
- Filter-Chips: Sammlung / Auf Wunschliste / Gebaut / OVP
- Suchfeld mit Lupe-Icon und Clear-Button
- Set-Cards: Bild links, Info rechts, Herz-Icon, Chevron
- Bottom Nav: 4 Tabs, Wunschliste-Badge

---

## Phase 7 – QR-Code Scanner

LEGO-Anleitungen enthalten QR-Codes mit URL:
```
https://LEGO.COM/GO/38/0075316/6382344/...
                    ^^^^^^^^
                    Set-Nummer (zero-padded, 7 Stellen)
```

Umsetzung:
- `jsQR` Library (funktioniert auf Safari iOS, kein BarcodeDetector nötig)
- Video-Stream via `getUserMedia`, Frames per Canvas auslesen
- Set-Nummer extrahieren → automatische Rebrickable-Suche

---

## Phase 8 – Swipe-to-Delete & Theme

**Swipe-to-Delete:**
- Touch-Events auf SetCard mit Direction Lock (verhindert versehentliches Triggern beim Scrollen)
- Links wischen → roter Löschen-Button (80px) erscheint
- Snap-Mechanismus: öffnet/schließt bei >36px Swipe
- Löschen direkt aus Firestore

**Theme-Anzeige:**
- `fetchThemeNames(themeId)` beim Set-Preview aufrufen
- `themeName` und `parentThemeName` in Firestore speichern
- Anzeige in SetCard: `42115-1 · Technic · 2020`

---

## Phase 9 – GitHub Pages Deployment

```yaml
# .github/workflows/deploy.yml
# Trigger: Push auf main
# Build: npm ci && npm run build (mit Secrets als Env-Vars)
# Deploy: actions/deploy-pages@v4
```

`vite.config.js`:
```js
export default defineConfig({
  plugins: [react()],
  base: '/lego-tracker/',
})
```

GitHub Secrets erforderlich:
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
- `VITE_REBRICKABLE_KEY`

---

## Phase 10 – BrickSet API + UVP-Preise

- Cloudflare Worker als CORS-Proxy für BrickSet API v3
- Endpoint: `lego-brickset-proxy.gxnpny5jhn.workers.dev/?setNumber=42115-1`
- Response: `{ "retailPrice": 379.99 }`
- Preise in Firestore gecacht (`retailPrice` Feld)
- Refresh-Button im Detail-Modal
- „Alle Preise laden" in StatsScreen und WishlistScreen
- Bulk-Backfill via `scripts/backfill-prices.mjs`

---

## Phase 11 – Birchline Design System

CSS Custom Properties in `src/index.css`:

```css
--clay: #D97757;   --slate: #141413;
--ivory: #FAF9F5;  --oat: #E3DACC;
--white: #FFFFFF;
--gray-100: #F0EEE6;  --gray-300: #D1CFC5;
--gray-500: #87867F;  --gray-700: #3D3D3A;
--success: #788C5D;   --warning: #C78E3F;
--danger: #B04A4A;    --info: #5C7CA3;
--font-display: 'Fraunces', Georgia, serif;
--font-body:    'DM Sans', sans-serif;
--font-mono:    'DM Mono', monospace;
```

Google Fonts via `<link>` in `index.html` eingebunden.

Hintergrund-Hierarchie:
- Seite: `var(--oat)` #E3DACC
- Karten / Modals: `var(--white)` #FFFFFF
- Inputs: `var(--ivory)` #FAF9F5

---

## Phase 12 – Lucide Icon System + Filter Redesign

**Icon-Migration:**
- `npm install lucide-react`
- Alle Emoji und Unicode-Symbole (🏠 ❤️ ✓ 📦 🔄 ⚙️ 📥 etc.) ersetzt durch Lucide-Komponenten
- Einheitliche Parameter: `strokeWidth={1.75}`, `size={16}` inline / `size={22}` BottomNav

**Filter-Button Redesign:**
- Pill-Form: `borderRadius: 999px`
- Inaktiv: transparent, `1.5px solid var(--gray-300)`, `var(--gray-700)` Text
- Aktiv: `var(--clay)` Hintergrund + Border, weißer Text
- Gleiche Behandlung für Sort-Chips und Theme-Filter-Button
