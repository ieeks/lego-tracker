import { useState, useRef } from "react";
import { StatusBadge } from "./StatusBadge";
import { deleteSet } from "../services/setService";

const REVEAL_WIDTH   = 80;
const SWIPE_THRESHOLD = 36;

const LOCATION_LABEL = {
  home:         { icon: "🏠", text: "Daheim"  },
  grandparents: { icon: "👵", text: "Oma/Opa" },
};

export function SetCard({ set, onClick }) {
  const [offset, setOffset]     = useState(0);
  const [animating, setAnimating] = useState(false);
  const touchStartX    = useRef(0);
  const touchStartOff  = useRef(0);
  const dragging       = useRef(false);
  const movedHoriz     = useRef(false);

  const isWishlist = set.status === "wishlist";
  const loc        = LOCATION_LABEL[set.location];

  const snapTo = (target) => { setAnimating(true); setOffset(target); };

  const handleTouchStart = (e) => {
    touchStartX.current   = e.touches[0].clientX;
    touchStartOff.current = offset;
    dragging.current      = true;
    movedHoriz.current    = false;
    setAnimating(false);
  };

  const handleTouchMove = (e) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    if (!movedHoriz.current && Math.abs(dx) > 6) movedHoriz.current = true;
    if (!movedHoriz.current) return;
    const clamped = Math.max(-REVEAL_WIDTH, Math.min(0, touchStartOff.current + dx));
    setOffset(clamped);
  };

  const handleTouchEnd = () => {
    dragging.current = false;
    if (!movedHoriz.current) return;
    if (touchStartOff.current === 0) {
      snapTo(offset < -SWIPE_THRESHOLD ? -REVEAL_WIDTH : 0);
    } else {
      snapTo(offset > -REVEAL_WIDTH + SWIPE_THRESHOLD ? 0 : -REVEAL_WIDTH);
    }
  };

  const handleCardClick = (e) => {
    if (movedHoriz.current) return;
    if (offset < -10) { e.stopPropagation(); snapTo(0); return; }
    onClick(set);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteSet(set.id);
  };

  return (
    <div style={{ position: "relative", marginBottom: 12, borderRadius: 20, overflow: "hidden" }}>

      {/* Delete button (behind card) */}
      <div
        onClick={handleDelete}
        style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: REVEAL_WIDTH,
          background: "linear-gradient(135deg, #FF3B30, #E11D48)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
          cursor: "pointer", userSelect: "none",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
        <span style={{ color: "#FFF", fontSize: 11, fontWeight: 600 }}>Löschen</span>
      </div>

      {/* Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          background: "#FFFFFF", borderRadius: 20, padding: "14px 16px",
          boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
          cursor: "pointer", userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          transform: `translateX(${offset}px)`,
          transition: animating ? "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
          position: "relative", zIndex: 1,
          touchAction: "pan-y",
        }}
      >
        {/* Bild */}
        <div style={{ width: 80, height: 80, borderRadius: 16, overflow: "hidden", flexShrink: 0, background: "#F0EEE8" }}>
          {set.image ? (
            <img
              src={set.image} alt={set.name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#AEAEB2" }}>
              <svg fill="none" height="16" viewBox="0 0 28 16" width="28" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="14" rx="1" width="28" x="0" y="2" />
                <circle cx="4"  cy="2" fill="currentColor" r="2" />
                <circle cx="11" cy="2" fill="currentColor" r="2" />
                <circle cx="18" cy="2" fill="currentColor" r="2" />
                <circle cx="25" cy="2" fill="currentColor" r="2" />
                <circle cx="4"  cy="7" fill="currentColor" opacity="0.3" r="2" />
                <circle cx="11" cy="7" fill="currentColor" opacity="0.3" r="2" />
                <circle cx="18" cy="7" fill="currentColor" opacity="0.3" r="2" />
                <circle cx="25" cy="7" fill="currentColor" opacity="0.3" r="2" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Titel + Herz */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
            <div style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontWeight: 700, fontSize: 15, color: "#1C1C1E",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1,
            }}>
              {set.name}
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill={isWishlist ? "#1D6AE5" : "none"}
              stroke={isWishlist ? "#1D6AE5" : "#D1D1D6"}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>

          {/* Set-Nr + Theme */}
          <div style={{ fontSize: 12, color: "#8E8E93", fontWeight: 500, marginBottom: 6 }}>
            {set.setNumber}
            {set.themeName && <span style={{ color: "#AEAEB2" }}> · {set.themeName}</span>}
          </div>

          {/* Badge + Teile */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusBadge status={set.status} />
            {set.parts > 0 && (
              <span style={{ fontSize: 12, color: "#AEAEB2", fontWeight: 500 }}>
                {set.parts.toLocaleString("de-DE")} Teile
              </span>
            )}
          </div>

          {/* Standort */}
          {loc && (
            <div style={{ marginTop: 5, fontSize: 11, color: "#AEAEB2", fontWeight: 500 }}>
              {loc.icon} {loc.text}
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0, opacity: 0.25, marginLeft: 4 }}>
          <path d="M1 1L7 7L1 13" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
