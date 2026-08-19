import { useEffect, useState } from "react";

/**
 * Laedt den Set-Katalog aus public/catalog/.
 *
 * Bewusst erst beim Oeffnen der Ansicht und nicht als Import ins Bundle:
 * das JS-Bundle liegt schon bei 735 KB. Der Katalog sind ~18 KB gzip, aber
 * sie belasten so nur den, der ihn auch aufschlaegt.
 *
 * Anders als die Wellen braucht der Katalog keinen einzigen
 * Rebrickable-Aufruf — Name, Teilezahl und Bild stehen bereits im Dump.
 */

let cache = null;          // { themes, years, sets }
let inflight = null;

const base = import.meta.env.BASE_URL;   // Deploy liegt unter /lego-tracker/

async function loadCatalog() {
  const index = await fetch(`${base}catalog/index.json`).then((r) => {
    if (!r.ok) throw new Error(`Katalog-Index nicht ladbar (HTTP ${r.status})`);
    return r.json();
  });

  const years = await Promise.all(
    index.years.map((y) =>
      fetch(`${base}catalog/${y.file}`).then((r) => {
        if (!r.ok) throw new Error(`${y.file} nicht ladbar (HTTP ${r.status})`);
        return r.json();
      })
    )
  );

  return {
    themes: index.themes ?? [],
    source: index.source,
    generated_at: index.generated_at,
    years: index.years.map((y) => y.year),
    sets: years.flatMap((y) => y.sets),
  };
}

export function useCatalog() {
  const [data, setData]   = useState(cache);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    inflight ??= loadCatalog();
    inflight
      .then((result) => {
        cache = result;
        if (!cancelled) { setData(result); setLoading(false); }
      })
      .catch((err) => {
        inflight = null;   // naechster Versuch darf neu laden
        if (!cancelled) { setError(err.message); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
