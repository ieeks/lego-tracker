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
      background: "rgba(250,249,245,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid var(--gray-300)",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
      zIndex: 50,
      boxShadow: "0 -2px 20px rgba(20,20,19,0.06)",
    }}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const showBadge = tab.id === "wishlist" && wishlistCount > 0;
        const iconColor = isActive ? "var(--clay)" : "var(--gray-500)";
        const iconFill = isActive && tab.fillActive ? "var(--clay)" : "none";
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
              <tab.Icon
                size={22}
                strokeWidth={1.75}
                color={iconColor}
                fill={iconFill}
              />
              {showBadge && (
                <div style={{
                  position: "absolute", top: -4, right: -6,
                  background: "var(--clay)", color: "var(--white)",
                  borderRadius: "50%", minWidth: 16, height: 16,
                  fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px",
                  border: "1.5px solid rgba(250,249,245,0.9)",
                }}>
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </div>
              )}
            </div>
            <span style={{
              fontSize: 10,
              fontFamily: "var(--font-body)",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--clay)" : "var(--gray-500)",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
