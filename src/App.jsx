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
        {/* Handle */}
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

        {/* Aktionen */}
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

function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{
      flex: 1, background: "#FFFFFF", borderRadius: 20, padding: "18px 20px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: accent + "18",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 12, color: "#8E8E93", fontWeight: 500, marginTop: 4 }}>{label}</div>
      <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontSize: 28, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.5px" }}>
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
  const totalSets  = owned.length;
  const totalParts = owned.reduce((acc, s) => acc + (s.parts || 0), 0);

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
          padding: "56px 20px 20px",
          background: "linear-gradient(180deg, #1D6AE5 0%, #1855C0 100%)",
          borderRadius: "0 0 28px 28px",
          marginBottom: 24,
          boxShadow: "0 8px 32px rgba(29,106,229,0.25)",
        }}>
          <div style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontWeight: 800, fontSize: 26, color: "#FFFFFF",
            letterSpacing: "-0.5px", marginBottom: 18,
          }}>
            Meine LEGO® Sammlung
          </div>

          <button
            onClick={() => setTab("hinzufuegen")}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 16, padding: "14px 20px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              color: "#FFFFFF",
              fontWeight: 600, fontSize: 15, cursor: "pointer",
              backdropFilter: "blur(10px)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Set hinzufügen
          </button>
        </div>

        {/* Stats */}
        <div style={{ padding: "0 20px", display: "flex", gap: 12, marginBottom: 28 }}>
          <StatCard label="Gesamt Sets"  value={totalSets}                          icon="🧱" accent="#1D6AE5" />
          <StatCard label="Gesamt Teile" value={totalParts.toLocaleString("de-DE")} icon="⚙️" accent="#059669" />
        </div>

        {/* Screen content */}
        {tab === "sammlung"     && <CollectionScreen sets={sets} loading={loading} onSetClick={setSelectedSet} />}
        {tab === "hinzufuegen"  && <AddScreen onSuccess={() => setTab("sammlung")} />}
        {tab === "wishlist"     && <WishlistScreen sets={sets} loading={loading} onSetClick={setSelectedSet} />}
        {tab === "statistik"    && <StatsScreen sets={sets} />}
        {tab === "info"         && <InfoScreen sets={sets} />}
      </div>

      <BottomNav active={tab} onNavigate={setTab} />
    </div>
  );
}
