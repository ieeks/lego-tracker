#!/usr/bin/env node
/**
 * Prüft src/data/newReleases.json, bevor sie ins Build geht.
 *
 * Die Daten werden von Hand recherchiert und aus Chat-Ausgaben übernommen —
 * genau dort entstehen die Fehler, die diese Prüfung fängt: vertippte
 * Feldnamen, Zahlen als String, eine Welle, die im waves-Block fehlt, eine
 * EOL-Prognose ohne Kennzeichnung als Schätzung.
 *
 * Exit 1 bei Fehlern, 0 bei Warnungen. Warnungen sind Dinge, die legitim
 * sein können, aber jemand angesehen haben sollte.
 */
import { readFileSync } from "node:fs";

// Pfad ueberschreibbar, damit die Pruefung selbst testbar ist.
const FILE = process.argv[2] ?? "src/data/newReleases.json";

const SET_KEYS = new Set([
  "set_num", "theme", "subtheme", "wave", "release_date", "uvp_eur", "age",
  "pieces", "minifigs", "eol_forecast", "confidence", "note", "region_note",
  "source",
]);
const REQUIRED = ["set_num", "theme", "wave", "release_date", "source"];
const CONFIDENCE = new Set(["confirmed", "estimated"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SET_NUM  = /^\d+-\d+$/;

const errors = [];
const warns  = [];
const err  = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);

const isValidDate = (v) => ISO_DATE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
/** null erlaubt; sonst muss es eine echte Zahl sein — "99.99" als String faellt durch. */
const numOrNull = (v) => v === null || (typeof v === "number" && Number.isFinite(v));

let data;
try {
  data = JSON.parse(readFileSync(FILE, "utf8"));
} catch (e) {
  console.error(`✗ ${FILE} ist kein gültiges JSON: ${e.message}`);
  process.exit(1);
}

// ---- Kopf ----------------------------------------------------------------
if (typeof data.schema_version !== "number") err("kopf", "schema_version fehlt oder ist keine Zahl");
if (!isValidDate(data.generated_at ?? "")) err("kopf", "generated_at fehlt oder ist kein YYYY-MM-DD");
if (!Array.isArray(data.waves) || data.waves.length === 0) err("kopf", "waves fehlt oder ist leer");
if (!Array.isArray(data.sets)) err("kopf", "sets fehlt");
if (errors.length) { report(); process.exit(1); }

// ---- Wellen --------------------------------------------------------------
const waveIds = new Set();
for (const w of data.waves) {
  const at = `welle ${w.id ?? "?"}`;
  if (!w.id) err(at, "id fehlt");
  else if (waveIds.has(w.id)) err(at, "doppelte Wellen-id");
  else waveIds.add(w.id);
  if (!w.label?.trim()) err(at, "label fehlt");
  if (!isValidDate(w.release_date ?? "")) err(at, "release_date ist kein gültiges YYYY-MM-DD");
  if (typeof w.total_sets_all_themes !== "number") err(at, "total_sets_all_themes ist keine Zahl");
}

const waveDate = Object.fromEntries(data.waves.map((w) => [w.id, w.release_date]));
const today = new Date().toISOString().slice(0, 10);

// ---- Sets ----------------------------------------------------------------
const seen = new Map();
for (const [i, s] of data.sets.entries()) {
  const at = `set ${s.set_num ?? `#${i}`}`;

  for (const key of Object.keys(s)) {
    if (!SET_KEYS.has(key)) err(at, `unbekanntes Feld "${key}" — Tippfehler?`);
  }
  for (const key of REQUIRED) {
    if (s[key] === undefined || s[key] === null || s[key] === "") err(at, `${key} fehlt`);
  }

  if (s.set_num && !SET_NUM.test(s.set_num)) {
    err(at, `set_num "${s.set_num}" nicht im Rebrickable-Format (z. B. "60509-1")`);
  }
  if (s.set_num) {
    if (seen.has(s.set_num)) err(at, `doppelte set_num, schon als #${seen.get(s.set_num)}`);
    else seen.set(s.set_num, i);
  }

  if (s.wave && !waveIds.has(s.wave)) err(at, `wave "${s.wave}" ist im waves-Block nicht deklariert`);

  if (!isValidDate(s.release_date ?? "")) {
    err(at, "release_date ist kein gültiges YYYY-MM-DD");
  } else {
    if (s.wave && waveDate[s.wave] && s.release_date !== waveDate[s.wave]) {
      warn(at, `release_date ${s.release_date} weicht von der Welle ab (${waveDate[s.wave]})`);
    }
    // Kein harter Fehler: ein angekuendigtes Set darf in der Zukunft liegen.
    // Das Schema hat kein Feld, das "gilt als erschienen" ausdrueckt.
    if (s.release_date > today) warn(at, `release_date ${s.release_date} liegt in der Zukunft`);
  }

  if (!numOrNull(s.uvp_eur)) err(at, `uvp_eur muss Zahl oder null sein, ist ${JSON.stringify(s.uvp_eur)}`);
  else if (s.uvp_eur !== null && s.uvp_eur <= 0) err(at, "uvp_eur muss größer als 0 sein");

  for (const key of ["pieces", "minifigs"]) {
    if (!numOrNull(s[key])) err(at, `${key} muss Zahl oder null sein, ist ${JSON.stringify(s[key])}`);
    else if (s[key] !== null && (s[key] < 0 || !Number.isInteger(s[key]))) {
      err(at, `${key} muss eine nicht-negative ganze Zahl sein`);
    }
  }
  // 0 ist zulaessig, bedeutet aber "unbekannt" — die UI rendert es als solches.
  if (s.pieces === 0) warn(at, "pieces 0 wird als „unbekannt“ gerendert, nicht als Teilezahl");

  if (s.eol_forecast != null) {
    if (!isValidDate(s.eol_forecast)) err(at, "eol_forecast ist kein gültiges YYYY-MM-DD");
    if (s.confidence !== "estimated") {
      err(at, 'eol_forecast ohne confidence "estimated" — Auslaufdaten sind nie bestätigt');
    }
  }
  if (s.confidence != null && !CONFIDENCE.has(s.confidence)) {
    err(at, `confidence muss "confirmed" oder "estimated" sein, ist ${JSON.stringify(s.confidence)}`);
  }

  for (const key of ["note", "region_note", "subtheme", "age"]) {
    if (s[key] != null && (typeof s[key] !== "string" || !s[key].trim())) {
      err(at, `${key} muss nicht-leerer String oder null sein`);
    }
  }
  if (typeof s.source !== "string" || !s.source.trim()) err(at, "source fehlt oder ist leer");
}

// Wellen ohne Sets erscheinen nicht im Screen — kein Fehler, aber gut zu wissen.
for (const id of waveIds) {
  if (!data.sets.some((s) => s.wave === id)) warn(`welle ${id}`, "keine Sets, wird im Screen ausgeblendet");
}

function report() {
  for (const w of warns)  console.warn(`⚠ ${w}`);
  for (const e of errors) console.error(`✗ ${e}`);
}

report();
if (errors.length) {
  console.error(`\n${errors.length} Fehler in ${FILE}.`);
  process.exit(1);
}
console.log(`✓ ${FILE}: ${data.sets.length} Sets, ${data.waves.length} Wellen, ${warns.length} Warnung(en).`);
