export function StatsScreen({ sets }) {
  const built    = sets.filter((s) => s.status === "built").length;
  const boxed    = sets.filter((s) => s.status === "boxed").length;
  const wishlist = sets.filter((s) => s.status === "wishlist").length;
  const total    = sets.length;

  const rows = [
    { label: "Gebaut",               count: built,    color: "#059669", bg: "#D1FAE5" },
    { label: "Ungeöffnet (OVP)",     count: boxed,    color: "#D97706", bg: "#FEF3C7" },
    { label: "Wunschliste",          count: wishlist, color: "#E11D48", bg: "#FEE2E2" },
  ];

  const bars = [
    { status: "built",    color: "#059669" },
    { status: "boxed",    color: "#D97706" },
    { status: "wishlist", color: "#E11D48" },
  ];

  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E", marginBottom: 18 }}>
        Statistik
      </div>

      {rows.map((item) => (
        <div key={item.label} style={{
          background: "#FFF", borderRadius: 18, padding: "16px 20px",
          marginBottom: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#1C1C1E" }}>{item.label}</div>
          <span style={{
            background: item.bg, color: item.color,
            borderRadius: 20, padding: "4px 14px",
            fontWeight: 700, fontSize: 15,
          }}>
            {item.count}
          </span>
        </div>
      ))}

      {total > 0 && (
        <div style={{ background: "#FFF", borderRadius: 18, padding: 20, marginTop: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1C1C1E", marginBottom: 14 }}>Statusverteilung</div>
          <div style={{ display: "flex", height: 10, borderRadius: 10, overflow: "hidden", gap: 2 }}>
            {bars.map(({ status, color }) => {
              const pct = (sets.filter((s) => s.status === status).length / total) * 100;
              return pct > 0 ? (
                <div key={status} style={{ width: `${pct}%`, background: color, borderRadius: 10 }} />
              ) : null;
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[["#059669", "Gebaut"], ["#D97706", "OVP"], ["#E11D48", "Wunsch"]].map(([color, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8E8E93" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#AEAEB2", fontSize: 14 }}>
          Noch keine Daten vorhanden.
        </div>
      )}
    </div>
  );
}
