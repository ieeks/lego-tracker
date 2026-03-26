# 🧱 LEGO Sammlung Tracker

Eine mobile-first Web-App zur Verwaltung und Nachverfolgung einer privaten LEGO-Sammlung.

Erstellt mit React und Firebase, Datenquelle ist die Rebrickable API.

---

## ✨ Funktionen

- 🔍 Suche nach LEGO Sets über die Set-Nummer
- 🖼️ Automatisches Laden von Set-Daten (Bild, Name, etc.)
- ➕ Hinzufügen zur Sammlung oder Wunschliste
- 📦 Verwaltung des Status:
  - ✅ Gebaut
  - 📦 Ungeöffnet
  - ❤️ Wunschliste
- 📊 Statistikübersicht (Sets, Teile, Statusverteilung)
- 📱 Optimiert für iPhone und iPad

---

## 🚀 Technologie-Stack

- Frontend: React (Vite)
- Backend: Firebase (Firestore)
- API: Rebrickable
- Hosting: Firebase Hosting

---

## 🧠 Funktionsweise

1. Eingabe einer LEGO Set-Nummer
2. Daten werden über Rebrickable geladen
3. Set kann:
   - zur Sammlung hinzugefügt werden
   - oder zur Wunschliste gespeichert werden
4. Speicherung erfolgt in Firestore
5. Anzeige im Grid mit Status

---

## 🧭 Navigation

- 🏠 Sammlung
- ➕ Hinzufügen
- ❤️ Wunschliste
- 📊 Statistik
- ℹ️ Info

---

## 📊 Statistik

- Anzahl Sets
- Gesamtteile
- Statusverteilung (gebaut / ungeöffnet)
- Erweiterbar um Wert, Themen etc.

---

## ℹ️ Info

- App-Informationen
- Datenverwaltung (Export, Reset)
- API-Hinweise (Rebrickable)

---

## ⚙️ Setup

1. Repo klonen
2. npm install
3. Firebase konfigurieren
4. Rebrickable API Key einfügen
5. npm run dev

---

## ☁️ Deployment

firebase deploy

---

## 📦 Datenstruktur (Firestore)

```json
{
  "setNumber": "42115-1",
  "name": "Lamborghini Sián FKP 37",
  "image": "https://...",
  "theme": 1,
  "status": "built", 
  "createdAt": "timestamp"
}
```
