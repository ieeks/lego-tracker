import { useWishlistImport } from "../hooks/useWishlistImport";
import { CatalogView } from "./CatalogView";

/**
 * Der Katalog als eigener Tab.
 *
 * Bis hierher lag er unter einem Umschalter neben den kuratierten Wellen.
 * Die Wellen wurden von Hand gepflegt und standen seit August still, waehrend
 * der Katalog jeden Montag aus dem Rebrickable-Dump neu entsteht — der
 * Umschalter hatte damit keine zweite Seite mehr.
 */
export function CatalogScreen({ sets }) {
  const wishlist = useWishlistImport(sets);

  return (
    <div style={{ padding: "0 20px" }}>
      {/* Der Fehlerfall des Wunschlisten-Schreibwegs haengt bisher in der
          Wellen-Ansicht und blieb im Katalog unsichtbar: ein fehlgeschlagenes
          addSet kam dort nie beim Benutzer an. */}
      {wishlist.error && (
        <div role="alert" style={{
          background: "var(--danger-soft)", color: "var(--danger)",
          borderRadius: "var(--r-field)", padding: "12px 14px", marginBottom: 16,
          fontSize: 13, lineHeight: 1.5, fontWeight: 500,
        }}>
          {wishlist.error}
        </div>
      )}

      <CatalogView wishlist={wishlist} />
    </div>
  );
}
