const CONFIG = {
  built:    { bg: "#EAF0E3", color: "var(--success)", label: "Gebaut",  icon: "✓" },
  boxed:    { bg: "var(--gray-100)", color: "var(--gray-500)", label: "OVP", icon: "📦" },
  wishlist: { bg: "#FAF0EB", color: "var(--clay)", label: "Wunsch", icon: "♥" },
};

export function StatusBadge({ status }) {
  const s = CONFIG[status] ?? CONFIG.boxed;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      fontFamily: "var(--font-body)",
    }}>
      <span style={{ fontSize: 10 }}>{s.icon}</span>
      {s.label}
    </span>
  );
}
