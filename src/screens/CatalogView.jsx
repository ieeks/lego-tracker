import { useState, useEffect, useMemo, useRef } from "react";
import { X, Search } from "lucide-react";
import { ReleaseCard } from "../components/ReleaseCard";
import { useCatalog } from "../hooks/useCatalog";
import { normalizeSetNum } from "../lib/newReleases";
import { readParams, readList, writeParams } from "../lib/urlState";

/**
 * Diakritika wegnormalisieren, damit "pokemon" auch "Pokémon" findet.
 * Auf einer deutschen Tastatur tippt niemand das é mit, und ohne das
 * lieferte die naheliegende Eingabe null Treffer.
 */
const fold = (v) => v.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Wie viele Karten pro Nachladeschritt. Alle auf einmal killt Mobile-Safari. */
const CHUNK = 40;

/**
 * Preisstufen als halboffene Intervalle [min, max). Wichtig gegen die
 * naheliegende Einteilung "150–299" und "ab 300": dazwischen faellt alles
 * von 299,01 bis 299,99 durch kein Raster.
 */
const PRICE_BUCKETS = [
  { id: "0-50",    label: "bis 50 €",   min: 0,   max: 50 },
  { id: "50-150",  label: "50–150 €",   min: 50,  max: 150 },
  { id: "150-300", label: "150–300 €",  min: 150, max: 300 },
  { id: "300+",    label: "ab 300 €",   min: 300, max: Infinity },
];

const SORTS = [
  { id: "teile",     label: "Teile" },
  { id: "preis-auf", label: "Preis ↑" },
  { id: "preis-ab",  label: "Preis ↓" },
];

/** Unbekanntes ans Ende, egal wie sortiert wird. */
const nullsLast = (v, dir) => (v == null ? (dir === "asc" ? Infinity : -Infinity) : v);

/**
 * Ein Katalog-Datensatz sieht anders aus als ein kuratierter. Statt eine
 * zweite Karte zu bauen, wird er auf die Props der ReleaseCard abgebildet:
 * Name, Teile und Bild stehen im Dump, also kommen sie als "live" rein.
 * UVP, Notiz und EOL hat der Dump nicht — die Karte rendert die Felder
 * ohnehin nur, wenn sie gesetzt sind.
 */
function toCardProps(row) {
  return {
    entry: {
      set_num: row.set_num,
      theme: row.theme,
      subtheme: row.subtheme,
      pieces: row.parts,
      uvp_eur: row.uvp_eur ?? null,
      age: null, minifigs: null,
      eol_forecast: null, note: null, region_note: null,
    },
    live: { name: row.name, parts: row.parts, image: row.img },
  };
}

export function CatalogView({ wishlist }) {
  const { data, loading, error } = useCatalog();
  const { ownedNums, wishedNums, busy, wish } = wishlist;

  const [search, setSearch]     = useState(() => readParams().get("q") ?? "");
  const [themeSel, setThemeSel] = useState(() => readList(readParams(), "kat"));
  const [yearSel, setYearSel]   = useState(() => readList(readParams(), "jahr"));
  const [onlyNew, setOnlyNew]   = useState(() => readParams().get("neu") === "1");
  const [priceSel, setPriceSel] = useState(() => readList(readParams(), "preis"));
  const [sort, setSort]         = useState(() => {
    const v = readParams().get("sort");
    return SORTS.some((x) => x.id === v) ? v : "teile";
  });
  const [limit, setLimit]       = useState(CHUNK);

  useEffect(() => {
    writeParams({
      q: search, kat: themeSel, jahr: yearSel, neu: onlyNew ? "1" : null,
      preis: priceSel, sort: sort === "teile" ? null : sort,
    });
  }, [search, themeSel, yearSel, onlyNew, priceSel, sort]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = fold(search.trim());
    return data.sets.filter((row) => {
      if (themeSel.length && !themeSel.includes(row.theme)) return false;
      if (yearSel.length && !yearSel.includes(String(row.year))) return false;
      // Ein aktiver Preisfilter schliesst Sets ohne Preis aus — sie lassen
      // sich keiner Stufe zuordnen. Betrifft rund ein Viertel des Katalogs.
      if (priceSel.length) {
        const eur = row.uvp_eur;
        if (eur == null) return false;
        const inRange = PRICE_BUCKETS.some(
          (b) => priceSel.includes(b.id) && eur >= b.min && eur < b.max
        );
        if (!inRange) return false;
      }
      if (onlyNew) {
        const num = normalizeSetNum(row.set_num);
        if (ownedNums.has(num) || wishedNums.has(num)) return false;
      }
      // Theme und Subtheme gehoeren in die Suche: wer "technic" tippt, meint
      // das Theme, nicht ein Set mit "Technic" im Namen. Ohne das liefert
      // eine naheliegende Eingabe null Treffer.
      if (q) {
        const haystack = fold([row.name, row.set_num, row.theme, row.subtheme]
          .filter(Boolean).join(" "));
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    // Der Dump hat kein Erscheinungsdatum, nur das Jahr — chronologisch
    // geht also nicht. Voreinstellung ist die Teilezahl absteigend: nach
    // Theme sortiert stuenden sonst die kleinsten Sets ganz oben.
    .sort((a, b) => {
      if (sort === "preis-auf") {
        return nullsLast(a.uvp_eur, "asc") - nullsLast(b.uvp_eur, "asc")
          || a.name.localeCompare(b.name, "de");
      }
      if (sort === "preis-ab") {
        return nullsLast(b.uvp_eur, "desc") - nullsLast(a.uvp_eur, "desc")
          || a.name.localeCompare(b.name, "de");
      }
      return (b.parts ?? -1) - (a.parts ?? -1) || a.name.localeCompare(b.name, "de");
    });
  }, [data, search, themeSel, yearSel, onlyNew, priceSel, sort, ownedNums, wishedNums]);

  // Nachladen, sobald der Fussmarker in Sichtweite kommt — ohne Bibliothek.
  const sentinel = useRef(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setLimit((l) => l + CHUNK); },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  // Jede Filteraenderung setzt das Nachladen zurueck — sonst bliebe nach
  // einem Wechsel die alte, lange Liste stehen.
  const changeSearch = (v) => { setSearch(v); setLimit(CHUNK); };
  const toggleNew    = ()  => { setOnlyNew((x) => !x); setLimit(CHUNK); };
  const toggle = (list, setList) => (v) => {
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
    setLimit(CHUNK);
  };
  const changeSort = (id) => { setSort(id); setLimit(CHUNK); };
  const resetAll = () => {
    setSearch(""); setThemeSel([]); setYearSel([]); setOnlyNew(false);
    setPriceSel([]); setSort("teile"); setLimit(CHUNK);
  };

  const activeCount = themeSel.length + yearSel.length + priceSel.length
    + (onlyNew ? 1 : 0) + (search ? 1 : 0) + (sort !== "teile" ? 1 : 0);

  if (loading) return <Info>Lade Katalog…</Info>;
  if (error)   return <Info tone="danger">Katalog konnte nicht geladen werden: {error}</Info>;

  const visible = filtered.slice(0, limit);

  return (
    <>
      {/* Suche */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search
          size={16} strokeWidth={2} color="var(--ink-soft)"
          style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        />
        <input
          className="field"
          value={search}
          onChange={(e) => changeSearch(e.target.value)}
          placeholder="Set-Name oder Nummer suchen…"
          style={{ padding: "11px 14px 11px 40px", paddingRight: search ? 40 : 14, fontSize: 14 }}
        />
        {search && (
          <button
            onClick={() => changeSearch("")}
            aria-label="Suche löschen"
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "var(--ink-soft)", border: "none", borderRadius: "var(--r-pill)",
              width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0, WebkitTapHighlightColor: "transparent",
            }}
          >
            <X size={10} strokeWidth={2.5} color="var(--on-accent)" />
          </button>
        )}
      </div>

      {/* Jahr nur, wenn es mehr als einen gibt — ein Filter mit einer Option
          filtert nichts, dieselbe Regel wie in der Wellen-Ansicht. */}
      {data.years.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <span className="mono" style={{ color: "var(--ink-soft)", flexShrink: 0 }}>Jahr</span>
          {data.years.map((y) => (
            <Chip key={y} active={yearSel.includes(String(y))} onClick={() => toggle(yearSel, setYearSel)(String(y))}>
              {y}
            </Chip>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <span className="mono" style={{ color: "var(--ink-soft)", flexShrink: 0 }}>Status</span>
        <Chip active={onlyNew} onClick={toggleNew}>Noch nicht erfasst</Chip>
      </div>

      {/* Preis */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <span className="mono" style={{ color: "var(--ink-soft)", flexShrink: 0 }}>Preis</span>
        {PRICE_BUCKETS.map((b) => (
          <Chip key={b.id} active={priceSel.includes(b.id)} onClick={() => toggle(priceSel, setPriceSel)(b.id)}>
            {b.label}
          </Chip>
        ))}
      </div>

      {/* Sortierung — einfachauswahl, anders als die Filter darueber */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <span className="mono" style={{ color: "var(--ink-soft)", flexShrink: 0 }}>Sortierung</span>
        {SORTS.map((o) => (
          <Chip key={o.id} active={sort === o.id} onClick={() => changeSort(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>

      {/* Themes — viele, deshalb scrollbare Reihe statt Blockwüste */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span className="mono" style={{ color: "var(--ink-soft)", flexShrink: 0 }}>Theme</span>
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4,
          scrollbarWidth: "thin", WebkitOverflowScrolling: "touch",
        }}>
          {data.themes.map((t) => (
            <Chip key={t} active={themeSel.includes(t)} onClick={() => toggle(themeSel, setThemeSel)(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <span className="mono" style={{ color: "var(--ink-soft)" }}>
          {filtered.length} von {data.sets.length} Sets
        </span>
        {activeCount > 0 && (
          <button
            onClick={resetAll}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "none", border: "none", cursor: "pointer", padding: "2px 0",
              color: "var(--brick)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
              WebkitTapHighlightColor: "transparent", whiteSpace: "nowrap",
            }}
          >
            <X size={13} strokeWidth={2.5} />
            Filter zurücksetzen
          </button>
        )}
      </div>

      {filtered.length === 0 && <Info>Keine Sets für diese Filter</Info>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {visible.map((row) => {
          const num = normalizeSetNum(row.set_num);
          const { entry, live } = toCardProps(row);
          return (
            <ReleaseCard
              key={row.set_num}
              entry={entry}
              live={live}
              owned={ownedNums.has(num)}
              wished={wishedNums.has(num)}
              busy={busy === row.set_num}
              onWish={() => wish({
                setNumber: row.set_num,
                name: row.name,
                label: row.name,
                image: row.img,
                parts: row.parts ?? 0,
                retailPrice: row.uvp_eur ?? null,
                themeId: row.theme_id ?? null,
                // Der Dump fuehrt den Theme-Pfad als Namen, keine theme_id —
                // die Sammlung zeigt daraus "City › Trains".
                themeName: row.subtheme ?? row.theme,
                parentThemeName: row.subtheme ? row.theme : null,
                year: row.year,
              })}
            />
          );
        })}
      </div>

      {visible.length < filtered.length && (
        <div ref={sentinel} style={{ padding: "24px 0", textAlign: "center" }}>
          <span className="mono" style={{ color: "var(--ink-soft)" }}>
            {visible.length} von {filtered.length} geladen…
          </span>
        </div>
      )}

      <p className="mono" style={{ color: "var(--ink-soft)", textAlign: "center", margin: "28px 0 0", lineHeight: 1.8 }}>
        {data.source} · Stand {data.generated_at}
      </p>
    </>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "6px 12px", borderRadius: "var(--r-pill)",
        border: active ? "1.5px solid var(--ink)" : "1.5px solid var(--line)",
        background: active ? "var(--ink)" : "transparent",
        color: active ? "var(--on-accent)" : "var(--ink-soft)",
        fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
        cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
        WebkitTapHighlightColor: "transparent", transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

function Info({ children, tone }) {
  return (
    <div style={{
      textAlign: "center", padding: "48px 20px", fontSize: 14, fontWeight: 500,
      color: tone === "danger" ? "var(--danger)" : "var(--ink-soft)",
    }}>
      {children}
    </div>
  );
}
