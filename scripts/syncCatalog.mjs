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
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fetchPrices } from "./fetchPrices.mjs";

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
const EXCLUDED_THEMES = new Set([
  "Gear",                    // Crocs-Jibbitz, Schluesselanhaenger, Textilien
  "Books",                   // DK-Lesebuecher
  "Collectible Minifigures", // Blindtueten und Einzelfiguren, kein Bausatz
  "LEGO Brand Store",        // Store-Deko und Events, nicht reguleaer kaufbar
  "Promotional",             // Beigaben und Aktionsware
  "Educational and Dacta",   // Schulmaterial ueber Sonderkanaele
  "Power Functions",         // Motoren und Netzteile, keine Sets
  "FIRST LEGO League",       // Wettbewerbskits
  "LEGO Exclusive",          // Mitarbeiter- und Anlassware
  "Legoland Parks",          // Parkexklusives

  // Ab hier: nicht "keine Sets", sondern schlicht nicht gesammelt.
  "Friends",
  "Ninjago",
  "Harry Potter",
  "Duplo",
  "Minecraft",
  "Brickheadz",
  "Jurassic World",
  "Dreamzzz",
  "Gabby's Dollhouse",
  "Animal Crossing",
  "Wednesday",
  "KPop Demon Hunters",
]);

/**
 * Setnummern ohne fuehrende Ziffer sind keine reguleaeren Sets.
 * Rebrickable vergibt sie fuer Polybags und Zeitschriftenbeilagen
 * ("L0002220-1 Police on Snowmobile") sowie fuer Katalog-Artefakte
 * ("DATABASE-2026 Unused Parts Database Set", "Pick-a-Brick-2026").
 * Alle 69 Eintraege dieser Art haben keinen Preis und meist unter 100 Teile.
 */
const REGULAR_SET_NUM = /^\d/;
const ATTRIBUTION = "Daten von Rebrickable.com";
const PRICE_SOURCE = "UVP von Brickset.com";

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
  .filter(({ raw, path }) =>
    !EXCLUDED_THEMES.has(path[0]) && REGULAR_SET_NUM.test(raw.set_num))
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
      theme_id: Number(s.theme_id) || null,
      img: s.img_url || null,
    };
  })
  .sort((a, b) =>
    b.year - a.year ||
    (a.theme ?? "").localeCompare(b.theme ?? "", "de") ||
    a.set_num.localeCompare(b.set_num)
  );

// UVP dazuholen. Ohne Key laeuft der Sync trotzdem durch — der Katalog ist
// auch ohne Preise brauchbar, und ein fehlendes Secret soll nicht den
// ganzen Lauf kippen.
const apiKey = process.env.BRICKSET_API_KEY;
const catalogYears = [...new Set(sets.map((s) => s.year))].sort();
let prices = new Map();
let priceError = null;

if (!apiKey) {
  console.log("  BRICKSET_API_KEY nicht gesetzt — kein Preisabruf.");
} else {
  try {
    prices = await fetchPrices(apiKey, catalogYears);
  } catch (err) {
    // Ein Ausfall bei BrickSet darf die Rebrickable-Daten nicht verhindern.
    priceError = err.message;
    console.log(`  BrickSet nicht erreichbar (${err.message}) — kein Preisabruf.`);
  }
}

/**
 * Den Katalog des letzten Laufs einlesen, Set-Nummer auf Datensatz.
 *
 * Zwei Dinge haengen daran: die Preise (siehe unten) und `first_seen`.
 * Gelesen wird jede vorhandene Jahresdatei, nicht nur die der aktuellen
 * Jahrgaenge — ein Set kann im Dump das Jahr wechseln und waere sonst
 * ploetzlich wieder ein Neuzugang.
 */
function previousSets() {
  const map = new Map();
  const files = existsSync(OUT_DIR)
    ? readdirSync(OUT_DIR).filter((f) => /^\d{4}\.json$/.test(f))
    : [];
  for (const file of files) {
    try {
      for (const s of JSON.parse(readFileSync(join(OUT_DIR, file), "utf8")).sets ?? []) {
        map.set(s.set_num, s);
      }
    } catch {
      // Kaputte Datei aus einem frueheren Lauf: dann eben ohne Altbestand.
    }
  }
  return map;
}

const previous = previousSets();

/**
 * Preise aus dem letzten Lauf uebernehmen.
 *
 * Ohne das waere ein Ausfall bei BrickSet stille Datenloeschung: die
 * Preis-Map bliebe leer, jeder Satz bekaeme uvp_eur null, und der Lauf
 * wuerde das als Erfolg committen. Also gilt — nur wenn wir frische Daten
 * haben, ersetzen wir; sonst behalten wir die alten.
 */
function previousPrices() {
  const map = new Map();
  for (const [set_num, s] of previous) {
    if (s.uvp_eur != null) map.set(set_num, s.uvp_eur);
  }
  return map;
}

const pricesUsable = apiKey && !priceError;
const fallback = pricesUsable ? null : previousPrices();

if (!pricesUsable) {
  console.log(fallback.size
    ? `  ${fallback.size} Preise aus dem letzten Lauf uebernommen.`
    : "  Kein Altbestand vorhanden — Katalog ohne Preise.");
}

for (const s of sets) {
  s.uvp_eur = pricesUsable
    ? (prices.get(s.set_num) ?? null)
    : (fallback.get(s.set_num) ?? null);
}

mkdirSync(OUT_DIR, { recursive: true });

const byYear = new Map();
for (const s of sets) {
  if (!byYear.has(s.year)) byYear.set(s.year, []);
  byYear.get(s.year).push(s);
}

const generated_at = new Date().toISOString().slice(0, 10);

/**
 * `first_seen`: mit welchem Lauf ist das Set in den Katalog gekommen?
 *
 * Der Dump kennt nur das Erscheinungsjahr, und Rebrickable traegt neue
 * Sets ueber das ganze Jahr verteilt nach. Ohne diesen Stempel gehen die
 * paar Neuzugaenge eines Laufs zwischen hunderten Jahrgangs-Sets unter.
 *
 * null heisst "war schon da, bevor mitgeschrieben wurde" — beim allerersten
 * Lauf bekommt niemand ein Datum, sonst stuende der komplette Katalog als
 * Neuzugang da.
 */
for (const s of sets) {
  s.first_seen = previous.has(s.set_num)
    ? (previous.get(s.set_num).first_seen ?? null)
    : (previous.size ? generated_at : null);
}

const newcomers = sets.filter((s) => s.first_seen === generated_at).length;

const years = [...byYear.keys()].filter((y) => byYear.get(y).length > 0).sort((a, b) => b - a);

for (const year of years) {
  const list = byYear.get(year);
  writeFileSync(
    join(OUT_DIR, `${year}.json`),
    JSON.stringify({
      source: ATTRIBUTION,
      price_source: sets.some((x) => x.uvp_eur != null) ? PRICE_SOURCE : null,
      generated_at, year, sets: list,
    }, null, 1) + "\n"
  );
}

const themes = [...new Set(sets.map((s) => s.theme).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
writeFileSync(
  join(OUT_DIR, "index.json"),
  JSON.stringify({
    source: ATTRIBUTION,
    price_source: sets.some((x) => x.uvp_eur != null) ? PRICE_SOURCE : null,
    generated_at,
    min_year: MIN_YEAR,
    themes,
    years: years.map((y) => ({ year: y, count: byYear.get(y).length, file: `${y}.json` })),
  }, null, 1) + "\n"
);

const unknownParts = sets.filter((s) => s.parts === null).length;
console.log(`✓ ${sets.length} Sets ab ${MIN_YEAR}, ${years.length} Jahrgang/Jahrgaenge, ${themes.length} Themes`);
console.log(`  davon ohne Teilezahl: ${unknownParts}`);
const withPrice = sets.filter((s) => s.uvp_eur != null).length;
console.log(`  mit UVP: ${withPrice}${priceError ? " (BrickSet-Abruf fehlgeschlagen)" : ""}`);
console.log(previous.size
  ? `  neu in diesem Lauf: ${newcomers}`
  : "  Erstlauf ohne Altbestand — kein Set als Neuzugang markiert.");

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
