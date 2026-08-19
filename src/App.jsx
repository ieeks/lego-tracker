import { useState, useEffect, useRef } from "react";
import { Home, Users, RotateCw, Layers, Plus, Sparkles, PackageOpen } from "lucide-react";
import { useCollection } from "./hooks/useCollection";
import { updateSetStatus, updateSetLocation, deleteSet, updateSetPrice } from "./services/setService";
import { fetchRetailPrice } from "./services/bricksetService";
import { BottomNav } from "./components/BottomNav";
import { StatusBadge } from "./components/StatusBadge";
import StudDivider from "./components/StudDivider";
import { NEW_RELEASES, normalizeSetNum } from "./lib/newReleases";
import { readParams, writeParams } from "./lib/urlState";
import { CollectionScreen } from "./screens/CollectionScreen";
import { NewReleasesScreen } from "./screens/NewReleasesScreen";
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
        background: "var(--scrim)", backdropFilter: "blur(6px)",
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
          background: "var(--card)",
          borderRadius: "var(--r-card) var(--r-card) 0 0",
          boxShadow: "var(--shadow-sheet)",
          paddingBottom: "max(32px, env(safe-area-inset-bottom, 32px))",
          transition: "transform 0.25s ease",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: "var(--r-pill)", background: "var(--ink-soft)", opacity: 0.3, margin: "14px auto 20px" }} />

        <div style={{ padding: "0 20px" }}>

          {/* Image */}
          {set.image && (
            <img
              src={set.image}
              alt={set.name}
              style={{
                width: "100%", height: 190, objectFit: "contain",
                borderRadius: "var(--r-thumb)", background: "var(--neutral-soft)",
                padding: 12, marginBottom: 20, boxSizing: "border-box",
              }}
            />
          )}

          {/* Title */}
          <div className="display" style={{ fontSize: 22, marginBottom: 6, lineHeight: 1.2 }}>
            {set.name}
          </div>

          {/* Meta */}
          <div className="mono" style={{ color: "var(--ink-soft)", marginBottom: 16, lineHeight: 1.7 }}>
            {set.setNumber}
            {set.themeName && ` · ${set.parentThemeName ? `${set.parentThemeName} › ${set.themeName}` : set.themeName}`}
            {set.year && ` · ${set.year}`}
          </div>

          {/* Parts + retail price */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {set.parts > 0 && (
              <span className="tag tag--parts">
                {set.parts.toLocaleString("de-DE")} Teile
              </span>
            )}
            {retailPrice != null && (
              <span className="tag tag--price">
                UVP {retailPrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </span>
            )}
            <button
              onClick={handleRefreshPrice}
              disabled={priceLoading}
              style={{
                background: "none", border: "none", cursor: priceLoading ? "default" : "pointer",
                color: "var(--ink-soft)",
                display: "flex", alignItems: "center",
                padding: "2px 4px", opacity: priceLoading ? 0.5 : 1,
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
            <div className="mono" style={{ color: "var(--ink-soft)", marginBottom: 8 }}>
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
                      flex: 1, padding: "12px 8px", borderRadius: "var(--r-field)",
                      border: active ? "2px solid var(--brick)" : "2px solid var(--line)",
                      background: active ? "var(--brick-soft)" : "var(--card)",
                      color: active ? "var(--brick)" : "var(--ink-soft)",
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
          <div style={{ height: 1, background: "var(--line)", marginBottom: 20 }} />

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleCycle} style={{
              flex: 1, padding: "14px 0", borderRadius: "var(--r-field)",
              background: "var(--neutral-soft)", border: "none",
              fontWeight: 600, fontSize: 14, color: "var(--ink)",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}>
              Status {STATUS_CYCLE_LABEL[currentStatus]}
            </button>
            <button onClick={handleDelete} style={{
              padding: "14px 20px", borderRadius: "var(--r-field)",
              background: "var(--danger-soft)", border: "none",
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

/**
 * `accent` / `accentSoft` sind Token-Namen und tragen jeweils eine
 * Bedeutung: --petrol steht für Statistik, --leaf für "gebaut".
 * Der Fortschrittsbalken zeigt den Gebaut-Anteil und läuft deshalb
 * in derselben Farbe wie die Gebaut-Rail an den Karten.
 */
function StatCardTop({ label, value, icon, accent, accentSoft, progress }) {
  return (
    <div style={{
      background: "var(--card)", borderRadius: "var(--r-card)", padding: "16px 18px",
      boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", gap: 4,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "var(--r-thumb)",
          background: accentSoft,
          color: accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {icon}
        </div>
        {progress !== undefined && (
          <span className="num" style={{ fontSize: 15, color: accent }}>
            {progress} %
          </span>
        )}
      </div>
      <div className="stat-value" style={{ marginTop: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 500, fontFamily: "var(--font-body)" }}>{label}</div>
      {progress !== undefined && (
        <div style={{ marginTop: 10, height: 6, background: "var(--neutral-soft)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${Math.max(progress, 0)}%`,
            background: accent,
            borderRadius: "var(--r-pill)", transition: "width 0.4s ease",
          }} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Der Tab gehoert mit in die URL: sonst landet ein geteilter Filter-Link
  // auf der Sammlung und die Filter-Params haengen verwaist daneben.
  const [tab, setTab] = useState(() => readParams().get("tab") ?? "sammlung");
  const [selectedSet, setSelectedSet] = useState(null);
  const { sets, loading } = useCollection();

  useEffect(() => { writeParams({ tab: tab === "sammlung" ? null : tab }); }, [tab]);

  const owned        = sets.filter((s) => s.status !== "wishlist");
  const wishlistSets = sets.filter((s) => s.status === "wishlist");
  const builtSets    = owned.filter((s) => s.status === "built");

  const totalSets   = owned.length;
  const totalParts  = owned.reduce((acc, s) => acc + (s.parts || 0), 0);
  const wishlistCount = wishlistSets.length;
  const builtCount  = builtSets.length;
  const builtPercent = owned.length > 0 ? Math.round((builtCount / owned.length) * 100) : 0;

  // Neuheiten-Kennzahlen: wie viele der kuratierten Sets schon erfasst sind.
  const trackedNums   = new Set(sets.map((s) => normalizeSetNum(s.setNumber)));
  const releaseTotal  = NEW_RELEASES.length;
  const releaseOpen   = NEW_RELEASES.filter((r) => !trackedNums.has(normalizeSetNum(r.set_num))).length;
  const releasePercent = releaseTotal > 0
    ? Math.round(((releaseTotal - releaseOpen) / releaseTotal) * 100) : 0;

  // Nur die beiden Bloettertabs bekommen Headline und Kacheln — die uebrigen
  // Screens bringen ihre eigene Ueberschrift mit, ein zweiter Titel darueber
  // waere eine Dopplung.
  const HEADERS = {
    sammlung:  { eyebrow: "Hallo Manuel",      title: "Meine LEGO Sammlung" },
    neuheiten: { eyebrow: "Frisch erschienen", title: "Neue LEGO Sets" },
  };
  const header = HEADERS[tab];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--paper)",
      fontFamily: "var(--font-body)",
      maxWidth: 680,
      margin: "0 auto",
      position: "relative",
      touchAction: "pan-y",
      boxShadow: "var(--shadow-lg)",
    }}>
      <DetailModal key={selectedSet?.id ?? "closed"} set={selectedSet} onClose={() => setSelectedSet(null)} />

      <div style={{ paddingBottom: 90 }}>
        {/* Header */}
        <div style={{
          paddingTop: "max(20px, calc(env(safe-area-inset-top, 0px) + 16px))",
          paddingLeft: 20, paddingRight: 20, paddingBottom: 20,
          marginBottom: 8,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", marginBottom: header ? 22 : 0,
          }}>
            <div style={{ minWidth: 0 }}>
              {header && (
                <>
                  <div className="mono" style={{ color: "var(--ink-soft)", marginBottom: 6 }}>
                    {header.eyebrow}
                  </div>
                  <div className="display-xl">{header.title}</div>
                </>
              )}
            </div>
            <button
              onClick={() => setTab("hinzufuegen")}
              aria-label="Set hinzufügen"
              style={{
                width: 52, height: 52, borderRadius: "var(--r-pill)",
                background: "var(--brick)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "var(--shadow-md)",
                WebkitTapHighlightColor: "transparent",
                flexShrink: 0, marginLeft: 12,
              }}
            >
              <Plus size={24} strokeWidth={2.8} color="var(--on-accent)" />
            </button>
          </div>

          {header && <StudDivider />}

          {tab === "sammlung" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
              <StatCardTop
                label="Sets"
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
                accent="var(--petrol)"
                accentSoft="var(--petrol-soft)"
              />
              <StatCardTop
                label="Teile"
                value={totalParts.toLocaleString("de-DE")}
                icon={<Layers size={20} strokeWidth={2} />}
                accent="var(--leaf)"
                accentSoft="var(--leaf-soft)"
                progress={builtPercent}
              />
            </div>
          )}

          {tab === "neuheiten" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
              <StatCardTop
                label="Kuratiert"
                value={releaseTotal}
                icon={<Sparkles size={20} strokeWidth={2} />}
                accent="var(--petrol)"
                accentSoft="var(--petrol-soft)"
              />
              <StatCardTop
                label="Noch offen"
                value={releaseOpen}
                icon={<PackageOpen size={20} strokeWidth={2} />}
                accent="var(--leaf)"
                accentSoft="var(--leaf-soft)"
                progress={releasePercent}
              />
            </div>
          )}
        </div>

        {tab === "sammlung"    && <CollectionScreen sets={sets} loading={loading} onSetClick={setSelectedSet} />}
        {tab === "neuheiten"   && <NewReleasesScreen sets={sets} loading={loading} />}
        {tab === "hinzufuegen" && <AddScreen onSuccess={() => setTab("sammlung")} />}
        {tab === "wishlist"    && <WishlistScreen sets={sets} loading={loading} onSetClick={setSelectedSet} />}
        {tab === "statistik"   && <StatsScreen sets={sets} />}
        {tab === "info"        && <InfoScreen sets={sets} />}
      </div>

      <BottomNav active={tab} onNavigate={setTab} wishlistCount={wishlistCount} />
    </div>
  );
}
