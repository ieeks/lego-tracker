import { useState } from "react";
import { Heart, Check, Clock, Globe } from "lucide-react";
import { formatEol } from "../lib/newReleases";

const EUR = { style: "currency", currency: "EUR" };

/**
 * Karte für ein kuratiertes Neuheiten-Set.
 *
 * `entry` ist der JSON-Datensatz, `live` das Ergebnis aus Rebrickable
 * (oder null, wenn das Set dort noch unbekannt ist). Teilezahl und Name
 * kommen bevorzugt live, mit Rückfall auf die JSON — bei brandneuen Sets
 * ist der Rückfall der Normalfall, nicht der Ausnahmefall.
 */
export function ReleaseCard({ entry, live, owned, wished, busy, onWish }) {
  const [imageFailed, setImageFailed] = useState(false);

  const name    = live?.name ?? null;
  const parts   = live?.parts ?? entry.pieces;
  const image   = live?.image ?? null;
  const eol     = formatEol(entry.eol_date);
  const showImg = image && !imageFailed;

  const buttonLabel = owned ? "In Sammlung" : wished ? "Auf Wunschliste" : "Auf die Wunschliste";
  const done = owned || wished;

  return (
    <article style={{
      background: "var(--card)", borderRadius: "var(--r-card)",
      boxShadow: "var(--shadow-sm)", overflow: "hidden",
      display: "flex", flexDirection: "column", minWidth: 0,
    }}>
      {/* Bild — bei fehlendem oder kaputtem Bild ein Platzhalter mit
          Setnummer statt eines Broken-Image-Icons. */}
      <div style={{
        aspectRatio: "4 / 3", background: "var(--neutral-soft)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 10, position: "relative",
      }}>
        {showImg ? (
          <img
            src={image} alt={name ?? entry.set_num}
            loading="lazy"
            onError={() => setImageFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div className="mono" style={{ color: "var(--ink-soft)", textAlign: "center" }}>
            {entry.set_num}
            <div style={{ marginTop: 4, opacity: 0.7, letterSpacing: "0.06em" }}>
              Kein Bild
            </div>
          </div>
        )}
        {eol && (
          <span className="tag" style={{
            position: "absolute", top: 8, right: 8,
            background: "var(--stud-soft)", color: "var(--stud-ink)",
          }}>
            <Clock size={11} strokeWidth={2} />
            {eol}
          </span>
        )}
      </div>

      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div>
          <div className="mono" style={{
            color: "var(--ink-soft)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {entry.set_num} · {entry.subtheme ?? entry.theme}
          </div>
          <div className="display" style={{ fontSize: 16, lineHeight: 1.25, marginTop: 3 }}>
            {name ?? `Set ${entry.set_num}`}
          </div>
        </div>

        {/* Zahlen laufen alle über .tag bzw. .num — DM Sans 700, tabular-nums. */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {parts != null && (
            <span className="tag tag--parts">{parts.toLocaleString("de-DE")} Teile</span>
          )}
          {entry.uvp_eur != null && (
            <span className="tag tag--price">{entry.uvp_eur.toLocaleString("de-DE", EUR)}</span>
          )}
          {entry.age && <span className="tag">{entry.age}</span>}
          {entry.minifigs != null && (
            <span className="tag">{entry.minifigs} Figuren</span>
          )}
        </div>

        {entry.note && (
          <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)", margin: 0 }}>
            {entry.note}
          </p>
        )}

        {entry.region_note && (
          <p style={{
            fontSize: 11, lineHeight: 1.45, color: "var(--ink-soft)", margin: 0,
            display: "flex", alignItems: "flex-start", gap: 5,
          }}>
            <Globe size={11} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 2 }} />
            {entry.region_note}
          </p>
        )}

        <button
          onClick={() => onWish(entry)}
          disabled={done || busy}
          aria-label={done ? buttonLabel : `${name ?? entry.set_num} auf die Wunschliste setzen`}
          style={{
            marginTop: "auto", padding: "10px 12px",
            borderRadius: "var(--r-field)", border: "none",
            background: done ? "var(--neutral-soft)" : "var(--brick)",
            color: done ? "var(--ink-soft)" : "var(--on-accent)",
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
            cursor: done ? "default" : busy ? "progress" : "pointer",
            opacity: busy ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            WebkitTapHighlightColor: "transparent",
            transition: "background 0.15s ease",
          }}
        >
          {done
            ? <Check size={13} strokeWidth={2.5} />
            : <Heart size={13} strokeWidth={2} />}
          {busy ? "Wird gespeichert…" : buttonLabel}
        </button>
      </div>
    </article>
  );
}
