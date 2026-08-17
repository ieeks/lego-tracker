/**
 * Leitet den Anzeige-Status eines Sets ab.
 *
 * Firestore speichert den Zustand in einem einzelnen `status`-Feld
 * ("built" | "boxed" | "wishlist"), nicht in getrennten Booleans —
 * die Prioritätsreihenfolge bleibt dieselbe:
 * Wunschliste vor Gebaut vor OVP, sonst Besitz.
 *
 * Rückgabewerte sind die `data-status`-Schlüssel aus index.css:
 * wunsch → --brick, gebaut → --leaf, ovp → --stud, besitz → --ink-soft
 */
export function setStatus(set) {
  if (set?.status === "wishlist") return "wunsch";
  if (set?.status === "built")    return "gebaut";
  if (set?.status === "boxed")    return "ovp";
  return "besitz";
}

/** Deutsche Labels zu den abgeleiteten Status-Schlüsseln. */
export const STATUS_LABEL = {
  wunsch: "Wunsch",
  gebaut: "Gebaut",
  ovp:    "OVP",
  besitz: "Besitz",
};
