import { useState } from "react";
import { fetchSet } from "../services/rebrickable";
import { addSet } from "../services/setService";
import { StatusBadge } from "../components/StatusBadge";

const STATUS_OPTIONS = [
  { id: "built",    label: "Gebaut",      icon: "✓" },
  { id: "boxed",    label: "OVP",         icon: "📦" },
  { id: "wishlist", label: "Wunschliste", icon: "♥" },
];

export function AddScreen({ onSuccess }) {
  const [input, setInput]       = useState("");
  const [preview, setPreview]   = useState(null);
  const [status, setStatus]     = useState("built");
  const [searching, setSearching] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [done, setDone]         = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSearching(true);
    setError(null);
    setPreview(null);
    setDone(false);
    try {
      const data = await fetchSet(input.trim());
      setPreview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!preview) return;
    setSaving(true);
    setError(null);
    try {
      await addSet({
        setNumber: preview.set_num,
        name: preview.name,
        image: preview.set_img_url,
        parts: preview.num_parts,
        theme: preview.theme_id,
        status,
      });
      setDone(true);
      setInput("");
      setPreview(null);
      setStatus("built");
      onSuccess?.();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E", marginBottom: 18 }}>
        Set hinzufügen
      </div>

      {done && (
        <div style={{ background: "#D1FAE5", color: "#059669", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
          ✓ Set wurde zur Sammlung hinzugefügt!
        </div>
      )}

      <div style={{ background: "#FFF", borderRadius: 20, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <form onSubmit={handleSearch}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Set-Nummer eingeben (z.B. 42115)"
            inputMode="numeric"
            style={{
              width: "100%", padding: "14px 16px",
              borderRadius: 14, border: "1.5px solid #E5E5EA",
              fontSize: 15, color: "#1C1C1E", outline: "none",
              background: "#FAFAFA",
            }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button type="button" disabled style={{
              flex: 1, padding: 13, borderRadius: 14,
              background: "#F1F0EB", border: "none",
              fontWeight: 600, fontSize: 14, color: "#C7C7CC", cursor: "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M7 7h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
              </svg>
              Barcode
            </button>
            <button type="button" disabled style={{
              flex: 1, padding: 13, borderRadius: 14,
              background: "#F1F0EB", border: "none",
              fontWeight: 600, fontSize: 14, color: "#C7C7CC", cursor: "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="4" y="4" width="4" height="4" rx="0.5"/>
                <rect x="16" y="4" width="4" height="4" rx="0.5"/>
                <rect x="4" y="16" width="4" height="4" rx="0.5"/>
                <rect x="12" y="12" width="8" height="8" rx="1"/>
              </svg>
              QR Code
            </button>
          </div>

          <button type="submit" disabled={searching} style={{
            width: "100%", marginTop: 14, padding: 15,
            borderRadius: 14,
            background: searching ? "#93B4F0" : "linear-gradient(135deg, #1D6AE5, #1855C0)",
            border: "none", color: "#FFF",
            fontWeight: 700, fontSize: 15, cursor: searching ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(29,106,229,0.35)",
          }}>
            {searching ? "Suche läuft…" : "Suchen"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#E11D48", fontSize: 13, marginTop: 12, fontWeight: 500 }}>{error}</p>
        )}
      </div>

      {/* Vorschau */}
      {preview && (
        <div style={{ background: "#FFF", borderRadius: 20, padding: 20, marginTop: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {preview.set_img_url && (
            <img
              src={preview.set_img_url}
              alt={preview.name}
              style={{ width: "100%", height: 200, objectFit: "contain", borderRadius: 14, background: "#F4F3EE", padding: 8, marginBottom: 14 }}
            />
          )}
          <div style={{ fontSize: 12, color: "#8E8E93", fontWeight: 500, marginBottom: 4 }}>
            #{preview.set_num}
          </div>
          <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E", marginBottom: 4 }}>
            {preview.name}
          </div>
          <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 18 }}>
            {preview.num_parts?.toLocaleString("de-DE")} Teile
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Status wählen:</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStatus(opt.id)}
                style={{
                  flex: 1,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "10px 4px",
                  border: status === opt.id ? "2px solid #1D6AE5" : "2px solid #E5E5EA",
                  borderRadius: 14,
                  background: status === opt.id ? "#EEF4FF" : "#FAFAFA",
                  cursor: "pointer",
                  fontSize: 12, fontWeight: 600,
                  color: status === opt.id ? "#1D6AE5" : "#636366",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span style={{ fontSize: 20 }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <StatusBadge status={status} />
            <button
              onClick={handleAdd}
              disabled={saving}
              style={{
                padding: "13px 24px", borderRadius: 14,
                background: saving ? "#93B4F0" : "linear-gradient(135deg, #1D6AE5, #1855C0)",
                border: "none", color: "#FFF",
                fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(29,106,229,0.3)",
              }}
            >
              {saving ? "Speichern…" : "Hinzufügen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
