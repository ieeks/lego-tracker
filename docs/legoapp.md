# 🧠 LEGO Tracker – Internal Context

## 🎯 Projektziel

Mobile-first Web-App zur Verwaltung einer privaten LEGO-Sammlung inklusive Wunschliste.

Ziel:
- Schnelle Erfassung von Sets
- Visuell ansprechende Darstellung
- Minimaler Aufwand für den Nutzer

---

## 🧱 Core Features

### MVP
- Sets über Setnummer hinzufügen
- Daten von Rebrickable laden
- Speicherung in Firebase Firestore
- Anzeige im Grid

---

## 🔥 Aktuelle Features

### Status System

Statuswerte:
- built
- boxed
- wishlist

UI Darstellung:
- built → grüner Haken
- boxed → neutrales Badge
- wishlist → Herzsymbol

---

### Wishlist

- Eigener Tab in Navigation
- Separate Anzeige von Wunsch-Sets
- Später: Move → Sammlung

---

### Navigation

Bottom Navigation:

- 🏠 Sammlung
- ➕ Hinzufügen
- ❤️ Wishlist
- 📊 Statistik
- ℹ️ Info

---

## 📊 Statistik Screen

Ziel:
Visuelles Dashboard (kein Excel Look)

Inhalte:
- Anzahl Sets
- Gesamtteile
- Statusverteilung (built / boxed)

Optional später:
- Wert der Sammlung
- meist vertretenes Theme
- teuerstes Set

---

## ℹ️ Info Screen

Inhalte:
- App Informationen
- Datenverwaltung (Reset, Export)
- API Hinweise

Optional:
- Dark Mode
- Einstellungen

---

## 🧠 Technische Entscheidungen

Frontend:
- React (Vite)
- Mobile-first
- Kein SSR

Backend:
- Firebase (kein eigener Server)

Datenbank:
- Firestore

API:
- Rebrickable

Grund:
Keine offizielle LEGO API verfügbar

---

## 📦 Firestore Struktur

Collection: sets

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
