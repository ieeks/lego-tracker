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
      <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E", marginBottom: 18 }}>
        Info
      </div>

      <div style={{ background: "#FFF", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 12 }}>
        {INFO_ROWS.map((item, i) => (
          <div key={item.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 18px",
            borderBottom: i < INFO_ROWS.length - 1 ? "1px solid #F3F4F6" : "none",
          }}>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#3A3A3C" }}>{item.label}</span>
            <span style={{ fontSize: 13, color: "#8E8E93" }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#FFF", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <button onClick={handleExport} style={{
          display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
          borderBottom: "1px solid #F3F4F6",
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#1D6AE5" }}>
            📥 Sammlung exportieren ({sets.length} Sets)
          </span>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ opacity: 0.3 }}>
            <path d="M1 1L7 7L1 13" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={handleReset} style={{
          display: "flex", width: "100%", alignItems: "center", justifyContent: "center",
          padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#E11D48" }}>
            Sammlung zurücksetzen
          </span>
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#AEAEB2", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
        Set-Daten werden über die Rebrickable API geladen.{"\n"}
        rebrickable.com
      </p>
    </div>
  );
}
