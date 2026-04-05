const TABS = [
  {
    id: "sammlung", label: "Sammlung",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#7B4955" : "none"} stroke={active ? "#7B4955" : "#8E8E93"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: "wishlist", label: "Wunschliste",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#E11D48" : "none"} stroke={active ? "#E11D48" : "#8E8E93"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    badgeColor: "#E11D48",
  },
  {
    id: "statistik", label: "Statistik",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#7B4955" : "#8E8E93"} strokeWidth="1.8" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: "info", label: "Info",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#7B4955" : "#8E8E93"} strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
];

export function BottomNav({ active, onNavigate, wishlistCount = 0 }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 680,
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
      zIndex: 50,
      boxShadow: "0 -2px 20px rgba(0,0,0,0.06)",
    }}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const showBadge = tab.id === "wishlist" && wishlistCount > 0;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "10px 4px 6px",
              background: "none", border: "none", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              position: "relative",
            }}
          >
            <div style={{ position: "relative" }}>
              {tab.icon(isActive)}
              {showBadge && (
                <div style={{
                  position: "absolute", top: -4, right: -6,
                  background: "#E11D48", color: "#FFF",
                  borderRadius: "50%", minWidth: 16, height: 16,
                  fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px",
                  border: "1.5px solid rgba(255,255,255,0.9)",
                }}>
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </div>
              )}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? (tab.id === "wishlist" ? "#E11D48" : "#7B4955")
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
