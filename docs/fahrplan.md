# 🧱 LEGO Tracker – Projektfahrplan

## Übersicht

| Phase | Thema | Status |
|-------|-------|--------|
| 1 | Projekt Setup (React + Vite) | ✅ Fertig |
| 2 | Firebase Setup | ✅ Fertig |
| 3 | Rebrickable API anbinden | ✅ Fertig |
| 4 | Echte Daten statt Mock-Daten | ✅ Fertig |
| 5 | UI ausbauen | 🔄 In Arbeit |
| 6 | GitHub Repository | ⬜ Offen |
| 7 | Deployment (Firebase Hosting) | ⬜ Offen |

---

## Phase 1 – Projekt Setup

```bash
npm create vite@latest lego-tracker -- --template react
cd lego-tracker
npm install
npm install firebase axios
```

Ordnerstruktur:
```
src/
  components/      # UI-Komponenten
  screens/         # Tab-Screens
  hooks/           # Custom Hooks (useCollection, useFirestore)
  services/        # Firebase, Rebrickable API
  assets/
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
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // ... rest der Config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 2.3 Firestore Collection: `sets`

Dokument-Struktur:
```json
{
  "setNumber": "42115-1",
  "name": "Lamborghini Sián FKP 37",
  "image": "https://...",
  "theme": "Technic",
  "parts": 3696,
  "status": "built",
  "createdAt": "timestamp"
}
```

---

## Phase 3 – Rebrickable API

### 3.1 API Key holen
→ https://rebrickable.com/api/ → Account → API Key generieren

### 3.2 Set-Daten abrufen

Datei: `src/services/rebrickable.js`
```js
const API_KEY = import.meta.env.VITE_REBRICKABLE_KEY;
const BASE = "https://rebrickable.com/api/v3/lego";

export async function fetchSet(setNumber) {
  const id = setNumber.includes("-") ? setNumber : `${setNumber}-1`;
  const res = await fetch(`${BASE}/sets/${id}/`, {
    headers: { Authorization: `key ${API_KEY}` }
  });
  if (!res.ok) throw new Error("Set nicht gefunden");
  return res.json();
}
```

Rückgabe enthält: `name`, `num_parts`, `set_img_url`, `theme_id`

### 3.3 .env Datei

```
VITE_REBRICKABLE_KEY=dein_api_key_hier
```

---

## Phase 4 – Echte Daten (Firestore)

### Hook: useCollection

Datei: `src/hooks/useCollection.js`
```js
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

export function useCollection() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "sets"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setSets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { sets, loading };
}
```

### Set hinzufügen

```js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { fetchSet } from "./rebrickable";

export async function addSet(setNumber, status = "built") {
  const data = await fetchSet(setNumber);
  await addDoc(collection(db, "sets"), {
    setNumber: data.set_num,
    name: data.name,
    image: data.set_img_url,
    parts: data.num_parts,
    theme: data.theme_id,
    status,
    createdAt: serverTimestamp(),
  });
}
```

---

## Phase 5 – UI ausbauen

Offene Punkte:
- [ ] Set-Detail Screen (vollständig)
- [ ] Status ändern (built / boxed / wishlist)
- [ ] Set löschen (Swipe oder Longpress)
- [ ] Suche / Filter in der Liste
- [ ] Statistik Screen mit echten Daten
- [ ] Wunschliste → Sammlung verschieben
- [ ] Ladestate & Fehlermeldungen
- [ ] Empty States (keine Sets)
- [] add Suchfunktion (damit man Sets ohne Nummer hinzufuegen kann (aber wie soll das gehen?))
---

## Phase 6 – Deployment

### Firebase Hosting einrichten

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

Einstellungen:
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub Actions: Optional

### Build & Deploy

```bash
npm run build
firebase deploy
```

App ist danach erreichbar unter:
`https://DEIN-PROJEKT.web.app`

---

## Empfohlene Reihenfolge

1. `npm create vite` → Projekt anlegen
2. Firebase Console → Projekt + Firestore
3. Rebrickable Account → API Key
4. `.env` Datei anlegen
5. `firebase.js` + `rebrickable.js` Services bauen
6. `useCollection` Hook integrieren
7. UI mit echten Daten verdrahten
8. Testen auf iPhone (Safari Dev Tools)
9. `firebase deploy`

---

## Nächster Schritt

Sag mir, womit du anfangen möchtest – ich generiere dann den konkreten Code dafür.
