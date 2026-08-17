import { useState } from "react";
import { useSets } from "../hooks/useSets";
import { SetCard } from "../components/SetCard";

const FILTERS = ["Alle", "Vorhanden", "Nicht vorhanden", "Wunschliste"];

export function HomeScreen({ onNavigateAdd }) {
  const { sets, loading, error, updateSet, deleteSet } = useSets();
  const [filter, setFilter] = useState("Alle");
  const [search, setSearch] = useState("");

  const filtered = sets.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.setNumber.includes(search);
    if (!matchesSearch) return false;
    if (filter === "Vorhanden") return s.owned;
    if (filter === "Nicht vorhanden") return !s.owned && !s.wishlist;
    if (filter === "Wunschliste") return s.wishlist;
    return true;
  });

  const stats = {
    total: sets.length,
    owned: sets.filter((s) => s.owned).length,
    wishlist: sets.filter((s) => s.wishlist).length,
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>LEGO Tracker</h1>
        <button onClick={onNavigateAdd} style={styles.addButton}>+ Set hinzufügen</button>
      </header>

      <div style={styles.stats}>
        <Stat label="Gesamt" value={stats.total} />
        <Stat label="Vorhanden" value={stats.owned} />
        <Stat label="Wunschliste" value={stats.wishlist} />
      </div>

      <input
        style={styles.search}
        placeholder="Nach Name oder Set-Nummer suchen…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p style={styles.message}>Lade Sets…</p>}
      {error && <p style={{ ...styles.message, color: "var(--danger)" }}>Fehler: {error}</p>}

      {!loading && filtered.length === 0 && (
        <p style={styles.message}>Keine Sets gefunden.</p>
      )}

      <div style={styles.grid}>
        {filtered.map((set) => (
          <SetCard
            key={set.id}
            set={set}
            onToggleOwned={(id, owned) => updateSet(id, { owned })}
            onDelete={deleteSet}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles = {
  container: { maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "var(--font-body)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { margin: 0, fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 900, color: "var(--ink)" },
  addButton: {
    background: "var(--brick)",
    color: "var(--on-accent)",
    border: "none",
    borderRadius: "var(--r-field)",
    padding: "10px 18px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  stats: { display: "flex", gap: 12, marginBottom: 20 },
  stat: {
    flex: 1,
    background: "var(--card)",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-field)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "var(--font-body)",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums lining-nums",
    color: "var(--ink)",
  },
  statLabel: { fontSize: 12, color: "var(--ink-soft)", marginTop: 2 },
  search: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 14px",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-field)",
    fontSize: 14,
    marginBottom: 12,
    outline: "none",
  },
  filters: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  filterBtn: {
    padding: "6px 14px",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-pill)",
    background: "var(--card)",
    fontSize: 13,
    cursor: "pointer",
    color: "var(--ink-soft)",
  },
  filterActive: { background: "var(--ink)", color: "var(--on-accent)", border: "1px solid var(--ink)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  message: { textAlign: "center", color: "var(--ink-soft)", padding: 32 },
};
