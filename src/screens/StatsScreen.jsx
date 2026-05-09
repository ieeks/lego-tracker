import { useState } from "react";
import { Tag, Heart, RotateCw } from "lucide-react";
import { fetchRetailPrice } from "../services/bricksetService";
import { updateSetPrice } from "../services/setService";

function priceSum(sets) {
  return sets.filter((s) => s.retailPrice != null).reduce((acc, s) => acc + s.retailPrice, 0);
}

function priceLabel(sets) {
  const priced = sets.filter((s) => s.retailPrice != null).length;
  const total  = sets.length;
  if (priced === 0) return null;
  return `(${priced} von ${total} Sets)`;
}

function formatPrice(sum, hasPriced) {
  if (!hasPriced) return "–";
  return sum.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export function StatsScreen({ sets }) {
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [loadedCount, setLoadedCount]     = useState(0);
  const [totalCount, setTotalCount]       = useState(0);

  const setsWithoutPrice = sets.filter((s) => s.retailPrice == null);
  const showLoadButton   = setsWithoutPrice.length > 0;

  async function handleLoadPrices() {
    const targets = sets.filter((s) => s.retailPrice == null);
    setLoadingPrices(true);
    setLoadedCount(0);
    setTotalCount(targets.length);
    for (let i = 0; i < targets.length; i++) {
      try {
        const price = await fetchRetailPrice(targets[i].setNumber);
        if (price != null) {
          await updateSetPrice(targets[i].id, price);
        }
      } catch {
        // ignore
      }
      setLoadedCount(i + 1);
      if (i < targets.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    setLoadingPrices(false);
  }

  const built    = sets.filter((s) => s.status === "built").length;
  const boxed    = sets.filter((s) => s.status === "boxed").length;
  const wishlist = sets.filter((s) => s.status === "wishlist").length;
  const total    = sets.length;

  const ownedSets    = sets.filter((s) => s.status !== "wishlist");
  const wishlistSets = sets.filter((s) => s.status === "wishlist");

  const ownedValue    = priceSum(ownedSets);
  const wishlistValue = priceSum(wishlistSets);
  const ownedHasPriced    = ownedSets.some((s) => s.retailPrice != null);
  const wishlistHasPriced = wishlistSets.some((s) => s.retailPrice != null);

  const valueCards = [
    {
      label: "Sammlungswert",
      value: formatPrice(ownedValue, ownedHasPriced),
      sub: priceLabel(ownedSets),
      Icon: Tag,
      color: "var(--warning)",
      bg: "#FBF0DC",
    },
    {
      label: "Wunschliste Wert",
      value: formatPrice(wishlistValue, wishlistHasPriced),
      sub: priceLabel(wishlistSets),
      Icon: Heart,
      color: "var(--clay)",
      bg: "#FAF0EB",
    },
  ];

  const rows = [
    { label: "Gebaut",           count: built,    color: "var(--success)", bg: "#EAF0E3" },
    { label: "Ungeöffnet (OVP)", count: boxed,    color: "var(--gray-500)", bg: "var(--gray-100)" },
    { label: "Wunschliste",      count: wishlist, color: "var(--clay)",    bg: "#FAF0EB" },
  ];

  const bars = [
    { status: "built",    color: "var(--success)" },
    { status: "boxed",    color: "var(--gray-300)" },
    { status: "wishlist", color: "var(--clay)" },
  ];

  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 20, color: "var(--slate)" }}>
          Statistik
        </div>
        {showLoadButton && (
          <button
            onClick={handleLoadPrices}
            disabled={loadingPrices}
            style={{
              background: "var(--oat)", color: "var(--clay)",
              fontFamily: "var(--font-body)",
              fontSize: 12, padding: "6px 12px", borderRadius: "var(--r-lg)",
              border: "none", cursor: loadingPrices ? "default" : "pointer",
              fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <RotateCw size={12} strokeWidth={2} />
            {loadingPrices ? `Lade… (${loadedCount}/${totalCount})` : "Preise laden"}
          </button>
        )}
      </div>

      {valueCards.map((card) => (
        <div key={card.label} style={{
          background: "var(--white)", borderRadius: "var(--r-md)", padding: "16px 20px",
          marginBottom: 10, boxShadow: "var(--shadow-sm)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--slate)", marginBottom: 2, fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 6 }}>
              <card.Icon size={14} strokeWidth={1.75} color={card.color} />
              {card.label}
            </div>
            {card.sub && (
              <div style={{ fontSize: 11, color: "var(--gray-500)", fontFamily: "var(--font-mono)" }}>{card.sub}</div>
            )}
          </div>
          <span style={{
            background: card.bg, color: card.color,
            borderRadius: "var(--r-lg)", padding: "4px 14px",
            fontWeight: 600, fontSize: 15,
            fontFamily: "var(--font-mono)",
          }}>
            {card.value}
          </span>
        </div>
      ))}

      <div style={{ height: 1, background: "var(--gray-100)", margin: "6px 0 16px" }} />

      {rows.map((item) => (
        <div key={item.label} style={{
          background: "var(--white)", borderRadius: "var(--r-md)", padding: "16px 20px",
          marginBottom: 10, boxShadow: "var(--shadow-sm)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--slate)", fontFamily: "var(--font-body)" }}>{item.label}</div>
          <span style={{
            background: item.bg, color: item.color,
            borderRadius: "var(--r-lg)", padding: "4px 14px",
            fontWeight: 600, fontSize: 15,
            fontFamily: "var(--font-mono)",
          }}>
            {item.count}
          </span>
        </div>
      ))}

      {total > 0 && (
        <div style={{ background: "var(--white)", borderRadius: "var(--r-md)", padding: 20, marginTop: 8, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--slate)", marginBottom: 14, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Statusverteilung</div>
          <div style={{ display: "flex", height: 10, borderRadius: 10, overflow: "hidden", gap: 2 }}>
            {bars.map(({ status, color }) => {
              const pct = (sets.filter((s) => s.status === status).length / total) * 100;
              return pct > 0 ? (
                <div key={status} style={{ width: `${pct}%`, background: color, borderRadius: 10 }} />
              ) : null;
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[["var(--success)", "Gebaut"], ["var(--gray-300)", "OVP"], ["var(--clay)", "Wunsch"]].map(([color, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--gray-500)", fontFamily: "var(--font-body)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-300)", fontSize: 14 }}>
          Noch keine Daten vorhanden.
        </div>
      )}
    </div>
  );
}
