import { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import { fetchSet, fetchThemeNames } from "../services/rebrickable";
import { addSet } from "../services/setService";
import { StatusBadge } from "../components/StatusBadge";
import { Hammer, Package, Heart, Check, Camera } from "lucide-react";

/* Jede Option färbt sich in ihrer eigenen Statusfarbe —
   dieselbe Kodierung wie die Rails an den Karten. */
const STATUS_OPTIONS = [
  { id: "built",    label: "Gebaut",      Icon: Hammer,  accent: "var(--leaf)",     soft: "var(--leaf-soft)" },
  { id: "boxed",    label: "OVP",         Icon: Package, accent: "var(--stud-ink)", soft: "var(--stud-soft)" },
  { id: "wishlist", label: "Wunschliste", Icon: Heart,   accent: "var(--brick)",    soft: "var(--brick-soft)" },
];

function extractSetNumberFromLegoUrl(raw) {
  const goMatch = raw.match(/\/GO\/38\/(\d+)/i);
  if (goMatch) return parseInt(goMatch[1], 10).toString();
  const productMatch = raw.match(/\/product\/[^/?#]*\/(\d{4,6})/i);
  if (productMatch) return productMatch[1];
  return null;
}

function QrScannerModal({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        video.play();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const scan = () => {
          if (cancelled) return;
          if (video.readyState >= video.HAVE_ENOUGH_DATA) {
            setReady(true);
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
            if (code) {
              const raw = code.data;
              const setNum = extractSetNumberFromLegoUrl(raw);
              stopStream();
              onDetect(setNum, raw);
              return;
            }
          }
          rafRef.current = requestAnimationFrame(scan);
        };
        rafRef.current = requestAnimationFrame(scan);
      })
      .catch((err) => {
        if (!cancelled) setError("Kamera-Zugriff verweigert.\nBitte in den Einstellungen erlauben.");
        console.error(err);
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [onDetect, stopStream]);

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--camera-bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "env(safe-area-inset-top, 20px) 20px 16px",
        paddingTop: "max(env(safe-area-inset-top, 20px), 20px)",
        background: "var(--camera-chrome)", backdropFilter: "blur(10px)",
        zIndex: 10,
      }}>
        <div className="display" style={{ color: "var(--camera-fg)", fontSize: 17 }}>QR-Code scannen</div>
        <button onClick={handleClose} aria-label="Scanner schließen" style={{
          background: "var(--camera-control)", border: "none", borderRadius: "var(--r-pill)",
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--camera-fg)" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="15" y2="15"/>
            <line x1="15" y1="1" x2="1" y2="15"/>
          </svg>
        </button>
      </div>

      {/* Camera */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {!error && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "var(--camera-mask)" }} />
            <div style={{
              position: "relative", zIndex: 1,
              width: 240, height: 240,
              boxShadow: "0 0 0 9999px var(--camera-mask)",
              borderRadius: 20,
            }}>
              {[
                { top: 0, left: 0,     borderTop: "3px solid var(--camera-fg)",    borderLeft:  "3px solid var(--camera-fg)",  borderRadius: "12px 0 0 0" },
                { top: 0, right: 0,    borderTop: "3px solid var(--camera-fg)",    borderRight: "3px solid var(--camera-fg)",  borderRadius: "0 12px 0 0" },
                { bottom: 0, left: 0,  borderBottom: "3px solid var(--camera-fg)", borderLeft:  "3px solid var(--camera-fg)",  borderRadius: "0 0 0 12px" },
                { bottom: 0, right: 0, borderBottom: "3px solid var(--camera-fg)", borderRight: "3px solid var(--camera-fg)",  borderRadius: "0 0 12px 0" },
              ].map((s, i) => (
                <div key={i} style={{ position: "absolute", width: 28, height: 28, ...s }} />
              ))}
              {ready && (
                <div style={{
                  position: "absolute", left: 0, right: 0, height: 2,
                  background: "linear-gradient(90deg, transparent, var(--brick), transparent)",
                  animation: "scanline 1.8s ease-in-out infinite",
                }} />
              )}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 32, textAlign: "center",
          }}>
            <div style={{ marginBottom: 16, color: "var(--camera-fg)" }}><Camera size={48} strokeWidth={1.75} /></div>
            <div style={{ color: "var(--camera-fg)", fontWeight: 600, fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-line" }}>{error}</div>
          </div>
        )}
      </div>

      {/* Hint */}
      <div style={{
        padding: "16px 20px",
        paddingBottom: "max(env(safe-area-inset-bottom, 20px), 20px)",
        background: "var(--camera-chrome)", backdropFilter: "blur(10px)",
        textAlign: "center",
      }}>
        <div style={{ color: "var(--camera-fg-soft)", fontSize: 13 }}>
          Halte die Kamera auf den QR-Code in der LEGO® Anleitung
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}

export function AddScreen({ onSuccess }) {
  const [input, setInput]         = useState("");
  const [preview, setPreview]     = useState(null);
  const [status, setStatus]       = useState("built");
  const [searching, setSearching] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [done, setDone]           = useState(false);
  const [scanning, setScanning]   = useState(false);

  const triggerSearch = async (setNumber) => {
    if (!setNumber?.trim()) return;
    setInput(setNumber);
    setSearching(true);
    setError(null);
    setPreview(null);
    setDone(false);
    try {
      const data = await fetchSet(setNumber.trim());
      const { themeName, parentThemeName } = await fetchThemeNames(data.theme_id).catch(() => ({ themeName: null, parentThemeName: null }));
      setPreview({ ...data, themeName, parentThemeName });
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    triggerSearch(input);
  };

  const handleQrDetect = (setNum, rawUrl) => {
    setScanning(false);
    if (setNum) {
      triggerSearch(setNum);
    } else {
      setError(`QR-Code erkannt, aber keine Set-Nummer gefunden.\nURL: ${rawUrl}`);
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
        themeName: preview.themeName ?? null,
        parentThemeName: preview.parentThemeName ?? null,
        year: preview.year ?? null,
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
    <>
      {scanning && (
        <QrScannerModal
          onDetect={handleQrDetect}
          onClose={() => setScanning(false)}
        />
      )}

      <div style={{ padding: "0 20px" }}>
        <div className="display" style={{ fontSize: 20, marginBottom: 18 }}>
          Set hinzufügen
        </div>

        {done && (
          <div style={{ background: "var(--leaf-soft)", color: "var(--leaf)", borderRadius: "var(--r-field)", padding: "12px 16px", marginBottom: 16, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={14} strokeWidth={2} color="var(--leaf)" />
            Set wurde zur Sammlung hinzugefügt!
          </div>
        )}

        <div style={{ background: "var(--card)", borderRadius: "var(--r-card)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <form onSubmit={handleSearch}>
            <input
              className="field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Set-Nummer eingeben (z.B. 42115)"
              inputMode="numeric"
              style={{ padding: "13px 16px", fontSize: 15 }}
            />

            {/* QR Button */}
            <button
              type="button"
              onClick={() => setScanning(true)}
              style={{
                width: "100%", marginTop: 12, padding: 14,
                borderRadius: "var(--r-field)",
                background: "var(--neutral-soft)", border: "none",
                fontWeight: 600, fontSize: 15, color: "var(--ink)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                WebkitTapHighlightColor: "transparent",
                transition: "background 0.15s",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
                <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
                <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
                <line x1="14" y1="14" x2="14" y2="14"/>
                <rect x="14" y="14" width="3" height="3" rx="0.5"/>
                <rect x="18" y="14" width="3" height="3" rx="0.5"/>
                <rect x="14" y="18" width="3" height="3" rx="0.5"/>
                <rect x="18" y="18" width="3" height="3" rx="0.5"/>
              </svg>
              QR-Code aus Anleitung scannen
            </button>

            <button type="submit" disabled={searching} style={{
              width: "100%", marginTop: 10, padding: 15,
              borderRadius: "var(--r-field)",
              background: searching ? "var(--neutral-soft)" : "var(--brick)",
              border: "none", color: searching ? "var(--ink-soft)" : "var(--on-accent)",
              fontWeight: 600, fontSize: 15,
              fontFamily: "var(--font-body)",
              cursor: searching ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}>
              {searching ? "Suche läuft…" : "Suchen"}
            </button>
          </form>

          {error && (
            <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12, fontWeight: 500, whiteSpace: "pre-line" }}>{error}</p>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ background: "var(--card)", borderRadius: "var(--r-card)", padding: 20, marginTop: 16, boxShadow: "var(--shadow-sm)" }}>
            {preview.set_img_url && (
              <img
                src={preview.set_img_url}
                alt={preview.name}
                style={{ width: "100%", height: 200, objectFit: "contain", borderRadius: "var(--r-thumb)", background: "var(--neutral-soft)", padding: 8, marginBottom: 14 }}
              />
            )}
            <div className="mono" style={{ color: "var(--ink-soft)", marginBottom: 6 }}>
              {preview.set_num}
              {preview.themeName && ` · ${preview.themeName}`}
              {preview.year && ` · ${preview.year}`}
            </div>
            <div className="display" style={{ fontSize: 20, marginBottom: 10 }}>
              {preview.name}
            </div>
            <div style={{ marginBottom: 18 }}>
              {preview.num_parts > 0 && (
                <span className="tag tag--parts">
                  {preview.num_parts.toLocaleString("de-DE")} Teile
                </span>
              )}
            </div>

            <div className="mono" style={{ color: "var(--ink-soft)", marginBottom: 10 }}>Status wählen</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    style={{
                      flex: 1, minWidth: 0,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "10px 4px",
                      border: active ? `2px solid ${opt.accent}` : "2px solid var(--line)",
                      borderRadius: "var(--r-field)",
                      background: active ? opt.soft : "var(--card)",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: 12, fontWeight: 600,
                      color: active ? opt.accent : "var(--ink-soft)",
                      WebkitTapHighlightColor: "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <opt.Icon size={20} strokeWidth={1.75} />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <StatusBadge status={status} />
              <button
                onClick={handleAdd}
                disabled={saving}
                style={{
                  padding: "13px 24px", borderRadius: "var(--r-field)",
                  background: saving ? "var(--neutral-soft)" : "var(--brick)",
                  border: "none", color: saving ? "var(--ink-soft)" : "var(--on-accent)",
                  fontWeight: 600, fontSize: 14,
                  fontFamily: "var(--font-body)",
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {saving ? "Speichern…" : "Hinzufügen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
