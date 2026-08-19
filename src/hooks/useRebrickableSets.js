import { useEffect, useState } from "react";
import { fetchSet } from "../services/rebrickable";

/**
 * Lädt Name, Bild und Teilezahl für eine Liste von Set-Nummern.
 *
 * Rebrickable v3 hat keinen Batch-Endpoint für mehrere set_num, also bleibt
 * nur ein Call pro Set. Deshalb zwei Bremsen gegen das Rate-Limit:
 * ein Cache über den Modul-Scope hinaus (sessionStorage, überlebt Tabwechsel
 * und Reload) und sequentielle Abfrage mit Pause statt paralleler Flut.
 *
 * Fehler pro Set werden geschluckt und als Fehlschlag gemerkt: brandneue
 * Sets kennt Rebrickable oft noch nicht (404), und ein einzelner 404 darf
 * den Screen nicht kippen. Die Karte fällt dann auf die JSON-Werte zurück.
 */

const STORAGE_KEY = "rb-set-cache-v1";
const REQUEST_GAP_MS = 260;

const cache = new Map(Object.entries(readStorage()));

// Laufende Abrufe pro Set-Nummer. Ohne das holen zwei gleichzeitige
// Effekt-Durchlaeufe — StrictMode im Dev, schneller Tabwechsel in Produktion —
// dasselbe Set doppelt und verbrennen Rate-Limit fuer nichts.
const inflight = new Map();

function readStorage() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(cache)));
  } catch {
    // sessionStorage voll oder gesperrt — Cache bleibt dann nur im Speicher.
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Abruf mit Dubletten-Schutz: parallele Anfragen teilen sich ein Promise. */
function load(setNum) {
  if (!inflight.has(setNum)) {
    inflight.set(setNum, fetchSet(setNum).finally(() => inflight.delete(setNum)));
  }
  return inflight.get(setNum);
}

export function useRebrickableSets(setNums) {
  const key = setNums.join(",");
  const [entries, setEntries] = useState(() => Object.fromEntries(cache));
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const missing = setNums.filter((n) => !cache.has(n) && !inflight.has(n));

    if (missing.length === 0) {
      setPending(0);
      return;
    }

    setPending(missing.length);

    (async () => {
      for (let i = 0; i < missing.length; i++) {
        if (cancelled) return;
        const setNum = missing[i];
        if (cache.has(setNum)) continue;   // inzwischen von anderer Runde geholt
        try {
          const data = await load(setNum);
          cache.set(setNum, {
            name: data.name ?? null,
            image: data.set_img_url ?? null,
            parts: data.num_parts ?? null,
            // themeId und year braucht der Wunschlisten-Import, damit der
            // Firestore-Datensatz dasselbe Schema hat wie beim Hinzufügen
            // über den Suchen-Screen.
            themeId: data.theme_id ?? null,
            year: data.year ?? null,
          });
        } catch {
          // Unbekannt oder Abruf gescheitert — als Fehlschlag merken, damit
          // derselbe Call nicht bei jedem Render erneut rausgeht.
          cache.set(setNum, null);
        }
        if (cancelled) return;
        setEntries(Object.fromEntries(cache));
        setPending(missing.length - i - 1);
        if (i < missing.length - 1) await sleep(REQUEST_GAP_MS);
      }
      persist();
    })();

    return () => { cancelled = true; };
    // setNums ist bei jedem Render ein neues Array; über den Join
    // vergleichen, sonst läuft der Effekt endlos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { entries, pending };
}
