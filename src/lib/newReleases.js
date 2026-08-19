import data from "../data/newReleases.json";

/**
 * Kuratierte Neuheiten-Metadaten.
 *
 * Datenhoheit: diese Datei liefert nur, was Rebrickable nicht hat —
 * uvp_eur, eol_date, release_date, note, wave, region_note.
 * Name, Bild und Teilezahl kommen zur Laufzeit über set_num aus der
 * bestehenden Rebrickable-Integration; `pieces` hier ist nur Fallback,
 * falls Rebrickable ein brandneues Set noch nicht kennt.
 */
export const NEW_RELEASES = data.sets;

/** Set-Nummern in JSON-Reihenfolge — Join-Key für Rebrickable. */
export const RELEASE_SET_NUMS = data.sets.map((s) => s.set_num);

/**
 * Wellen, absteigend nach release_date.
 * Wellen ohne kuratierte Sets fallen raus — ein leerer Filterchip wäre
 * nur eine Sackgasse. `curated` vs. `total` macht sichtbar, dass die
 * Liste ein Auszug ist und nicht die komplette Welle.
 */
export const WAVES = data.waves
  .map((w) => ({
    ...w,
    curated: data.sets.filter((s) => s.wave === w.id).length,
    total: w.total_sets_all_themes,
  }))
  .filter((w) => w.curated > 0)
  .sort((a, b) => b.release_date.localeCompare(a.release_date));

/** Themes dynamisch aus den Daten, alphabetisch. */
export const THEMES = [...new Set(data.sets.map((s) => s.theme))]
  .sort((a, b) => a.localeCompare(b, "de"));

/**
 * "Sommerwelle Juni 2026" -> "Juni 2026".
 * Aus release_date abgeleitet statt aus dem Label geschnitten: das Label
 * ist freier Text, das Datum nicht.
 */
export function waveShortLabel(wave) {
  const d = new Date(`${wave.release_date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return wave.label;
  return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

/** "2027-12-31" -> "EOL 12/2027" */
export function formatEol(eolDate) {
  if (!eolDate) return null;
  const [year, month] = eolDate.split("-");
  return `EOL ${month}/${year}`;
}

/**
 * Rebrickable liefert "60509-1", die Sammlung speichert mal mit und mal
 * ohne Variantensuffix. Für den Abgleich beides auf die nackte Nummer
 * bringen, sonst greift die Dublettenerkennung nicht.
 */
export function normalizeSetNum(setNumber) {
  return String(setNumber ?? "").trim().split("-")[0];
}
