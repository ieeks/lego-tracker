import { Check, Package, Heart, Box } from "lucide-react";
import { setStatus, STATUS_LABEL } from "../lib/setStatus";

const CONFIG = {
  gebaut: { bg: "var(--leaf-soft)",    color: "var(--leaf)",     Icon: Check },
  ovp:    { bg: "var(--stud-soft)",    color: "var(--stud-ink)", Icon: Package },
  wunsch: { bg: "var(--brick-soft)",   color: "var(--brick)",    Icon: Heart },
  besitz: { bg: "var(--neutral-soft)", color: "var(--ink-soft)", Icon: Box },
};

export function StatusBadge({ status }) {
  const key = setStatus({ status });
  const s = CONFIG[key];
  return (
    <span className="tag" style={{ background: s.bg, color: s.color }}>
      <s.Icon size={11} strokeWidth={2} />
      {STATUS_LABEL[key]}
    </span>
  );
}
