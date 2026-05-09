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
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 20, color: "var(--slate)", marginBottom: 18 }}>
        Info
      </div>

      <div style={{ background: "var(--white)", borderRadius: "var(--r-md)", overflow: "hidden", boxShadow: "var(--shadow-sm)", marginBottom: 12 }}>
        {INFO_ROWS.map((item, i) => (
          <div key={item.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 18px",
            borderBottom: i < INFO_ROWS.length - 1 ? "1px solid var(--gray-100)" : "none",
          }}>
            <span style={{ fontWeight: 500, fontSize: 14, color: "var(--slate)", fontFamily: "var(--font-body)" }}>{item.label}</span>
            <span style={{ fontSize: 13, color: "var(--gray-500)", fontFamily: "var(--font-mono)" }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--white)", borderRadius: "var(--r-md)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <button onClick={handleExport} style={{
          display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
          borderBottom: "1px solid var(--gray-100)",
          WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--clay)", fontFamily: "var(--font-body)" }}>
            📥 Sammlung exportieren ({sets.length} Sets)
          </span>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ opacity: 0.25 }}>
            <path d="M1 1L7 7L1 13" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

      <p style={{ fontSize: 11, color: "var(--gray-500)", textAlign: "center", marginTop: 20, lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
        Set-Daten werden über die Rebrickable API geladen.{"\n"}
        rebrickable.com
      </p>
    </div>
  );
}
