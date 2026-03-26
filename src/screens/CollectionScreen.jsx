import { useState } from "react";
import { SetCard } from "../components/SetCard";

const FILTERS = [
  { id: "all",   label: "Alle" },
  { id: "built", label: "Gebaut" },
  { id: "boxed", label: "OVP" },
];

export function CollectionScreen({ sets, loading, onSetClick }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const collection = sets.filter((s) => s.status !== "wishlist");

  const filtered = collection.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.setNumber.includes(search);
    if (!matchesSearch) return false;
    if (filter === "built") return s.status === "built";
    if (filter === "boxed") return s.status === "boxed";
    return true;
  });

  return (
    <div style={{ padding: "0 20px" }}>
      {/* Titel + Filter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E" }}>
          Meine Sets
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(({ id, label }) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              padding: "5px 10px", borderRadius: 20, border: "none",
              background: filter === id ? "#1D6AE5" : "#EDECE8",
              color: filter === id ? "#FFF" : "#636366",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              transition: "all 0.15s",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Suche */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Name oder Nummer suchen…"
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 14,
          border: "1.5px solid #E5E5EA", fontSize: 14, color: "#1C1C1E",
          outline: "none", background: "#FAFAFA", marginBottom: 14,
        }}
      />

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#AEAEB2", fontSize: 14 }}>
          Lade Sets…
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "#AEAEB2", fontSize: 14, fontWeight: 500 }}>
          {collection.length === 0 ? "Noch keine Sets in der Sammlung" : "Keine Sets gefunden"}
        </div>
      )}

      {filtered.map((set) => (
        <SetCard key={set.id} set={set} onClick={onSetClick} />
      ))}
    </div>
  );
}
