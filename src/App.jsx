import { useState, useEffect, useRef } from "react";
import { Home, Users, RotateCw, Layers, Plus } from "lucide-react";
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
  { id: "home",         label: "Daheim",  Icon: Home },
  { id: "grandparents", label: "Oma/Opa", Icon: Users },
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
                background: "rgba(192,122,30,0.12)",
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
              {priceLoading ? "…" : <RotateCw size={16} strokeWidth={1.75} />}
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
              {LOCATIONS.map(({ id, label, Icon }) => {
                const active = location === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleLocation(id)}
                    style={{
                      flex: 1, padding: "12px 8px", borderRadius: "var(--r-md)",
                      border: active ? "2px solid var(--clay)" : "2px solid var(--gray-300)",
                      background: active ? "var(--blush)" : "var(--ivory)",
                      color: active ? "var(--clay)" : "var(--gray-700)",
                      fontWeight: 600, fontSize: 14, cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      WebkitTapHighlightColor: "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <Icon size={16} strokeWidth={1.75} /> {label}
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
      background: "var(--card)", borderRadius: 20, padding: "16px 18px",
      boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: accentColor + "1f",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        {progress !== undefined && (
          <span style={{ fontFamily: "var(--font-stat)", fontWeight: 700, fontSize: 15, color: "var(--orange)" }}>
            {progress} %
          </span>
        )}
      </div>
      <div style={{ fontFamily: "var(--font-stat)", fontSize: 34, fontWeight: 700, color: "var(--slate)", letterSpacing: "-1px", lineHeight: 1, marginTop: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--taupe)", fontWeight: 500, fontFamily: "var(--font-body)" }}>{label}</div>
      {progress !== undefined && (
        <div style={{ marginTop: 10, height: 6, background: "var(--gray-100)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${Math.max(progress, 0)}%`,
            background: "linear-gradient(90deg, var(--orange), var(--lego-red))",
            borderRadius: 999, transition: "width 0.4s ease",
          }} />
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
      background: `
        radial-gradient(90% 55% at 100% 0%, rgba(232,145,58,0.13), rgba(232,145,58,0) 55%),
        radial-gradient(rgba(160,139,114,0.05) 1.2px, transparent 1.4px),
        linear-gradient(rgba(160,139,114,0.032) 1px, transparent 1px),
        linear-gradient(90deg, rgba(160,139,114,0.032) 1px, transparent 1px),
        var(--oat)`,
      backgroundSize: "auto, 22px 22px, 22px 22px, 22px 22px, auto",
      fontFamily: "var(--font-body)",
      maxWidth: 680,
      margin: "0 auto",
      position: "relative",
      touchAction: "pan-y",
      boxShadow: "0 0 60px rgba(90,70,45,0.10)",
    }}>
      <DetailModal key={selectedSet?.id ?? "closed"} set={selectedSet} onClose={() => setSelectedSet(null)} />

      <div style={{ paddingBottom: 90 }}>
        {/* Header */}
        <div style={{
          paddingTop: "max(20px, calc(env(safe-area-inset-top, 0px) + 16px))",
          paddingLeft: 20, paddingRight: 20, paddingBottom: 20,
          marginBottom: 8,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600, fontSize: 12, color: "var(--taupe)",
                textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 6,
              }}>
                Hallo Manuel
              </div>
              <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900, fontSize: 30, color: "var(--slate)",
                lineHeight: 1.05, letterSpacing: "-0.5px",
              }}>
                Meine <span style={{ color: "var(--lego-red)" }}>LEGO</span> Sammlung
              </div>
            </div>
            <button
              onClick={() => setTab("hinzufuegen")}
              style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "linear-gradient(145deg, #e8503f, #d02718)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 20px rgba(217,58,43,0.35)",
                WebkitTapHighlightColor: "transparent",
                flexShrink: 0, marginLeft: 12,
              }}
            >
              <Plus size={24} strokeWidth={2.8} color="#fff" />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCardTop
              label="Sets"
              value={totalSets}
              icon={
                <svg fill="none" height="16" viewBox="0 0 28 16" width="28" xmlns="http://www.w3.org/2000/svg" style={{ color: "var(--lego-red)" }}>
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
              accentColor="#d93a2b"
            />
            <StatCardTop
              label="Teile"
              value={totalParts.toLocaleString("de-DE")}
              icon={<Layers size={20} strokeWidth={2} color="var(--orange)" />}
              accentColor="#e8913a"
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
