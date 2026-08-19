import { useState, useCallback, useMemo } from "react";
import { addSet } from "../services/setService";
import { normalizeSetNum } from "../lib/newReleases";

/**
 * Der eine Schreibweg auf die Wunschliste, geteilt von Wellen und Katalog.
 *
 * Es gibt bewusst keine zweite Implementierung: die Wunschliste ist kein
 * eigener Pfad, sondern ein status-Wert, und addSet ist die einzige
 * Funktion, die neue Sets anlegt.
 */
export function useWishlistImport(sets) {
  const [busy, setBusy]             = useState(null);
  const [optimistic, setOptimistic] = useState([]);
  const [error, setError]           = useState(null);

  // Die Sammlung speichert Setnummern mal mit, mal ohne Variantensuffix.
  const ownedNums = useMemo(
    () => new Set(sets.filter((s) => s.status !== "wishlist").map((s) => normalizeSetNum(s.setNumber))),
    [sets]
  );
  const wishedNums = useMemo(
    () => new Set([
      ...sets.filter((s) => s.status === "wishlist").map((s) => normalizeSetNum(s.setNumber)),
      ...optimistic.map(normalizeSetNum),
    ]),
    [sets, optimistic]
  );

  const wish = useCallback(async (payload) => {
    const { setNumber, label } = payload;
    const num = normalizeSetNum(setNumber);
    // Idempotent: Doppelklick und bereits erfasste Sets laufen ins Leere.
    if (busy || ownedNums.has(num) || wishedNums.has(num)) return;

    setBusy(setNumber);
    setError(null);
    setOptimistic((prev) => [...prev, setNumber]);

    try {
      await addSet({
        setNumber,
        name: payload.name,
        image: payload.image ?? null,
        parts: payload.parts ?? 0,
        theme: payload.themeId ?? null,
        themeName: payload.themeName ?? null,
        parentThemeName: payload.parentThemeName ?? null,
        year: payload.year ?? null,
        status: "wishlist",
      });
    } catch (err) {
      setOptimistic((prev) => prev.filter((n) => n !== setNumber));   // Rollback
      setError(
        `„${label ?? setNumber}“ konnte nicht gespeichert werden: ${err.message} ` +
        `Prüfe die Verbindung und versuche es erneut — es wurde nichts geschrieben.`
      );
    } finally {
      setBusy(null);
    }
  }, [busy, ownedNums, wishedNums]);

  return { ownedNums, wishedNums, busy, error, wish, clearError: () => setError(null) };
}
