/**
 * `accent` / `accentSoft` sind Token-Namen und tragen jeweils eine
 * Bedeutung: --petrol steht für Statistik, --leaf für "gebaut".
 * Der Fortschrittsbalken zeigt den Gebaut-Anteil und läuft deshalb
 * in derselben Farbe wie die Gebaut-Rail an den Karten.
 */
export function StatCardTop({ label, value, icon, accent, accentSoft, progress, progressLabel }) {
  return (
    <div style={{
      background: "var(--card)", borderRadius: "var(--r-card)", padding: "16px 18px",
      boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", gap: 4,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "var(--r-thumb)",
          background: accentSoft,
          color: accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {icon}
        </div>
        {/* Ohne progressLabel bleibt die Prozentzahl oben rechts (Sammlung);
            mit progressLabel steht die absolute Form unter dem Balken. */}
        {progress !== undefined && progressLabel == null && (
          <span className="num" style={{ fontSize: 15, color: accent }}>
            {progress} %
          </span>
        )}
      </div>
      <div className="stat-value" style={{ marginTop: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 500, fontFamily: "var(--font-body)" }}>{label}</div>
      {progress !== undefined && (
        <div style={{ marginTop: 10, height: 6, background: "var(--neutral-soft)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${Math.max(progress, 0)}%`,
            background: accent,
            borderRadius: "var(--r-pill)", transition: "width 0.4s ease",
          }} />
        </div>
      )}
      {progressLabel != null && (
        <div className="num" style={{ fontSize: 12, color: accent, marginTop: 6 }}>
          {progressLabel}
        </div>
      )}
    </div>
  );
}
