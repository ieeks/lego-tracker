import { Check, Package, Heart } from "lucide-react";

const CONFIG = {
  built:    { bg: "rgba(125,138,90,0.14)", color: "var(--olive)",  label: "Gebaut",  Icon: Check },
  boxed:    { bg: "var(--gray-100)",       color: "var(--gray-500)", label: "OVP",   Icon: Package },
  wishlist: { bg: "var(--blush)",          color: "var(--lego-red)", label: "Wunsch", Icon: Heart },
};

export function StatusBadge({ status }) {
  const s = CONFIG[status] ?? CONFIG.boxed;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      fontFamily: "var(--font-body)",
    }}>
      <s.Icon size={10} strokeWidth={1.75} color={s.color} />
      {s.label}
    </span>
  );
}
