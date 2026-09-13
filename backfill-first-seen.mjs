// backfill-first-seen.mjs
// Einmalig ausführen: node backfill-first-seen.mjs
//
// Traegt `first_seen` in public/catalog/<jahr>.json nach. Ab jetzt stempelt
// der Sync das Feld selbst (scripts/syncCatalog.mjs), aber nur fuer Sets, die
// nach dieser Aenderung dazukommen — der Filter im Katalog waere also bis zum
// naechsten Lauf leer.
//
// Die Historie steht schon im Repo: jeder Katalog-Sync ist ein Commit auf
// public/catalog. Also einmal durch alle Commits, und fuer jedes Set den
// ersten Lauf merken, in dem es auftaucht.
//
// Sets aus dem allerersten Lauf bleiben auf null: der Erstimport ist kein
// Neuzugang, sonst stuende der halbe Katalog unter einem Datum.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "public/catalog";
const YEAR_FILE = /\/?(\d{4})\.json$/;

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const commits = git("log", "--reverse", "--format=%H", "--", OUT_DIR)
  .trim().split("\n").filter(Boolean);

if (!commits.length) {
  console.error("Keine Commits auf public/catalog gefunden.");
  process.exit(1);
}

const firstSeen = new Map();   // set_num -> Datum des Laufs
let baseline = null;           // Datum des ersten Laufs ueberhaupt

for (const sha of commits) {
  const files = git("ls-tree", "--name-only", sha, `${OUT_DIR}/`)
    .trim().split("\n").filter((f) => YEAR_FILE.test(f));

  for (const file of files) {
    let snapshot;
    try {
      snapshot = JSON.parse(git("show", `${sha}:${file}`));
    } catch {
      // Datei gab es in diesem Commit noch nicht oder sie ist kaputt.
      continue;
    }
    const run = snapshot.generated_at;
    if (!run) continue;
    baseline ??= run;
    for (const s of snapshot.sets ?? []) {
      if (!firstSeen.has(s.set_num)) firstSeen.set(s.set_num, run);
    }
  }
}

console.log(`${commits.length} Commits gelesen, Erstlauf ${baseline}.`);

const perRun = new Map();
let total = 0;

for (const file of readdirSync(OUT_DIR).filter((f) => YEAR_FILE.test(f))) {
  const path = join(OUT_DIR, file);
  const data = JSON.parse(readFileSync(path, "utf8"));

  for (const s of data.sets ?? []) {
    const run = firstSeen.get(s.set_num) ?? null;
    s.first_seen = run && run !== baseline ? run : null;
    total++;
    const key = s.first_seen ?? `${baseline} (Erstlauf, bleibt null)`;
    perRun.set(key, (perRun.get(key) ?? 0) + 1);
  }

  writeFileSync(path, JSON.stringify(data, null, 1) + "\n");
  console.log(`  ${file}: ${data.sets?.length ?? 0} Sets geschrieben`);
}

console.log(`\n${total} Sets, Verteilung nach Lauf:`);
for (const [run, count] of [...perRun].sort()) {
  console.log(`  ${String(count).padStart(4)}  ${run}`);
}
