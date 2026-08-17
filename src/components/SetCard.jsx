import { useState, useRef } from "react";
import { Home, Users, Check, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { setStatus } from "../lib/setStatus";
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
  const status     = setStatus(set);
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

  const themePath = set.parentThemeName
    ? `${set.parentThemeName} › ${set.themeName}`
    : set.themeName;

  return (
    <div style={{ position: "relative", marginBottom: 12, borderRadius: "var(--r-card)", overflow: "hidden" }}>

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
        <Trash2 size={20} strokeWidth={2} color="var(--on-accent)" />
        <span className="mono" style={{ color: "var(--on-accent)", fontSize: 9, letterSpacing: "0.1em" }}>Löschen</span>
      </div>

      {/* Card */}
      <div
        className="set"
        data-status={status}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          background: "var(--card)", borderRadius: "var(--r-card)",
          paddingTop: 14, paddingRight: 16, paddingBottom: 14,
          boxShadow: "var(--shadow-sm)",
          cursor: "pointer", userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          transform: `translateX(${offset}px)`,
          transition: animating ? "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
          zIndex: 1,
          touchAction: "pan-y",
        }}
      >
        {/* Thumbnail */}
        <div style={{ width: 80, height: 80, borderRadius: "var(--r-thumb)", overflow: "hidden", flexShrink: 0, background: "var(--neutral-soft)" }}>
          {set.image ? (
            <img
              src={set.image} alt={set.name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)", opacity: 0.35 }}>
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
            <div className="display" style={{
              fontSize: 15, lineHeight: 1.25,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1,
            }}>
              {set.name}
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill={isWishlist ? "var(--brick)" : "none"}
              stroke={isWishlist ? "var(--brick)" : "var(--ink-soft)"}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 2, opacity: isWishlist ? 1 : 0.35 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>

          {/* Set number · Theme · Year — der Theme-Pfad ist der einzige
              Teil variabler Länge und schluckt deshalb die Kürzung;
              Nummer und Jahr bleiben immer vollständig lesbar. */}
          <div className="mono" style={{
            color: "var(--ink-soft)", marginBottom: 7,
            display: "flex", whiteSpace: "nowrap", minWidth: 0,
          }}>
            <span style={{ flexShrink: 0 }}>{set.setNumber}</span>
            {themePath && (
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
                {` · ${themePath}`}
              </span>
            )}
            {set.year && <span style={{ flexShrink: 0 }}>{` · ${set.year}`}</span>}
          </div>

          {/* Chips: status / pieces / price */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {set.status !== "built" && <StatusBadge status={set.status} />}
            {set.parts > 0 && (
              <span className="tag tag--parts">
                {set.status === "built" && <Check size={11} strokeWidth={2.5} />}
                {set.parts.toLocaleString("de-DE")} Teile
              </span>
            )}
            {set.retailPrice != null && (
              <span className="tag tag--price">
                {set.retailPrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </span>
            )}
          </div>

          {/* Location */}
          {loc && (
            <div style={{ marginTop: 6, fontSize: 11, color: "var(--ink-soft)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              <loc.Icon size={11} strokeWidth={1.75} />
              {loc.text}
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0, opacity: 0.2, marginLeft: 4 }}>
          <path d="M1 1L7 7L1 13" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
