# Changelog

Nennenswerte Änderungen, neueste zuerst.

Das Projekt führt keine Versionsnummern: jeder Merge auf `main` wird automatisch
nach GitHub Pages deployt. Die Abschnitte sind deshalb nach dem Tag des Merges
benannt. Wo sich ein Eintrag eindeutig einem Pull Request zuordnen ließ, steht
dessen Nummer dahinter; für die älteren Einträge ist das aus der Historie nicht
zweifelsfrei rekonstruierbar.

Die wöchentlichen Commits `Katalog-Sync <Datum>` stehen hier nicht einzeln —
sie ändern nur Katalogdaten, keinen Code.

---

## 2026-09-14

### Geändert
- **Katalog: „Neu am" filtert wieder genau einen Lauf.** Die kumulative
  Auslegung („seit diesem Lauf und alles danach") war irreführend: ein Set vom
  jüngsten Lauf tauchte in jeder Auswahl auf. Mehrere Chips lassen sich wieder
  kombinieren, in der URL als `neuam=<datum>,<datum>`. (#16)
- **Teilezahl wird nachgeladen, wenn sie beim Anlegen fehlte.** Angekündigte
  Sets stehen bei Rebrickable mit 0 Teilen im Dump; bisher blieb ein so
  angelegtes Set dauerhaft bei 0. Das Detail-Sheet fragt jetzt beim Öffnen
  einmal nach und speichert das Ergebnis. Bei bekannter Teilezahl läuft kein
  Abruf. (#16)
- **Der Tab „Neuheiten" heißt „Katalog"** und zeigt ihn direkt, ohne Umschalter.
  Die Tab-id bleibt `neuheiten`, damit geteilte `?tab=`-Links weiter
  funktionieren. (#16)

### Behoben
- Schlug das Speichern auf die Wunschliste **aus dem Katalog heraus** fehl, sah
  man davon nichts: die Fehlermeldung hing in der Wellen-Ansicht. Sie sitzt
  jetzt im Tab. (#16)

### Entfernt
- **Wellen-Ansicht.** Ihre Daten (`src/data/newReleases.json`) wurden von Hand
  gepflegt und standen seit dem 19.08. still — 10 Sets in 3 Wellen, von denen
  nur eine kuratierte Sets hatte. Der Katalog entsteht dagegen wöchentlich neu
  und führt über 400 Sets. Mit entfallen: `NewReleasesScreen`,
  `useRebrickableSets`, `scripts/checkReleases.mjs`, das npm-Script
  `check:releases` und die zugehörigen Schritte in `ci.yml` und `deploy.yml`.
  Bundle: 751 → 740 KB. (#16)

---

## 2026-09-13

### Hinzugefügt
- **Katalog: Filterreihe „Neu am"** — welcher Sync-Lauf hat das Set gebracht?
  Der Rebrickable-Dump kennt nur das Erscheinungsjahr, neue Sets kommen über
  das Jahr verteilt dazu und gingen zwischen hunderten Jahrgangs-Sets unter.
  Der Sync stempelt dafür jedes Set mit `first_seen`; die Reihe zeigt die
  letzten vier Läufe. (#15)
- **Katalog: Sortierung „Neueste"** — Laufdatum absteigend, für alles, was
  weiter zurückliegt als die vier Chips. (#15)
- **`backfill-first-seen.mjs`** trägt `first_seen` einmalig aus der
  Git-Historie nach: jeder Sync ist ein Commit auf `public/catalog`. Ergab 24
  Sets auf vier Läufe; der Erstimport bleibt bewusst ohne Datum. (#15)
- **Wunsch-Sets direkt als gekauft markieren.** Das Detail-Sheet zeigt bei
  Wunsch-Sets „In OVP" und „Schon gebaut" statt des Cycle-Buttons — vorher
  führte aus `wishlist` nur eine Kante nach `built`, ein gerade gekauftes,
  noch verpacktes Set ging also den Umweg über „Gebaut". Dazu der Rückweg auf
  die Wunschliste, den es gar nicht gab. (#14)

---

## 2026-09-12

### Hinzugefügt
- Katalog-Sync läuft wöchentlich als GitHub Action und deployt automatisch;
  Preise überleben einen Ausfall der BrickSet-API, statt stillschweigend
  gelöscht zu werden; Warnung vor doppelt erfassten Sets. (#13)

---

## 2026-08-19

### Hinzugefügt
- **Katalog-Ansicht**: Sets aus dem Rebrickable-CSV-Dump durchsuchen, filtern
  und auf die Wunschliste setzen.
- **Katalog-Sync** (`scripts/syncCatalog.mjs`) erzeugt `public/catalog/` aus dem
  Dump; UVP-Preise kommen von BrickSet dazu.
- Preisfilter und Sortierung nach Preis im Katalog.
- Neuheiten-Ansicht mit kuratierten Wellen — *am 2026-09-14 wieder entfernt.*

### Geändert
- Themes ohne Sammelwert (Gear, Bücher, Sammelfiguren und weitere) und
  Nicht-Sets fliegen aus dem Katalog; Suche ignoriert Diakritika, damit
  „pokemon" auch „Pokémon" findet.

---

## 2026-08-17

### Geändert
- Design-System-Refresh: zentrale Tokens in `src/styles/tokens.css`,
  Mono-Mikrolabels, Status-Rails. Die alte Birchline-Palette (`--clay`,
  `--oat`, `--gray-*`) ist damit abgelöst.

---

## 2026-07-24

### Geändert
- UI-Redesign: warmer Papierlook, Fraunces als Display-Schrift.

---

## 2026-05-09 und früher

Birchline Design System, Lucide-Icon-System, Filter-Redesign — und davor die
Phasen 1 bis 10: Projekt-Setup, Firebase, Rebrickable, Echtzeit-Sync, iOS-UI,
QR-Scanner, Swipe-to-Delete, GitHub-Pages-Deployment und die BrickSet-Preise.

Details dazu in [`docs/fahrplan.md`](docs/fahrplan.md).
