/**
 * Filter- und Tab-Zustand in den Query-Params.
 *
 * Die App hat keinen Router — Navigation ist ein useState in App.jsx.
 * Für einen teilbaren, reload-festen Blick reicht die History-API:
 * replaceState statt pushState, damit Filterklicks nicht den
 * Zurück-Button vollmüllen.
 *
 * Der Tab gehört mit in die URL. Ohne ihn landet ein geteilter Link auf
 * der Sammlung, und die Filter-Params hängen verwaist daneben.
 */

/** Mehrfachauswahl steht als Komma-Liste in einem Param. */
export function readList(params, key) {
  const raw = params.get(key);
  if (!raw) return [];
  return raw.split(",").map((v) => v.trim()).filter(Boolean);
}

export function readParams() {
  return new URLSearchParams(window.location.search);
}

/**
 * Schreibt die übergebenen Schlüssel; leere Werte fliegen raus, damit die
 * URL bei "kein Filter aktiv" wieder saubere Adresse ist.
 */
export function writeParams(next) {
  const params = readParams();
  for (const [key, value] of Object.entries(next)) {
    const empty = value == null || value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (empty) params.delete(key);
    else params.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const query = params.toString();
  window.history.replaceState(
    null, "",
    query ? `${window.location.pathname}?${query}` : window.location.pathname
  );
}
