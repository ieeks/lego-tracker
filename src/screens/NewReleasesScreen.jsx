import { useState, useEffect, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { ReleaseCard } from "../components/ReleaseCard";
import { useRebrickableSets } from "../hooks/useRebrickableSets";
import { addSet } from "../services/setService";
import {
  NEW_RELEASES, RELEASE_SET_NUMS, WAVES, THEMES, normalizeSetNum,
} from "../lib/newReleases";
import { readParams, readList, writeParams } from "../lib/urlState";

const STATUS_FILTERS = [
  { id: "neu",       label: "Noch nicht in Sammlung" },
  { id: "unwished",  label: "Nicht auf Wunschliste" },
];

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: "var(--r-pill)",
        border: active ? "1.5px solid var(--ink)" : "1.5px solid var(--line)",
        background: active ? "var(--ink)" : "transparent",
        color: active ? "var(--on-accent)" : "var(--ink-soft)",
        fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
        cursor: "pointer", whiteSpace: "nowrap",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span className="mono" style={{ color: "var(--ink-soft)", flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

export function NewReleasesScreen({ sets, loading }) {
  // Filter kommen aus der URL, damit ein gefilterter Blick teilbar und
  // reload-fest ist. Initialisierung einmalig aus location.search.
  const [waveFilter,   setWaveFilter]   = useState(() => readList(readParams(), "welle"));
  const [themeFilter,  setThemeFilter]  = useState(() => readList(readParams(), "theme"));
  const [statusFilter, setStatusFilter] = useState(() => readList(readParams(), "status"));

  const [busy,      setBusy]      = useState(null);   // set_num im Flug
  const [optimistic, setOptimistic] = useState([]);   // lokal schon als Wunsch markiert
  const [error,     setError]     = useState(null);

  useEffect(() => {
    writeParams({ welle: waveFilter, theme: themeFilter, status: statusFilter });
  }, [waveFilter, themeFilter, statusFilter]);

  const { entries, pending } = useRebrickableSets(RELEASE_SET_NUMS);

  // Abgleich gegen den Firestore-Live-State. Die Sammlung speichert
  // Setnummern mal mit, mal ohne Variantensuffix — deshalb normalisiert.
  const ownedNums = useMemo(
    () => new Set(sets.filter((s) => s.status !== "wishlist").map((s) => normalizeSetNum(s.setNumber))),
    [sets]
  );
  const wishedNums = useMemo(
    () => new Set([
      ...sets.filter((s) => s.status === "wishlist").map((s) => normalizeSetNum(s.setNumber)),
      ...optimistic.map(normalizeSetNum),
    ]),
    [sets, optimistic]
  );

  const toggle = (list, setList) => (id) =>
    setList(list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);

  const activeCount = waveFilter.length + themeFilter.length + statusFilter.length;
  const resetFilters = () => { setWaveFilter([]); setThemeFilter([]); setStatusFilter([]); };

  // Mehrfachauswahl innerhalb einer Gruppe (ODER), UND zwischen den Gruppen.
  const filtered = NEW_RELEASES.filter((entry) => {
    if (waveFilter.length  && !waveFilter.includes(entry.wave))   return false;
    if (themeFilter.length && !themeFilter.includes(entry.theme)) return false;
    const num = normalizeSetNum(entry.set_num);
    if (statusFilter.includes("neu")      && ownedNums.has(num))  return false;
    if (statusFilter.includes("unwished") && wishedNums.has(num)) return false;
    return true;
  });

  // Nach Welle gruppiert (absteigend), innerhalb nach Theme/Subtheme sortiert —
  // dieselbe Ordnung wie die Theme-Sortierung in der Sammlung.
  const groups = WAVES
    .map((wave) => ({
      wave,
      items: filtered
        .filter((e) => e.wave === wave.id)
        .sort((a, b) =>
          a.theme.localeCompare(b.theme, "de") ||
          (a.subtheme ?? "").localeCompare(b.subtheme ?? "", "de") ||
          a.set_num.localeCompare(b.set_num)
        ),
    }))
    .filter((g) => g.items.length > 0);

  const handleWish = useCallback(async (entry) => {
    const num = normalizeSetNum(entry.set_num);
    // Idempotent: doppelter Klick und bereits vorhandene Sets laufen ins Leere.
    if (busy || ownedNums.has(num) || wishedNums.has(num)) return;

    setBusy(entry.set_num);
    setError(null);
    setOptimistic((prev) => [...prev, entry.set_num]);   // optimistisch

    const live = entries[entry.set_num];
    try {
      await addSet({
        setNumber: entry.set_num,
        name: live?.name ?? `Set ${entry.set_num}`,
        image: live?.image ?? null,
        parts: live?.parts ?? entry.pieces ?? 0,
        theme: live?.themeId ?? null,
        // theme/subtheme aus der JSON auf das bestehende Schema abgebildet:
        // die Sammlung zeigt "Parent › Theme", hier also "City › Trains".
        themeName: entry.subtheme ?? entry.theme,
        parentThemeName: entry.subtheme ? entry.theme : null,
        year: live?.year ?? (Number(entry.release_date.slice(0, 4)) || null),
        status: "wishlist",
      });
    } catch (err) {
      setOptimistic((prev) => prev.filter((n) => n !== entry.set_num));   // Rollback
      setError(
        `„${live?.name ?? entry.set_num}" konnte nicht gespeichert werden: ${err.message} ` +
        `Prüfe die Verbindung und versuche es erneut — es wurde nichts geschrieben.`
      );
    } finally {
      setBusy(null);
    }
  }, [busy, ownedNums, wishedNums, entries]);

  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div className="display" style={{ fontSize: 20 }}>Neuheiten</div>
        {pending > 0 && (
          <span className="mono" style={{ color: "var(--ink-soft)" }}>
            Lade {pending} Sets…
          </span>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        <FilterGroup label="Welle">
          {WAVES.map((w) => (
            <FilterChip key={w.id} active={waveFilter.includes(w.id)} onClick={() => toggle(waveFilter, setWaveFilter)(w.id)}>
              {w.label}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Theme">
          {THEMES.map((t) => (
            <FilterChip key={t} active={themeFilter.includes(t)} onClick={() => toggle(themeFilter, setThemeFilter)(t)}>
              {t}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Status">
          {STATUS_FILTERS.map((s) => (
            <FilterChip key={s.id} active={statusFilter.includes(s.id)} onClick={() => toggle(statusFilter, setStatusFilter)(s.id)}>
              {s.label}
            </FilterChip>
          ))}
        </FilterGroup>

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "none", border: "none", cursor: "pointer", padding: "2px 0",
              color: "var(--brick)", fontFamily: "var(--font-body)",
              fontSize: 13, fontWeight: 600,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <X size={13} strokeWidth={2.5} />
            {activeCount} Filter zurücksetzen
          </button>
        )}
      </div>

      {error && (
        <div role="alert" style={{
          background: "var(--danger-soft)", color: "var(--danger)",
          borderRadius: "var(--r-field)", padding: "12px 14px", marginBottom: 16,
          fontSize: 13, lineHeight: 1.5, fontWeight: 500,
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-soft)", fontSize: 14 }}>
          Lade Sammlung…
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--ink-soft)", fontSize: 14, fontWeight: 500 }}>
          Keine Neuheiten für diese Filter
        </div>
      )}

      {groups.map(({ wave, items }) => (
        <section key={wave.id} style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 12 }}>
            <h2 className="display" style={{ fontSize: 17, margin: 0 }}>{wave.label}</h2>
            {/* Ungefiltert zaehlt die Welle, gefiltert der Auszug daraus —
                sonst liest sich die Filtertrefferzahl wie die Kuratierung. */}
            <div className="mono" style={{ color: "var(--ink-soft)", marginTop: 3 }}>
              {items.length === wave.curated
                ? `${wave.curated} von ${wave.total} Sets kuratiert`
                : `${items.length} von ${wave.curated} kuratierten Sets`}
            </div>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 12,
          }}>
            {items.map((entry) => {
              const num = normalizeSetNum(entry.set_num);
              return (
                <ReleaseCard
                  key={entry.set_num}
                  entry={entry}
                  live={entries[entry.set_num]}
                  owned={ownedNums.has(num)}
                  wished={wishedNums.has(num)}
                  busy={busy === entry.set_num}
                  onWish={handleWish}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
