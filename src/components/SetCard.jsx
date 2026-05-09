import { useState, useRef } from "react";
import { Home, Users } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { deleteSet } from "../services/setService";

const REVEAL_WIDTH   = 80;
const SWIPE_THRESHOLD = 36;

const LOCATION_LABEL = {
  home:         { Icon: Home,  text: "Daheim"  },
  grandparents: { Icon: Users, text: "Oma/Opa" },
};

export function SetCard({ set, onClick }) {
  const [offset, setOffset]     = useState(0);
  const [animating, setAnimating] = useState(false);
  const touchStartX    = useRef(0);
  const touchStartY    = useRef(0);
  const touchStartOff  = useRef(0);
  const dragging       = useRef(false);
  const movedHoriz     = useRef(false);
  const lockDir        = useRef(null); // 'horiz' | 'vert' | null

  const isWishlist = set.status === "wishlist";
  const loc        = LOCATION_LABEL[set.location];

  const snapTo = (target) => { setAnimating(true); setOffset(target); };

  const handleTouchStart = (e) => {
    touchStartX.current   = e.touches[0].clientX;
    touchStartY.current   = e.touches[0].clientY;
    touchStartOff.current = offset;
    dragging.current      = true;
    movedHoriz.current    = false;
    lockDir.current       = null;
    setAnimating(false);
  };

  const handleTouchMove = (e) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!lockDir.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      lockDir.current = Math.abs(dx) > Math.abs(dy) ? 'horiz' : 'vert';
    }

    if (lockDir.current !== 'horiz') return;

    movedHoriz.current = true;
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
    <div style={{ position: "relative", marginBottom: 12, borderRadius: "var(--r-lg)", overflow: "hidden" }}>

      {/* Delete button (behind card) */}
      <div
        onClick={handleDelete}
        style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: REVEAL_WIDTH,
          background: "var(--danger)",
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
          background: "var(--white)", borderRadius: "var(--r-lg)", padding: "14px 16px",
          boxShadow: "var(--shadow-sm)",
          cursor: "pointer", userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          transform: `translateX(${offset}px)`,
          transition: animating ? "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
          position: "relative", zIndex: 1,
          touchAction: "pan-y",
        }}
      >
        {/* Thumbnail */}
        <div style={{ width: 80, height: 80, borderRadius: "var(--r-md)", overflow: "hidden", flexShrink: 0, background: "var(--gray-100)" }}>
          {set.image ? (
            <img
              src={set.image} alt={set.name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-300)" }}>
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
          {/* Name + heart */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600, fontSize: 15, color: "var(--slate)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1,
            }}>
              {set.name}
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill={isWishlist ? "var(--clay)" : "none"}
              stroke={isWishlist ? "var(--clay)" : "var(--gray-300)"}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>

          {/* Set number + Theme + Year */}
          <div style={{ fontSize: 12, color: "var(--gray-700)", fontWeight: 500, marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)" }}>{set.setNumber}</span>
            {set.themeName && (
              <span style={{ color: "var(--gray-700)" }}>
                {" · "}
                {set.parentThemeName ? `${set.parentThemeName} › ${set.themeName}` : set.themeName}
              </span>
            )}
            {set.year && <span style={{ color: "var(--gray-700)" }}> · {set.year}</span>}
          </div>

          {/* Badge + Pieces */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusBadge status={set.status} />
            {set.parts > 0 && (
              <span style={{ fontSize: 12, color: "var(--gray-700)", fontFamily: "var(--font-mono)" }}>
                {set.parts.toLocaleString("de-DE")} Teile
              </span>
            )}
          </div>

          {/* Retail price */}
          {set.retailPrice != null && (
            <div style={{ marginTop: 5 }}>
              <span style={{
                display: "inline-block",
                fontSize: 11, fontWeight: 500, color: "var(--warning)",
                fontFamily: "var(--font-mono)",
                background: "#FBF0DC",
                borderRadius: "var(--r-xs)", padding: "2px 8px",
              }}>
                {set.retailPrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          )}

          {/* Location */}
          {loc && (
            <div style={{ marginTop: 5, fontSize: 11, color: "var(--gray-500)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              <loc.Icon size={11} strokeWidth={1.75} />
              {loc.text}
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0, opacity: 0.2, marginLeft: 4 }}>
          <path d="M1 1L7 7L1 13" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
