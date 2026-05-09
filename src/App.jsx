import { useState, useEffect, useRef } from "react";
import { useCollection } from "./hooks/useCollection";
import { updateSetStatus, updateSetLocation, deleteSet, updateSetPrice } from "./services/setService";
import { fetchRetailPrice } from "./services/bricksetService";
import { BottomNav } from "./components/BottomNav";
import { StatusBadge } from "./components/StatusBadge";
import { CollectionScreen } from "./screens/CollectionScreen";
import { AddScreen } from "./screens/AddScreen";
import { WishlistScreen } from "./screens/WishlistScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { InfoScreen } from "./screens/InfoScreen";

const STATUS_CYCLE       = { built: "boxed", boxed: "built", wishlist: "built" };
const STATUS_CYCLE_LABEL = { built: "→ OVP", boxed: "→ Gebaut", wishlist: "→ Gebaut" };

const LOCATIONS = [
  { id: "home",         label: "Daheim",  icon: "🏠" },
  { id: "grandparents", label: "Oma/Opa", icon: "👵" },
];

function DetailModal({ set, onClose }) {
  const [currentStatus, setCurrentStatus] = useState(set?.status ?? "boxed");
  const [location, setLocationState] = useState(set?.location ?? null);
  const [retailPrice, setRetailPrice] = useState(set?.retailPrice ?? null);
  const [priceLoading, setPriceLoading] = useState(false);
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);

  useEffect(() => {
    setCurrentStatus(set?.status ?? "boxed");
    setLocationState(set?.location ?? null);
    setRetailPrice(set?.retailPrice ?? null);
  }, [set?.id]);

  if (!set) return null;

  const handleCycle = async () => {
    const next = STATUS_CYCLE[currentStatus];
    setCurrentStatus(next);
    await updateSetStatus(set.id, next);
  };

  const handleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
      sheetRef.current.style.transition = "none";
    }
  };

  const handleTouchEnd = (e) => {
    if (dragStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - dragStartY.current;
    dragStartY.current = null;
    if (sheetRef.current) {
      sheetRef.current.style.transition = "transform 0.25s ease";
      if (delta > 100) {
        sheetRef.current.style.transform = "translateY(100%)";
        setTimeout(onClose, 250);
      } else {
        sheetRef.current.style.transform = "translateY(0)";
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${set.name}" wirklich löschen?`)) return;
    await deleteSet(set.id);
    onClose();
  };

  const handleRefreshPrice = async () => {
    setPriceLoading(true);
    try {
      const price = await fetchRetailPrice(set.setNumber);
      await updateSetPrice(set.id, price);
      setRetailPrice(price);
    } catch {
      // ignore
    } finally {
      setPriceLoading(false);
    }
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
        background: "rgba(20,20,19,0.5)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%", maxWidth: 680, margin: "0 auto",
          background: "var(--white)", borderRadius: "28px 28px 0 0",
          boxShadow: "0 -8px 40px rgba(20,20,19,0.15)",
          paddingBottom: "max(32px, env(safe-area-inset-bottom, 32px))",
          transition: "transform 0.25s ease",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--gray-300)", margin: "14px auto 20px" }} />

        <div style={{ padding: "0 20px" }}>

          {/* Image */}
          {set.image && (
            <img
              src={set.image}
              alt={set.name}
              style={{
                width: "100%", height: 190, objectFit: "contain",
                borderRadius: "var(--r-md)", background: "var(--gray-100)",
                padding: 12, marginBottom: 20, boxSizing: "border-box",
              }}
            />
          )}

          {/* Title */}
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 22, color: "var(--slate)",
            marginBottom: 4, lineHeight: 1.2,
          }}>
            {set.name}
          </div>

          {/* Meta */}
          <div style={{ fontSize: 13, color: "var(--gray-700)", marginBottom: 16, fontFamily: "var(--font-mono)" }}>
            #{set.setNumber}
            {set.parts > 0 && ` · ${set.parts.toLocaleString("de-DE")} Teile`}
            {set.themeName && ` · ${set.parentThemeName ? `${set.parentThemeName} › ${set.themeName}` : set.themeName}`}
            {set.year && ` · ${set.year}`}
          </div>

          {/* Retail price */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            {retailPrice != null && (
              <span style={{
                fontSize: 13, fontWeight: 500, color: "var(--warning)",
                fontFamily: "var(--font-mono)",
                background: "#FBF0DC",
                borderRadius: "var(--r-xs)", padding: "4px 10px",
              }}>
                UVP {retailPrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </span>
            )}
            <button
              onClick={handleRefreshPrice}
              disabled={priceLoading}
              style={{
                background: "none", border: "none", cursor: priceLoading ? "default" : "pointer",
                fontSize: 16, padding: "2px 4px", opacity: priceLoading ? 0.5 : 1,
                WebkitTapHighlightColor: "transparent",
              }}
              title="Preis aktualisieren"
            >
              {priceLoading ? "…" : "🔄"}
            </button>
          </div>

          {/* Status Badge */}
          <div style={{ marginBottom: 20 }}>
            <StatusBadge status={currentStatus} />
          </div>

          {/* Location */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
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
                      flex: 1, padding: "12px 8px", borderRadius: "var(--r-md)",
                      border: active ? "2px solid var(--clay)" : "2px solid var(--gray-300)",
                      background: active ? "#FAF0EB" : "var(--ivory)",
                      color: active ? "var(--clay)" : "var(--gray-700)",
                      fontWeight: 600, fontSize: 14, cursor: "pointer",
                      fontFamily: "var(--font-body)",
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
          <div style={{ height: 1, background: "var(--gray-100)", marginBottom: 20 }} />

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleCycle} style={{
              flex: 1, padding: "14px 0", borderRadius: "var(--r-md)",
              background: "var(--oat)", border: "none",
              fontWeight: 600, fontSize: 14, color: "var(--slate)",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}>
              Status {STATUS_CYCLE_LABEL[currentStatus]}
            </button>
            <button onClick={handleDelete} style={{
              padding: "14px 20px", borderRadius: "var(--r-md)",
              background: "rgba(176,74,74,0.1)", border: "none",
              fontWeight: 600, fontSize: 14, color: "var(--danger)",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
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

function StatCardTop({ label, value, icon, accentColor, progress }) {
  return (
    <div style={{
      background: "var(--white)", borderRadius: "var(--r-lg)", padding: "16px 18px",
      boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "var(--r-sm)",
        background: accentColor + "22",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 11, color: "var(--gray-700)", fontWeight: 500, marginTop: 4, fontFamily: "var(--font-body)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--slate)", letterSpacing: "-0.5px", lineHeight: 1 }}>
        {value}
      </div>
      {progress !== undefined && (
        <div style={{ marginTop: 4 }}>
          <div style={{ height: 4, background: "var(--gray-100)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(progress, 0)}%`, background: "var(--clay)", borderRadius: 2, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--gray-300)", marginTop: 3, textAlign: "right", fontFamily: "var(--font-mono)" }}>{progress} %</div>
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
      background: "var(--oat)",
      fontFamily: "var(--font-body)",
      maxWidth: 680,
      margin: "0 auto",
      position: "relative",
      touchAction: "pan-y",
    }}>
      <DetailModal key={selectedSet?.id ?? "closed"} set={selectedSet} onClose={() => setSelectedSet(null)} />

      <div style={{ paddingBottom: 90 }}>
        {/* Header */}
        <div style={{
          paddingTop: "max(16px, calc(env(safe-area-inset-top, 0px) + 12px))",
          paddingLeft: 20, paddingRight: 20, paddingBottom: 24,
          background: "var(--clay)",
          borderRadius: "0 0 28px 28px",
          marginBottom: 14,
          boxShadow: "0 8px 28px rgba(217,119,87,0.28)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 22, color: "var(--white)",
              lineHeight: 1.2,
            }}>
              Meine LEGO® Sammlung
            </div>
            <button
              onClick={() => setTab("hinzufuegen")}
              style={{
                width: 50, height: 50, borderRadius: "50%",
                background: "var(--ivory)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 18px rgba(217,119,87,0.25)",
                WebkitTapHighlightColor: "transparent",
                flexShrink: 0, marginLeft: 12,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--clay)" strokeWidth="2.8" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCardTop
              label="Gesamt Sets"
              value={totalSets}
              icon={
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
              }
              accentColor="#D97757"
            />
            <StatCardTop
              label="Gesamt Teile"
              value={totalParts.toLocaleString("de-DE")}
              icon="⚙️"
              accentColor="#788C5D"
              progress={builtPercent}
            />
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
