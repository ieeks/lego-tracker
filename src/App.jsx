import { useState, useEffect } from "react";
import { useCollection } from "./hooks/useCollection";
import { updateSetStatus, updateSetLocation, deleteSet } from "./services/setService";
import { BottomNav } from "./components/BottomNav";
import { StatusBadge } from "./components/StatusBadge";
import { CollectionScreen } from "./screens/CollectionScreen";
import { AddScreen } from "./screens/AddScreen";
import { WishlistScreen } from "./screens/WishlistScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { InfoScreen } from "./screens/InfoScreen";

const STATUS_CYCLE       = { built: "boxed", boxed: "wishlist", wishlist: "built" };
const STATUS_CYCLE_LABEL = { built: "→ OVP", boxed: "→ Wunschliste", wishlist: "→ Gebaut" };

const LOCATIONS = [
  { id: "home",         label: "Daheim",  icon: "🏠" },
  { id: "grandparents", label: "Oma/Opa", icon: "👵" },
];

function DetailModal({ set, onClose }) {
  const [location, setLocationState] = useState(set?.location ?? null);

  useEffect(() => {
    setLocationState(set?.location ?? null);
  }, [set?.id]);

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

  const handleLocation = async (locId) => {
    const next = location === locId ? null : locId;
    setLocationState(next);
    await updateSetLocation(set.id, next);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 680, margin: "0 auto",
          background: "#FFFFFF", borderRadius: "28px 28px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          paddingBottom: "max(32px, env(safe-area-inset-bottom, 32px))",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E5E5EA", margin: "14px auto 20px" }} />

        {/* Content mit konsistentem Padding */}
        <div style={{ padding: "0 20px" }}>

          {/* Bild */}
          {set.image && (
            <img
              src={set.image}
              alt={set.name}
              style={{
                width: "100%", height: 190, objectFit: "contain",
                borderRadius: 18, background: "#F4EDDB",
                padding: 12, marginBottom: 20, boxSizing: "border-box",
              }}
            />
          )}

          {/* Titel */}
          <div style={{
            fontWeight: 800, fontSize: 22, color: "#1C1C1E",
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            marginBottom: 4,
          }}>
            {set.name}
          </div>

          {/* Meta */}
          <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 16 }}>
            #{set.setNumber}
            {set.parts > 0 && ` · ${set.parts.toLocaleString("de-DE")} Teile`}
            {set.themeName && ` · ${set.themeName}`}
          </div>

          {/* Status Badge */}
          <div style={{ marginBottom: 20 }}>
            <StatusBadge status={set.status} />
          </div>

          {/* Standort */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#8E8E93", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Standort
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {LOCATIONS.map(({ id, label, icon }) => {
                const active = location === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleLocation(id)}
                    style={{
                      flex: 1, padding: "12px 8px", borderRadius: 14,
                      border: active ? "2px solid #7B4955" : "2px solid #E5E5EA",
                      background: active ? "rgba(123,73,85,0.08)" : "#FAFAF5",
                      color: active ? "#7B4955" : "#636366",
                      fontWeight: 600, fontSize: 14, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      WebkitTapHighlightColor: "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{icon}</span> {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#F0EEE8", marginBottom: 20 }} />

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleCycle} style={{
              flex: 1, padding: "14px 0", borderRadius: 14,
              background: "#F1F0EB", border: "none",
              fontWeight: 600, fontSize: 14, color: "#3A3A3C", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}>
              Status {STATUS_CYCLE_LABEL[set.status]}
            </button>
            <button onClick={handleDelete} style={{
              padding: "14px 20px", borderRadius: 14,
              background: "#FEE2E2", border: "none",
              fontWeight: 600, fontSize: 14, color: "#E11D48", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}>
              Löschen
            </button>
          </div>

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
            <div style={{ height: "100%", width: `${Math.max(progress, 0)}%`, background: "#7B4955", borderRadius: 2, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 10, color: "#AEAEB2", marginTop: 3, textAlign: "right" }}>{progress} %</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("sammlung");
  const [selectedSet, setSelectedSet] = useState(null);
  const { sets, loading } = useCollection();

  const owned        = sets.filter((s) => s.status !== "wishlist");
  const wishlistSets = sets.filter((s) => s.status === "wishlist");
  const builtSets    = owned.filter((s) => s.status === "built");

  const totalSets   = owned.length;
  const totalParts  = owned.reduce((acc, s) => acc + (s.parts || 0), 0);
  const wishlistCount = wishlistSets.length;
  const builtCount  = builtSets.length;
  const builtPercent = owned.length > 0 ? Math.round((builtCount / owned.length) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F4EDDB",
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: 680,
      margin: "0 auto",
      position: "relative",
      touchAction: "pan-y",
    }}>
      <DetailModal key={selectedSet?.id ?? "closed"} set={selectedSet} onClose={() => setSelectedSet(null)} />

      <div style={{ paddingBottom: 90 }}>
        {/* Header */}
        <div style={{
          paddingTop: "max(52px, calc(env(safe-area-inset-top, 0px) + 16px))",
          paddingLeft: 20, paddingRight: 20, paddingBottom: 24,
          background: "linear-gradient(180deg, #7B4955 0%, #5E3442 100%)",
          borderRadius: "0 0 28px 28px",
          marginBottom: 14,
          boxShadow: "0 8px 28px rgba(123,73,85,0.28)",
        }}>
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
                background: "#F4EDDB", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 18px rgba(123,73,85,0.25)",
                WebkitTapHighlightColor: "transparent",
                flexShrink: 0, marginLeft: 12,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4955" strokeWidth="2.8" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCardTop label="Gesamt Sets"  value={totalSets}                          icon={<svg fill="none" height="16" viewBox="0 0 28 16" width="28" xmlns="http://www.w3.org/2000/svg"><rect fill="currentColor" height="14" rx="1" width="28" x="0" y="2" /><circle cx="4"  cy="2" fill="currentColor" r="2" /><circle cx="11" cy="2" fill="currentColor" r="2" /><circle cx="18" cy="2" fill="currentColor" r="2" /><circle cx="25" cy="2" fill="currentColor" r="2" /><circle cx="4"  cy="7" fill="currentColor" opacity="0.3" r="2" /><circle cx="11" cy="7" fill="currentColor" opacity="0.3" r="2" /><circle cx="18" cy="7" fill="currentColor" opacity="0.3" r="2" /><circle cx="25" cy="7" fill="currentColor" opacity="0.3" r="2" /></svg>} accent="#7B4955" />
            <StatCardTop label="Gesamt Teile" value={totalParts.toLocaleString("de-DE")} icon="⚙️" accent="#059669" progress={builtPercent} />
          </div>
        </div>

        {tab === "sammlung"    && <CollectionScreen sets={sets} loading={loading} onSetClick={setSelectedSet} />}
        {tab === "hinzufuegen" && <AddScreen onSuccess={() => setTab("sammlung")} />}
        {tab === "wishlist"    && <WishlistScreen sets={sets} loading={loading} onSetClick={setSelectedSet} />}
        {tab === "statistik"   && <StatsScreen sets={sets} />}
        {tab === "info"        && <InfoScreen sets={sets} />}
      </div>

      <BottomNav active={tab} onNavigate={setTab} wishlistCount={wishlistCount} />
    </div>
  );
}
