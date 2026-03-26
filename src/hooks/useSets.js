import { useState, useEffect, useCallback } from "react";
import { getSets, addSet, updateSet, deleteSet } from "../services/setService";

export function useSets() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSets();
      setSets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const handleAdd = useCallback(async (setData) => {
    const id = await addSet(setData);
    setSets((prev) => [...prev, { id, ...setData }]);
    return id;
  }, []);

  const handleUpdate = useCallback(async (id, updates) => {
    await updateSet(id, updates);
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const handleDelete = useCallback(async (id) => {
    await deleteSet(id);
    setSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    sets,
    loading,
    error,
    refresh: fetchSets,
    addSet: handleAdd,
    updateSet: handleUpdate,
    deleteSet: handleDelete,
  };
}
