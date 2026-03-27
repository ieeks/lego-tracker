import { useState } from "react";
import { useCollection } from "./hooks/useCollection";
import { updateSetStatus, deleteSet } from "./services/setService";
import { BottomNav } from "./components/BottomNav";
import { StatusBadge } from "./components/StatusBadge";
import { CollectionScreen } from "./screens/CollectionScreen";
import { AddScreen } from "./screens/AddScreen";
import { WishlistScreen } from "./screens/WishlistScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { InfoScreen } from "./screens/InfoScreen";

const STATUS_CYCLE = { built: "boxed", boxed: "wishlist", wishlist: "built" };
const STATUS_CYCLE_LABEL = { built: "→ OVP", boxed: "→ Wunschliste", wishlist: "→ Gebaut" };

function DetailModal({ set, onClose }) {
  if (!set) return null;

  const handleCycle = async () => {
    await updateSetStatus(set.id, STATUS_CYCLE[set.status]);
    onClose();
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${set.name}" wirklich löschen?`)) return;
    await deleteSet(set.id);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 680, margin: "0 auto",
          background: "#FFFFFF", borderRadius: "28px 28px 0 0",
          padding: "0 24px 48px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E5E5EA", margin: "16px auto 24px" }} />

        {set.image && (
          <img
            src={set.image}
            alt={set.name}
            style={{ width: "100%", height: 200, objectFit: "contain", borderRadius: 18, background: "#F4F3EE", padding: 12, marginBottom: 20, boxSizing: "border-box" }}
          />
        )}

        <div style={{ fontWeight: 800, fontSize: 22, color: "#1C1C1E", marginBottom: 4, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
          {set.name}
        </div>
        <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 14 }}>
          #{set.setNumber} {set.parts > 0 && `· ${set.parts.toLocaleString("de-DE")} Teile`}
        </div>
        <div style={{ marginBottom: 24 }}>
          <StatusBadge status={set.status} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleCycle} style={{
            flex: 1, padding: "13px 0", borderRadius: 14,
            background: "#F1F0EB", border: "none",
            fontWeight: 600, fontSize: 14, color: "#3A3A3C", cursor: "pointer",
          }}>
            Status {STATUS_CYCLE_LABEL[set.status]}
          </button>
          <button onClick={handleDelete} style={{
            padding: "13px 18px", borderRadius: 14,
            background: "#FEE2E2", border: "none",
            fontWeight: 600, fontSize: 14, color: "#E11D48", cursor: "pointer",
          }}>
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCardTop({ label, value, icon, accent, progress }) {
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 20, padding: "16px 18px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.10)", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: accent + "20",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 11, color: "#8E8E93", fontWeight: 500, marginTop: 4 }}>{label}</div>
      <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontSize: 30, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.5px" }}>
        {value}
      </div>
      {progress !== undefined && (
        <div style={{ marginTop: 4 }}>
          <div style={{ height: 4, background: "#F0EEE8", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(progress, 0)}%`, background: "#1D6AE5", borderRadius: 2, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 10, color: "#AEAEB2", marginTop: 3, textAlign: "right" }}>{progress} %</div>
        </div>
      )}
    </div>
  );
}

function StatCardWide({ label, value, icon, accent, sub }) {
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 20, padding: "14px 16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: accent + "20",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#8E8E93", fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: "#AEAEB2", marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontSize: 26, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.5px", flexShrink: 0 }}>
        {value}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("sammlung");
  const [selectedSet, setSelectedSet] = useState(null);
  const { sets, loading } = useCollection();

  const owned = sets.filter((s) => s.status !== "wishlist");
  const wishlistSets = sets.filter((s) => s.status === "wishlist");
  const builtSets = owned.filter((s) => s.status === "built");
  const boxedSets = owned.filter((s) => s.status === "boxed");

  const totalSets  = owned.length;
  const totalParts = owned.reduce((acc, s) => acc + (s.parts || 0), 0);
  const wishlistCount = wishlistSets.length;
  const builtCount = builtSets.length;
  const boxedCount = boxedSets.length;
  const builtPercent = owned.length > 0 ? Math.round((builtCount / owned.length) * 100) : 0;
  const ovpPercent = owned.length > 0 ? Math.round((boxedCount / owned.length) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F4F3EE",
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: 680,
      margin: "0 auto",
      position: "relative",
    }}>
      <DetailModal set={selectedSet} onClose={() => setSelectedSet(null)} />

      <div style={{ paddingBottom: 90 }}>
        {/* Header */}
        <div style={{
          padding: "52px 20px 24px",
          background: "linear-gradient(180deg, #2370E8 0%, #1650C4 100%)",
          borderRadius: "0 0 28px 28px",
          marginBottom: 14,
          boxShadow: "0 8px 28px rgba(29,106,229,0.28)",
        }}>
          {/* Title + FAB */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontWeight: 800, fontSize: 22, color: "#FFFFFF",
              letterSpacing: "-0.4px", lineHeight: 1.2,
            }}>
              Meine LEGO® Sammlung
            </div>
            <button
              onClick={() => setTab("hinzufuegen")}
              style={{
                width: 50, height: 50, borderRadius: "50%",
                background: "#F5CC00",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 18px rgba(245,204,0,0.45)",
                WebkitTapHighlightColor: "transparent",
                flexShrink: 0, marginLeft: 12,
                transition: "transform 0.15s",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" strokeWidth="2.8" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          {/* Top stat cards – inside header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCardTop
              label="Gesamt Sets"
              value={totalSets}
              icon="🧱"
              accent="#1D6AE5"
            />
            <StatCardTop
              label="Gesamt Teile"
              value={totalParts.toLocaleString("de-DE")}
              icon="⚙️"
              accent="#059669"
              progress={builtPercent}
            />
          </div>
        </div>

        {/* Bottom stat cards */}
        <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <StatCardWide
            label="Auf Wunschliste"
            value={wishlistCount}
            icon="❤️"
            accent="#E11D48"
          />
          <StatCardWide
            label="OVP-Ratio"
            value={`${ovpPercent}%`}
            icon="📦"
            accent="#F59E0B"
            sub={`${boxedCount} OVP / ${builtCount} gebaut`}
          />
        </div>

        {/* Screen content */}
        {tab === "sammlung"     && <CollectionScreen sets={sets} loading={loading} onSetClick={setSelectedSet} />}
        {tab === "hinzufuegen"  && <AddScreen onSuccess={() => setTab("sammlung")} />}
        {tab === "wishlist"     && <WishlistScreen sets={sets} loading={loading} onSetClick={setSelectedSet} />}
        {tab === "statistik"    && <StatsScreen sets={sets} />}
        {tab === "info"         && <InfoScreen sets={sets} />}
      </div>

      <BottomNav active={tab} onNavigate={setTab} wishlistCount={wishlistCount} />
    </div>
  );
}
