import { useState } from "react";
import { useSets } from "../hooks/useSets";

const THEMES = [
  "City", "Technic", "Star Wars", "Harry Potter", "Marvel", "Creator",
  "Architecture", "Icons", "Ideas", "Ninjago", "Friends", "Sonstiges",
];

const EMPTY_FORM = {
  name: "",
  setNumber: "",
  theme: "City",
  pieces: "",
  owned: false,
  wishlist: false,
};

export function AddSetScreen({ onNavigateHome }) {
  const { addSet } = useSets();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.setNumber.trim()) {
      setError("Name und Set-Nummer sind Pflichtfelder.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addSet({ ...form, pieces: Number(form.pieces) || 0 });
      onNavigateHome();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={onNavigateHome} style={styles.backButton}>← Zurück</button>
        <h1 style={styles.title}>Set hinzufügen</h1>
      </header>

      <form onSubmit={handleSubmit} style={styles.form}>
        <Field label="Name *">
          <input
            style={styles.input}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="z.B. Millennium Falcon"
          />
        </Field>

        <Field label="Set-Nummer *">
          <input
            style={styles.input}
            value={form.setNumber}
            onChange={(e) => set("setNumber", e.target.value)}
            placeholder="z.B. 75192"
          />
        </Field>

        <Field label="Thema">
          <select
            style={styles.input}
            value={form.theme}
            onChange={(e) => set("theme", e.target.value)}
          >
            {THEMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>

        <Field label="Anzahl Teile">
          <input
            style={styles.input}
            type="number"
            min="0"
            value={form.pieces}
            onChange={(e) => set("pieces", e.target.value)}
            placeholder="z.B. 7541"
          />
        </Field>

        <div style={styles.checkboxRow}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.owned}
              onChange={(e) => set("owned", e.target.checked)}
            />
            Ich besitze dieses Set
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.wishlist}
              onChange={(e) => set("wishlist", e.target.checked)}
            />
            Auf Wunschliste
          </label>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={saving} style={styles.submitButton}>
          {saving ? "Speichern…" : "Set speichern"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  container: { maxWidth: 480, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 28 },
  backButton: {
    background: "none",
    border: "none",
    fontSize: 15,
    cursor: "pointer",
    color: "#6b7280",
    padding: 0,
  },
  title: { margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
  },
  checkboxRow: { display: "flex", flexDirection: "column", gap: 10 },
  checkboxLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", cursor: "pointer" },
  error: { color: "#ef4444", fontSize: 13, margin: 0 },
  submitButton: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 0",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 8,
  },
};
