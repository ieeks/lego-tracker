import { useState } from "react";
import { SetCard } from "../components/SetCard";
import { fetchRetailPrice } from "../services/bricksetService";
import { updateSetPrice } from "../services/setService";

export function WishlistScreen({ sets, loading, onSetClick }) {
  const wishlist = sets.filter((s) => s.status === "wishlist");
  const unpricedSets = wishlist.filter((s) => s.retailPrice == null);

  const [loadingPrices, setLoadingPrices] = useState(false);
  const [progress, setProgress] = useState(null);

  const handleLoadAllPrices = async () => {
    if (loadingPrices || unpricedSets.length === 0) return;
    setLoadingPrices(true);
    setProgress({ done: 0, total: unpricedSets.length });
    for (let i = 0; i < unpricedSets.length; i++) {
      const s = unpricedSets[i];
      try {
        const price = await fetchRetailPrice(s.setNumber);
        await updateSetPrice(s.id, price);
      } catch {
        // ignore
      }
      setProgress({ done: i + 1, total: unpricedSets.length });
    }
    setLoadingPrices(false);
    setProgress(null);
  };

  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div className="display" style={{ fontSize: 20 }}>
          Meine Wunschliste
        </div>

        {!loading && unpricedSets.length > 0 && (
          <button
            onClick={handleLoadAllPrices}
            disabled={loadingPrices}
            style={{
              background: loadingPrices ? "var(--neutral-soft)" : "var(--stud-soft)",
              color: loadingPrices ? "var(--ink-soft)" : "var(--stud-ink)",
              fontFamily: "var(--font-body)",
              border: "none", borderRadius: "var(--r-pill)", padding: "6px 12px",
              fontSize: 13, fontWeight: 600, cursor: loadingPrices ? "default" : "pointer",
              WebkitTapHighlightColor: "transparent",
              whiteSpace: "nowrap",
            }}
          >
            {loadingPrices && progress
              ? `Lade Preise… (${progress.done}/${progress.total})`
              : "Alle Preise laden"}
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-soft)", fontSize: 14 }}>
          Lade Wunschliste…
        </div>
      )}

      {!loading && wishlist.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--ink-soft)", fontSize: 14, fontWeight: 500 }}>
          Noch keine Wunsch-Sets
        </div>
      )}

      {wishlist.map((set) => (
        <SetCard key={set.id} set={set} onClick={onSetClick} />
      ))}
    </div>
  );
}
