import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

export function SetCard({ set, onClick }) {
  const [pressed, setPressed] = useState(false);
  const isWishlist = set.status === "wishlist";

  return (
    <div
      onClick={() => onClick(set)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "#FFFFFF",
        borderRadius: 18,
        padding: "12px 14px",
        marginBottom: 10,
        boxShadow: pressed
          ? "0 1px 4px rgba(0,0,0,0.08)"
          : "0 2px 12px rgba(0,0,0,0.07)",
        cursor: "pointer",
        transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
        transform: pressed ? "scale(0.985)" : "scale(1)",
        opacity: isWishlist ? 0.82 : 1,
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Bild */}
      <div style={{
        width: 72, height: 72, borderRadius: 14, overflow: "hidden",
        flexShrink: 0, background: "#F0EEE8", position: "relative",
      }}>
        {set.image ? (
          <img
            src={set.image}
            alt={set.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            🧱
          </div>
        )}
        {isWishlist && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "saturate(0.4)",
          }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          fontWeight: 700, fontSize: 15, color: "#1C1C1E",
          marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {set.name}
        </div>
        <div style={{
          fontSize: 12, color: "#8E8E93", marginBottom: 7,
          display: "flex", gap: 6, alignItems: "center",
        }}>
          <span style={{ fontWeight: 500 }}>{set.setNumber}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusBadge status={set.status} />
          {set.parts > 0 && (
            <span style={{ fontSize: 11, color: "#AEAEB2", fontWeight: 500 }}>
              {set.parts.toLocaleString("de-DE")} Teile
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
        <path d="M1 1L7 7L1 13" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
