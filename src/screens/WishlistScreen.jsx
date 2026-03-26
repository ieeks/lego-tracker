import { SetCard } from "../components/SetCard";

export function WishlistScreen({ sets, loading, onSetClick }) {
  const wishlist = sets.filter((s) => s.status === "wishlist");

  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E", marginBottom: 14 }}>
        Meine Wunschliste
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
