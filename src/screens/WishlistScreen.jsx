import { useState } from "react";
import { SetCard } from "../components/SetCard";
import { fetchRetailPrice } from "../services/bricksetService";
import { updateSetPrice } from "../services/setService";

export function WishlistScreen({ sets, loading, onSetClick }) {
  const wishlist = sets.filter((s) => s.status === "wishlist");
  const unpricedSets = wishlist.filter((s) => s.retailPrice == null);

  const [loadingPrices, setLoadingPrices] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }

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
        <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E" }}>
          Meine Wunschliste
        </div>

        {!loading && unpricedSets.length > 0 && (
          <button
            onClick={handleLoadAllPrices}
            disabled={loadingPrices}
            style={{
              background: loadingPrices ? "#E5E5EA" : "#059669",
              color: loadingPrices ? "#8E8E93" : "#FFFFFF",
              border: "none", borderRadius: 10, padding: "6px 12px",
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
        <div style={{ textAlign: "center", padding: "48px 0", color: "#AEAEB2", fontSize: 14 }}>
          Lade Wunschliste…
        </div>
      )}

      {!loading && wishlist.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "#AEAEB2", fontSize: 14, fontWeight: 500 }}>
          Noch keine Wunsch-Sets
        </div>
      )}

      {wishlist.map((set) => (
        <SetCard key={set.id} set={set} onClick={onSetClick} />
      ))}
    </div>
  );
}
