const TABS = [
  {
    id: "sammlung", label: "Sammlung",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#1D6AE5" : "none"} stroke={active ? "#1D6AE5" : "#8E8E93"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: "hinzufuegen", label: "Hinzufügen",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D6AE5" : "#8E8E93"} strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    id: "wishlist", label: "Wunschliste",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#E11D48" : "none"} stroke={active ? "#E11D48" : "#8E8E93"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    id: "statistik", label: "Statistik",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D6AE5" : "#8E8E93"} strokeWidth="1.8" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: "info", label: "Info",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D6AE5" : "#8E8E93"} strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
];

export function BottomNav({ active, onNavigate }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 680,
      background: "rgba(255,255,255,0.88)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
      zIndex: 50,
    }}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "10px 4px 6px",
              background: "none", border: "none", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {tab.icon(isActive)}
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? (tab.id === "wishlist" ? "#E11D48" : "#1D6AE5")
                : "#8E8E93",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
