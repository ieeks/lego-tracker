/**
 * Reihe LEGO-Noppen als Outline-SVG — Signature-Element zwischen
 * Header und Statistikkarten. Reine Dekoration, daher aria-hidden.
 */
export default function StudDivider({ count = 11, className = "" }) {
  const gap = 28, r = 6, pad = 12;
  const w = pad * 2 + gap * (count - 1);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} 16`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: 16,
               color: "var(--brick)", opacity: .42, margin: "22px 0 4px" }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        {Array.from({ length: count }, (_, i) => (
          <circle key={i} cx={pad + i * gap} cy="8" r={r} />
        ))}
      </g>
    </svg>
  );
}
