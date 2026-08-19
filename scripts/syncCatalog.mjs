#!/usr/bin/env node
/**
 * Baut den Set-Katalog aus dem Rebrickable-CSV-Dump.
 *
 * Datenquelle: https://rebrickable.com/downloads/ — die CSVs duerfen
 * automatisiert geladen werden, hoechstens einmal taeglich, unter Nennung
 * von Rebrickable als Quelle. Scraping der Webseiten ist untersagt; dieses
 * Skript laedt ausschliesslich die bereitgestellten Dateien.
 *
 * Ergebnis: public/catalog/<jahr>.json + index.json + themes.json.
 * Bewusst nach public/ statt als Import ins Bundle — der Katalog wird nur
 * geladen, wenn er geoeffnet wird, und belastet die uebrigen Screens nicht.
 *
 * Aufruf:
 *   node scripts/syncCatalog.mjs                 # laedt von Rebrickable
 *   node scripts/syncCatalog.mjs --from <dir>    # nutzt lokale CSVs (Test)
 */
import { gunzipSync } from "node:zlib";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE      = "https://cdn.rebrickable.com/media/downloads";
const OUT_DIR   = "public/catalog";
const MIN_YEAR  = 2026;

/**
 * Der Dump enthaelt nicht nur Bausets. "Gear" sind Crocs-Jibbitz,
 * Schluesselanhaenger und Textilien, "Books" sind DK-Lesebuecher.
 * Zusammen 528 der 1304 Eintraege ab 2026 — und 504 der 609 ohne
 * Teilezahl. In einem Tool, in dem man Sets auf die Wunschliste setzt,
 * haben sie nichts verloren.
 */
const EXCLUDED_THEMES = new Set(["Gear", "Books"]);
const ATTRIBUTION = "Daten von Rebrickable.com";

/** CSV-Zeilenparser mit Anfuehrungszeichen — Set-Namen enthalten Kommas. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...rest] = rows;
  return rest
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

async function load(name, fromDir) {
  if (fromDir) return readFileSync(join(fromDir, name.replace(/\.gz$/, "")), "utf8");
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8");
}

/** "" und "0" sind bei Rebrickable "unbekannt", nicht der Wert null. */
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const fromIdx = process.argv.indexOf("--from");
const fromDir = fromIdx > -1 ? process.argv[fromIdx + 1] : null;

const [setsCsv, themesCsv] = await Promise.all([
  load("sets.csv.gz", fromDir),
  load("themes.csv.gz", fromDir),
]);

const themeRows = parseCsv(themesCsv);
const themeById = new Map(themeRows.map((t) => [t.id, t]));

/** Theme-Pfad aufloesen: "Star Wars" > "Ultimate Collector Series". */
function themePath(id) {
  const chain = [];
  let cur = themeById.get(id);
  const seen = new Set();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    chain.unshift(cur.name);
    cur = cur.parent_id ? themeById.get(cur.parent_id) : null;
  }
  return chain;
}

const sets = parseCsv(setsCsv)
  .filter((s) => Number(s.year) >= MIN_YEAR)
  .map((s) => ({ raw: s, path: themePath(s.theme_id) }))
  .filter(({ path }) => !EXCLUDED_THEMES.has(path[0]))
  .map(({ raw: s, path }) => {
    return {
      set_num: s.set_num,
      name: s.name,
      year: Number(s.year),
      // parts null heisst "noch unbekannt": angekuendigte Sets stehen im
      // Dump mit 0 Teilen, das ist keine Teilezahl.
      parts: num(s.num_parts),
      theme: path[0] ?? null,
      subtheme: path.length > 1 ? path[path.length - 1] : null,
      img: s.img_url || null,
    };
  })
  .sort((a, b) =>
    b.year - a.year ||
    (a.theme ?? "").localeCompare(b.theme ?? "", "de") ||
    a.set_num.localeCompare(b.set_num)
  );

mkdirSync(OUT_DIR, { recursive: true });

const byYear = new Map();
for (const s of sets) {
  if (!byYear.has(s.year)) byYear.set(s.year, []);
  byYear.get(s.year).push(s);
}

const generated_at = new Date().toISOString().slice(0, 10);
const years = [...byYear.keys()].sort((a, b) => b - a);

for (const year of years) {
  const list = byYear.get(year);
  writeFileSync(
    join(OUT_DIR, `${year}.json`),
    JSON.stringify({ source: ATTRIBUTION, generated_at, year, sets: list }, null, 1) + "\n"
  );
}

const themes = [...new Set(sets.map((s) => s.theme).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
writeFileSync(
  join(OUT_DIR, "index.json"),
  JSON.stringify({
    source: ATTRIBUTION,
    generated_at,
    min_year: MIN_YEAR,
    themes,
    years: years.map((y) => ({ year: y, count: byYear.get(y).length, file: `${y}.json` })),
  }, null, 1) + "\n"
);

const unknownParts = sets.filter((s) => s.parts === null).length;
console.log(`✓ ${sets.length} Sets ab ${MIN_YEAR}, ${years.length} Jahrgang/Jahrgaenge, ${themes.length} Themes`);
console.log(`  davon ohne Teilezahl: ${unknownParts}`);

// Verteilung mitloggen: der Dump enthaelt neben Bausets auch Gear, Buecher
// und nicht inventarisierte Polybags. Ohne die Aufschluesselung laesst sich
// nicht entscheiden, was in den Katalog gehoert.
const byTheme = new Map();
for (const s of sets) {
  const k = s.theme ?? "(ohne Theme)";
  const e = byTheme.get(k) ?? { total: 0, ohneTeile: 0 };
  e.total++;
  if (s.parts === null) e.ohneTeile++;
  byTheme.set(k, e);
}
console.log("\n  Themes nach Groesse:");
for (const [name, e] of [...byTheme].sort((a, b) => b[1].total - a[1].total)) {
  console.log(`    ${String(e.total).padStart(5)}  ${String(e.ohneTeile).padStart(5)} ohne Teile  ${name}`);
}
for (const y of years) console.log(`  ${y}: ${byYear.get(y).length}`);
