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
| 10 | Statistik-Screen ausbauen | ⬜ Offen |
| 11 | Suche nach Set-Name (ohne Nummer) | ⬜ Offen |

Live: https://ieeks.github.io/lego-tracker/

---

## Phase 1 – Projekt Setup

```bash
npm create vite@latest lego-tracker -- --template react
cd lego-tracker
npm install
npm install firebase jsqr
```

Ordnerstruktur:
```
src/
  components/      # SetCard, StatusBadge, BottomNav
  screens/         # CollectionScreen, AddScreen, WishlistScreen, StatsScreen, InfoScreen
  hooks/           # useCollection
  services/        # firebase.js, rebrickable.js, setService.js
App.jsx
main.jsx
```

---

## Phase 2 – Firebase Setup

### 2.1 Firebase Projekt anlegen
1. https://console.firebase.google.com
2. Neues Projekt erstellen
3. Firestore Database aktivieren (Testmodus)
4. Web-App registrieren → Config kopieren

### 2.2 Config in Projekt einfügen

Datei: `src/services/firebase.js`
```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 2.3 Firestore Collection: `sets`

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

## Phase 3 – Rebrickable API

Datei: `src/services/rebrickable.js`

- `fetchSet(setNumber)` → Set-Daten (Name, Bild, Teile, Theme-ID)
- `fetchThemeName(themeId)` → Theme-Name (z.B. "City", "Technic")

`.env.local`:
```
VITE_REBRICKABLE_KEY=dein_api_key_hier
```

---

## Phase 4 – Echte Daten (Firestore)

Hook `useCollection`: onSnapshot auf Collection `sets`, sortiert nach `createdAt desc`.

`setService.js`:
- `addSet({ setNumber, name, image, parts, theme, themeName, status })`
- `updateSetStatus(id, status)`
- `deleteSet(id)`

---

## Phase 5 – iOS UI Redesign

- Header: blauer Gradient, gelber FAB-Button (+) oben rechts
- Stats-Dashboard: 2×2 Grid (Gesamt Sets, Gesamt Teile, Wunschliste, OVP-Ratio)
- Filter-Chips: Sammlung / Auf Wunschliste / Gebaut
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
- Touch-Events auf SetCard
- Links wischen → roter Löschen-Button (80px) erscheint
- Snap-Mechanismus: öffnet/schließt bei >36px Swipe
- Löschen direkt aus Firestore

**Theme-Anzeige:**
- `fetchThemeName(themeId)` beim Set-Preview aufrufen
- `themeName` in Firestore speichern
- Anzeige in SetCard: `60478-1 · City`

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
