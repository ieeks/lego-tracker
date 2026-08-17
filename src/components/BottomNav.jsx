import { Home, Heart, BarChart2, Info } from "lucide-react";

const TABS = [
  { id: "sammlung",  label: "Sammlung",    Icon: Home,     fillActive: true },
  { id: "wishlist",  label: "Wunschliste", Icon: Heart,    fillActive: true },
  { id: "statistik", label: "Statistik",   Icon: BarChart2, fillActive: false },
  { id: "info",      label: "Info",        Icon: Info,     fillActive: false },
];

export function BottomNav({ active, onNavigate, wishlistCount = 0 }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 680,
      background: "color-mix(in srgb, var(--card) 92%, transparent)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid var(--line)",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
      zIndex: 50,
      boxShadow: "var(--shadow-sheet)",
    }}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const showBadge = tab.id === "wishlist" && wishlistCount > 0;
        const iconColor = isActive ? "var(--brick)" : "var(--ink-soft)";
        const iconFill = isActive && tab.fillActive ? "var(--brick)" : "none";
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, padding: "10px 4px 6px",
              background: "none", border: "none", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              position: "relative",
            }}
          >
            <div style={{
              position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 52, height: 30, borderRadius: "var(--r-pill)",
              background: isActive ? "var(--brick-soft)" : "transparent",
              transition: "background 0.18s ease",
            }}>
              <tab.Icon
                size={21}
                strokeWidth={2}
                color={iconColor}
                fill={iconFill}
              />
              {showBadge && (
                <div className="num" style={{
                  position: "absolute", top: -2, right: 6,
                  background: "var(--brick)", color: "var(--on-accent)",
                  borderRadius: "var(--r-pill)", minWidth: 16, height: 16,
                  fontSize: 9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px",
                  border: "1.5px solid var(--card)",
                }}>
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </div>
              )}
            </div>
            <span style={{
              fontSize: 10,
              fontFamily: "var(--font-body)",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "var(--brick)" : "var(--ink-soft)",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
