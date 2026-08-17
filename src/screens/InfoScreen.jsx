import { Download } from "lucide-react";
import { deleteSet } from "../services/setService";

const INFO_ROWS = [
  { label: "Version",    value: "1.0.0" },
  { label: "API",        value: "Rebrickable v3" },
  { label: "Datenbank",  value: "Firebase Firestore" },
  { label: "Framework",  value: "React + Vite" },
];

export function InfoScreen({ sets }) {
  const handleExport = () => {
    const data = sets.map(({ id, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lego-sammlung.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    if (!window.confirm(`Alle ${sets.length} Sets wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return;
    await Promise.all(sets.map((s) => deleteSet(s.id)));
  };

  return (
    <div style={{ padding: "0 20px" }}>
      <div className="display" style={{ fontSize: 20, marginBottom: 18 }}>
        Info
      </div>

      <div style={{ background: "var(--card)", borderRadius: "var(--r-card)", overflow: "hidden", boxShadow: "var(--shadow-sm)", marginBottom: 12 }}>
        {INFO_ROWS.map((item, i) => (
          <div key={item.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
            padding: "14px 18px",
            borderBottom: i < INFO_ROWS.length - 1 ? "1px solid var(--line)" : "none",
          }}>
            <span style={{ fontWeight: 500, fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-body)" }}>{item.label}</span>
            <span className="mono" style={{ color: "var(--ink-soft)", textAlign: "right" }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--card)", borderRadius: "var(--r-card)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <button onClick={handleExport} style={{
          display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
          borderBottom: "1px solid var(--line)",
          WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--brick)", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 6, textAlign: "left" }}>
            <Download size={14} strokeWidth={1.75} color="var(--brick)" />
            Sammlung exportieren ({sets.length} Sets)
          </span>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ opacity: 0.25, flexShrink: 0 }}>
            <path d="M1 1L7 7L1 13" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={handleReset} style={{
          display: "flex", width: "100%", alignItems: "center", justifyContent: "center",
          padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--danger)", fontFamily: "var(--font-body)" }}>
            Sammlung zurücksetzen
          </span>
        </button>
      </div>

      <p className="mono" style={{ color: "var(--ink-soft)", textAlign: "center", marginTop: 20, lineHeight: 1.8 }}>
        Set-Daten werden über die Rebrickable API geladen.{"\n"}
        rebrickable.com
      </p>
    </div>
  );
}
