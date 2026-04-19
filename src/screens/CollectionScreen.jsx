import { useState, useRef } from "react";
import { SetCard } from "../components/SetCard";

const FILTERS = [
  { id: "sammlung", label: "Sammlung",        icon: "🏠" },
  { id: "wishlist", label: "Auf Wunschliste", icon: "❤️" },
  { id: "built",    label: "Gebaut",          icon: "✓"  },
  { id: "boxed",    label: "OVP",             icon: "📦" },
];

const SORTS = [
  { id: "date",  label: "Hinzugefügt", icon: "📅" },
  { id: "parts", label: "Teile",       icon: "🧱" },
  { id: "theme", label: "Theme",       icon: "🏷️" },
];

const EMPTY_LABELS = {
  sammlung: "Noch keine Sets in der Sammlung",
  wishlist: "Noch keine Wunsch-Sets",
  built:    "Noch keine gebauten Sets",
  boxed:    "Noch keine OVP-Sets",
};

export function CollectionScreen({ sets, loading, onSetClick }) {
  const [filter,      setFilter]      = useState("sammlung");
  const [search,      setSearch]      = useState("");
  const [sort,        setSort]        = useState("date");
  const [themeFilter, setThemeFilter] = useState(null);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);

  const handleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateX(-50%) translateY(${delta}px)`;
      sheetRef.current.style.transition = "none";
    }
  };

  const handleTouchEnd = (e) => {
    if (dragStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - dragStartY.current;
    dragStartY.current = null;
    if (sheetRef.current) {
      sheetRef.current.style.transition = "transform 0.25s ease";
      if (delta > 100) {
        sheetRef.current.style.transform = "translateX(-50%) translateY(100%)";
        setTimeout(() => setThemeSheetOpen(false), 250);
      } else {
        sheetRef.current.style.transform = "translateX(-50%) translateY(0)";
      }
    }
  };

  // Status-Filter anwenden (vor Theme-Filter, damit Chips nur relevante Themes zeigen)
  const statusFiltered = sets.filter((s) => {
    if (filter === "sammlung") return s.status !== "wishlist";
    if (filter === "wishlist") return s.status === "wishlist";
    if (filter === "built")    return s.status === "built";
    if (filter === "boxed")    return s.status === "boxed";
    return true;
  });

  // Unique Parent-Themes aus dem aktuellen Status-Filter ableiten
  const availableThemes = [...new Set(
    statusFiltered
      .map((s) => s.parentThemeName ?? s.themeName ?? null)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "de"));

  const filtered = statusFiltered.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.setNumber.includes(search);
    if (!matchesSearch) return false;
    if (themeFilter) {
      const t = s.parentThemeName ?? s.themeName ?? null;
      if (t !== themeFilter) return false;
    }
    return true;
  });

  const sorted = sort === "parts"
    ? [...filtered].sort((a, b) => (b.parts || 0) - (a.parts || 0))
    : sort === "theme"
    ? [...filtered].sort((a, b) => {
        const ta = a.parentThemeName ?? a.themeName ?? "";
        const tb = b.parentThemeName ?? b.themeName ?? "";
        if (!ta && !tb) return 0;
        if (!ta) return 1;
        if (!tb) return -1;
        return ta.localeCompare(tb, "de");
      })
    : filtered;

  return (
    <div style={{ padding: "0 20px" }}>
      {/* Section header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          fontWeight: 800, fontSize: 20, color: "#1C1C1E", marginBottom: 12,
        }}>
          Sammlung
        </div>

        {/* Filter chips – 2 Zeilen à 2 Chips (Theme-Filter beim Wechsel zurücksetzen) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[FILTERS.slice(0, 2), FILTERS.slice(2)].map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: "flex", gap: 8 }}>
              {row.map(({ id, label, icon }) => {
                const isActive = filter === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setFilter(id); setThemeFilter(null); setThemeSheetOpen(false); }}
                    style={{
                      flex: 1,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
                      padding: "8px 14px", borderRadius: 20, border: "none",
                      background: isActive ? "#7B4955" : "#EDE5D8",
                      color: isActive ? "#F4EDDB" : "#636366",
                      fontSize: 13, fontWeight: 600,
                      cursor: "pointer", whiteSpace: "nowrap",
                      WebkitTapHighlightColor: "transparent",
                      transition: "all 0.15s ease",
                      boxShadow: isActive ? "0 2px 10px rgba(123,73,85,0.3)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 12 }}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Sort chips */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#AEAEB2", whiteSpace: "nowrap" }}>
          Sortierung
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {SORTS.map(({ id, label, icon }) => {
            const isActive = sort === id;
            return (
              <button
                key={id}
                onClick={() => setSort(id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "6px 12px", borderRadius: 20, border: "none",
                  background: isActive ? "#7B4955" : "#EDE5D8",
                  color: isActive ? "#F4EDDB" : "#636366",
                  fontSize: 12, fontWeight: 600,
                  cursor: "pointer", whiteSpace: "nowrap",
                  WebkitTapHighlightColor: "transparent",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 11 }}>{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme-Filter Button */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{
          fontSize: 12, fontWeight: 600, color: "#AEAEB2",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          Theme
        </span>
        <button
          onClick={() => setThemeSheetOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "6px 14px", borderRadius: 20, border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: themeFilter ? "#7B4955" : "#EDE5D8",
            color: themeFilter ? "#fff" : "#636366",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {themeFilter ?? "Alle"}
          <svg
            style={{ transform: themeSheetOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
            width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
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
          onFocus={(e) => { e.target.style.borderColor = "#7B4955"; }}
          onBlur={(e)  => { e.target.style.borderColor = "#E5E5EA"; }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "#AEAEB2", border: "none", borderRadius: "50%",
              width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0, WebkitTapHighlightColor: "transparent",
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

      {!loading && sorted.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "#AEAEB2", fontSize: 14, fontWeight: 500 }}>
          {search ? "Keine Sets gefunden" : EMPTY_LABELS[filter]}
        </div>
      )}

      {sorted.map((set) => (
        <SetCard key={set.id} set={set} onClick={onSetClick} />
      ))}

      {themeSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setThemeSheetOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
            }}
          />

          {/* Sheet */}
          <div
            ref={sheetRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: "fixed", bottom: 0, left: "50%",
              transform: "translateX(-50%)",
              width: "100%", maxWidth: 680,
              background: "#fff",
              borderRadius: "28px 28px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
              zIndex: 101,
              paddingBottom: "max(32px, env(safe-area-inset-bottom, 32px))",
              transition: "transform 0.25s ease",
            }}
          >
            {/* Handle */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: "#E5E5EA", margin: "14px auto 4px",
            }} />

            {/* Titel */}
            <div style={{
              fontSize: 15, fontWeight: 700, color: "#1C1C1E",
              padding: "10px 20px 8px",
            }}>
              Theme wählen
            </div>

            {/* Liste */}
            <div style={{ overflowY: "auto", maxHeight: "60vh" }}>

              {/* "Alle" Option */}
              <button
                onClick={() => { setThemeFilter(null); setThemeSheetOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "13px 20px",
                  border: "none", background: !themeFilter ? "#FDF8F0" : "transparent",
                  cursor: "pointer", textAlign: "left",
                  fontSize: 15, fontWeight: !themeFilter ? 700 : 500,
                  color: !themeFilter ? "#7B4955" : "#1C1C1E",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Alle Themes
                {!themeFilter && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#7B4955" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>

              {/* Divider */}
              <div style={{ height: 1, background: "#F0EEE8", margin: "0 20px" }} />

              {/* Themes */}
              {availableThemes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => { setThemeFilter(theme); setThemeSheetOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "13px 20px",
                    border: "none",
                    background: themeFilter === theme ? "#FDF8F0" : "transparent",
                    cursor: "pointer", textAlign: "left",
                    fontSize: 15, fontWeight: themeFilter === theme ? 700 : 500,
                    color: themeFilter === theme ? "#7B4955" : "#1C1C1E",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {theme}
                  {themeFilter === theme && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="#7B4955" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
