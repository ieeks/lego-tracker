import { useState } from "react";
import { SetCard } from "../components/SetCard";

const FILTERS = [
  { id: "sammlung", label: "Sammlung",        icon: "🏠" },
  { id: "wishlist", label: "Auf Wunschliste", icon: "❤️" },
  { id: "built",    label: "Gebaut",          icon: "✓"  },
];

export function CollectionScreen({ sets, loading, onSetClick }) {
  const [filter, setFilter] = useState("sammlung");
  const [search, setSearch] = useState("");

  const filtered = sets.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.setNumber.includes(search);
    if (!matchesSearch) return false;
    if (filter === "sammlung") return s.status !== "wishlist";
    if (filter === "wishlist") return s.status === "wishlist";
    if (filter === "built")    return s.status === "built";
    return true;
  });

  const emptyLabel = {
    sammlung: "Noch keine Sets in der Sammlung",
    wishlist: "Noch keine Wunsch-Sets",
    built: "Noch keine gebauten Sets",
  };

  return (
    <div style={{ padding: "0 20px" }}>
      {/* Section header + filter chips */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E", marginBottom: 12 }}>
          Sammlung
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {FILTERS.map(({ id, label, icon }) => {
            const isActive = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "8px 14px",
                  borderRadius: 20, border: "none",
                  background: isActive ? "#1D6AE5" : "#EDECE8",
                  color: isActive ? "#FFFFFF" : "#636366",
                  fontSize: 13, fontWeight: 600,
                  cursor: "pointer", whiteSpace: "nowrap",
                  WebkitTapHighlightColor: "transparent",
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 2px 10px rgba(29,106,229,0.3)" : "none",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 12 }}>{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round"
          style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Set-Name oder Nummer suchen…"
          style={{
            width: "100%", padding: "12px 14px 12px 40px",
            paddingRight: search ? 40 : 14,
            borderRadius: 16, border: "1.5px solid #E5E5EA",
            fontSize: 14, color: "#1C1C1E",
            outline: "none", background: "#FAFAF8",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#1D6AE5"; }}
          onBlur={(e)  => { e.target.style.borderColor = "#E5E5EA"; }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "#AEAEB2", border: "none", borderRadius: "50%",
              width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9"/>
              <line x1="9" y1="1" x2="1" y2="9"/>
            </svg>
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#AEAEB2", fontSize: 14 }}>
          Lade Sets…
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "#AEAEB2", fontSize: 14, fontWeight: 500 }}>
          {search ? "Keine Sets gefunden" : emptyLabel[filter]}
        </div>
      )}

      {filtered.map((set) => (
        <SetCard key={set.id} set={set} onClick={onSetClick} />
      ))}
    </div>
  );
}
