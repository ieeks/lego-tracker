import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, authReady } from "../services/firebase";

export function useCollection() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsub = () => {};
    authReady
      .then(() => {
        const q = query(collection(db, "sets"), orderBy("createdAt", "desc"));
        unsub = onSnapshot(
          q,
          (snap) => {
            setSets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
      })
      .catch((err) => {
        setError("Anmeldung fehlgeschlagen: " + err.message);
        setLoading(false);
      });
    return () => unsub();
  }, []);

  return { sets, loading, error };
}
