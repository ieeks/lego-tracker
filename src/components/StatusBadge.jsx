const CONFIG = {
  built:    { bg: "#D1FAE5", color: "#059669", label: "Gebaut",  icon: "✓" },
  boxed:    { bg: "#F1F0EB", color: "#78716C", label: "OVP",     icon: "📦" },
  wishlist: { bg: "#FEE2E2", color: "#E11D48", label: "Wunsch",  icon: "♥" },
};

export function StatusBadge({ status }) {
  const s = CONFIG[status] ?? CONFIG.boxed;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
    }}>
      <span style={{ fontSize: 10 }}>{s.icon}</span>
      {s.label}
    </span>
  );
}
